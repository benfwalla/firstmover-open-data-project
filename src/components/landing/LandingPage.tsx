import { Eye, Lightning, CheckCircle, BellRinging, MagnifyingGlass, PaperPlaneTilt } from '@phosphor-icons/react/ssr';
import { NotificationForecaster } from '@/components/landing/NotificationForecaster';
import { TrackedAppStoreLink } from '@/components/landing/TrackedAppStoreLink';

const IMG = '/images/landing';
const IMAGES = {
  heroBg: `${IMG}/hero-bg.avif`,
  phoneFrame: `${IMG}/phone-frame.png`,
  phoneScreen: `${IMG}/phone-screen.webp`,
  logo: '/logo.svg',
  cardNeverMissBg: `${IMG}/card-never-miss-bg.avif`,
  cardNeverMissDialog: `${IMG}/card-never-miss-dialog.svg`,
  cardEasySetup: `${IMG}/card-easy-setup.png`,
};

const LEFT_NOTIF_SVGS = [
  `${IMG}/notif-left-1.webp`,
  `${IMG}/notif-left-2.webp`,
  `${IMG}/notif-left-3.webp`,
];

const RIGHT_NOTIF_SVGS = [
  `${IMG}/notif-right-1.webp`,
  `${IMG}/notif-right-2.webp`,
  `${IMG}/notif-right-3.webp`,
];

const REVIEWS = [
  { title: 'Huge edge in a competitive market', text: 'I used this during my August move and it immediately helped me find some of the best apartments and get a chance to see them first. This app removes the luck of being on Street Easy at the right time and gives you an advantage over other renters by getting to see apartments first. Highly recommend for anyone living in NYC.' },
  { title: 'It actually worked', text: 'Dead simple app- put in the same search criteria you would for StreetEasy, and get real notifications. I would request getting amenities searchable' },
  { title: 'saved me thousands of $$$', text: 'Insanely useful app, it got me my dream apartment for hundreds less than the market average. This app will literally save me thousands each year I live here' },
  { title: '10/10 app!', text: 'If I could give this more than 5 stars I would.' },
  { title: 'Amazing people', text: "Ben\u2019s a top tier person! Love this app too" },
];

/* ---------- Sub-components ---------- */

function LandingNav() {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <a href="/" className="landing-nav-logo">
          <img src={IMAGES.logo} alt="FirstMover" width={28} height={28} />
        </a>
        <div className="landing-nav-links">
          <a href="/open" className="landing-nav-link">Open Data Project</a>
          <TrackedAppStoreLink className="landing-nav-download" label="Download" placement="navigation" />
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg">
        <img src={IMAGES.heroBg} alt="" width="768" height="644" fetchPriority="high" decoding="async" />
      </div>
      <div className="landing-hero-glow" />

      <div className="landing-hero-content">
        <div className="landing-hero-text-group">
          <div className="landing-hero-clock">
            NYC rentals <span aria-hidden="true">&bull;</span> Listings move fast
          </div>

          <h1 className="landing-hero-headline">
            Get StreetEasy<br />Notifications<br />Before Anyone Else
          </h1>

          <TrackedAppStoreLink className="landing-hero-cta" label="Get alerts now" placement="hero" iconSize={20} />
        </div>

        <div className="landing-hero-phone-area">
          {/* Left notifications */}
          <div className="hero-notifs-left">
            {LEFT_NOTIF_SVGS.map((src, i) => (
              <div key={src} className={`hero-notif-svg hero-notif-${i + 1}`}>
                <picture>
                  <source media="(min-width: 811px)" srcSet={src} type="image/webp" />
                  <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width="640" height="148" loading="lazy" decoding="async" />
                </picture>
              </div>
            ))}
          </div>

          {/* Phone */}
          <div className="hero-phone-mockup">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES.phoneScreen}
              alt="FirstMover app showing a new listing notification"
              className="hero-phone-screen"
              fetchPriority="high"
              decoding="async"
              width="760"
              height="1647"
            />
            <img
              src={IMAGES.phoneFrame}
              alt=""
              className="hero-phone-frame"
              width="1072"
              height="2163"
              decoding="async"
            />
          </div>

          {/* Right notifications */}
          <div className="hero-notifs-right">
            {RIGHT_NOTIF_SVGS.map((src, i) => (
              <div key={src} className={`hero-notif-svg hero-notif-${i + 1}`}>
                <picture>
                  <source media="(min-width: 811px)" srcSet={src} type="image/webp" />
                  <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width="640" height="148" loading="lazy" decoding="async" />
                </picture>
              </div>
            ))}
          </div>
        </div>

        <p className="landing-hero-sub">
          Beat the rush. Get listings the moment they go live.<br />
          Free trial, then $30 lifetime.
        </p>
      </div>
    </section>
  );
}

