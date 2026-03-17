'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice, formatMonth } from '@/lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TrendPoint {
  month: string;
  median_rent: number;
  listing_count: number;
}

interface RentCheckData {
  neighborhood: string;
  bedrooms: number;
  monthly_trends: TrendPoint[];
  current_median: number | null;
  current_listing_count: number;
  available_bedrooms: number[];
}

function getLeaseMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const start = new Date(2025, 0);
  const d = new Date(now.getFullYear(), now.getMonth());
  while (d >= start) {
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value: val, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
    d.setMonth(d.getMonth() - 1);
  }
  return options;
}

export default function RentCheckTool() {
  const [neighborhood, setNeighborhood] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [currentRent, setCurrentRent] = useState<number>(3000);
  const [leaseMonth, setLeaseMonth] = useState('');
  const [allNeighborhoods, setAllNeighborhoods] = useState<string[]>([]);
  const [data, setData] = useState<RentCheckData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const leaseMonthOptions = useMemo(() => getLeaseMonthOptions(), []);

  useEffect(() => {
    fetch('/api/rent-check')
      .then(r => r.json())
      .then(d => setAllNeighborhoods(d.neighborhoods || []))
      .catch(console.error);
  }, []);

  // Fetch + show results on button click
  const handleCheck = useCallback(async () => {
    if (!neighborhood) return;
    setLoading(true);
    setShowResults(false);
    try {
      const res = await fetch(`/api/rent-check?neighborhood=${encodeURIComponent(neighborhood)}&bedrooms=${bedrooms}`);
      const d = await res.json();
      setData(d);
      setShowResults(true);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [neighborhood, bedrooms]);

  const chartData = useMemo(() => {
    if (!data?.monthly_trends?.length) return [];
    return data.monthly_trends.map(t => ({
      name: formatMonth(t.month),
      month: t.month,
      rent: t.median_rent,
      listings: t.listing_count,
    }));
  }, [data]);

  const leaseMedian = useMemo(() => {
    if (!leaseMonth || !data?.monthly_trends?.length) return null;
    return data.monthly_trends.find(t => t.month === leaseMonth)?.median_rent ?? null;
  }, [leaseMonth, data]);

  const comparison = useMemo(() => {
    const median = leaseMedian ?? data?.current_median ?? null;
    if (!median) return null;
    const difference = currentRent - median;
    const percentageDiff = Math.round(Math.abs(difference) / median * 100);
    return {
      medianRent: median,
      difference,
      percentageDiff,
      isAbove: difference > 0,
      isBelow: difference < 0,
      isClose: Math.abs(difference) <= 200,
    };
  }, [leaseMedian, data?.current_median, currentRent]);

  const seasonalInsight = useMemo(() => {
    if (!data?.monthly_trends || data.monthly_trends.length < 4) return null;
    const byMonth: { [m: number]: number[] } = {};
    for (const t of data.monthly_trends) {
      const m = parseInt(t.month.split('-')[1]);
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(t.median_rent);
    }
    const avgByMonth = Object.entries(byMonth).map(([m, rents]) => ({
      month: parseInt(m),
      avg: rents.reduce((a, b) => a + b, 0) / rents.length,
    }));
    if (avgByMonth.length < 3) return null;
    const cheapest = avgByMonth.reduce((a, b) => a.avg < b.avg ? a : b);
    const priciest = avgByMonth.reduce((a, b) => a.avg > b.avg ? a : b);
    if (priciest.avg - cheapest.avg < 50) return null;
    return {
      cheapMonth: MONTH_NAMES[cheapest.month - 1],
      priceMonth: MONTH_NAMES[priciest.month - 1],
      savings: Math.round(priciest.avg - cheapest.avg),
    };
  }, [data?.monthly_trends]);

  const leaseMonthLabel = leaseMonth ? formatMonth(leaseMonth) : null;
  const bedLabel = bedrooms === 0 ? 'studio' : `${bedrooms}BR`;
  const hasData = data && data.monthly_trends.length > 0;
  const noData = data !== null && !hasData;
  const formComplete = !!neighborhood && !!leaseMonth && currentRent >= 1000;

  return (
    <div className="publication-section narrow">
      <div className="section-header text-center mb-48">
        <h1 className="section-title font-40">Is My Rent Fair?</h1>
        <p className="section-subtitle">Compare your rent to what others are paying in your neighborhood, and see how prices have changed over time.</p>
      </div>

      <div className="rc-form-card">
        <div className="rc-field">
          <label className="rc-label">Neighborhood</label>
          <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="rc-select">
            <option value="">Select your neighborhood...</option>
            {allNeighborhoods.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="rc-field">
          <label className="rc-label">Bedrooms</label>
          <div className="rc-btn-row">
            {[0, 1, 2, 3].map(count => (
              <button key={count} onClick={() => setBedrooms(count)}
                className={`rc-bed-btn ${bedrooms === count ? 'selected' : ''}`}>
                {count === 0 ? 'Studio' : `${count}BR`}
              </button>
            ))}
          </div>
        </div>

        <div className="rc-field">
          <label className="rc-label">When did you sign your lease?</label>
          <select value={leaseMonth} onChange={(e) => setLeaseMonth(e.target.value)} className="rc-select">
            <option value="">Select month...</option>
            {leaseMonthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="rc-field-lg">
          <label className="rc-label">Your Monthly Rent</label>
          <input type="range" min="1000" max="10000" step="50" value={currentRent}
            onChange={(e) => setCurrentRent(parseInt(e.target.value))} className="rc-rent-slider" />
          <div className="rc-rent-display">{formatPrice(currentRent)}/month</div>
        </div>

        <button
          className="rc-check-btn"
          onClick={handleCheck}
          disabled={!formComplete || loading}
        >
          {loading ? 'Loading...' : 'Check My Rent'}
        </button>
      </div>

      {showResults && hasData && (
        <div className="rc-chart-card">
          <h3 className="rc-chart-title">
            {bedLabel} median rent in {neighborhood}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0051ff" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0051ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2efeb" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#888' }} axisLine={{ stroke: '#f2efeb' }} tickLine={false} />
              <YAxis
                domain={['dataMin - 200', 'dataMax + 200']}
                tickFormatter={formatPrice}
                tick={{ fontSize: 13, fill: '#888' }}
                axisLine={false} tickLine={false} width={72}
              />
              <Tooltip
                formatter={(value: any) => [formatPrice(value as number), 'Median Rent']}
                contentStyle={{ background: '#171717', border: 'none', borderRadius: 12, color: 'white', fontSize: 14 }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                itemStyle={{ color: 'white' }}
              />
              <ReferenceLine
                y={currentRent}
                stroke={comparison?.isAbove ? '#ef4444' : comparison?.isBelow ? 'var(--green)' : 'var(--blue)'}
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{
                  value: `Your rent: ${formatPrice(currentRent)}`,
                  position: 'right',
                  fill: '#666',
                  fontSize: 12,
                }}
              />
              {leaseMonthLabel && chartData.some(d => d.name === leaseMonthLabel) && (
                <ReferenceLine
                  x={leaseMonthLabel}
                  stroke="#888"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: 'Lease signed',
                    position: 'insideTopRight',
                    fill: '#666',
                    fontSize: 12,
                    dy: -14,
                  }}
                />
              )}
              <Area
                type="monotone" dataKey="rent" stroke="#0051ff" strokeWidth={3}
                fill="url(#rcGrad)"
                dot={{ r: 4, fill: '#0051ff', stroke: 'white', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0051ff', stroke: 'white', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {data.monthly_trends.length < 6 && (
            <p className="rc-chart-note">Limited data available for this combo. Results may be less reliable.</p>
          )}
        </div>
      )}

      {showResults && comparison && (
        <div className="rc-result" style={{ border: `2px solid ${comparison.isAbove ? '#ff5252' : comparison.isBelow ? 'var(--green)' : 'var(--blue)'}` }}>
          <div className="rc-result-center">
            <h3 className="rc-result-title" style={{ color: comparison.isAbove ? '#d32f2f' : comparison.isBelow ? 'var(--green)' : 'var(--blue)' }}>
              {comparison.isClose ? "You're paying about market rate" :
               comparison.isAbove ? `You're paying ${formatPrice(Math.abs(comparison.difference))} above median` :
               `You're getting a deal: ${formatPrice(Math.abs(comparison.difference))} below median`}
            </h3>
            <div className="rc-result-subtitle">
              {leaseMedian
                ? `${bedLabel} median in ${neighborhood} when you signed (${formatMonth(leaseMonth)}): ${formatPrice(leaseMedian)}`
                : `${bedLabel} median in ${neighborhood} (last 90 days): ${formatPrice(comparison.medianRent)}`}
            </div>
            {data?.current_median && leaseMedian && leaseMedian !== data.current_median && (
              <div className="rc-result-current">
                Current median: {formatPrice(data.current_median)}
                {data.current_median > leaseMedian
                  ? ` (up ${formatPrice(data.current_median - leaseMedian)} since you signed)`
                  : ` (down ${formatPrice(leaseMedian - data.current_median)} since you signed)`}
              </div>
            )}
            {!comparison.isClose && (
              <div className="rc-result-pct" style={{ color: comparison.isAbove ? '#d32f2f' : 'var(--green)' }}>
                That's {comparison.percentageDiff}% {comparison.isAbove ? 'above' : 'below'} median
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="rc-bar-row">
              <div className="rc-bar-label rc-bar-label-left">Below Median</div>
              <div className="rc-bar-track">
                <div className="rc-bar-median" />
                <div className="rc-bar-indicator"
                  style={{
                    left: `${Math.min(95, Math.max(5, 50 + (comparison.difference / comparison.medianRent * 50)))}%`,
                    background: comparison.isAbove ? '#ff5252' : comparison.isBelow ? 'var(--green)' : 'var(--blue)'
                  }} />
              </div>
              <div className="rc-bar-label rc-bar-label-right">Above Median</div>
            </div>
          </div>

          <div className="rc-advice">
            {comparison.isAbove && (<><strong>You're overpaying.</strong> The median {bedLabel} in {neighborhood} is {formatPrice(comparison.medianRent)}, but you're paying {formatPrice(currentRent)}. Consider negotiating with your landlord or exploring similar apartments in the area.</>)}
            {comparison.isBelow && (<><strong>You've got a good deal.</strong> You're paying {formatPrice(Math.abs(comparison.difference))} below the median {bedLabel} in {neighborhood}. </>)}
            {comparison.isClose && (<><strong>You're paying market rate.</strong> Your rent is within $200 of the median {bedLabel} in {neighborhood}. That's about as fair as it gets in NYC's rental market.</>)}
          </div>

          {seasonalInsight && (
            <div className="rc-seasonal">
              Seasonal tip: {bedLabel} rents in {neighborhood} tend to be cheapest in {seasonalInsight.cheapMonth} and most expensive in {seasonalInsight.priceMonth} (a {formatPrice(seasonalInsight.savings)} swing). Time your renewal accordingly.
            </div>
          )}
        </div>
      )}

      {showResults && noData && (
        <div className="rc-warning">
          <h4>No data for {bedLabel} in {neighborhood}</h4>
          {data!.available_bedrooms.length > 0 ? (
            <p>We have data for {data!.available_bedrooms.map(b => b === 0 ? 'Studio' : `${b}BR`).join(', ')} in {neighborhood}. Try a different bedroom count.</p>
          ) : (
            <p>We don't have enough listing data in {neighborhood} yet. Try a nearby neighborhood.</p>
          )}
        </div>
      )}

      <p className="fm-attribution" style={{ marginTop: '32px', textAlign: 'center' }}>
        Looking for a better deal? Try <Link href="/tools/find-your-neighborhood">Find Your Neighborhood</Link> · <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer">FirstMover</a>
      </p>
    </div>
  );
}
