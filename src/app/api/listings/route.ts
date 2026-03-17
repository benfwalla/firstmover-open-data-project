import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const neighborhood = searchParams.get('neighborhood');
    const beds = searchParams.get('beds');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const nearPrice = searchParams.get('nearPrice');
    const limit = parseInt(searchParams.get('limit') || '10');

    const pool = getPool();
    
    let query = `
      SELECT 
        id, area_name, street, unit, price, bedroom_count,
        full_bathroom_count, living_area_size, lead_media_photo,
        url_path, created_at
      FROM listings
      WHERE created_at >= NOW() - INTERVAL '14 days'
        AND price > 0
        AND lead_media_photo IS NOT NULL AND lead_media_photo != ''
        AND url_path IS NOT NULL
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (neighborhood) {
      query += ` AND area_name ILIKE $${paramIndex}`;
      params.push(`%${neighborhood}%`);
      paramIndex++;
    }
    
    if (beds) {
      query += ` AND bedroom_count = $${paramIndex}`;
      params.push(parseInt(beds));
      paramIndex++;
    }
    
    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(parseInt(minPrice));
      paramIndex++;
    }
    
    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(parseInt(maxPrice));
      paramIndex++;
    }
    
    if (nearPrice) {
      // Pick randomly from the 20 closest-priced listings
      query = `SELECT * FROM (${query} ORDER BY ABS(price - $${paramIndex}) LIMIT 20) sub ORDER BY RANDOM() LIMIT $${paramIndex + 1}`;
      params.push(parseInt(nearPrice));
      params.push(limit);
    } else {
      query += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    const listings = result.rows.map(row => ({
      id: row.id,
      area_name: row.area_name,
      street: row.street,
      unit: row.unit,
      price: parseInt(row.price),
      bedroom_count: row.bedroom_count,
      full_bathroom_count: row.full_bathroom_count,
      living_area_size: parseInt(row.living_area_size || 0),
      lead_media_photo: row.lead_media_photo,
      url_path: row.url_path,
    }));
    
    return Response.json(listings);
    
  } catch (error: any) {
    console.error('Listings API error:', error?.message);
    return Response.json(
      { error: 'Failed to fetch listing data', detail: error?.message },
      { status: 500 }
    );
  }
}
