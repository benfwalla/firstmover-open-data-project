'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Neighborhood {
  name: string;
  median_rents: { [key: string]: number };
  total_listings: number;
}

export default function RentCheckTool() {
  const [neighborhood, setNeighborhood] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [currentRent, setCurrentRent] = useState<number>(3000);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhoodData, setSelectedNeighborhoodData] = useState<Neighborhood | null>(null);

  useEffect(() => {
    fetch('/api/neighborhoods').then(r => r.json()).then(setNeighborhoods).catch(console.error);
  }, []);

  useEffect(() => {
    if (neighborhood) {
      setSelectedNeighborhoodData(neighborhoods.find(n => n.name === neighborhood) || null);
    }
  }, [neighborhood, neighborhoods]);

  const formatPrice = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
  const getBedroomKey = (b: number) => b === 0 ? 'studio' : `${b}br`;

  const getComparison = () => {
    if (!selectedNeighborhoodData || !neighborhood) return null;
    const medianRent = selectedNeighborhoodData.median_rents[getBedroomKey(bedrooms)];
    if (!medianRent) return null;
    const difference = currentRent - medianRent;
    const percentageDiff = Math.round(Math.abs(difference) / medianRent * 100);
    return { medianRent, difference, percentageDiff, isAbove: difference > 0, isBelow: difference < 0, isClose: Math.abs(difference) <= 200 };
  };

  const comparison = getComparison();
  const bedLabel = bedrooms === 0 ? 'studio' : `${bedrooms}BR`;

  return (
    <>
      <div className="publication-section narrow">
        <div className="section-header text-center mb-48">
          <h1 className="section-title font-40">Is My Rent Fair?</h1>
          <p className="section-subtitle">Compare your rent to the median in your neighborhood. Spoiler: you're probably overpaying.</p>
        </div>

        <div className="rc-form-card">
          <div className="rc-field">
            <label className="rc-label">Neighborhood</label>
            <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="rc-select">
              <option value="">Select your neighborhood...</option>
              {neighborhoods.sort((a, b) => a.name.localeCompare(b.name)).map(n => (
                <option key={n.name} value={n.name}>{n.name}</option>
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

          <div className="rc-field-lg">
            <label className="rc-label">Your Current Rent</label>
            <input type="range" min="1500" max="8000" step="50" value={currentRent}
              onChange={(e) => setCurrentRent(parseInt(e.target.value))} className="rc-rent-slider" />
            <div className="rc-rent-display">{formatPrice(currentRent)}/month</div>
          </div>
        </div>

        {comparison && neighborhood && (
          <div className="rc-result" style={{ border: `2px solid ${comparison.isAbove ? '#ff5252' : comparison.isBelow ? 'var(--green)' : 'var(--blue)'}` }}>
            <div className="rc-result-center">
              <h3 className="rc-result-title" style={{ color: comparison.isAbove ? '#d32f2f' : comparison.isBelow ? 'var(--green)' : 'var(--blue)' }}>
                {comparison.isClose ? "You're paying about market rate" :
                 comparison.isAbove ? `You're paying ${formatPrice(Math.abs(comparison.difference))} above median` :
                 `You're getting a deal: ${formatPrice(Math.abs(comparison.difference))} below median`}
              </h3>
              <div className="rc-result-subtitle">{bedLabel} median in {neighborhood}: {formatPrice(comparison.medianRent)}</div>
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
                      left: `${50 + (comparison.difference / comparison.medianRent * 50)}%`,
                      background: comparison.isAbove ? '#ff5252' : comparison.isBelow ? 'var(--green)' : 'var(--blue)'
                    }} />
                </div>
                <div className="rc-bar-label rc-bar-label-right">Above Median</div>
              </div>
            </div>

            <div className="rc-advice">
              {comparison.isAbove && (<><strong>You're overpaying.</strong> The median {bedLabel} in {neighborhood} is {formatPrice(comparison.medianRent)}, but you're paying {formatPrice(currentRent)}. Consider negotiating with your landlord or exploring similar apartments in the area.</>)}
              {comparison.isBelow && (<><strong>You've got a good deal!</strong> You're paying {formatPrice(Math.abs(comparison.difference))} below the median {bedLabel} in {neighborhood}. </>)}
              {comparison.isClose && (<><strong>You're paying market rate.</strong> Your rent is within $200 of the median {bedLabel} in {neighborhood}. That's about as fair as it gets in NYC's rental market.</>)}
            </div>
          </div>
        )}

        {!comparison && neighborhood && selectedNeighborhoodData && (
          <div className="rc-warning">
            <h4>Not enough data</h4>
            <p>We don't have enough {bedLabel} listings in {neighborhood} to calculate a reliable median. Try selecting a different bedroom count.</p>
          </div>
        )}

        <p className="fm-attribution" style={{ marginTop: '32px', textAlign: 'center' }}>
          Looking for a better deal? Try <Link href="/tools/find-your-neighborhood">Find Your Neighborhood</Link> · <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer">FirstMover</a>
        </p>
      </div>
    </>
  );
}
