import { LandingPage } from '@/components/landing/LandingPage';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FirstMover · Get StreetEasy Notifications Before Anyone Else',
  description: 'Beat the rush. Get new NYC rental listings the moment they go live on StreetEasy, for $30 lifetime. Real-time alerts, instant notifications, first-mover advantage.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    type: 'website',
    images: [{ url: '/images/landing/og_image_landing.png', width: 1200, height: 630 }],
  },
};

export default function LandingRoute() {
  return <LandingPage />;
}
