import { getPool } from '@/lib/db';

const POPULAR_NEIGHBORHOODS = [
  'Williamsburg', 'Bushwick', 'Astoria', 'Crown Heights', 'East Village',
  'Bedford-Stuyvesant', 'Upper West Side', "Hell's Kitchen", 'Greenpoint',
  'Financial District', 'Murray Hill', 'West Village', 'Chelsea', 'Park Slope',
  'Fort Greene', 'Flatbush', 'Downtown Brooklyn', 'Yorkville', 'Lenox Hill',
  'Kips Bay', 'Central Harlem', 'East Harlem', 'Hunters Point', 'Cobble Hill',
  'SoHo', 'Tribeca', 'Gramercy Park', 'Nolita', 'Prospect Heights',
  'Upper East Side', 'Lower East Side', 'Midtown', 'Boerum Hill',
];

// Cache eligible listing IDs so each request only picks 5 random ones
let cachedIds: number[] = [];
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEligibleIds(): Promise<number[]> {
  if (cachedIds.length > 0 && Date.now() - cacheTime < CACHE_TTL) {
    return cachedIds;
  }
  const pool = getPool();
  const placeholders = POPULAR_NEIGHBORHOODS.map((_, i) => `$${i + 1}`).join(', ');
  const result = await pool.query(`
    SELECT id FROM listings
    WHERE created_at >= NOW() - INTERVAL '10 days'
      AND price > 1000 AND price < 15000
      AND lead_media_photo IS NOT NULL AND lead_media_photo != ''
      AND photos IS NOT NULL AND photos != '' AND array_length(string_to_array(photos, ','), 1) >= 2
      AND bedroom_count >= 0
      AND area_name IN (${placeholders})
  `, POPULAR_NEIGHBORHOODS);
  cachedIds = result.rows.map(r => r.id);
  cacheTime = Date.now();
  return cachedIds;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export async function GET() {
  try {
    const pool = getPool();
    const ids = await getEligibleIds();
    const picked = pickRandom(ids, 5);

    if (picked.length === 0) {
      return Response.json([]);
    }

    const placeholders = picked.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(`
      SELECT id, area_name, street, unit, price, bedroom_count,
             full_bathroom_count, living_area_size, lead_media_photo, photos,
             EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS minutes_ago
      FROM listings
      WHERE id IN (${placeholders})
    `, picked);

    const listings = result.rows.map(row => {
      const photoHashes = row.photos ? row.photos.split(',') : [row.lead_media_photo];
      return {
        id: row.id,
        area_name: row.area_name,
        street: row.street,
        unit: row.unit,
        price: parseInt(row.price),
        bedroom_count: row.bedroom_count,
        full_bathroom_count: row.full_bathroom_count,
        living_area_size: parseInt(row.living_area_size || 0),
        photos: photoHashes.map((h: string) => `https://photos.zillowstatic.com/fp/${h.trim()}-se_extra_large_1500_800.webp`),
        listed_minutes_ago: Math.round(parseFloat(row.minutes_ago || '0')),
      };
    });

    return Response.json(listings);
  } catch (error: any) {
    console.error('Guess the Rent API error:', error?.message);
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
