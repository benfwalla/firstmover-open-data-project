'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'all' | 'tools' | 'search' | 'research' | 'guides';

function getFaviconUrl(href: string, external?: boolean): string {
  if (!external) return '/favicon.png';
  try {
    const domain = new URL(href).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '/favicon.png';
  }
}

interface Resource {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  tweetHref?: string;
  category: Category;
}

const resources: Resource[] = [
  // Tools (our interactive stuff)
  {
    title: 'Find Your Neighborhood',
    description: 'Enter your budget, lifestyle, and commute, and we\'ll recommend the perfect neighborhoods.',
    href: '/tools/find-your-neighborhood',
    category: 'tools',
  },
  {
    title: 'Guess the Rent Game',
    description: 'We show you real listings, you guess the monthly rent.',
    href: '/tools/guess-the-rent',
    category: 'tools',
  },
  {
    title: 'Is My Rent Fair?',
    description: 'Compare your rent to the median in your neighborhood. Find out if you\'re overpaying.',
    href: '/tools/rent-check',
    category: 'tools',
  },
  {
    title: 'Neighborhood Pages',
    description: 'Detailed rental market data for 170+ NYC neighborhoods: median rents, trends, and active listings. Updated daily.',
    href: '/neighborhoods',
    category: 'research',
  },

  {
    title: 'NYC Commute Time Map',
    description: 'Visualizes NYC as a heatmap based on commute time to any destination. Useful for figuring out where to live.',
    href: 'https://ranger.parallai.com/New%20York%20City',
    external: true,
    tweetHref: 'https://x.com/towheretobegin/status/2033210425509023918',
    category: 'tools',
  },

  // Apartment Search
  {
    title: 'FirstMover',
    description: 'Instant push notifications when new NYC rental listings match your search.',
    href: 'https://apps.apple.com/us/app/firstmover/id6740444528',
    external: true,
    category: 'search',
  },
  {
    title: 'PadDaddy',
    description: 'Scores apartments on price per sqft, distance to parks, and broker fee amortization.',
    href: 'https://paddaddy.app',
    external: true,
    category: 'search',
  },
  {
    title: 'Realer Estate',
    description: 'Analyzes NYC rental listings to find undervalued apartments using comps. Scores deals on a grading scale.',
    href: 'https://realerestate.org',
    external: true,
    category: 'search',
  },
  {
    title: 'Unseen Apartments',
    description: 'Hire locals to tour apartments for you. They send back photos, videos, and notes.',
    href: 'https://unseenapartments.io',
    external: true,
    category: 'search',
  },

  // Building & Landlord Research
  {
    title: 'OpenIgloo',
    description: 'Tenant reviews, violation history, bedbug data, 311 complaints, and a rent-stabilized building map.',
    href: 'https://www.openigloo.com',
    external: true,
    category: 'research',
  },
  {
    title: 'Who Owns What (JustFix)',
    description: 'Search by address or landlord name to see their full portfolio, HPD complaints, violations, and building history.',
    href: 'https://whoownswhat.justfix.org',
    external: true,
    category: 'research',
  },
  {
    title: 'HPD Online',
    description: 'Official NYC portal to look up building complaints, violations, and housing code issues by address.',
    href: 'https://hpdonline.nyc.gov/hpdonline/',
    external: true,
    category: 'research',
  },
  // Guides & Advice & Checklists
  {
    title: 'NYC Apartment Hunting Checklist',
    description: 'Exhaustive checklist from r/AskNYC (313 upvotes) covering building checks, unit checks, location checks, bugs, water pressure, violations, and more.',
    href: 'https://www.reddit.com/r/AskNYC/comments/gvkya2/',
    external: true,
    category: 'guides',
  },
  {
    title: 'Ultimate NYC Renting 101',
    description: 'Comprehensive guide from r/AskNYC covering budget rules (40x rent), documents needed, timeline, broker fees, and the full rental process.',
    href: 'https://www.reddit.com/r/AskNYC/comments/bxgwx5/',
    external: true,
    category: 'guides',
  },
  {
    title: 'Advice for NYC Apartment Seekers',
    description: 'Practical tips from someone who posted a popular NYC listing, covering the process, red flags, and what makes applicants stand out.',
    href: 'https://www.reddit.com/r/NYCapartments/comments/1efhsj0/',
    external: true,
    category: 'guides',
  },
];

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tools', label: 'Our Tools' },
  { key: 'search', label: 'Apartment Search' },
  { key: 'research', label: 'Building Research' },
  { key: 'guides', label: 'Guides & Checklists' },
];

export default function ResourcesPage() {
  const [active, setActive] = useState<Category>('all');

  const filtered = active === 'all' ? resources : resources.filter(r => r.category === active);

  return (
    <div className="publication-section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Resources</h1>
        <p className="section-subtitle" style={{ maxWidth: '500px', margin: '12px auto 0' }}>
          Tools, apps, and guides for navigating NYC&apos;s rental market
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={active === c.key ? 'filter-pill filter-pill-active' : 'filter-pill'}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="tools-grid">
        {filtered.map(r => {
          const favicon = getFaviconUrl(r.href, r.external);
          const inner = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={favicon}
                  alt=""
                  width={20}
                  height={20}
                  style={{ borderRadius: '4px', flexShrink: 0 }}
                />
                <h3 className="tool-title" style={{ margin: 0 }}>
                  {r.title}
                  {r.external && <span style={{ fontSize: '13px', opacity: 0.4, marginLeft: '6px' }}>↗</span>}
                </h3>
              </div>
              <p className="tool-description">{r.description}</p>
            </>
          );

          if (r.tweetHref) {
            return (
              <div key={r.title} className="tool-card">
                {inner}
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                    Visit ↗
                  </a>
                  <a href={r.tweetHref} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#999' }}>
                    via tweet ↗
                  </a>
                </div>
              </div>
            );
          }

          return r.external ? (
            <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className="tool-card">
              {inner}
            </a>
          ) : (
            <Link key={r.title} href={r.href} className="tool-card">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
