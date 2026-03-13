import { getPool } from './db';
import { getNeighborhoodAreaNames } from './neighborhoods';

export interface RentByBedroom {
  bedroom_count: number;
  label: string;
  median_rent: number;
  listing_count: number;
  min_rent: number;
  max_rent: number;
}

export interface RecentListing {
  id: string;
  street: string;
  unit: string;
  price: number;
  bedroom_count: number;
  full_bathroom_count: number;
  living_area_size: number;
  lead_media_photo: string;
  url_path: string;
  created_at: string;
}

export interface NeighborhoodRentData {
  rents: RentByBedroom[];
  total_listings: number;
  recent_listings: RecentListing[];
  avg_price: number;
  median_price: number;
}

const BED_LABELS: Record<number, string> = {
  0: 'Studio',
  1: '1 Bedroom',
  2: '2 Bedroom',
  3: '3 Bedroom',
  4: '4+ Bedroom',
};

export async function getNeighborhoodRentData(neighborhoodName: string): Promise<NeighborhoodRentData> {
  const pool = getPool();

  // Aggregate data for parent neighborhoods by including all children
  const areaNames = getNeighborhoodAreaNames(neighborhoodName);
  const placeholders = areaNames.map((_, i) => `$${i + 1}`).join(', ');

  // Get rent breakdown by bedroom count
  const rentQuery = `
    SELECT
      CASE WHEN bedroom_count >= 4 THEN 4 ELSE bedroom_count END as bedroom_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
      COUNT(*) as listing_count,
      MIN(price) as min_rent,
      MAX(price) as max_rent
    FROM listings
    WHERE area_name IN (${placeholders})
      AND created_at >= NOW() - INTERVAL '30 days'
      AND price > 0
    GROUP BY CASE WHEN bedroom_count >= 4 THEN 4 ELSE bedroom_count END
    ORDER BY bedroom_count
  `;

  const overallQuery = `
    SELECT
      COUNT(*) as total,
      ROUND(AVG(price)) as avg_price,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_price
    FROM listings
    WHERE area_name IN (${placeholders})
      AND created_at >= NOW() - INTERVAL '30 days'
      AND price > 0
  `;

  const recentQuery = `
    SELECT id, street, unit, price, bedroom_count, full_bathroom_count,
           living_area_size, lead_media_photo, url_path, created_at
    FROM listings
    WHERE area_name IN (${placeholders})
      AND created_at >= NOW() - INTERVAL '14 days'
      AND price > 0
      AND lead_media_photo IS NOT NULL AND lead_media_photo != ''
      AND url_path IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 6
  `;

  const [rentResult, overallResult, recentResult] = await Promise.all([
    pool.query(rentQuery, areaNames),
    pool.query(overallQuery, areaNames),
    pool.query(recentQuery, areaNames),
  ]);

  const rents: RentByBedroom[] = rentResult.rows.map(row => ({
    bedroom_count: parseInt(row.bedroom_count),
    label: BED_LABELS[parseInt(row.bedroom_count)] || `${row.bedroom_count} Bedroom`,
    median_rent: parseInt(row.median_rent),
    listing_count: parseInt(row.listing_count),
    min_rent: parseInt(row.min_rent),
    max_rent: parseInt(row.max_rent),
  }));

  const overall = overallResult.rows[0] || { total: 0, avg_price: 0, median_price: 0 };

  const recent_listings: RecentListing[] = recentResult.rows.map(row => ({
    id: row.id,
    street: row.street,
    unit: row.unit,
    price: parseInt(row.price),
    bedroom_count: row.bedroom_count,
    full_bathroom_count: row.full_bathroom_count,
    living_area_size: parseInt(row.living_area_size || 0),
    lead_media_photo: row.lead_media_photo,
    url_path: row.url_path,
    created_at: row.created_at,
  }));

  return {
    rents,
    total_listings: parseInt(overall.total),
    recent_listings,
    avg_price: parseInt(overall.avg_price || 0),
    median_price: parseInt(overall.median_price || 0),
  };
}
