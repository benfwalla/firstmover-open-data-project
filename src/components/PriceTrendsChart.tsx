"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatPrice, formatMonth } from "@/lib/utils";

type Props = {
  data?: Array<{ month: string; median_rent: number; listing_count: string }>;
  monthlyTrendsWithBedrooms?: Record<string, Record<string, { median_rent: number; listing_count: number }>>;
};

const BEDROOM_FILTERS = [
  { key: 'all', label: 'All', color: '#0051ff' },
  { key: 'studio', label: 'Studio', color: '#00C851' },
  { key: '1', label: '1BR', color: '#ff4444' },
  { key: '2', label: '2BR', color: '#ffbb33' },
  { key: '3', label: '3BR', color: '#AA66CC' },
];

export function PriceTrendsChart({ data, monthlyTrendsWithBedrooms }: Props) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Prepare chart data based on filter
  let chartData;
  
  if (monthlyTrendsWithBedrooms && selectedFilter !== 'all') {
    // Use bedroom-specific data
    chartData = Object.entries(monthlyTrendsWithBedrooms)
      .map(([month, bedrooms]) => {
        const bedroomData = bedrooms[selectedFilter];
        return {
          name: formatMonth(month + '-01'),
          rent: bedroomData ? bedroomData.median_rent : null,
          listings: bedroomData ? bedroomData.listing_count : 0,
        };
      })
      .filter(d => d.rent !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Use overall data
    chartData = data?.map((d) => ({
      name: formatMonth(d.month),
      rent: Math.round(d.median_rent),
      listings: parseInt(d.listing_count),
    })) || [];
  }

  const selectedFilterData = BEDROOM_FILTERS.find(f => f.key === selectedFilter);
  const chartColor = selectedFilterData?.color || '#0051ff';

  return (
    <div>
      {/* Bedroom filter buttons */}
      <div className="price-trends-filters" style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {BEDROOM_FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: selectedFilter === filter.key ? '2px solid #0051ff' : '1px solid #ddd',
              backgroundColor: selectedFilter === filter.key ? '#0051ff' : 'white',
              color: selectedFilter === filter.key ? 'white' : '#333',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f2efeb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 13, fill: "#888" }}
            axisLine={{ stroke: "#f2efeb" }}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 100", "dataMax + 100"]}
            tickFormatter={formatPrice}
            tick={{ fontSize: 13, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value: any) => [formatPrice(value as number), "Median Rent"]}
            contentStyle={{
              background: "#171717",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontSize: 14,
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
            itemStyle={{ color: "white" }}
          />
          <Area
            type="monotone"
            dataKey="rent"
            stroke={chartColor}
            strokeWidth={3}
            fill="url(#rentGrad)"
            dot={{ r: 5, fill: chartColor, stroke: "white", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: chartColor, stroke: "white", strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
    </div>
  );
}
