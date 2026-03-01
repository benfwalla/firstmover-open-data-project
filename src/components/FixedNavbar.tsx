'use client';

import { useState } from 'react';
import Link from 'next/link';

export const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
);

export function FixedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed-navbar">
      <div className="container">
        <div className="nav-container">
          <Link href="/" className="nav-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="" style={{ height: '28px', width: 'auto' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'var(--text)', letterSpacing: '-0.02em' }}>Open Data Project</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link href="/open-data" className="nav-link">
              Open Data
            </Link>
            <Link href="/reports" className="nav-link">
              Reports
            </Link>
            <Link href="/resources" className="nav-link">
              Resources
            </Link>
            <a href="https://github.com/benfwalla/firstmover-open-data-project" target="_blank" rel="noopener noreferrer" className="nav-github">
              <GitHubIcon />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="nav-mobile-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="nav-mobile-menu">
          <Link href="/open-data" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Open Data
          </Link>
          <Link href="/reports" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Reports
          </Link>
          <Link href="/resources" className="nav-mobile-link" onClick={() => setIsMenuOpen(false)}>
            Resources
          </Link>
          <a href="https://github.com/benfwalla/firstmover-open-data-project" target="_blank" rel="noopener noreferrer" className="nav-mobile-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      )}
    </nav>
  );
}
