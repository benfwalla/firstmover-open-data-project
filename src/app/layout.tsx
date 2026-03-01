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
        <footer className="site-footer">
          <div className="container">
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'black' }}>
              Built by <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer" className="footer-link">FirstMover</a>
              <a href="https://github.com/benfwalla/firstmover-open-data-project" target="_blank" rel="noopener noreferrer" className="footer-github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
