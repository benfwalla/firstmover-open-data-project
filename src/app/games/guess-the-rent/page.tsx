import { Suspense } from 'react';
import { GuessTheRentGame } from '@/components/GuessTheRentGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guess the Rent | FirstMover',
  description: 'Think you know NYC rent prices? Guess the monthly rent on real listings and see how you stack up.',
  openGraph: {
    title: 'Guess the Rent',
    description: 'Think you know NYC rent prices? Test your instincts on real listings.',
    images: ['/og-image.png'],
  },
};

export default function GuessTheRentPage() {
  return (
    <main className="gtr-page">
      <Suspense fallback={
        <div className="gtr-container">
          <div className="gtr-loading">
            <div className="gtr-loading-spinner" />
            <p>Loading...</p>
          </div>
        </div>
      }>
        <GuessTheRentGame />
      </Suspense>
    </main>
  );
}
