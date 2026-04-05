import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';

// Neighborhoods where the same area_name appears in multiple boroughs.
// Map from area_name to the zip codes that should be EXCLUDED.
const EXCLUDED_ZIPS: Record<string, string[]> = {
  'Murray Hill': ['11354', '11355', '11358', '11364', '10029'], // Exclude Queens + East Harlem zips from Manhattan Murray Hill
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const beds = searchParams.get('beds');
    const budget = searchParams.get('budget');

    const pool = getPool();

    let query = `
      SELECT
        area_name as name,
        bedroom_count as beds,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days') as recent_count
      FROM listings
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND price > 0
        AND area_name IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (beds) {
      query += ` AND bedroom_count = $${paramIndex}`;
      params.push(parseInt(beds));
      paramIndex++;
    }

    if (budget) {
      query += ` AND price <= $${paramIndex}`;
      params.push(parseInt(budget));
      paramIndex++;
    }

    // Exclude mismatched zip codes for neighborhoods with cross-borough name collisions
    for (const [name, zips] of Object.entries(EXCLUDED_ZIPS)) {
      const nameIdx = paramIndex++;
      const zipPlaceholders = zips.map(() => `$${paramIndex++}`).join(', ');
      query += ` AND NOT (area_name = $${nameIdx} AND zip_code IN (${zipPlaceholders}))`;
      params.push(name, ...zips);
    }

    query += `
      GROUP BY area_name, bedroom_count
      HAVING COUNT(*) >= 5
      ORDER BY COUNT(*) DESC, median_rent ASC
    `;

    const result = await pool.query(query, params);

    const neighborhoodMap = new Map();

    for (const row of result.rows) {
      const name = row.name;
      if (!neighborhoodMap.has(name)) {
        neighborhoodMap.set(name, {
          name,
          median_rents: {},
          total_listings: 0
        });
      }

      const neighborhood = neighborhoodMap.get(name);
      const bedKey = row.beds === 0 ? 'studio' : `${row.beds}br`;
      neighborhood.median_rents[bedKey] = parseInt(row.median_rent);
      neighborhood.total_listings += parseInt(row.listing_count);
      neighborhood.daily_avg = (neighborhood.daily_avg || 0) + parseInt(row.recent_count) / 14;
    }

    const neighborhoods = Array.from(neighborhoodMap.values())
      .sort((a: any, b: any) => b.total_listings - a.total_listings);

    return Response.json(neighborhoods);

  } catch (error: any) {
    console.error('Neighborhoods API error:', error?.message);
    return Response.json(
      { error: 'Failed to fetch neighborhood data', detail: error?.message },
      { status: 500 }
    );
  }
}
