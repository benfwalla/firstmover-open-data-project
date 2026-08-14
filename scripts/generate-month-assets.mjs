#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';

// StreetEasy event timestamps are stored without a timezone and represent New York local time.
// Pin the process timezone so CSV conversion is identical locally and in GitHub Actions.
process.env.TZ = 'America/New_York';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HAS_REST_CREDENTIALS = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const HAS_DATABASE_CREDENTIALS = Boolean(
  process.env.SUPABASE_HOST &&
  process.env.SUPABASE_USER &&
  process.env.SUPABASE_PASSWORD
);

if (!HAS_REST_CREDENTIALS && !HAS_DATABASE_CREDENTIALS) {
  console.error('Missing Supabase REST or database credentials');
  process.exit(1);
}

const { Client } = pg;
let databaseClient;

const PAGE_SIZE = 1000;
const PRICE_MIN = 0;
const PRICE_MAX = 20000;
const NYC_BOUNDS = {
  minLat: 40.4,
  maxLat: 40.9,
  minLng: -74.3,
  maxLng: -73.6,
};

function parseArgs(argv) {
  const args = { writeReport: false, dataOnly: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--market-month') args.marketMonth = argv[++i];
    else if (arg === '--slug') args.slug = argv[++i];
    else if (arg === '--report-title') args.reportTitle = argv[++i];
    else if (arg === '--report-date') args.reportDate = argv[++i];
    else if (arg === '--write-report') args.writeReport = true;
    else if (arg === '--data-only') args.dataOnly = true;
    else if (arg === '--report-description') args.reportDescription = argv[++i];
    else if (arg === '--summary') args.summary = argv[++i];
    else throw new Error(`Unknown arg: ${arg}`);
  }
  if (!args.marketMonth || (!args.dataOnly && !args.slug)) {
    throw new Error('Usage: node scripts/generate-month-assets.mjs --market-month YYYY-MM [--data-only | --slug month-year]');
  }
  return args;
}

function monthStart(yyyyMm) {
  return new Date(`${yyyyMm}-01T00:00:00.000Z`);
}

