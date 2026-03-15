'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Eye, Lightning, CheckCircle, AppStoreLogo, BellRinging, MagnifyingGlass, PaperPlaneTilt } from '@phosphor-icons/react';

const APP_STORE_URL = 'https://apps.apple.com/app/id6740444528';

const IMG = '/images/landing';
const IMAGES = {
  heroBg: `${IMG}/hero-bg.png`,
  phoneFrame: `${IMG}/phone-frame.png`,
  phoneScreen: `${IMG}/phone-screen.svg`,
  logo: '/logo.svg',
  cardNeverMissBg: `${IMG}/card-never-miss-bg.jpg`,
  cardNeverMissDialog: `${IMG}/card-never-miss-dialog.svg`,
  cardEasySetup: `${IMG}/card-easy-setup.png`,
  cardPark: `${IMG}/city-park.avif`,
};

const LEFT_NOTIF_SVGS = [
  `${IMG}/notif-left-1.svg`,
  `${IMG}/notif-left-2.svg`,
  `${IMG}/notif-left-3.svg`,
];

const RIGHT_NOTIF_SVGS = [
  `${IMG}/notif-right-1.svg`,
  `${IMG}/notif-right-2.svg`,
  `${IMG}/notif-right-3.svg`,
];

const REVIEWS = [
  { title: 'Huge edge in a competitive market', text: 'I used this during my August move and it immediately helped me find some of the best apartments and get a chance to see them first. This app removes the luck of being on Street Easy at the right time and gives you an advantage over other renters by getting to see apartments first. Highly recommend for anyone living in NYC.' },
  { title: 'It actually worked', text: 'Dead simple app- put in the same search criteria you would for StreetEasy, and get real notifications. I would request getting amenities searchable' },
  { title: 'saved me thousands of $$$', text: 'Insanely useful app, it got me my dream apartment for hundreds less than the market average. This app will literally save me thousands each year I live here' },
  { title: '10/10 app!', text: 'If I could give this more than 5 stars I would.' },
  { title: 'Amazing people', text: "Ben\u2019s a top tier person! Love this app too" },
];

/* ---------- Sub-components ---------- */

