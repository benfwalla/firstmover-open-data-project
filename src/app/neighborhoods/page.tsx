import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllNeighborhoods,
  getNeighborhoodAreaNames,
  getNeighborhoodStaticData,
} from '@/lib/neighborhoods';
import { getPool } from '@/lib/db';

export const metadata: Metadata = {
  title: 'NYC Neighborhood Rent Prices · FirstMover Open Data Project',
  description:
    'Explore rent prices, subway access, and commute times for 170+ NYC neighborhoods. Powered by the latest rental listing data.',
  alternates: { canonical: '/neighborhoods' },
  openGraph: { url: '/neighborhoods' },
};

async function getMedianRents(neighborhoodNames: string[]): Promise<Record<string, number>> {
  try {
    const pool = getPool();
    const neighborhoodAreas = neighborhoodNames.flatMap((neighborhoodName) =>
      getNeighborhoodAreaNames(neighborhoodName).map((areaName) => ({ neighborhoodName, areaName }))
    );
    const values = neighborhoodAreas
      .map((_, index) => `($${index * 2 + 1}::text, $${index * 2 + 2}::text)`)
      .join(', ');
    const params = neighborhoodAreas.flatMap(({ neighborhoodName, areaName }) => [neighborhoodName, areaName]);

    const result = await pool.query(`
      WITH neighborhood_areas(neighborhood_name, area_name) AS (
        VALUES ${values}
      )
      SELECT
        neighborhood_areas.neighborhood_name,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY listings.price)) as median_rent
      FROM neighborhood_areas
      JOIN listings ON listings.area_name = neighborhood_areas.area_name
      WHERE listings.created_at >= NOW() - INTERVAL '30 days'
        AND listings.price > 0
      GROUP BY neighborhood_areas.neighborhood_name
      HAVING COUNT(*) >= 3
    `, params);
    const map: Record<string, number> = {};
    for (const row of result.rows) {
      map[row.neighborhood_name] = parseInt(row.median_rent);
    }
    return map;
  } catch {
    return {};
  }
}

export default async function NeighborhoodsIndexPage() {
  const allNames = getAllNeighborhoods();
  const medianRents = await getMedianRents(allNames);

  // Simple flat list grouped by borough
  const boroughGroups: Record<string, { name: string; slug: string; medianRent: number | null }[]> = {};
  for (const name of allNames) {
    const data = getNeighborhoodStaticData(name);
    if (!data) continue;
    const b = data.borough;
    if (!boroughGroups[b]) boroughGroups[b] = [];
    boroughGroups[b].push({
      name: data.name,
      slug: data.slug,
      medianRent: medianRents[name] ?? null,
    });
  }

  const boroughOrder = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'New Jersey', 'NYC'];
  const sortedBoroughs = Object.keys(boroughGroups).sort(
    (a, b) => (boroughOrder.indexOf(a) === -1 ? 99 : boroughOrder.indexOf(a)) - (boroughOrder.indexOf(b) === -1 ? 99 : boroughOrder.indexOf(b))
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'NYC Neighborhood Rent Prices',
    description: 'Rent prices, subway access, and commute times for 170+ NYC neighborhoods.',
    url: 'https://www.firstmovernyc.com/neighborhoods',
    isPartOf: {
      '@type': 'WebSite',
      name: 'FirstMover Open Data Project',
      url: 'https://www.firstmovernyc.com',
    },
  };

  return (
    <div className="publication-section narrow" style={{ maxWidth: '900px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="section-header" style={{ marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '40px' }}>
          NYC Neighborhood Rent Prices
        </h1>
        <p className="section-subtitle">
          Rent data, subway access, and commute times for {allNames.length} neighborhoods. Powered by <Link href="/open-data" style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: '#ccc', textUnderlineOffset: '3px' }}>the latest listing data</Link>.
        </p>
      </div>

      {sortedBoroughs.map((borough) => (
        <section key={borough} style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--text)',
              marginBottom: '16px',
            }}
          >
            {borough}
          </h2>
          <div className="neighborhoods-index-grid">
            {boroughGroups[borough]!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((n) => (
                <Link
                  key={n.slug}
                  href={`/neighborhoods/${n.slug}`}
                  className="neighborhoods-index-card"
                >
                  <div className="name">{n.name}</div>
                  {n.medianRent ? (
                    <div className="median-rent">
                      ${n.medianRent.toLocaleString()}/mo
                    </div>
                  ) : (
                    <div className="median-rent no-data">No recent data</div>
                  )}
                </Link>
              ))}
          </div>
        </section>
      ))}

      <p className="fm-attribution" style={{ marginTop: '32px', textAlign: 'center' }}>
        Data from <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer">FirstMover</a>
      </p>
    </div>
  );
}
