import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostsByType } from '@/lib/content';

export const metadata: Metadata = {
  title: 'NYC Rent Blog · FirstMover Open Data Project',
  description: 'Data-driven insights on NYC\'s rental market. Neighborhood deep dives, rent trends, and guides powered by real listing data.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getPostsByType('blog');

  return (
    <div className="publication-section narrow">
      <div className="section-header">
        <h1 className="section-title" style={{ fontSize: '40px' }}>Blog</h1>
        <p className="section-subtitle">
          Data-driven insights on NYC&apos;s rental market.
        </p>
      </div>

      <div className="blog-posts-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-post-card">
            <h2 className="blog-post-title">{post.frontmatter.title}</h2>
            <p style={{ fontSize: '15px', color: '#666', margin: '8px 0 12px', lineHeight: 1.5 }}>
              {post.frontmatter.description}
            </p>
            <div className="blog-post-meta">
              {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {post.frontmatter.readTime && ` · ${post.frontmatter.readTime}`}
            </div>
          </Link>
        ))}
      </div>

      <p className="fm-attribution" style={{ marginTop: '48px', textAlign: 'center' }}>
        A <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer">FirstMover</a> project
      </p>
    </div>
  );
}
