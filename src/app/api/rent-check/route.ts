import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { getAllNeighborhoods } from '@/lib/neighborhoods';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const neighborhood = searchParams.get('neighborhood');
    const bedrooms = searchParams.get('bedrooms');

    // Mode 1: Return static neighborhood list (no DB query needed)
    if (!neighborhood) {
      return Response.json({ neighborhoods: getAllNeighborhoods().sort() });
    }

    const pool = getPool();

    // Mode 2: Return monthly trends for a specific neighborhood + bedroom combo
    const beds = parseInt(bedrooms || '1');

    // Run both queries in parallel
    const [trendsResult, currentResult] = await Promise.all([
      pool.query(`
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
          COUNT(*) as listing_count
        FROM listings
        WHERE area_name = $1
          AND bedroom_count = $2
          AND price > 0
        GROUP BY date_trunc('month', created_at)
        ORDER BY month
      `, [neighborhood, beds]),
      pool.query(`
        SELECT
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
          COUNT(*) as listing_count
        FROM listings
        WHERE area_name = $1
          AND bedroom_count = $2
          AND price > 0
          AND created_at >= NOW() - INTERVAL '90 days'
      `, [neighborhood, beds]),
    ]);

    const currentMedian = currentResult.rows[0]?.median_rent
      ? parseInt(currentResult.rows[0].median_rent)
      : null;
    const currentCount = parseInt(currentResult.rows[0]?.listing_count || '0');

    // If we have zero data for this exact combo, try to offer broader data
    // by showing all bedroom types available for this neighborhood
    let availableBedrooms: number[] = [];
    if (trendsResult.rows.length === 0) {
      const bedsResult = await pool.query(`
        SELECT DISTINCT bedroom_count, COUNT(*) as cnt
        FROM listings
        WHERE area_name = $1 AND price > 0
        GROUP BY bedroom_count
        HAVING COUNT(*) >= 3
        ORDER BY bedroom_count
      `, [neighborhood]);
      availableBedrooms = bedsResult.rows.map(r => r.bedroom_count);
    }

    return Response.json({
      neighborhood,
      bedrooms: beds,
      monthly_trends: trendsResult.rows.map(r => ({
        month: r.month,
        median_rent: parseInt(r.median_rent),
        listing_count: parseInt(r.listing_count),
      })),
      current_median: currentMedian,
      current_listing_count: currentCount,
      available_bedrooms: availableBedrooms,
    });
  } catch (error: any) {
    console.error('Rent check API error:', error?.message);
    return Response.json(
      { error: 'Failed to fetch rent check data', detail: error?.message },
      { status: 500 }
    );
  }
}
