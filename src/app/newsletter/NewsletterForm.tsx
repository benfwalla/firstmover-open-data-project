'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const endpoint =
        process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ||
        (process.env.NODE_ENV === 'development' ? '/api/newsletter' : undefined);
      if (!endpoint) {
        throw new Error('Newsletter endpoint is not configured.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Something went wrong.');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  return (
    <div className="tool-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h2 className="tool-title" style={{ marginBottom: '8px' }}>Get the monthly report</h2>
      <p className="tool-description" style={{ marginBottom: '20px' }}>
        A short, data-first recap with highlights, neighborhood shifts, and new datasets.
      </p>

      {status === 'success' ? (
          <div className="cta-section" style={{ marginTop: 0 }}>
            <p style={{fontSize: 32}}>🎉 </p>
            <p style={{ marginBottom: 0 }}>
             Almost done! Confirm your subscription in the email we just sent.
            </p>
          </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{
                flex: '1 1 220px',
                minWidth: '200px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--light-gray)',
                fontSize: '16px',
                background: 'white',
                color: 'var(--text)',
              }}
            />
            <button
              type="submit"
              className="cta-button"
              style={{ justifyContent: 'center', padding: '12px 24px', border: 'none', background: 'var(--dark)' }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Submitting...' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && (
            <p style={{ color: '#b42318', fontSize: '14px', marginTop: '10px' }}>{errorMessage}</p>
          )}
        </form>
      )}

      <p className="tool-description" style={{ marginTop: '16px' }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
