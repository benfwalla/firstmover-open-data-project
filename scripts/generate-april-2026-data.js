#!/usr/bin/env node

import { getDBClient } from './db.mjs';
import fs from 'fs';
import path from 'path';

const CURRENT_START = '2026-03-01';
const CURRENT_END = '2026-04-01';
const PREV_START = '2026-02-01';
const PREV_END = '2026-03-01';
const TREND_START = '2025-10-01'; // 6 months trailing

async function generate() {
  const client = await getDBClient();

  try {
    console.log('Generating April 2026 report data (March market)...');

    console.log('Fetching market stats...');
    const marketStats = (await client.query(`
      SELECT COUNT(*) as total_active,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent
      FROM listings
      WHERE created_at >= '${CURRENT_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000
    `)).rows[0];

    console.log('Fetching bedroom breakdown...');
    const bedroomBreakdown = (await client.query(`
      SELECT bedroom_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '${CURRENT_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000 AND bedroom_count BETWEEN 0 AND 3
      GROUP BY bedroom_count ORDER BY bedroom_count
    `)).rows;

    console.log('Fetching top neighborhoods...');
    const topNeighborhoods = (await client.query(`
      SELECT area_name, COUNT(*) as listing_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent
      FROM listings
      WHERE created_at >= '${CURRENT_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000 AND area_name IS NOT NULL
      GROUP BY area_name HAVING COUNT(*) >= 10
      ORDER BY listing_count DESC LIMIT 20
    `)).rows;

    console.log('Fetching monthly trends...');
    const monthlyTrends = (await client.query(`
      SELECT DATE_TRUNC('month', created_at) as month,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '${TREND_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000
      GROUP BY DATE_TRUNC('month', created_at) ORDER BY month
    `)).rows.map(r => ({ month: r.month, median_rent: parseInt(r.median_rent), listing_count: r.listing_count.toString() }));

    console.log('Fetching bedroom trends...');
    const bedroomTrendsRaw = (await client.query(`
      SELECT DATE_TRUNC('month', created_at) as month, bedroom_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        COUNT(*) as listing_count
      FROM listings
      WHERE created_at >= '${TREND_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000 AND bedroom_count BETWEEN 0 AND 3
      GROUP BY DATE_TRUNC('month', created_at), bedroom_count
      ORDER BY month, bedroom_count
    `)).rows;

    const monthlyTrendsWithBedrooms = bedroomTrendsRaw.reduce((acc, row) => {
      const key = row.bedroom_count === 0 ? 'studio' : row.bedroom_count.toString();
      if (!acc[row.month]) acc[row.month] = {};
      acc[row.month][key] = { median_rent: parseInt(row.median_rent), listing_count: parseInt(row.listing_count) };
      return acc;
    }, {});

    console.log('Fetching price changes...');
    const neighborhoodChanges = (await client.query(`
      WITH prev AS (
        SELECT area_name, ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as prev_median
        FROM listings
        WHERE created_at >= '${PREV_START}' AND created_at < '${PREV_END}'
          AND price > 0 AND price < 20000 AND area_name IS NOT NULL
        GROUP BY area_name HAVING COUNT(*) >= 10
      ),
      curr AS (
        SELECT area_name, ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as curr_median
        FROM listings
        WHERE created_at >= '${CURRENT_START}' AND created_at < '${CURRENT_END}'
          AND price > 0 AND price < 20000 AND area_name IS NOT NULL
        GROUP BY area_name HAVING COUNT(*) >= 10
      )
      SELECT c.area_name, c.curr_median as mar_median, p.prev_median as feb_median,
        (c.curr_median - p.prev_median) as price_change,
        ROUND((c.curr_median - p.prev_median) * 100.0 / p.prev_median) as pct_change
      FROM curr c JOIN prev p ON c.area_name = p.area_name
      ORDER BY price_change
    `)).rows;

    console.log('Fetching geo data...');
    const geoData = (await client.query(`
      SELECT area_name, COUNT(*) as listing_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)) as median_rent,
        AVG(latitude) as lat, AVG(longitude) as lng
      FROM listings
      WHERE created_at >= '${CURRENT_START}' AND created_at < '${CURRENT_END}'
        AND price > 0 AND price < 20000 AND area_name IS NOT NULL
        AND latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN 40.4 AND 40.9 AND longitude BETWEEN -74.3 AND -73.6
      GROUP BY area_name HAVING COUNT(*) >= 5
      ORDER BY listing_count DESC
    `)).rows.map(r => ({
      area_name: r.area_name, listing_count: r.listing_count.toString(),
      median_rent: parseInt(r.median_rent), lat: parseFloat(r.lat), lng: parseFloat(r.lng)
    }));

    const reportData = {
      marketStats: { total_active: parseInt(marketStats.total_active), median_rent: parseInt(marketStats.median_rent) },
      bedroomBreakdown,
      topNeighborhoods,
      monthlyTrends,
      monthlyTrendsWithBedrooms,
      neighborhoodChanges,
      geoData,
      generated_at: new Date().toISOString()
    };

    const outputPath = path.join(process.cwd(), 'src/data/april-2026-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));

    console.log(`✓ Data written to ${outputPath}`);
    console.log(`✓ ${reportData.marketStats.total_active} total listings`);
    console.log(`✓ Median rent: $${reportData.marketStats.median_rent}`);
    console.log(`✓ ${reportData.geoData.length} neighborhoods with geo data`);

    await client.end();
  } catch (error) {
    console.error('Error:', error);
    await client.end();
    process.exit(1);
  }
}

generate();
