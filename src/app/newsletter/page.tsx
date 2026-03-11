import type { Metadata } from 'next';
import NewsletterForm from './NewsletterForm';

export const metadata: Metadata = {
  title: 'Newsletter · FirstMover Open Data Project',
  description: 'Get monthly NYC rental market insights delivered to your inbox. Data-driven reports on rent prices, trends, and neighborhood analysis.',
  alternates: { canonical: '/newsletter' },
  openGraph: { url: '/newsletter' },
};

export default function NewsletterPage() {
  return (
    <div className="publication-section narrow">
      <div className="section-header" style={{ textAlign: 'center' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>Newsletter</h1>
        <p className="section-subtitle" style={{ maxWidth: '520px', margin: '12px auto 0' }}>
          Subscribe for monthly report updates and the latest on NYC housing trends.
        </p>
      </div>

      <NewsletterForm />
    </div>
  );
}
