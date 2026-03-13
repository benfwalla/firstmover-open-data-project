import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NYC Rental Market Data & Reports · FirstMover',
  description: 'Free NYC rental listing data, monthly rent reports, and interactive tools for apartment hunters. Powered by the latest data from FirstMover.',
  alternates: { canonical: '/' },
  openGraph: { url: '/', type: 'website' },
};

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
              Free listing data, tools, and guides powered by the latest data.
            </p>
            <div className="home-links">
              <Link href="/about" className="home-about-link">About</Link>
              <Link href="/newsletter" className="home-about-link">Newsletter</Link>
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
              <img src="/open/images/open_data_listings_preview.svg" alt="Open Data preview" className="tool-card-preview" />
            </div>
          </Link>

          {/* Bottom-left: Reports */}
          <Link href="/reports" className="tool-card">
            <h3 className="tool-title">Reports</h3>
            <p className="tool-description">
              Monthly rent reports breaking down what's happening across NYC.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/open/images/reports_preview.png" alt="Reports preview" className="tool-card-preview" />
            </div>
          </Link>

          {/* Bottom-right: Resources */}
          <Link href="/resources" className="tool-card">
            <h3 className="tool-title">Resources</h3>
            <p className="tool-description">
              Interactive tools and sites to explore NYC's rental market.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/open/images/resource_preview.svg" alt="Resources preview" className="tool-card-preview" />
            </div>
          </Link>

          {/* Neighborhoods */}
          <Link href="/neighborhoods" className="tool-card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="tool-title">Neighborhoods</h3>
            <p className="tool-description">
              Rent prices, subway access, and commute times for 170+ NYC neighborhoods.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
