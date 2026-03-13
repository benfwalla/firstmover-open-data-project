import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is My Rent Fair? · FirstMover Open Data Project',
  description: 'Compare your NYC rent to the neighborhood median and see where you fall in the price range. Powered by the latest NYC rental listing data.',
  alternates: { canonical: '/tools/rent-check' },
  openGraph: { url: '/tools/rent-check' },
};

export default function RentCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
