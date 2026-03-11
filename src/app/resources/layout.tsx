import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources · FirstMover Open Data Project',
  description: 'Free tools and interactive resources for NYC apartment hunters. Explore rental market data, neighborhood guides, and open house maps.',
  alternates: { canonical: '/resources' },
  openGraph: { url: '/resources' },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
