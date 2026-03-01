import { compileMDXContent } from '@/lib/mdx';
import { getPostBySlug, getAllSlugs } from '@/lib/content';
import {
  DataTable,
  DataAttribution,
  PriceTrendsChart,
  NeighborhoodMap,
} from '@/components/mdx-components';
import { notFound } from 'next/navigation';

import februaryData from '@/data/february-2026-data.json';

interface ReportPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs()
    .filter(({ type }) => type === 'report')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ReportPageProps) {
  const { slug } = await params;
  const post = getPostBySlug('report', slug);
  if (!post) return { title: 'Report Not Found' };

  return {
    title: `${post.frontmatter.title} | FirstMover Open Data Project`,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params;
  const post = getPostBySlug('report', slug);
  if (!post) notFound();

  // Build neighborhood table data
  const neighborhoodData = slug === 'february-2026'
    ? februaryData.topNeighborhoods.slice(0, 20).map((n, i) => {
        const change = februaryData.neighborhoodChanges.find(c => c.area_name === n.area_name);
        return {
          rank: i + 1,
          neighborhood: n.area_name,
          listings: parseInt(n.listing_count as string),
          median_rent: n.median_rent,
          price_change: change?.price_change || 0,
          pct_change: change?.pct_change || 0,
        };
      })
    : [];

  const Content = await compileMDXContent(post.content, {
    PriceTrendsChart: (props: any) => (
      <div className="chart-wrapper" style={{ margin: '32px 0' }}>
        <PriceTrendsChart
          data={februaryData.monthlyTrends}
          monthlyTrendsWithBedrooms={februaryData.monthlyTrendsWithBedrooms}
          {...props}
        />
      </div>
    ),
    NeighborhoodMap: (props: any) => (
      <div style={{ margin: '32px 0' }}>
        <div className="map-container">
          <NeighborhoodMap data={februaryData.geoData} {...props} />
        </div>
      </div>
    ),
    DataTable: (props: any) => (
      <DataTable
        columns={[
          { header: '#', key: 'rank' },
          { header: 'Neighborhood', key: 'neighborhood' },
          { header: 'Listings', key: 'listings', render: (v: number) => v.toLocaleString() },
          { header: 'Median Rent', key: 'median_rent', render: (v: number) => `$${Math.round(v).toLocaleString()}` },
          { header: 'MoM', key: 'pct_change', render: (v: number) => `${v > 0 ? '+' : ''}${v}%` },
        ]}
        data={neighborhoodData}
        {...props}
      />
    ),
    DataAttribution,
  });

  return (
    <div className="publication-section narrow">
      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>{post.frontmatter.title}</h1>
        {post.frontmatter.description && (
          <p className="section-subtitle">{post.frontmatter.description}</p>
        )}
      </div>

      <article className="report-narrative">
        <Content />
      </article>
    </div>
  );
}
