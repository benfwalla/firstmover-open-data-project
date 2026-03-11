import Link from 'next/link';
import { getPostsByType } from '@/lib/content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports · FirstMover Open Data Project',
  description: 'Monthly NYC rent reports with real data. See average rents, price trends, and neighborhood breakdowns across Manhattan, Brooklyn, Queens, and more.',
  alternates: { canonical: '/reports' },
  openGraph: { url: '/reports' },
};

export default function ReportsPage() {
  const reports = getPostsByType('report');
  return (
    <div className="publication-section narrow">
      <div className="section-header">
        <h1 className="section-title" style={{ fontSize: '40px' }}>Reports</h1>
        <p className="section-subtitle">
          Monthly rent reports breaking down what&apos;s happening across NYC.
        </p>
      </div>
      
      <div className="blog-posts-list">
        {reports.map(post => (
          <Link key={post.slug} href={`/reports/${post.slug}`} className="blog-post-card">
            <h2 className="blog-post-title">{post.frontmatter.title}</h2>
            <div className="blog-post-meta">
              {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              {post.frontmatter.readTime && ` · ${post.frontmatter.readTime}`}
            </div>
            {/* description omitted — title already conveys the month */}
          </Link>
        ))}
      </div>
    </div>
  );
}
