import { Suspense } from 'react';
import { GuessTheRentGame } from '@/components/GuessTheRentGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guess the Rent · FirstMover Open Data Project',
  description: 'Think you know NYC rent prices? Guess the monthly rent on real listings and see how you stack up.',
  alternates: { canonical: '/tools/guess-the-rent' },
  openGraph: { url: '/tools/guess-the-rent' },
};

export default function GuessTheRentPage() {
  return (
    <main className="gtr-page">
      <h1 className="sr-only">Guess the Rent - NYC Rental Price Game</h1>
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
