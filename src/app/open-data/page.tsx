export const metadata = {
  title: 'Open Data | FirstMover Open Data Project',
  description: 'Free NYC rental listing data. Monthly CSVs and rent stabilized building records.',
};

const monthlyData: { month: string; file: string; count: number; note?: string }[] = [
  { month: 'February 2026', file: 'listings-february-2026.csv', count: 15923 },
  { month: 'January 2026', file: 'listings-january-2026.csv', count: 17538 },
  { month: 'December 2025', file: 'listings-december-2025.csv', count: 15434 },
  { month: 'November 2025', file: 'listings-november-2025.csv', count: 11139, note: 'Missing Nov 1-7' },
  { month: 'October 2025', file: 'listings-october-2025.csv', count: 16144, note: 'Missing Oct 27-31' },
  { month: 'September 2025', file: 'listings-september-2025.csv', count: 22559 },
  { month: 'August 2025', file: 'listings-august-2025.csv', count: 24360 },
  { month: 'July 2025', file: 'listings-july-2025.csv', count: 27303 },
  { month: 'June 2025', file: 'listings-june-2025.csv', count: 24180 },
  { month: 'May 2025', file: 'listings-may-2025.csv', count: 25309 },
  { month: 'April 2025', file: 'listings-april-2025.csv', count: 21473 },
  { month: 'March 2025', file: 'listings-march-2025.csv', count: 19740 },
  { month: 'February 2025', file: 'listings-february-2025.csv', count: 12387 },
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
          Every month, we collect publicly available rental listings from StreetEasy and publish the factual data here for anyone to use. Each CSV contains the neighborhood, address, bedrooms, bathrooms, price, building type, square footage, and listing URL. No copyrighted content like photos or descriptions is reproduced. This project is not affiliated with or endorsed by StreetEasy or Zillow Group.
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
                    <a href={`/data/${d.file}`} download style={{ fontWeight: 500 }}>
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
