export const metadata = {
  title: 'Open Data | FirstMover Open Data Project',
  description: 'Free NYC rental listing data. Monthly CSVs and rent stabilized building records.',
};

const monthlyData: { month: string; file: string; count: number; note?: string }[] = [
  { month: 'February 2026', file: '2026-02.csv', count: 16048 },
  { month: 'January 2026', file: '2026-01.csv', count: 17538 },
  { month: 'December 2025', file: '2025-12.csv', count: 15434 },
  { month: 'November 2025', file: '2025-11.csv', count: 11139, note: 'Scraper down Nov 1–7' },
  { month: 'October 2025', file: '2025-10.csv', count: 16144, note: 'Scraper down Oct 27–31' },
  { month: 'September 2025', file: '2025-09.csv', count: 22559 },
  { month: 'August 2025', file: '2025-08.csv', count: 24360 },
  { month: 'July 2025', file: '2025-07.csv', count: 27303 },
  { month: 'June 2025', file: '2025-06.csv', count: 24180 },
  { month: 'May 2025', file: '2025-05.csv', count: 25309 },
  { month: 'April 2025', file: '2025-04.csv', count: 21473 },
  { month: 'March 2025', file: '2025-03.csv', count: 19740 },
  { month: 'February 2025', file: '2025-02.csv', count: 12387 },
  { month: 'January 2025', file: '2025-01.csv', count: 9491, note: 'Some corrupted date_listed values' },
];

const COLUMNS = [
  { name: 'id', desc: 'Unique listing identifier' },
  { name: 'street', desc: 'Street address' },
  { name: 'unit', desc: 'Unit number' },
  { name: 'neighborhood', desc: 'Neighborhood name' },
  { name: 'borough', desc: 'NYC borough or NJ' },
  { name: 'zip_code', desc: 'ZIP code' },
  { name: 'state', desc: 'State (NY, NJ)' },
  { name: 'latitude', desc: 'Latitude coordinate' },
  { name: 'longitude', desc: 'Longitude coordinate' },
  { name: 'building_type', desc: 'Building type' },
  { name: 'bedrooms', desc: 'Bedroom count (0 = studio)' },
  { name: 'bathrooms', desc: 'Full bathroom count' },
  { name: 'half_baths', desc: 'Half bathroom count' },
  { name: 'sqft', desc: 'Square footage' },
  { name: 'furnished', desc: 'Whether the unit is furnished' },
  { name: 'is_new_development', desc: 'Whether the building is a new development' },
  { name: 'price', desc: 'Monthly asking rent' },
  { name: 'net_effective_price', desc: 'Net effective rent after concessions' },
  { name: 'lease_months', desc: 'Lease term in months' },
  { name: 'months_free', desc: 'Free months offered' },
  { name: 'no_fee', desc: 'Whether there is no broker fee' },
  { name: 'source_group_label', desc: 'Listing source/brokerage' },
  { name: 'source_type', desc: 'Source type (e.g. PARTNER)' },
  { name: 'status', desc: 'Listing status' },
  { name: 'created_at_utc', desc: 'When the listing was first seen (UTC)' },
  { name: 'available_date', desc: 'Move-in date' },
  { name: 'has_videos', desc: 'Whether the listing has video' },
  { name: 'has_3d_tour', desc: 'Whether the listing has a 3D tour' },
  { name: 'media_asset_count', desc: 'Total media assets' },
  { name: 'lead_photo_hash', desc: 'Primary photo hash (see photo URL pattern below)' },
  { name: 'photo_hashes', desc: 'All photo hashes, comma-separated' },
  { name: 'open_house_start_utc', desc: 'Open house start time (UTC)' },
  { name: 'open_house_end_utc', desc: 'Open house end time (UTC)' },
  { name: 'open_house_appointment_only', desc: 'Whether the open house is by appointment' },
  { name: 'url', desc: 'Full StreetEasy listing URL' },
];

export default function OpenDataPage() {
  return (
    <div className="publication-section narrow">
      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Open Data</h1>
        <p className="section-subtitle">
          Free NYC rental listing data.
        </p>
      </div>

      {/* Monthly Listing Data */}
      <div className="open-data-card">
        <h3 className="tool-title">Monthly Listing Data</h3>
        <p className="tool-description" style={{ marginBottom: '20px' }}>
          Every month, we collect publicly available rental listings from StreetEasy and publish the raw data here for anyone to use. Each CSV contains 35 columns including address, coordinates, pricing, concessions, building details, media, open house info, and listing URLs. No copyrighted content like photos or descriptions is reproduced. This project is not affiliated with or endorsed by StreetEasy or Zillow Group.
        </p>

        <div className="table-wrapper">
          <table className="data-table" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Listings</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d) => (
                <tr key={d.file}>
                  <td>
                    <a href={`https://raw.githubusercontent.com/benfwalla/firstmover-open-data-project/main/public/data/${d.file}`} download style={{ fontWeight: 500 }}>
                      {d.month}
                    </a>
                    {d.note && (
                      <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                        *{d.note}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {d.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Reference */}
      <div className="open-data-card" style={{ marginTop: '32px' }}>
        <h3 className="tool-title">Column Reference</h3>
        <p className="tool-description" style={{ marginBottom: '20px' }}>
          All 35 columns included in each monthly CSV, in order.
        </p>
        <div className="table-wrapper">
          <table className="data-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Column</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNS.map((col) => (
                <tr key={col.name}>
                  <td><code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{col.name}</code></td>
                  <td style={{ color: '#666' }}>{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rent Stabilized Buildings */}
      <div className="open-data-card" style={{ marginTop: '32px' }}>
        <h3 className="tool-title">Rent Stabilized Buildings</h3>
        <p className="tool-description" style={{ marginBottom: '16px' }}>
          The NYC Rent Guidelines Board publishes rent-stabilized building data across all five boroughs, but it lives in PDFs that are hard to work with. We cleaned and standardized the listings, made them searchable, and added latitude/longitude coordinates so anyone can map the buildings.
        </p>
        <p className="tool-description" style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
          The Rent Guidelines Board notes its data "...do not indicate which apartments in these buildings are rent stabilized, but rather, only those buildings that contain at least one rent stabilized unit." This is a hobby project and is not affiliated with NYC.gov.
        </p>
        <a
          href="https://docs.google.com/spreadsheets/d/1_yUjWl9Z1z6T_8oRqXscOU6KFV25ECYgVO69lORFyxI/edit?usp=drivesdk"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{ fontSize: '14px', padding: '10px 24px' }}
        >
          View Google Sheet
        </a>
      </div>
    </div>
  );
}