function formatMonth(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(yyyyMm, delta) {
  const d = monthStart(yyyyMm);
  d.setUTCMonth(d.getUTCMonth() + delta);
  return formatMonth(d);
}

function monthName(yyyyMm) {
  return monthStart(yyyyMm).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function monthLabelShort(yyyyMm) {
  return monthStart(yyyyMm).toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

function parseObjectLiteralFromFile(filePath, constName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const marker = `const ${constName} =`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${constName} in ${filePath}`);
  const after = source.slice(start + marker.length);
  const end = after.indexOf('};');
  if (end === -1) throw new Error(`Could not parse ${constName} in ${filePath}`);
  const literal = after.slice(0, end + 1).trim();
  return Function(`return (${literal});`)();
}

function parseArrayLiteralFromFile(filePath, constName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const marker = `const ${constName} =`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${constName} in ${filePath}`);
  const after = source.slice(start + marker.length);
  const end = after.indexOf('];');
  if (end === -1) throw new Error(`Could not parse ${constName} in ${filePath}`);
  const literal = after.slice(0, end + 1).trim();
  return Function(`return (${literal});`)();
}

const csvScriptPath = path.join(process.cwd(), 'scripts', 'generate-csvs.mjs');
const BOROUGH_MAP = parseObjectLiteralFromFile(csvScriptPath, 'BOROUGH_MAP');
const COLUMNS = parseArrayLiteralFromFile(csvScriptPath, 'COLUMNS');

async function fetchRowsForRange(startDate, endDate, select) {
  if (!HAS_REST_CREDENTIALS) {
    if (!/^(\*|[a-z_,]+)$/.test(select)) {
      throw new Error(`Invalid database select list: ${select}`);
    }
    if (!databaseClient) {
      databaseClient = new Client({
        host: process.env.SUPABASE_HOST,
        port: Number(process.env.SUPABASE_PORT || 6543),
        database: process.env.SUPABASE_DB || 'postgres',
        user: process.env.SUPABASE_USER,
        password: process.env.SUPABASE_PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      });
      await databaseClient.connect();
      await databaseClient.query("SET TIME ZONE 'UTC'");
    }

    const result = await databaseClient.query(
      `SELECT ${select} FROM listings WHERE created_at >= $1 AND created_at < $2 ORDER BY created_at ASC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  const rows = [];
  let offset = 0;

  while (true) {
    const url = new URL(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/listings`);
    url.searchParams.set('select', select);
    url.searchParams.set('created_at', `gte.${startDate}`);
    url.searchParams.set('order', 'created_at.asc');
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(PAGE_SIZE));

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase fetch failed (${res.status}): ${await res.text()}`);
    }

    const batch = (await res.json()).filter((row) => row.created_at.slice(0, 10) < endDate);
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function roundMedian(values) {
  const value = median(values);
  return value == null ? null : Math.round(value);
}

function validPrice(row) {
  return typeof row.price === 'number' && row.price > PRICE_MIN && row.price < PRICE_MAX;
}

function summarizeMonthRows(rows) {
  const filtered = rows.filter(validPrice);
  const marketPrices = filtered.map((row) => row.price);

  const bedroomBreakdown = [0, 1, 2, 3]
    .map((bedroomCount) => {
      const bedroomRows = filtered.filter((row) => row.bedroom_count === bedroomCount);
      if (!bedroomRows.length) return null;
      return {
        bedroom_count: bedroomCount,
        median_rent: roundMedian(bedroomRows.map((row) => row.price)),
        listing_count: String(bedroomRows.length),
      };
    })
    .filter(Boolean);

  const byNeighborhood = new Map();
  for (const row of filtered) {
    if (!row.area_name) continue;
    const list = byNeighborhood.get(row.area_name) || [];
    list.push(row);
    byNeighborhood.set(row.area_name, list);
  }

  const topNeighborhoods = [...byNeighborhood.entries()]
    .map(([area_name, neighborhoodRows]) => ({
      area_name,
      listing_count: String(neighborhoodRows.length),
      median_rent: roundMedian(neighborhoodRows.map((row) => row.price)),
    }))
    .filter((row) => Number(row.listing_count) >= 10)
    .sort((a, b) => Number(b.listing_count) - Number(a.listing_count) || a.area_name.localeCompare(b.area_name))
    .slice(0, 20);

  const geoData = [...byNeighborhood.entries()]
    .map(([area_name, neighborhoodRows]) => {
      const geoRows = neighborhoodRows.filter(
        (row) => typeof row.latitude === 'number' && typeof row.longitude === 'number' &&
          row.latitude >= NYC_BOUNDS.minLat && row.latitude <= NYC_BOUNDS.maxLat &&
          row.longitude >= NYC_BOUNDS.minLng && row.longitude <= NYC_BOUNDS.maxLng
      );
      if (geoRows.length < 5) return null;
      const lat = geoRows.reduce((sum, row) => sum + row.latitude, 0) / geoRows.length;
      const lng = geoRows.reduce((sum, row) => sum + row.longitude, 0) / geoRows.length;
      return {
        area_name,
        listing_count: String(neighborhoodRows.length),
        median_rent: roundMedian(neighborhoodRows.map((row) => row.price)),
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.listing_count) - Number(a.listing_count));

  return {
    marketStats: {
      total_active: filtered.length,
      median_rent: roundMedian(marketPrices),
    },
    bedroomBreakdown,
    topNeighborhoods,
    geoData,
    byNeighborhood,
    filtered,
  };
}

function buildMonthlyTrends(monthRowsMap) {
  const months = [...monthRowsMap.keys()].sort();

  const monthlyTrends = months.map((month) => {
    const rows = monthRowsMap.get(month).filter(validPrice);
    return {
      month: `${month}-01T00:00:00.000Z`,
      median_rent: roundMedian(rows.map((row) => row.price)),
      listing_count: String(rows.length),
    };
  });

  const monthlyTrendsWithBedrooms = {};
  for (const month of months) {
    const rows = monthRowsMap.get(month).filter(validPrice);
    monthlyTrendsWithBedrooms[`${month}-01T00:00:00.000Z`] = {};
    for (const bedroomCount of [0, 1, 2, 3]) {
      const bedroomRows = rows.filter((row) => row.bedroom_count === bedroomCount);
      if (!bedroomRows.length) continue;
      monthlyTrendsWithBedrooms[`${month}-01T00:00:00.000Z`][bedroomCount === 0 ? 'studio' : String(bedroomCount)] = {
        median_rent: roundMedian(bedroomRows.map((row) => row.price)),
        listing_count: bedroomRows.length,
      };
    }
  }

  return { monthlyTrends, monthlyTrendsWithBedrooms };
}

function buildNeighborhoodChanges(currentByNeighborhood, previousByNeighborhood) {
  return [...currentByNeighborhood.entries()]
    .map(([area_name, currentRows]) => {
      const previousRows = previousByNeighborhood.get(area_name);
      if (!previousRows || currentRows.length < 10 || previousRows.length < 10) return null;
      const currMedian = roundMedian(currentRows.map((row) => row.price));
      const prevMedian = roundMedian(previousRows.map((row) => row.price));
      if (!prevMedian) return null;
      const priceChange = currMedian - prevMedian;
      const pctChange = Math.round((priceChange * 100) / prevMedian);
      return {
        area_name,
        curr_median: currMedian,
        prev_median: prevMedian,
        price_change: priceChange,
        pct_change: pctChange,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.price_change - b.price_change || a.area_name.localeCompare(b.area_name));
}

function escapeCSV(value) {
  if (value === null || value === undefined || value === '') return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatPhotoHashes(value) {
  if (!value) return '';
  return String(value).split(',').map((part) => part.trim()).filter(Boolean).join(',');
}

function rowToCSV(row) {
  const borough = BOROUGH_MAP[row.area_name] || '';
  const values = [
    formatTimestamp(row.created_at),
    formatDate(row.available_at),
    row.id,
    row.street,
    row.unit,
    row.area_name,
    borough,
    row.zip_code,
    row.state,
    row.latitude,
    row.longitude,
    row.building_type,
    row.bedroom_count,
    row.full_bathroom_count,
    row.half_bathroom_count,
    row.living_area_size,
    row.furnished,
    row.is_new_development,
    row.lease_term,
    row.months_free,
    row.price,
    row.net_effective_price,
    row.no_fee,
    row.source_group_label,
    row.source_type,
    row.has_videos,
    row.has_tour_3d,
    row.media_asset_count,
    row.lead_media_photo || '',
    formatPhotoHashes(row.photos),
    formatTimestamp(row.upcoming_open_house_start),
    formatTimestamp(row.upcoming_open_house_end),
    row.upcoming_open_house_appointment_only,
    row.url_path ? `https://streeteasy.com${row.url_path}` : '',
  ];
  return values.map(escapeCSV).join(',');
}

function buildCsv(rows) {
  const header = COLUMNS.join(',');
  const body = rows.filter(validPrice).map(rowToCSV).join('\n');
  return `${header}\n${body}\n`;
}

function deriveReportTemplate(args, summary, marketMonth, previousMonth) {
  const reportTitle = args.reportTitle || `${monthName(marketMonth)} Rent Report`;
  const reportDate = args.reportDate || `${shiftMonth(marketMonth, 1)}-01`;
  const reportDescription = args.reportDescription || `${monthName(marketMonth)} Market Data`;
  const currentLabel = monthName(marketMonth);
  const previousLabel = monthName(previousMonth);
  const topDrops = summary.neighborhoodChanges.slice(0, 5).map((row) => `${row.area_name} (${row.pct_change}%)`).join(', ');
  const topIncreases = summary.neighborhoodChanges.slice(-5).reverse().map((row) => `${row.area_name} (+${row.pct_change}%)`).join(', ');
  const summaryLine = args.summary || `${currentLabel} recorded **${summary.marketStats.total_active.toLocaleString()} new rental listings** with a citywide median asking rent of **$${summary.marketStats.median_rent.toLocaleString()}**.`;

  return `---\ntitle: \"${reportTitle}\"\ndate: \"${reportDate}\"\ndescription: \"${reportDescription}\"\ntype: report\n---\n\n## Summary\n\n${summaryLine}\n\nThe full dataset, ${summary.marketStats.total_active.toLocaleString()} listings with 34 columns each, is available on the [Open Data](/open-data) page.\n\n## By Bedroom Count\n\n| Type | Listings | Median Rent | vs. ${monthName(previousMonth).split(' ')[0]} |\n|------|----------|-------------|-------------|\n| Studio | ${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 0)?.listing_count || 0).toLocaleString()} | $${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 0)?.median_rent || 0).toLocaleString()} | TODO |\n| 1 Bedroom | ${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 1)?.listing_count || 0).toLocaleString()} | $${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 1)?.median_rent || 0).toLocaleString()} | TODO |\n| 2 Bedroom | ${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 2)?.listing_count || 0).toLocaleString()} | $${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 2)?.median_rent || 0).toLocaleString()} | TODO |\n| 3 Bedroom | ${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 3)?.listing_count || 0).toLocaleString()} | $${Number(summary.bedroomBreakdown.find((row) => row.bedroom_count === 3)?.median_rent || 0).toLocaleString()} | TODO |\n\n## Median Rent Over Time\n\n<PriceTrendsChart />\n\n## Listing Volume by Neighborhood\n\n<NeighborhoodMap />\n\n## Top 20 Neighborhoods by Volume\n\nThe 20 neighborhoods with the most new listings in ${currentLabel}, with month-over-month median rent changes compared to ${previousLabel}.\n\n<DataTable />\n\n## Biggest Price Movements\n\nAmong neighborhoods with at least 10 listings in both ${previousLabel} and ${currentLabel}:\n\n**Largest drops:** ${topDrops}\n\n**Largest increases:** ${topIncreases}\n`;
}

async function main() {
  const args = parseArgs(process.argv);

  const currentMonth = args.marketMonth;
  const previousMonth = shiftMonth(currentMonth, -1);
  const trendMonths = Array.from({ length: 6 }, (_, index) => shiftMonth(currentMonth, index - 5));

  console.log(args.dataOnly
    ? `Generating data for market month ${currentMonth}`
    : `Generating assets for market month ${currentMonth} (slug ${args.slug})`);

  const currentRows = await fetchRowsForRange(`${currentMonth}-01`, `${shiftMonth(currentMonth, 1)}-01`, '*');

  if (args.dataOnly) {
    const currentSummary = summarizeMonthRows(currentRows);
    const csvPath = path.join(process.cwd(), 'public', 'data', `${currentMonth}.csv`);
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, buildCsv(currentRows));
    if (databaseClient) await databaseClient.end();

    console.log(JSON.stringify({
      marketMonth: currentMonth,
      listings: currentSummary.marketStats.total_active,
      csvPath,
    }, null, 2));
    return;
  }

  const previousRows = await fetchRowsForRange(`${previousMonth}-01`, `${currentMonth}-01`, 'id,created_at,price,area_name,bedroom_count,latitude,longitude');

  const trendRowsMap = new Map();
  for (const month of trendMonths) {
    const rows = await fetchRowsForRange(`${month}-01`, `${shiftMonth(month, 1)}-01`, 'id,created_at,price,area_name,bedroom_count,latitude,longitude');
    trendRowsMap.set(month, rows);
  }

  const currentSummary = summarizeMonthRows(currentRows);
  const previousSummary = summarizeMonthRows(previousRows);
  const { monthlyTrends, monthlyTrendsWithBedrooms } = buildMonthlyTrends(trendRowsMap);
  const neighborhoodChanges = buildNeighborhoodChanges(currentSummary.byNeighborhood, previousSummary.byNeighborhood);

  const reportData = {
    marketStats: currentSummary.marketStats,
    bedroomBreakdown: currentSummary.bedroomBreakdown,
    topNeighborhoods: currentSummary.topNeighborhoods,
    monthlyTrends,
    monthlyTrendsWithBedrooms,
    neighborhoodChanges,
    geoData: currentSummary.geoData,
    generated_at: new Date().toISOString(),
  };

  const jsonPath = path.join(process.cwd(), 'src', 'data', `${args.slug}-data.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));

  const csvPath = path.join(process.cwd(), 'public', 'data', `${currentMonth}.csv`);
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, buildCsv(currentRows));

  if (args.writeReport) {
    const reportPath = path.join(process.cwd(), 'content', 'reports', `${args.slug}.mdx`);
    fs.writeFileSync(reportPath, deriveReportTemplate(args, reportData, currentMonth, previousMonth));
    console.log(`Wrote report template to ${reportPath}`);
  }

  if (databaseClient) await databaseClient.end();

  console.log(JSON.stringify({
    slug: args.slug,
    marketMonth: currentMonth,
    reportListings: reportData.marketStats.total_active,
    reportMedianRent: reportData.marketStats.median_rent,
    jsonPath,
    csvPath,
    topNeighborhood: reportData.topNeighborhoods[0],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
