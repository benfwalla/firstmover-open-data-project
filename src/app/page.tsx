import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="home-hero">
      <div className="container">
        <div className="home-grid">
          {/* Top-left: intro */}
          <div className="home-intro">
            <h1 className="publication-title">The FirstMover Open Data Project</h1>
            <p className="home-description">
              Democratizing NYC rental data and resources for renters and analysts.
              Free listing data, tools, and guides updated every month.
            </p>
            <div className="home-links">
              <Link href="/about" className="home-about-link">About</Link>
              <a href="https://github.com/benfwalla/firstmover-open-data-project" target="_blank" rel="noopener noreferrer" className="home-about-link">GitHub <span style={{ fontSize: '13px', color: 'black' }}>↗</span></a>
            </div>
          </div>

          {/* Top-right: Open Data */}
          <Link href="/open-data" className="tool-card">
            <h3 className="tool-title">Open Data</h3>
            <p className="tool-description">
              Monthly listing CSVs and a rent stabilized buildings database.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/open_data_listings_preview.svg" alt="Open Data preview" className="tool-card-preview" />
            </div>
          </Link>

          {/* Bottom-left: Reports */}
          <Link href="/reports" className="tool-card">
            <h3 className="tool-title">Reports</h3>
            <p className="tool-description">
              Monthly rent reports breaking down what's happening across NYC.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/reports_preview.png" alt="Reports preview" className="tool-card-preview" />
            </div>
          </Link>

          {/* Bottom-right: Resources */}
          <Link href="/resources" className="tool-card">
            <h3 className="tool-title">Resources</h3>
            <p className="tool-description">
              Interactive tools and sites to explore NYC's rental market.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/resource_preview.svg" alt="Resources preview" className="tool-card-preview" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
