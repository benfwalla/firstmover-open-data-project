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
  title: "FirstMover Open Data Project · NYC Rental Market Data",
  description:
    "Free NYC rental listing data, updated monthly. Downloadable CSVs, rent reports, and tools for apartment hunters.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "FirstMover Open Data Project · NYC Rental Market Data",
    description: "Free NYC rental listing data, updated monthly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${inter.variable}`}>
      <body>
        <FixedNavbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
