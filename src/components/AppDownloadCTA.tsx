import Link from 'next/link';

const APP_STORE_URL = 'https://apps.apple.com/us/app/firstmover/id6740444528';
const BADGE_URL = 'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us';

export function AppDownloadCTA({ neighborhood }: { neighborhood?: string }) {
  const title = neighborhood
    ? `Get alerts for ${neighborhood}`
    : 'Stop refreshing StreetEasy';
  const body = neighborhood
    ? `New listings in ${neighborhood}, sent to your phone the moment they appear.`
    : 'Get push notifications the moment new NYC apartments hit the market.';

  return (
    <div
      style={{
        border: '1px solid #e5e1dc',
        borderRadius: '12px',
        padding: '32px',
        marginTop: '32px',
        marginBottom: '16px',
        textAlign: 'center',
        background: 'var(--light-gray)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '22px',
          fontWeight: 600,
          margin: '0 0 8px 0',
          color: 'var(--text)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: '#666',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BADGE_URL}
          alt="Download on the App Store"
          style={{ height: '44px' }}
        />
      </a>
    </div>
  );
}
