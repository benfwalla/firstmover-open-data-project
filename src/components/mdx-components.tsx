'use client';

import { PriceTrendsChart } from './PriceTrendsChart';
import { NeighborhoodMap } from './NeighborhoodMap';

interface StatCard {
  label: string;
  value: string;
  color?: 'default' | 'green' | 'blue';
}

interface StatCardsProps {
  data: StatCard[];
}

export function StatCards({ data }: StatCardsProps) {
  return (
    <div className="report-stats">
      {data.map((stat, index) => (
        <div key={index} className="stat-card-report">
          <div className={`stat-number ${stat.color || ''}`}>
            {stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Neighborhood ranking table — auto-formats from standard data shape
interface DataTableProps {
  data: { rank: number; neighborhood: string; listings: number; median_rent: number; price_change?: number; pct_change?: number }[];
  caption?: string;
}

export function DataTable({ data, caption }: DataTableProps) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ margin: '32px 0' }}>
      <div className="table-wrapper">
        <table className="data-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Neighborhood</th>
              <th style={{ textAlign: 'right' }}>Listings</th>
              <th style={{ textAlign: 'right' }}>Median Rent</th>
              <th style={{ textAlign: 'right' }}>MoM</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.rank}>
                <td>{row.rank}</td>
                <td style={{ fontWeight: 500 }}>{row.neighborhood}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.listings.toLocaleString()}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>${Math.round(row.median_rent).toLocaleString()}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: (row.pct_change || 0) < 0 ? '#e53e3e' : (row.pct_change || 0) > 0 ? '#38a169' : '#888' }}>
                  {(row.pct_change || 0) > 0 ? '+' : ''}{row.pct_change || 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <DataAttribution text={caption} />}
    </div>
  );
}

interface ListingCardProps {
  price: number;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  photo?: string;
  address?: string;
}

export function ListingCard({ 
  price, 
  neighborhood, 
  bedrooms, 
  bathrooms, 
  sqft,
  photo,
  address 
}: ListingCardProps) {
  const formatPrice = (n: number): string => {
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  return (
    <div className="listing-card" style={{ margin: '16px 0' }}>
      {photo && (
        <div className="listing-card-photo">
          <img 
            src={photo} 
            alt={`Apartment in ${neighborhood}`}
            loading="lazy" 
          />
        </div>
      )}
      <div className="listing-card-body">
        <div className="listing-price">
          {formatPrice(price)}
          <span className="listing-price-mo">/mo</span>
        </div>
        <div className="listing-neighborhood">
          {neighborhood}
        </div>
        {address && (
          <div className="listing-address">{address}</div>
        )}
        <div className="listing-meta">
          <span>{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
          <span className="listing-meta-dot">•</span>
          <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
          {sqft && (
            <>
              <span className="listing-meta-dot">•</span>
              <span>{sqft.toLocaleString()} sqft</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface DataAttributionProps {
  text?: string;
}

export function DataAttribution({ text = "Data from FirstMover" }: DataAttributionProps) {
  return (
    <div style={{
      fontSize: '12px',
      color: '#888',
      textAlign: 'right' as const,
      marginTop: '8px'
    }}>
      {text}
    </div>
  );
}

// Re-export existing components for MDX use
export { PriceTrendsChart, NeighborhoodMap };

// Default MDX components mapping
export const mdxComponents = {
  StatCards,
  DataTable,
  ListingCard,
  DataAttribution,
  PriceTrendsChart,
  NeighborhoodMap,
  // Override default markdown elements with custom styling
  h1: ({ children, ...props }: any) => (
    <h1 className="report-title" style={{ fontSize: '40px', marginBottom: '16px' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 style={{ 
      fontFamily: 'var(--font-heading)', 
      fontSize: '28px', 
      fontWeight: '600', 
      marginBottom: '16px',
      marginTop: '48px',
      color: 'var(--text)' 
    }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 style={{ 
      fontFamily: 'var(--font-heading)', 
      fontSize: '20px', 
      fontWeight: '600', 
      marginBottom: '16px',
      marginTop: '32px',
      color: 'var(--text)' 
    }} {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: any) => (
    <p style={{ 
      fontSize: '18px', 
      lineHeight: '1.7', 
      marginBottom: '24px',
      maxWidth: '700px'
    }} {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul style={{ 
      fontSize: '18px', 
      lineHeight: '1.6', 
      paddingLeft: '20px',
      marginBottom: '24px',
      maxWidth: '700px'
    }} {...props}>
      {children}
    </ul>
  ),
  blockquote: ({ children, ...props }: any) => (
    <div style={{
      background: 'rgba(0, 166, 126, 0.03)', 
      border: '1px solid rgba(0, 166, 126, 0.1)',
      borderRadius: '16px', 
      padding: '32px', 
      margin: '32px 0'
    }} {...props}>
      {children}
    </div>
  )
};