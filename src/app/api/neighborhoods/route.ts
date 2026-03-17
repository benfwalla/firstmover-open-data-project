import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';

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
