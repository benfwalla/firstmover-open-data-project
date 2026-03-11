import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import { FixedNavbar } from '@/components/FixedNavbar';
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://data.firstmovernyc.com'),
  title: "FirstMover Open Data Project · NYC Rental Market Data",
  description:
    "Free NYC rental market data, monthly rent reports, and tools for apartment hunters. Powered by real-time StreetEasy listing data from FirstMover.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'FirstMover Open Data Project',
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FirstMover',
    url: 'https://firstmovernyc.com',
    logo: 'https://data.firstmovernyc.com/logo.svg',
    sameAs: ['https://github.com/benfwalla/firstmover-open-data-project'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FirstMover Open Data Project',
    url: 'https://data.firstmovernyc.com',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <FixedNavbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
