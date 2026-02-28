import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="publication-hero">
        <div className="container">
          <img src="/logo.svg" alt="FirstMover" className="publication-logo" />
          <h1 className="publication-title">FirstMover Open Data Project</h1>
          <p className="publication-tagline">
            Free NYC rental listing data, updated monthly.
          </p>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '24px auto 0' }}>
            We collect rental listings from StreetEasy every month and publish everything as downloadable CSVs.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="publication-section">
        <div className="tools-grid">
          <Link href="/open-data" className="tool-card">
            <h3 className="tool-title">Open Data</h3>
            <p className="tool-description">
              Monthly listing CSVs and a rent stabilized buildings database.
            </p>
          </Link>

          <Link href="/reports" className="tool-card">
            <h3 className="tool-title">Reports</h3>
            <p className="tool-description">
              Monthly rent reports breaking down what&apos;s happening across NYC neighborhoods.
            </p>
          </Link>

          <Link href="/resources" className="tool-card">
            <h3 className="tool-title">Resources</h3>
            <p className="tool-description">
              Interactive tools and games to explore NYC&apos;s rental market.
            </p>
          </Link>
        </div>
      </section>

      {/* spacer */}
    </>
  );
}
