'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Eye, Lightning, CheckCircle, AppStoreLogo, BellRinging, MagnifyingGlass, PaperPlaneTilt, ArrowUpRight, Lock, MapPin } from '@phosphor-icons/react';

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
  freeRealtimeMap: `${IMG}/free-realtime-map.png`,
  freeRentStabilized: `${IMG}/free-rent-stabilized.svg`,
  freeOpenHouse: `${IMG}/free-open-house.png`,
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

const TESTIMONIALS = [
  { name: 'Winston', text: "Got my dream studio in Hell\u2019s Kitchen thanks to FirstMover. The alert came in, I toured it that afternoon, and signed the lease two days later." },
  { name: 'Ellyn', text: "FirstMover successfully found me our dream apartment in a few hours under budget \ud83e\udd29\ud83e\udd29 We were the first to reach out and tour, and we signed the lease right there!" },
  { name: 'Marnie', text: "My only strategy was to just stare at StreetEasy all day and hit refresh. FirstMover gave me hope \ud83d\ude4c" },
  { name: 'Jonathan', text: "I\u2019m actually bummed they\u2019re turning this into an app. This was kinda our secret in the friend group lol" },
  { name: 'Vineet', text: "I got an alert at while brushing my teeth. Saw it. Loved it. Signed it. FirstMover works." },
  { name: 'Meghan', text: "The app is super easy to set up, and I\u2019m getting about 8 listings per day. I wish I could filter on in-unit washer and pet-friendly, but they said they\u2019re working on it!" },
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
          <a href="#free-stuff" className="landing-nav-link">Free Stuff</a>
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
          Beat the rush. Get listings the moment they go live,<br />
          for $30 lifetime.
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

function FreeStuffSection() {
  return (
    <section className="landing-free" id="free-stuff">
      <div className="landing-free-inner">
        <span className="landing-free-badge">Free Stuff</span>
        <p className="landing-free-subtitle">
          Cool, quick resources we&rsquo;re actively building for NYC apartment hunters.
        </p>

        <div className="landing-free-grid">
          <div className="landing-free-card">
            <a href="https://www.firstmovernyc.com/realtime-map" className="landing-free-card-thumb">
              <img src={IMAGES.freeRealtimeMap} alt="Realtime Listing Map" loading="lazy" />
            </a>
            <div className="landing-free-card-body">
              <div className="landing-free-card-info">
                <div className="landing-free-card-header">
                  <Lightning size={20} weight="fill" className="landing-free-card-emoji" />
                  <h4 className="landing-free-card-title">Realtime Listing Map</h4>
                </div>
                <p className="landing-free-card-desc">A mission control of every listing added to StreetEasy in the last 60 minutes.</p>
              </div>
              <a href="https://www.firstmovernyc.com/realtime-map" className="landing-free-card-link">
                <MapPin size={14} weight="bold" /> Open <ArrowUpRight size={12} weight="bold" />
              </a>
            </div>
          </div>

          <div className="landing-free-card">
            <div className="landing-free-card-thumb">
              <img src={IMAGES.freeRentStabilized} alt="Rent Stabilized Buildings Dataset" loading="lazy" />
            </div>
            <div className="landing-free-card-body">
              <div className="landing-free-card-info">
                <div className="landing-free-card-header">
                  <Lock size={20} weight="fill" className="landing-free-card-emoji" />
                  <h4 className="landing-free-card-title">Rent Stabilized Buildings Dataset</h4>
                </div>
                <p className="landing-free-card-desc">Get a clean, searchable, and geotagged dataset of all known rent-stabilized units from the NYC Rent Guidelines Board.</p>
              </div>
              <div className="landing-free-card-links">
                <a href="https://docs.google.com/spreadsheets/d/1_yUjWl9Z1z6T_8oRqXscOU6KFV25ECYgVO69lORFyxI/edit" target="_blank" rel="noopener noreferrer" className="landing-free-card-link">
                  Google Sheet <ArrowUpRight size={12} weight="bold" />
                </a>
                <a href="https://github.com/firstmovernyc/nyc-rent-stabilized-listings" target="_blank" rel="noopener noreferrer" className="landing-free-card-link">
                  Github <ArrowUpRight size={12} weight="bold" />
                </a>
              </div>
            </div>
          </div>

          <a href="https://www.firstmovernyc.com/map" className="landing-free-card">
            <div className="landing-free-card-thumb">
              <img src={IMAGES.freeOpenHouse} alt="Open House Mapper" loading="lazy" />
            </div>
            <div className="landing-free-card-body">
              <div className="landing-free-card-info">
                <div className="landing-free-card-header">
                  <MapPin size={20} weight="fill" className="landing-free-card-emoji" />
                  <h4 className="landing-free-card-title">Open House Mapper</h4>
                </div>
                <p className="landing-free-card-desc">View all upcoming open houses from StreetEasy on a filterable map.</p>
              </div>
              <span className="landing-free-card-link">
                <MapPin size={14} weight="bold" /> Open <ArrowUpRight size={12} weight="bold" />
              </span>
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
        <h2 className="landing-testimonials-heading">Early User Vibes</h2>
        <div className="landing-testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card">
              <h4 className="testimonial-name">{t.name}</h4>
              <p className="testimonial-text">{t.text}</p>
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
      <FreeStuffSection />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}
