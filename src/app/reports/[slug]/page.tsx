import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllSlugs } from '@/lib/content';
import { 
  StatCards, 
  DataTable, 
  ListingCard, 
  DataAttribution,
  PriceTrendsChart,
  NeighborhoodMap,
  mdxComponents 
} from '@/components/mdx-components';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Import data files that MDX components might need
import februaryData from '@/data/february-2026-data.json';

interface ReportPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs
    .filter(({ type }) => type === 'report')
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ReportPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug('report', resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Report Not Found | FirstMover Data'
    };
  }

  return {
    title: `${post.frontmatter.title} | FirstMover Data`,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = await params;
  const post = getPostBySlug('report', resolvedParams.slug);
  
  if (!post) {
    notFound();
  }

  // Prepare data for MDX components based on slug
  let componentData = {};
  if (resolvedParams.slug === 'february-2026') {
    componentData = {
      februaryData,
      neighborhoodData: februaryData.topNeighborhoods.slice(0, 20).map((neighborhood, index) => {
        const change = februaryData.neighborhoodChanges.find(c => c.area_name === neighborhood.area_name);
        return {
          rank: index + 1,
          neighborhood: neighborhood.area_name,
          listings: parseInt(neighborhood.listing_count as string),
          median_rent: neighborhood.median_rent,
          price_change: change?.price_change || 0,
          pct_change: change?.pct_change || 0
        };
      })
    };
  }

  return (
    <>
      {/* Header */}
      <section className="report-header">
        <div className="container">
          <Link href="/" className="logo-link">
            <img src="/logo.svg" alt="FirstMover" className="report-logo" />
          </Link>
          <h1 className="report-title">{post.frontmatter.title}</h1>
          {post.frontmatter.description && (
            <p className="report-subtitle">{post.frontmatter.description}</p>
          )}
          {post.frontmatter.readTime && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '8px' 
            }}>
              {post.frontmatter.readTime}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="report-section">
          <MDXRemote 
            source={post.content} 
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            components={{
              StatCards,
              ListingCard,
              DataAttribution,
              // Pass data to components that need it
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
                    <NeighborhoodMap 
                      data={februaryData.geoData}
                      {...props}
                    />
                  </div>
                  <DataAttribution />
                </div>
              ),
              DataTable: (props: any) => (
                <DataTable 
                  data={(componentData as any).neighborhoodData || []}
                  {...props}
                />
              )
            }}
          />
        </div>
      </div>

      {/* Footer CTA */}
      <section className="report-footer">
        <div className="container">
          <p>Data from FirstMover. Get alerts when new apartments drop in your target neighborhoods.</p>
          <a
            href="https://apps.apple.com/us/app/firstmover/id6740444528"
            className="app-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the app
          </a>
        </div>
      </section>
    </>
  );
}