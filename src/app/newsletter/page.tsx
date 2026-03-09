import NewsletterForm from './NewsletterForm';

export const metadata = {
  title: 'Newsletter | FirstMover Open Data Project',
  description: 'Monthly report updates and the latest NYC housing trends.',
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
