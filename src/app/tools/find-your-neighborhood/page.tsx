import { FindYourNeighborhoodQuiz } from '@/components/FindYourNeighborhoodQuiz';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const budget = params.budget;
  const vibes = params.vibes;

  if (budget || vibes) {
    return {
      title: 'My NYC Neighborhood Results · FirstMover Open Data Project',
      description: `I found my perfect NYC neighborhoods with a $${budget} budget. See which neighborhoods match your lifestyle and commute.`,
      alternates: { canonical: '/tools/find-your-neighborhood' },
      openGraph: { url: '/tools/find-your-neighborhood', type: 'article' },
    };
  }

  return {
    title: 'Find Your NYC Neighborhood · FirstMover Open Data Project',
    description: 'Answer 3 questions to find your perfect NYC neighborhood based on budget, lifestyle, and commute.',
    alternates: { canonical: '/tools/find-your-neighborhood' },
    openGraph: { url: '/tools/find-your-neighborhood' },
  };
}

export default function FindYourNeighborhoodPage() {
  return (
    <div className="quiz-page">
      <h1 className="sr-only">Find Your NYC Neighborhood</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FindYourNeighborhoodQuiz />
      </Suspense>
    </div>
  );
}
