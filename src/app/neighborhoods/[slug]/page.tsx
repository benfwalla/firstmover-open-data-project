import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllNeighborhoodSlugs,
  unslugify,
  getNeighborhoodStaticData,
  COMMUTE_LABELS,
  getAllNeighborhoods,
  slugify,
  getSubwayColor,
  getSubwayTextColor,
  getNeighborhoodAreaIds,
} from '@/lib/neighborhoods';
import { getNeighborhoodRentData } from '@/lib/neighborhood-data';

export async function generateStaticParams() {
  return getAllNeighborhoodSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = unslugify(slug);
  if (!name) return {};

  const data = getNeighborhoodStaticData(name);
  if (!data) return {};

  const title = `${name} Rent Prices & Apartment Data · FirstMover`;
  const description = `Current median rent, listings, subway access, and commute times for ${name}, ${data.borough}. Powered by the latest NYC rental listing data.`;

  return {
    title,
    description,
    alternates: { canonical: `/neighborhoods/${slug}` },
    openGraph: { url: `/neighborhoods/${slug}`, title, description },
  };
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const mins = Math.round((now - then) / 60000);
  if (mins < 1) return 'Just listed';
  if (mins < 60) return `Listed ${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Listed ${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Listed yesterday';
  return `Listed ${days} days ago`;
}

function bedroomLabel(n: number): string {
  if (n === 0) return 'Studio';
  if (n === 1) return '1 BR';
  if (n === 2) return '2 BR';
  if (n === 3) return '3 BR';
  return '4+ BR';
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = unslugify(slug);
  if (!name) notFound();

  const staticData = getNeighborhoodStaticData(name);
  if (!staticData) notFound();

  let rentData;
  try {
    rentData = await getNeighborhoodRentData(name);
  } catch {
    rentData = null;
  }

  const hasData = rentData && rentData.total_listings > 0;
  const areaIds = getNeighborhoodAreaIds(name);

  // Pick 6 nearby neighborhoods (same borough, different name)
  const allNeighborhoods = getAllNeighborhoods();
  const nearby = allNeighborhoods
    .filter((n) => n !== name)
    .map((n) => {
      const d = getNeighborhoodStaticData(n);
      if (!d) return null;
      const dist = Math.sqrt(
        Math.pow(d.lat - staticData.lat, 2) + Math.pow(d.lng - staticData.lng, 2)
      );
      return { ...d, dist };
    })
    .filter(Boolean)
    .sort((a, b) => a!.dist - b!.dist)
    .slice(0, 6) as (NonNullable<ReturnType<typeof getNeighborhoodStaticData>> & { dist: number })[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${name}, ${staticData.borough}`,
    description: `Rental market data for ${name} in ${staticData.borough}. ${hasData ? `Median rent: ${formatPrice(rentData!.median_price)} across ${rentData!.total_listings} recent listings.` : ''}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: staticData.lat,
      longitude: staticData.lng,
    },
    containedInPlace: staticData.parentNeighborhood
      ? {
          '@type': 'Place',
          name: `${staticData.parentNeighborhood.name}, ${staticData.borough}`,
          containedInPlace: {
            '@type': 'City',
            name: staticData.borough === 'New Jersey' ? 'New Jersey' : 'New York City',
          },
        }
      : {
          '@type': 'City',
          name: staticData.borough === 'New Jersey' ? 'New Jersey' : 'New York City',
        },
  };

  return (
    <div className="publication-section narrow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="neighborhood-breadcrumb">
        <Link href="/">Home</Link>
        <span className="separator">/</span>
        <Link href="/neighborhoods">Neighborhoods</Link>
        <span className="separator">/</span>
        {staticData.parentNeighborhood && (
          <>
            <Link href={`/neighborhoods/${staticData.parentNeighborhood.slug}`}>
              {staticData.parentNeighborhood.name}
            </Link>
            <span className="separator">/</span>
          </>
        )}
        <span>{name}</span>
      </nav>

      {/* Header */}
      <header className="neighborhood-header">
        <h1 className="section-title" style={{ fontSize: '40px' }}>
          {name}
        </h1>
        <p className="section-subtitle">
          {staticData.parentNeighborhood ? (
            <>{staticData.borough} · <Link href={`/neighborhoods/${staticData.parentNeighborhood.slug}`} style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: '#ccc', textUnderlineOffset: '3px' }}>{staticData.parentNeighborhood.name}</Link></>
          ) : (
            staticData.borough
          )}
          {staticData.subwayLines.length > 0 && (
            <>
              {' · '}
              <span className="subway-pills">
                {staticData.subwayLines.map((line) => (
                  <span key={line} className="subway-pill" style={{ background: getSubwayColor(line), color: getSubwayTextColor(line) }}>{line}</span>
                ))}
              </span>
            </>
          )}
        </p>
      </header>

      {/* Key stats */}
      {hasData && (
        <div className="neighborhood-stats-grid">
          <div className="stat-card">
            <div className="label">Median Rent</div>
            <div className="value">{formatPrice(rentData!.median_price)}</div>
            <div className="note">across all unit types</div>
          </div>
          <div className="stat-card">
            <div className="label">Listings This Month</div>
            <div className="value">{rentData!.total_listings.toLocaleString()}</div>
            <div className="note">last 30 days</div>
          </div>
          <div className="stat-card">
            <div className="label">Average Rent</div>
            <div className="value">{formatPrice(rentData!.avg_price)}</div>
            <div className="note">mean asking price</div>
          </div>
        </div>
      )}

      {/* Rent by bedroom */}
      {hasData && rentData!.rents.length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Rent by Unit Type</h2>
          <p className="neighborhood-section-desc">
            Median asking rents in {name} based on {rentData!.total_listings.toLocaleString()} listings from the past 30 days.
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Median</th>
                  <th style={{ textAlign: 'right' }}>Low</th>
                  <th style={{ textAlign: 'right' }}>High</th>
                  <th style={{ textAlign: 'right' }}>Listings</th>
                  {areaIds && <th style={{ textAlign: 'right' }}></th>}
                </tr>
              </thead>
              <tbody>
                {rentData!.rents.map((r) => (
                  <tr key={r.bedroom_count}>
                    <td style={{ fontWeight: 500 }}>{r.label}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatPrice(r.median_rent)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#666' }}>{formatPrice(r.min_rent)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#666' }}>{formatPrice(r.max_rent)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.listing_count}</td>
                    {areaIds && (
                      <td style={{ textAlign: 'right' }}>
                        <a
                          href={`https://streeteasy.com/for-rent/nyc/area:${areaIds}${r.bedroom_count >= 0 ? `%7Cbeds:${r.bedroom_count}` : ''}?sort_by=listing_desc`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#666', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          View ↗
                        </a>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent listings */}
      {hasData && rentData!.recent_listings.length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Recent Listings</h2>
          <p className="neighborhood-section-desc">
            The latest apartments listed in {name}.
          </p>
          <div className="listing-grid">
            {rentData!.recent_listings.map((listing) => (
              <a
                key={listing.id}
                href={`https://streeteasy.com${listing.url_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="listing-card"
              >
                <div className="listing-photo-wrapper">
                  <img
                    src={`https://photos.zillowstatic.com/fp/${listing.lead_media_photo}-se_extra_large_1500_800.webp`}
                    alt={`${listing.street} ${listing.unit}`}
                    className="listing-photo"
                    loading="lazy"
                  />
                </div>
                <div className="listing-info">
                  <div className="listing-price">{formatPrice(listing.price)}/mo</div>
                  <div className="listing-details">
                    {bedroomLabel(listing.bedroom_count)}
                    {listing.full_bathroom_count > 0 && ` · ${listing.full_bathroom_count} Bath`}
                    {listing.living_area_size > 0 && ` · ${listing.living_area_size} ft²`}
                  </div>
                  <div className="listing-address">{listing.street}{listing.unit ? `, ${listing.unit}` : ''}</div>
                  <div className="listing-ago">{timeAgo(listing.created_at)}</div>
                </div>
              </a>
            ))}
          </div>

        </section>
      )}

      {/* Commute times */}
      {Object.keys(staticData.commuteTimes).length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Commute Times from {name}</h2>
          <p className="neighborhood-section-desc">
            Estimated transit commute times via subway and bus.
          </p>
          <div className="commute-grid">
            {Object.entries(staticData.commuteTimes)
              .sort(([, a], [, b]) => a - b)
              .map(([key, minutes]) => (
                <div key={key} className="commute-card">
                  <div className="commute-minutes">{minutes} min</div>
                  <div className="commute-dest">{COMMUTE_LABELS[key] || key}</div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Subway lines */}
      {staticData.subwayLines.length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Subway Access</h2>
          <p className="neighborhood-section-desc">
            {name} is served by the following subway lines:
          </p>
          <div className="subway-lines-large">
            {staticData.subwayLines.map((line) => (
              <span key={line} className="subway-pill-large" style={{ background: getSubwayColor(line), color: getSubwayTextColor(line) }}>{line}</span>
            ))}
          </div>
        </section>
      )}

      {/* Sub-neighborhoods */}
      {staticData.childNeighborhoods.length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Neighborhoods in {name}</h2>
          <div className="nearby-grid">
            {staticData.childNeighborhoods.map((child) => (
              <Link
                key={child.slug}
                href={`/neighborhoods/${child.slug}`}
                className="nearby-card"
              >
                <div className="nearby-name">{child.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby neighborhoods */}
      {nearby.length > 0 && (
        <section className="neighborhood-section">
          <h2 className="neighborhood-section-title">Nearby Neighborhoods</h2>
          <div className="nearby-grid">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/neighborhoods/${n.slug}`}
                className="nearby-card"
              >
                <div className="nearby-name">{n.name}</div>
                <div className="nearby-borough">{n.borough}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="fm-attribution" style={{ marginTop: '32px', textAlign: 'center', color: '#000' }}>
        Get new listing alerts for {name} with <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline', textUnderlineOffset: '3px' }}>FirstMover</a>
      </p>
    </div>
  );
}
