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
import marchData from '@/data/march-2026-data.json';

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
    title: `${post.frontmatter.title} · FirstMover Open Data Project`,
    description: post.frontmatter.description,
    alternates: { canonical: `/reports/${slug}` },
    openGraph: { url: `/reports/${slug}`, type: 'article' },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params;
  const post = getPostBySlug('report', slug);
  if (!post) notFound();

  // Select data based on report slug
  const reportDataMap: Record<string, any> = {
    'february-2026': februaryData,
    'march-2026': marchData,
  };
  const data = reportDataMap[slug];
  if (!data) notFound();

  const neighborhoodData = data.topNeighborhoods.slice(0, 20).map((n: any, i: number) => {
    const change = data.neighborhoodChanges.find((c: any) => c.area_name === n.area_name);
    return {
      rank: i + 1,
      neighborhood: n.area_name,
      listings: parseInt(n.listing_count as string),
      median_rent: n.median_rent,
      price_change: change?.price_change || 0,
      pct_change: change?.pct_change || 0,
    };
  });

  const Content = await compileMDXContent(post.content, {
    PriceTrendsChart: (props: any) => (
      <div className="chart-wrapper" style={{ margin: '32px 0' }}>
        <PriceTrendsChart
          data={data.monthlyTrends}
          monthlyTrendsWithBedrooms={data.monthlyTrendsWithBedrooms}
          {...props}
        />
        <div style={{ fontSize: '12px', color: '#aaa', textAlign: 'right', marginTop: '8px' }}>Powered by data provided by FirstMover</div>
      </div>
    ),
    NeighborhoodMap: (props: any) => (
      <div style={{ margin: '32px 0' }}>
        <div className="map-container">
          <NeighborhoodMap data={data.geoData} {...props} />
        </div>
        <div style={{ fontSize: '12px', color: '#aaa', textAlign: 'right', marginTop: '8px' }}>Powered by data provided by FirstMover</div>
      </div>
    ),
    DataTable: (props: any) => (
      <DataTable data={neighborhoodData} {...props} />
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
