import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import { FixedNavbar } from '@/components/FixedNavbar';
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.firstmovernyc.com'),
  title: "FirstMover Open Data Project · NYC Rental Market Data",
  description:
    "Free NYC rental market data, monthly rent reports, and tools for apartment hunters. Powered by real listing data from FirstMover.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
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
  other: {
    'apple-itunes-app': 'app-id=6740444528',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FirstMover',
    url: 'https://www.firstmovernyc.com',
    logo: 'https://www.firstmovernyc.com/logo.svg',
    sameAs: ['https://github.com/benfwalla/firstmover-open-data-project'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FirstMover Open Data Project',
    url: 'https://www.firstmovernyc.com',
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