function LiveClock() {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(2);
      const h = now.getHours();
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setDisplay(`${mm}.${dd}.${yy} \u2022 ${h12}:${min}:${sec} ${ampm}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!display) return <span style={{ visibility: 'hidden' }}>00.00.00 &bull; 0:00:00 AM</span>;
  return <span>{display}</span>;
}

function LandingNav() {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <a href="/" className="landing-nav-logo">
          <img src={IMAGES.logo} alt="FirstMover" width={28} height={28} />
        </a>
        <div className="landing-nav-links">
          <a href="/open" className="landing-nav-link">Open Data Project</a>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="landing-nav-download">
            <AppStoreLogo size={16} weight="regular" />
            Download
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Notification cards: hidden at start, slide outward on scroll
  const leftX1 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, -30, -70]);
  const leftX2 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, -50, -110]);
  const leftX3 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, -40, -90]);
  const rightX1 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, 30, 70]);
  const rightX2 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, 50, 110]);
  const rightX3 = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, 40, 90]);
  const notifOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2], [0, 0.5, 1]);

  const leftXValues = [leftX1, leftX2, leftX3];
  const rightXValues = [rightX1, rightX2, rightX3];
  const leftRotations = [-4, 3, -2.5];
  const rightRotations = [4, -3, 2.5];

  // Scroll animations: clock + headline + CTA slide down into the phone
  const heroTextY = useTransform(scrollYProgress, [0, 0.25], [0, 200]);
  const heroTextScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.7]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section className="landing-hero" ref={heroRef}>
      <div className="landing-hero-bg">
        <img src={IMAGES.heroBg} alt="" />
      </div>
      <div className="landing-hero-glow" />

      <div className="landing-hero-content">
        <motion.div
          className="landing-hero-text-group"
          style={{ y: heroTextY, scale: heroTextScale, opacity: heroTextOpacity }}
        >
          <div className="landing-hero-clock">
            <LiveClock />
          </div>

          <h1 className="landing-hero-headline">
            Get StreetEasy<br />Notifications<br />Before Anyone Else
          </h1>

          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-hero-cta"
          >
            <AppStoreLogo size={20} weight="regular" />
            Get alerts now
          </a>
        </motion.div>

        <div className="landing-hero-phone-area">
          {/* Left notifications */}
          <div className="hero-notifs-left">
            {LEFT_NOTIF_SVGS.map((src, i) => (
              <motion.div
                key={i}
                style={{ x: leftXValues[i], opacity: notifOpacity, rotate: leftRotations[i] }}
                className="hero-notif-svg"
              >
                <img src={src} alt="" />
              </motion.div>
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
            />
            <img
              src={IMAGES.phoneFrame}
              alt=""
              className="hero-phone-frame"
            />
          </div>

          {/* Right notifications */}
          <div className="hero-notifs-right">
            {RIGHT_NOTIF_SVGS.map((src, i) => (
              <motion.div
                key={i}
                style={{ x: rightXValues[i], opacity: notifOpacity, rotate: rightRotations[i] }}
                className="hero-notif-svg"
              >
                <img src={src} alt="" />
              </motion.div>
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

function NotificationForecaster() {
  return (
    <iframe
      src="https://benfwalla.github.io/firstmover-avg-listing-embed/"
      className="forecaster-iframe"
      title="Notification Forecaster"
      loading="lazy"
    />
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
                <img src={IMAGES.cardNeverMissBg} alt="" className="feature-card-clouds" loading="lazy" />
                <img src={IMAGES.cardNeverMissDialog} alt="" className="feature-card-dialog" loading="lazy" />
              </div>
              <div className="feature-card-content">
                <BellRinging size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Never Miss a Listing</h4>
                <p className="feature-card-desc">Enable alerts and we&rsquo;ll ping you instantly &mdash; faster than StreetEasy ever could.</p>
              </div>
            </div>
            <div className="landing-feature-card">
              <div className="feature-card-visual">
                <img src={IMAGES.cardEasySetup} alt="" className="feature-card-phone" loading="lazy" />
              </div>
              <div className="feature-card-content">
                <MagnifyingGlass size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Easy Setup</h4>
                <p className="feature-card-desc">Tell us what you&rsquo;re looking for, and we&rsquo;ll estimate how often you&rsquo;ll get notified.</p>
              </div>
            </div>
            <div className="landing-feature-card">
              <div className="feature-card-visual feature-card-notifs">
                <img src={LEFT_NOTIF_SVGS[0]} alt="" className="feature-notif feature-notif-1" loading="lazy" />
                <img src={RIGHT_NOTIF_SVGS[0]} alt="" className="feature-notif feature-notif-2" loading="lazy" />
              </div>
              <div className="feature-card-content">
                <PaperPlaneTilt size={28} weight="regular" className="feature-card-icon" />
                <h4 className="feature-card-title">Be the First to Tour</h4>
                <p className="feature-card-desc">We&rsquo;ll send you fresh listings linking directly to StreetEasy, before anyone else sees them.</p>
              </div>
            </div>
            <div className="landing-feature-card landing-feature-card-park">
              <img src={IMAGES.cardPark} alt="" className="feature-card-park-img" loading="lazy" />
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
              <img src="/images/open_data_listings_preview.svg" alt="Open Data preview" className="tool-card-preview" loading="lazy" />
            </div>
          </a>

          <a href="/reports" className="tool-card">
            <h3 className="tool-title">Reports</h3>
            <p className="tool-description">
              Monthly rent reports breaking down what's happening across NYC.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/reports_preview.png" alt="Reports preview" className="tool-card-preview" loading="lazy" />
            </div>
          </a>

          <a href="/resources" className="tool-card">
            <h3 className="tool-title">Resources</h3>
            <p className="tool-description">
              Interactive tools and sites to explore NYC's rental market.
            </p>
            <div className="tool-card-preview-wrapper">
              <img src="/images/resource_preview.svg" alt="Resources preview" className="tool-card-preview" loading="lazy" />
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
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="landing-footer-download">
              <AppStoreLogo size={16} weight="regular" />
              Download
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Main export ---------- */

export function LandingPage() {
  useEffect(() => {
    document.body.classList.add('landing');
    return () => document.body.classList.remove('landing');
  }, []);

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
