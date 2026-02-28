export const metadata = {
  title: 'Open Data | FirstMover Open Data Project',
  description: 'NYC rental market datasets, open and free. Monthly listing data and rent stabilized building records.',
};

const monthlyData: { month: string; file: string; count: number; note?: string }[] = [
  { month: 'February 2026', file: 'listings-february-2026.csv', count: 15923 },
  { month: 'January 2026', file: 'listings-january-2026.csv', count: 17538 },
  { month: 'December 2025', file: 'listings-december-2025.csv', count: 15434 },
  { month: 'November 2025', file: 'listings-november-2025.csv', count: 11139, note: 'Missing Nov 1–7 due to scraper outage' },
  { month: 'October 2025', file: 'listings-october-2025.csv', count: 16144, note: 'Missing Oct 27–31 due to scraper outage' },
  { month: 'September 2025', file: 'listings-september-2025.csv', count: 22559 },
  { month: 'August 2025', file: 'listings-august-2025.csv', count: 24360 },
  { month: 'July 2025', file: 'listings-july-2025.csv', count: 27303 },
  { month: 'June 2025', file: 'listings-june-2025.csv', count: 24180 },
  { month: 'May 2025', file: 'listings-may-2025.csv', count: 25309 },
  { month: 'April 2025', file: 'listings-april-2025.csv', count: 21473 },
  { month: 'March 2025', file: 'listings-march-2025.csv', count: 19740 },
  { month: 'February 2025', file: 'listings-february-2025.csv', count: 12387 },
  { month: 'January 2025', file: 'listings-january-2025.csv', count: 9491, note: 'Partial month — scraper launched mid-January' },
];

export default function OpenDataPage() {
  return (
    <div className="publication-section narrow">
      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Open Data</h1>
        <p className="section-subtitle">
          NYC rental market datasets, open and free.
        </p>
      </div>

      <div className="report-narrative">
        <h3 className="about-heading">Monthly Listing Data</h3>
        <p style={{ opacity: 0.7, marginBottom: '16px' }}>
          Each CSV contains neighborhood, address, bedrooms, bathrooms, price, building type, square footage, and listing URL.
        </p>
        <ul>
          {monthlyData.map((d) => (
            <li key={d.file}>
              <strong>{d.month}</strong> — {d.count.toLocaleString()} listings{' '}
              <a href={`/data/${d.file}`} download>
                (download CSV)
              </a>
              {d.note && (
                <span style={{ fontSize: '13px', color: '#999', display: 'block', marginTop: '2px' }}>
                  * {d.note}
                </span>
              )}
            </li>
          ))}
        </ul>

        <h3 className="about-heading" style={{ marginTop: '48px' }}>Rent Stabilized Buildings</h3>
        <ul>
          <li>
            <a href="https://docs.google.com/spreadsheets/d/1_yUjWl9Z1z6T_8oRqXscOU6KFV25ECYgVO69lORFyxI/edit?usp=drivesdk" target="_blank" rel="noopener noreferrer">
              Rent Stabilized Buildings — Google Sheet
            </a>{' '}
            <span style={{ opacity: 0.6 }}>(from firstmovernyc.com)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
