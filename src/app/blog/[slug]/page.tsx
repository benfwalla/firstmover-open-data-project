import { compileMDXContent } from '@/lib/mdx';
import { getPostBySlug, getAllSlugs } from '@/lib/content';
import {
  StatCards,
  DataTable,
  ListingCard,
  DataAttribution,
  PriceTrendsChart,
  NeighborhoodMap,
} from '@/components/mdx-components';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs
    .filter(({ type }) => type === 'blog')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug('blog', resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found | FirstMover Data'
    };
  }

  return {
    title: `${post.frontmatter.title} · FirstMover Open Data Project`,
    description: post.frontmatter.description,
    alternates: { canonical: `/blog/${resolvedParams.slug}` },
    openGraph: { url: `/blog/${resolvedParams.slug}`, type: 'article' },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug('blog', resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const Content = await compileMDXContent(post.content, {
    StatCards,
    DataTable,
    ListingCard,
    DataAttribution,
    PriceTrendsChart,
    NeighborhoodMap,
  });

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: 'FirstMover',
      url: 'https://firstmovernyc.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FirstMover',
      logo: {
        '@type': 'ImageObject',
        url: 'https://data.firstmovernyc.com/logo.svg',
      },
    },
    mainEntityOfPage: `https://data.firstmovernyc.com/blog/${resolvedParams.slug}`,
  };

  return (
    <div className="publication-section narrow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 className="section-title" style={{ fontSize: '36px' }}>
            {post.frontmatter.title}
          </h1>
          <p className="section-subtitle">
            {post.frontmatter.description}
          </p>
          <div style={{
            fontSize: '14px',
            color: '#888',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '16px'
          }}>
            <span>{new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            {post.frontmatter.readTime && (
              <>
                <span>•</span>
                <span>{post.frontmatter.readTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="report-narrative">
          <Content />
        </div>

        {/* Footer Navigation */}
        <div style={{
          background: 'var(--light-gray)',
          padding: '24px',
          borderRadius: '12px',
          marginTop: '48px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            Want more NYC rental insights?
          </p>
          <Link
            href="/blog"
            className="cta-button-secondary"
            style={{ marginRight: '16px' }}
          >
            ← More Blog Posts
          </Link>
          <a
            href="https://apps.apple.com/us/app/firstmover/id6740444528"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button-primary"
          >
            Download FirstMover
          </a>
        </div>
      </div>
    </div>
  );
}