function ValuePropSection() {
  return (
    <section className="landing-value-wrapper">
      <div className="landing-value">
        <div className="landing-value-inner">
          <div className="landing-value-grid">
            <div className="landing-value-left">
              <h2 className="landing-value-heading">
                Stop losing out on your dream home.
              </h2>
              <p className="landing-value-text">
                StreetEasy&rsquo;s notifications are either days old or sponsored content.
              </p>
              <p className="landing-value-text">
                With FirstMover, you get access to new StreetEasy listings <strong>the moment they go live</strong>, so you can reach out first and get that <strong>first-mover advantage.</strong>
              </p>
              <ul className="landing-value-bullets">
                <li>
                  <Eye size={16} weight="bold" />
                  Stop Staring at StreetEasy
                </li>
                <li>
                  <Lightning size={16} weight="fill" />
                  Be the First to Know
                </li>
                <li>
                  <CheckCircle size={16} weight="fill" />
                  Cancel Anytime
                </li>
              </ul>
            </div>
            <div className="landing-value-right">
              <NotificationForecaster />
            </div>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="feature-card-visual feature-card-visual-clouds">
                <img src={IMAGES.cardNeverMissBg} alt="" className="feature-card-clouds" width="1600" height="900" loading="lazy" decoding="async" />
                <img src={IMAGES.cardNeverMissDialog} alt="" className="feature-card-dialog" width="308" height="203" loading="lazy" decoding="async" />
              </div>
              <div className="feature-card-content">
                <BellRinging size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Never Miss a Listing</h4>
                <p className="feature-card-desc">Enable alerts and we&rsquo;ll ping you instantly &mdash; faster than StreetEasy ever could.</p>
              </div>
            </div>
            <div className="landing-feature-card">
              <div className="feature-card-visual">
                <img src={IMAGES.cardEasySetup} alt="" className="feature-card-phone" width="507" height="1024" loading="lazy" decoding="async" />
              </div>
              <div className="feature-card-content">
                <MagnifyingGlass size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Easy Setup</h4>
                <p className="feature-card-desc">Tell us what you&rsquo;re looking for, and we&rsquo;ll estimate how often you&rsquo;ll get notified.</p>
              </div>
            </div>
            <div className="landing-feature-card">
              <div className="feature-card-visual feature-card-notifs">
                <img src={LEFT_NOTIF_SVGS[0]} alt="" className="feature-notif feature-notif-1" width="640" height="148" loading="lazy" decoding="async" />
                <img src={RIGHT_NOTIF_SVGS[0]} alt="" className="feature-notif feature-notif-2" width="640" height="148" loading="lazy" decoding="async" />
              </div>
              <div className="feature-card-content">
                <PaperPlaneTilt size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Be the First to Tour</h4>
                <p className="feature-card-desc">We&rsquo;ll send you fresh listings linking directly to StreetEasy, before anyone else sees them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpenDataSection() {
  return (
    <section className="landing-odp">
      <div className="landing-odp-inner">
        <div className="home-grid">
          <div className="home-intro">
            <h2 className="landing-odp-title">The FirstMover Open Data Project</h2>
            <p className="home-description">
              FirstMover sells push notifications. Everything we collect after is 100% free to the public.
            </p>
            <div className="home-links">
              <a href="/open" className="home-about-link">Learn more</a>
            </div>
          </div>

          <a href="/open-data" className="tool-card">
            <h3 className="tool-title">Open Data</h3>
            <p className="tool-description">
              Monthly listing CSVs and a rent stabilized buildings database.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/open_data_listings_preview.svg" alt="Open Data preview" className="tool-card-preview" width="554" height="204" loading="lazy" decoding="async" />
            </div>
          </a>

          <a href="/reports" className="tool-card">
            <h3 className="tool-title">Reports</h3>
            <p className="tool-description">
              Monthly rent reports breaking down what's happening across NYC.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/reports_preview.png" alt="Reports preview" className="tool-card-preview" width="1124" height="754" loading="lazy" decoding="async" />
            </div>
          </a>

          <a href="/resources" className="tool-card">
            <h3 className="tool-title">Resources</h3>
            <p className="tool-description">
              Interactive tools and sites to explore NYC's rental market.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/resource_preview.svg" alt="Resources preview" className="tool-card-preview" width="719" height="261" loading="lazy" decoding="async" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="landing-testimonials">
      <div className="landing-testimonials-inner">
        <h2 className="landing-testimonials-heading">Real App Store Reviews</h2>
        <div className="landing-testimonials-grid">
          {REVIEWS.map((r) => (
            <div key={r.title} className="testimonial-card">
              <h4 className="testimonial-name">{r.title}</h4>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <div className="landing-footer-wrapper">
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-footer-copy">&copy; FirstMover 2026</span>
          <a href="https://open.firstmovernyc.com/privacy.html" className="landing-footer-link">Privacy Policy</a>
          <div className="landing-footer-right">
            <a href="mailto:firstmovernyc@gmail.com" className="landing-footer-link">firstmovernyc@gmail.com</a>
            <TrackedAppStoreLink className="landing-footer-download" label="Download" placement="footer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Main export ---------- */

export function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <ValuePropSection />
      <OpenDataSection />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}
