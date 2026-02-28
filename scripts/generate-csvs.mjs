#!/usr/bin/env node
/**
 * Generate monthly CSV exports from the listings database.
 * Outputs to public/data/YYYY-MM.csv
 *
 * Usage: node scripts/generate-csvs.mjs [--month YYYY-MM]
 *   Without --month, generates all months from 2025-01 to current.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Borough mapping for NYC neighborhoods
const BOROUGH_MAP = {
  // Manhattan
  'Battery Park City': 'Manhattan', 'Beekman': 'Manhattan', 'Carnegie Hill': 'Manhattan',
  'Central Harlem': 'Manhattan', 'Central Park South': 'Manhattan', 'Chelsea': 'Manhattan',
  'Chinatown': 'Manhattan', 'Civic Center': 'Manhattan', 'East Harlem': 'Manhattan',
  'East Village': 'Manhattan', 'Financial District': 'Manhattan', 'Flatiron': 'Manhattan',
  'Fort George': 'Manhattan', 'Fulton/Seaport': 'Manhattan', 'Gramercy Park': 'Manhattan',
  'Greenwich Village': 'Manhattan', 'Hamilton Heights': 'Manhattan', 'Hell\'s Kitchen': 'Manhattan',
  'Hudson Heights': 'Manhattan', 'Hudson Square': 'Manhattan', 'Hudson Yards': 'Manhattan',
  'Inwood': 'Manhattan', 'Kips Bay': 'Manhattan', 'Lenox Hill': 'Manhattan',
  'Lincoln Square': 'Manhattan', 'Little Italy': 'Manhattan', 'Lower East Side': 'Manhattan',
  'Manhattan': 'Manhattan', 'Manhattan Valley': 'Manhattan', 'Manhattanville': 'Manhattan',
  'Marble Hill': 'Manhattan', 'Midtown': 'Manhattan', 'Midtown South': 'Manhattan',
  'Morningside Heights': 'Manhattan', 'Murray Hill': 'Manhattan', 'Noho': 'Manhattan',
  'Nolita': 'Manhattan', 'NoMad': 'Manhattan', 'Roosevelt Island': 'Manhattan',
  'Soho': 'Manhattan', 'South Harlem': 'Manhattan', 'Stuyvesant Town/PCV': 'Manhattan',
  'Sutton Place': 'Manhattan', 'Tribeca': 'Manhattan', 'Turtle Bay': 'Manhattan',
  'Two Bridges': 'Manhattan', 'Upper Carnegie Hill': 'Manhattan', 'Upper East Side': 'Manhattan',
  'Upper West Side': 'Manhattan', 'Washington Heights': 'Manhattan', 'West Chelsea': 'Manhattan',
  'West Harlem': 'Manhattan', 'West Village': 'Manhattan', 'Yorkville': 'Manhattan',
  
  // Brooklyn
  'Bath Beach': 'Brooklyn', 'Bay Ridge': 'Brooklyn', 'Bedford-Stuyvesant': 'Brooklyn',
  'Bensonhurst': 'Brooklyn', 'Bergen Beach': 'Brooklyn', 'Boerum Hill': 'Brooklyn',
  'Borough Park': 'Brooklyn', 'Brighton Beach': 'Brooklyn', 'Brooklyn': 'Brooklyn',
  'Brooklyn Heights': 'Brooklyn', 'Brownsville': 'Brooklyn', 'Bushwick': 'Brooklyn',
  'Canarsie': 'Brooklyn', 'Carroll Gardens': 'Brooklyn', 'City Line': 'Brooklyn',
  'Clinton Hill': 'Brooklyn', 'Cobble Hill': 'Brooklyn', 'Columbia St Waterfront District': 'Brooklyn',
  'Coney Island': 'Brooklyn', 'Crown Heights': 'Brooklyn', 'Cypress Hills': 'Brooklyn',
  'Ditmas Park': 'Brooklyn', 'Downtown Brooklyn': 'Brooklyn', 'DUMBO': 'Brooklyn',
  'Dyker Heights': 'Brooklyn', 'East Flatbush': 'Brooklyn', 'East New York': 'Brooklyn',
  'East Williamsburg': 'Brooklyn', 'Farragut': 'Brooklyn', 'Fiske Terrace': 'Brooklyn',
  'Flatbush': 'Brooklyn', 'Flatlands': 'Brooklyn', 'Fort Greene': 'Brooklyn',
  'Fort Hamilton': 'Brooklyn', 'Gerritsen Beach': 'Brooklyn', 'Gowanus': 'Brooklyn',
  'Gravesend': 'Brooklyn', 'Greenpoint': 'Brooklyn', 'Greenwood': 'Brooklyn',
  'Homecrest': 'Brooklyn', 'Kensington': 'Brooklyn', 'Lindenwood': 'Brooklyn',
  'Manhattan Beach': 'Brooklyn', 'Mapleton': 'Brooklyn', 'Marine Park': 'Brooklyn',
  'Midwood': 'Brooklyn', 'Mill Basin': 'Brooklyn', 'New Lots': 'Brooklyn',
  'Ocean Hill': 'Brooklyn', 'Old Mill Basin': 'Brooklyn', 'Park Slope': 'Brooklyn',
  'Prospect Heights': 'Brooklyn', 'Prospect Lefferts Gardens': 'Brooklyn',
  'Prospect Park South': 'Brooklyn', 'Red Hook': 'Brooklyn', 'Seagate': 'Brooklyn',
  'Sheepshead Bay': 'Brooklyn', 'Starrett City': 'Brooklyn', 'Stuyvesant Heights': 'Brooklyn',
  'Sunset Park': 'Brooklyn', 'Vinegar Hill': 'Brooklyn', 'Weeksville': 'Brooklyn',
  'Williamsburg': 'Brooklyn', 'Windsor Terrace': 'Brooklyn', 'Wingate': 'Brooklyn',
  
  // Queens
  'Arverne': 'Queens', 'Astoria': 'Queens', 'Auburndale': 'Queens', 'Bayswater': 'Queens',
  'Bay Terrace': 'Queens', 'Bayside': 'Queens', 'Beechhurst': 'Queens',
  'Belle Harbor': 'Queens', 'Bellerose': 'Queens', 'Breezy Point': 'Queens',
  'Briarwood': 'Queens', 'Broad Channel': 'Queens', 'Brookville': 'Queens',
  'Cambria Heights': 'Queens', 'Clearview': 'Queens', 'College Point': 'Queens',
  'Corona': 'Queens', 'Ditmars-Steinway': 'Queens', 'Douglaston': 'Queens',
  'East Elmhurst': 'Queens', 'East Flushing': 'Queens', 'Edgemere': 'Queens',
  'Elmhurst': 'Queens', 'Floral Park': 'Queens', 'Flushing': 'Queens',
  'Forest Hills': 'Queens', 'Fresh Meadows': 'Queens', 'Glen Oaks': 'Queens',
  'Glendale': 'Queens', 'Hamilton Beach': 'Queens', 'Hammels': 'Queens',
  'Hillcrest': 'Queens', 'Hollis': 'Queens', 'Hunters Point': 'Queens',
  'Jackson Heights': 'Queens', 'Jamaica': 'Queens', 'Jamaica Estates': 'Queens',
  'Jamaica Hills': 'Queens', 'Kew Gardens': 'Queens', 'Kew Gardens Hills': 'Queens',
  'Laurelton': 'Queens', 'Little Neck': 'Queens', 'Long Island City': 'Queens',
  'Malba': 'Queens', 'Maspeth': 'Queens', 'Middle Village': 'Queens',
  'North Corona': 'Queens', 'Oakland Gardens': 'Queens', 'Old Howard Beach': 'Queens',
  'Ozone Park': 'Queens', 'Pomonok': 'Queens', 'Queens': 'Queens',
  'Queens Village': 'Queens', 'Rego Park': 'Queens', 'Richmond Hill': 'Queens',
  'Ridgewood': 'Queens', 'Rockaway Park': 'Queens', 'Rosedale': 'Queens',
  'South Jamaica': 'Queens', 'South Ozone Park': 'Queens', 'South Richmond Hill': 'Queens',
  'Springfield Gardens': 'Queens', 'St. Albans': 'Queens', 'Sunnyside': 'Queens',
  'The Rockaways': 'Queens', 'Utopia': 'Queens', 'Whitestone': 'Queens',
  'Woodhaven': 'Queens', 'Woodside': 'Queens',
  
  // Bronx
  'Baychester': 'Bronx', 'Bedford Park': 'Bronx', 'Belmont': 'Bronx', 'Bronx': 'Bronx',
  'Bronxwood': 'Bronx', 'Castle Hill': 'Bronx', 'City Island': 'Bronx',
  'Claremont': 'Bronx', 'Co-op City': 'Bronx', 'Concourse': 'Bronx',
  'Country Club': 'Bronx', 'Crotona Park East': 'Bronx', 'Eastchester': 'Bronx',
  'East Tremont': 'Bronx', 'Edenwald': 'Bronx', 'Fieldston': 'Bronx',
  'Fordham': 'Bronx', 'Highbridge': 'Bronx', 'Hunts Point': 'Bronx',
  'Kingsbridge': 'Bronx', 'Kingsbridge Heights': 'Bronx', 'Laconia': 'Bronx',
  'Locust Point': 'Bronx', 'Longwood': 'Bronx', 'Melrose': 'Bronx',
  'Morrisania': 'Bronx', 'Morris Heights': 'Bronx', 'Morris Park': 'Bronx',
  'Mott Haven': 'Bronx', 'Mt. Hope': 'Bronx', 'Norwood': 'Bronx',
  'Parkchester': 'Bronx', 'Pelham Bay': 'Bronx', 'Pelham Gardens': 'Bronx',
  'Pelham Parkway': 'Bronx', 'Port Morris': 'Bronx', 'Riverdale': 'Bronx',
  'Schuylerville': 'Bronx', 'Soundview': 'Bronx', 'Spuyten Duyvil': 'Bronx',
  'Throgs Neck': 'Bronx', 'Tremont': 'Bronx', 'University Heights': 'Bronx',
  'Van Nest': 'Bronx', 'Wakefield': 'Bronx', 'West Farms': 'Bronx',
  'Westchester Square': 'Bronx', 'Westchester Village': 'Bronx',
  'Williamsbridge': 'Bronx', 'Woodlawn': 'Bronx', 'Woodstock': 'Bronx',
  
  // Staten Island
  'Annadale': 'Staten Island', 'Arden Heights': 'Staten Island', 'Arrochar': 'Staten Island',
  'Bulls Head': 'Staten Island', 'Castleton Corners': 'Staten Island',
  'Charleston': 'Staten Island', 'Clifton': 'Staten Island', 'Dongan Hills': 'Staten Island',
  'Elm Park': 'Staten Island', 'Eltingville': 'Staten Island', 'Graniteville': 'Staten Island',
  'Grant City': 'Staten Island', 'Grasmere': 'Staten Island', 'Great Kills': 'Staten Island',
  'Greenridge': 'Staten Island', 'Grymes Hill': 'Staten Island', 'Huguenot': 'Staten Island',
  'Mariners Harbor': 'Staten Island', 'Meiers Corners': 'Staten Island',
  'Midland Beach': 'Staten Island', 'New Brighton': 'Staten Island',
  'New Dorp': 'Staten Island', 'New Dorp Beach': 'Staten Island',
  'New Springville': 'Staten Island', 'Oakwood': 'Staten Island',
  'Park Hill': 'Staten Island', 'Port Richmond': 'Staten Island',
  'Richmondtown': 'Staten Island', 'Richmond Valley': 'Staten Island',
  'Rosebank': 'Staten Island', 'Rossville': 'Staten Island',
  'Saint George': 'Staten Island', 'Shore Acres': 'Staten Island',
  'South Beach': 'Staten Island', 'Stapleton': 'Staten Island',
  'Tompkinsville': 'Staten Island', 'Tottenville': 'Staten Island',
  'Travis': 'Staten Island', 'West Brighton': 'Staten Island',
  'Westerleigh': 'Staten Island', 'Willowbrook': 'Staten Island',
  'Woodrow': 'Staten Island',
  
  // New Jersey
  'Bayonne': 'New Jersey', 'Bergen/Lafayette': 'New Jersey', 'Cliffside Park': 'New Jersey',
  'East Newark': 'New Jersey', 'Edgewater': 'New Jersey', 'Fort Lee': 'New Jersey',
  'Guttenberg': 'New Jersey', 'Harrison': 'New Jersey', 'Historic Downtown': 'New Jersey',
  'Hoboken': 'New Jersey', 'Jersey City': 'New Jersey', 'Journal Square': 'New Jersey',
  'Kearny': 'New Jersey', 'Madison': 'New Jersey', 'McGinley Square': 'New Jersey',
  'New Jersey': 'New Jersey', 'Newport': 'New Jersey', 'North Bergen': 'New Jersey',
  'North New York': 'New Jersey', 'Paulus Hook': 'New Jersey', 'Secaucus': 'New Jersey',
  'The Heights': 'New Jersey', 'Union City': 'New Jersey', 'Waterfront': 'New Jersey',
  'Weehawken': 'New Jersey', 'West New York': 'New Jersey', 'West Side': 'New Jersey',
  
  // Other
  'New Hyde Park': 'Long Island',
};

// Photo URL pattern: https://photos.zillowstatic.com/fp/{hash}-se_extra_large_1500_800.webp
// We store just the hashes to keep CSVs small. Document the pattern on the site.

// Column order — logically grouped
const COLUMNS = [
  // Timing
  'created_at_utc', 'available_date',
  // Identity
  'id',
  // Location
  'street', 'unit', 'neighborhood', 'borough', 'zip_code', 'state', 'latitude', 'longitude',
  // Property details
  'building_type', 'bedrooms', 'bathrooms', 'half_baths', 'sqft', 'furnished', 'is_new_development',
  // Lease terms (before pricing)
  'lease_months', 'months_free',
  // Pricing
  'price', 'net_effective_price', 'no_fee',
  // Listing metadata
  'source_group', 'source_type',
  // Media
  'has_videos', 'has_3d_tour', 'media_asset_count', 'lead_photo_id', 'photo_ids',
  // Open house
  'open_house_start_utc', 'open_house_end_utc', 'open_house_appointment_only',
  // Link
  'url',
];

function escapeCSV(val) {
  if (val === null || val === undefined || val === '') return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

function formatDate(d) {
  if (!d) return '';
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
  return String(d);
}

function formatPhotoHashes(photosStr) {
  if (!photosStr) return '';
  return photosStr.split(',').map(h => h.trim()).filter(Boolean).join(',');
}

function rowToCSV(row) {
  const borough = BOROUGH_MAP[row.area_name] || '';
  const values = [
    formatTimestamp(row.created_at), formatDate(row.available_at),
    row.id,
    row.street, row.unit, row.area_name, borough, row.zip_code, row.state, row.latitude, row.longitude,
    row.building_type, row.bedroom_count, row.full_bathroom_count, row.half_bathroom_count,
    row.living_area_size, row.furnished, row.is_new_development,
    row.lease_term, row.months_free,
    row.price, row.net_effective_price, row.no_fee,
    row.source_group_label, row.source_type,
    row.has_videos, row.has_tour_3d, row.media_asset_count,
    row.lead_media_photo || '',
    formatPhotoHashes(row.photos),
    formatTimestamp(row.upcoming_open_house_start), formatTimestamp(row.upcoming_open_house_end),
    row.upcoming_open_house_appointment_only,
    row.url_path ? 'https://streeteasy.com' + row.url_path : '',
  ];
  return values.map(escapeCSV).join(',');
}

async function generateMonth(client, year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const startDate = `${monthStr}-01`;
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;
  
  console.log(`Generating ${monthStr}...`);
  
  const result = await client.query(`
    SELECT * FROM listings
    WHERE created_at >= $1 AND created_at < $2
    ORDER BY created_at ASC
  `, [startDate, nextMonth]);
  
  if (result.rows.length === 0) {
    console.log(`  Skipping ${monthStr} — no data`);
    return null;
  }
  
  const header = COLUMNS.join(',');
  const rows = result.rows.map(rowToCSV);
  const csv = header + '\n' + rows.join('\n') + '\n';
  
  const outPath = path.join('public', 'data', `${monthStr}.csv`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, csv);
  
  console.log(`  ${monthStr}: ${result.rows.length} listings → ${outPath}`);
  return { month: monthStr, count: result.rows.length };
}

async function main() {
  const args = process.argv.slice(2);
  const singleMonth = args.indexOf('--month') !== -1 ? args[args.indexOf('--month') + 1] : null;
  
  const client = new Client({
    host: process.env.SUPABASE_HOST || 'aws-0-us-west-1.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_PORT || '6543'),
    database: process.env.SUPABASE_DB || 'postgres',
    user: process.env.SUPABASE_USER || 'readonly_agent.tdrshcdwetrbivhjikup',
    password: process.env.SUPABASE_PASSWORD || '',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  
  await client.connect();
  console.log('Connected to database');
  
  const results = [];
  
  if (singleMonth) {
    const [y, m] = singleMonth.split('-').map(Number);
    const r = await generateMonth(client, y, m);
    if (r) results.push(r);
  } else {
    // Generate from Feb 2025 to current month (Jan 2025 excluded — corrupted data)
    const now = new Date();
    const endYear = now.getUTCFullYear();
    const endMonth = now.getUTCMonth() + 1;
    
    let y = 2025, m = 2;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      const r = await generateMonth(client, y, m);
      if (r) results.push(r);
      m++;
      if (m > 12) { m = 1; y++; }
    }
  }
  
  await client.end();
  
  console.log('\nSummary:');
  let total = 0;
  for (const r of results) {
    console.log(`  ${r.month}: ${r.count.toLocaleString()} listings`);
    total += r.count;
  }
  console.log(`  Total: ${total.toLocaleString()} listings across ${results.length} months`);
}

main().catch(err => { console.error(err); process.exit(1); });
