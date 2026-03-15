import DownloadLink from '@/components/DownloadLink';
import DownloadAllButton from '@/components/DownloadAllButton';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open Data · FirstMover Open Data Project',
  description: 'Download free monthly NYC rental listing data as CSVs. Every listing tracked — prices, neighborhoods, and more. Updated monthly.',
  alternates: { canonical: '/open-data' },
  openGraph: { url: '/open-data' },
};

const DATA_BASE = 'https://raw.githubusercontent.com/benfwalla/firstmover-open-data-project/main/public/data';

const MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDownloadName(file: string): string {
  const [yyyy, mm] = file.replace('.csv', '').split('-');
  return `${yyyy}-${MONTH_ABBRS[+mm - 1]}-nyc-rental-listings.csv`;
}

const monthlyData = [
  { month: 'February 2026', file: '2026-02.csv', count: 16059 },
  { month: 'January 2026', file: '2026-01.csv', count: 17538 },
  { month: 'December 2025', file: '2025-12.csv', count: 15434 },
  { month: 'November 2025', file: '2025-11.csv', count: 11139, note: 'Data not available Nov 1–7' },
  { month: 'October 2025', file: '2025-10.csv', count: 16144, note: 'Data not available Oct 27–31' },
  { month: 'September 2025', file: '2025-09.csv', count: 22559 },
  { month: 'August 2025', file: '2025-08.csv', count: 24360 },
  { month: 'July 2025', file: '2025-07.csv', count: 27303 },
  { month: 'June 2025', file: '2025-06.csv', count: 24180 },
  { month: 'May 2025', file: '2025-05.csv', count: 25309 },
  { month: 'April 2025', file: '2025-04.csv', count: 21473 },
  { month: 'March 2025', file: '2025-03.csv', count: 19740 },
  { month: 'February 2025', file: '2025-02.csv', count: 12387 },
];

const COLUMNS = [
  { name: 'created_at_utc', desc: 'When the listing first appeared on the market (UTC)' },
  { name: 'available_date', desc: 'Move-in date' },
  { name: 'id', desc: 'Unique listing identifier' },
  { name: 'street', desc: 'Street address' },
  { name: 'unit', desc: 'Unit number' },
  { name: 'neighborhood', desc: 'Neighborhood name' },
  { name: 'borough', desc: 'NYC borough or NJ' },
  { name: 'zip_code', desc: 'ZIP code' },
  { name: 'state', desc: 'State (NY, NJ)' },
  { name: 'latitude', desc: 'Latitude' },
  { name: 'longitude', desc: 'Longitude' },
  { name: 'building_type', desc: 'Building type' },
  { name: 'bedrooms', desc: 'Bedroom count (0 = studio)' },
  { name: 'bathrooms', desc: 'Full bathrooms' },
  { name: 'half_baths', desc: 'Half bathrooms' },
  { name: 'sqft', desc: 'Square footage' },
  { name: 'furnished', desc: 'Whether the unit is furnished' },
  { name: 'is_new_development', desc: 'Whether the building is a new development' },
  { name: 'lease_months', desc: 'Lease term in months' },
  { name: 'months_free', desc: 'Free months offered' },
  { name: 'price', desc: 'Monthly asking rent' },
  { name: 'net_effective_price', desc: 'Net effective rent after concessions' },
  { name: 'no_fee', desc: 'Whether there is no broker fee' },
  { name: 'source_group', desc: 'Listing source/brokerage' },
  { name: 'source_type', desc: 'Source type (e.g. PARTNER)' },
  { name: 'has_videos', desc: 'Whether the listing has video' },
  { name: 'has_3d_tour', desc: 'Whether the listing has a 3D tour' },
  { name: 'media_asset_count', desc: 'Total media assets' },
  { name: 'lead_photo_id', desc: 'Primary StreetEasy photo ID. URL pattern: https://photos.zillowstatic.com/fp/{id}-se_extra_large_1500_800.webp' },
  { name: 'photo_ids', desc: 'All StreetEasy photo IDs, comma-separated. URL pattern: https://photos.zillowstatic.com/fp/{id}-se_extra_large_1500_800.webp' },
  { name: 'open_house_start_utc', desc: 'Open house start time (UTC)' },
  { name: 'open_house_end_utc', desc: 'Open house end time (UTC)' },
  { name: 'open_house_appointment_only', desc: 'Whether open house is by appointment' },
  { name: 'url', desc: 'Full StreetEasy listing URL' },
];

const datasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'NYC Rental Listing Data',
  description: 'Monthly dataset of every NYC rental listing. 34 columns including price, neighborhood, bedrooms, square footage, and more. Updated monthly.',
  url: 'https://www.firstmovernyc.com/open-data',
  license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  creator: {
    '@type': 'Organization',
    name: 'FirstMover',
    url: 'https://firstmovernyc.com',
  },
  temporalCoverage: '2025-02/..',
  spatialCoverage: {
    '@type': 'Place',
    name: 'New York City, NY',
  },
  distribution: monthlyData.map((d) => ({
    '@type': 'DataDownload',
    contentUrl: `https://raw.githubusercontent.com/benfwalla/firstmover-open-data-project/main/public/data/${d.file}`,
    encodingFormat: 'text/csv',
    name: d.month,
  })),
};

export default function OpenDataPage() {
  return (
    <div className="publication-section narrow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Open Data</h1>
        <p className="section-subtitle">Free NYC rental listing data.</p>
      </div>

      <div className="tool-card">
        <h3 className="tool-title">Monthly Listing Data</h3>
        <p className="tool-description" style={{ marginBottom: '12px' }}>
          Every month, we collect publicly available rental listings and publish the raw data here for anyone to use. Each row represents a listing as it first appeared on the market. Listings may be updated after their initial posting (price changes, status updates, etc.) and those changes are not reflected here.
        </p>
        <p className="tool-description" style={{ marginBottom: '12px' }}>
          Each CSV contains 34 columns, referenced below. No copyrighted content like descriptions is reproduced. This project is not affiliated with or endorsed by StreetEasy or Zillow Group.
        </p>
        <p className="tool-description" style={{ marginBottom: '20px' }}>
          If you&rsquo;re a researcher that would like access to our real-time database, reach out at firstmovernyc@gmail.com for inquiry.
        </p>

        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <DownloadAllButton files={monthlyData.map((d) => ({ url: `${DATA_BASE}/${d.file}`, downloadName: toDownloadName(d.file) }))} />
        </div>

        <div className="table-wrapper">
          <table className="data-table" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Listings</th>
                <th style={{ textAlign: 'right' }}>CSV</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d) => (
                <tr key={d.file}>
                  <td style={{ fontWeight: 500 }}>
                    {d.month}
                    {d.note && <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>*{d.note}</span>}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.count.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <DownloadLink
                      href={`${DATA_BASE}/${d.file}`}
                      filename={toDownloadName(d.file)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details style={{ marginTop: '24px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: 'var(--text)', padding: '8px 0' }}>
            Column Reference (34 columns)
          </summary>
          <div className="table-wrapper" style={{ marginTop: '12px' }}>
            <table className="data-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '120px', minWidth: '100px' }}>Column</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map((col) => (
                  <tr key={col.name}>
                    <td><code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 5px', borderRadius: '4px' }}>{col.name}</code></td>
                    <td style={{ color: '#666' }}>{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="tool-card" style={{ marginTop: '32px' }}>
        <h3 className="tool-title">Rent Stabilized Buildings</h3>
        <p className="tool-description" style={{ marginBottom: '12px' }}>
          The NYC Rent Guidelines Board publishes rent-stabilized building data across all five boroughs, but it lives in PDFs that are hard to work with. We cleaned and standardized the listings, made them searchable, and added latitude/longitude coordinates so anyone can map the buildings.
        </p>
        <p className="tool-description" style={{ marginBottom: '20px' }}>
          The Rent Guidelines Board notes its data &ldquo;...do not indicate which apartments in these buildings are rent stabilized, but rather, only those buildings that contain at least one rent stabilized unit.&rdquo; This is a hobby project and is not affiliated with NYC.gov.
        </p>
        <a href="https://docs.google.com/spreadsheets/d/1_yUjWl9Z1z6T_8oRqXscOU6KFV25ECYgVO69lORFyxI/edit?usp=drivesdk" target="_blank" rel="noopener noreferrer" className="cta-button" style={{ fontSize: '14px', padding: '10px 24px', background: 'var(--text)' }}>
          View Google Sheet <span style={{ fontSize: '13px', color: 'white' }}>↗</span>
        </a>
      </div>
    </div>
  );
}
