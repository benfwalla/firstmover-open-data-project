import { NextResponse } from 'next/server';
import neighborhoodData from '@/data/forecaster-neighborhoods.json';

const FORECAST_API_URL =
  process.env.FORECAST_API_URL ||
  'https://firstmover-fast-api.vercel.app/getAvgListingsLast14Days';

const allowedNeighborhoods = new Set(neighborhoodData.map(({ name }) => name));
const allowedBathrooms = new Set([0, 1, 1.5, 2, 3]);

type ForecastRequest = {
  neighborhoods?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
  bedrooms?: unknown;
  minBathroom?: unknown;
};

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function parseUpstreamResult(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const candidate = record.avg_listings_per_day ?? record.result;
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null;
}

export async function POST(request: Request) {
  let body: ForecastRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Enter valid search criteria.' }, { status: 400 });
  }

  const neighborhoods = Array.isArray(body.neighborhoods)
    ? [...new Set(body.neighborhoods)]
    : [];
  const bedrooms = Array.isArray(body.bedrooms)
    ? [...new Set(body.bedrooms)]
    : [];

  if (
    neighborhoods.length === 0 ||
    neighborhoods.length > 300 ||
    neighborhoods.some(
      (name) => typeof name !== 'string' || !allowedNeighborhoods.has(name),
    )
  ) {
    return NextResponse.json(
      { error: 'Choose at least one valid neighborhood.' },
      { status: 400 },
    );
  }

  if (
    !isIntegerInRange(body.minPrice, 0, 100_000) ||
    !isIntegerInRange(body.maxPrice, 0, 100_000) ||
    body.maxPrice < body.minPrice
  ) {
    return NextResponse.json(
      { error: 'Enter a valid minimum and maximum price.' },
      { status: 400 },
    );
  }

  if (
    bedrooms.length === 0 ||
    bedrooms.length > 11 ||
    bedrooms.some((bedroom) => !isIntegerInRange(bedroom, 0, 10))
  ) {
    return NextResponse.json({ error: 'Choose valid bedroom options.' }, { status: 400 });
  }

  if (typeof body.minBathroom !== 'number' || !allowedBathrooms.has(body.minBathroom)) {
    return NextResponse.json({ error: 'Choose a valid bathroom option.' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(FORECAST_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        neighborhood_names: neighborhoods,
        min_price: body.minPrice,
        max_price: body.maxPrice,
        bedrooms,
        min_bathroom: body.minBathroom,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Forecast API returned ${upstreamResponse.status}`);
    }

    const averageListingsPerDay = parseUpstreamResult(await upstreamResponse.json());
    return NextResponse.json({ averageListingsPerDay });
  } catch (error) {
    console.error('Notification forecast failed:', error);
    return NextResponse.json(
      { error: 'The forecast is unavailable right now. Try again shortly.' },
      { status: 502 },
    );
  }
}
