'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatPrice, copyToClipboard } from '@/lib/utils';

interface Listing {
  id: number;
  area_name: string;
  street: string;
  unit: string;
  price: number;
  bedroom_count: number;
  full_bathroom_count: number;
  living_area_size: number;
  photos: string[];
  listed_minutes_ago?: number;
}

interface Result {
  listing: Listing;
  guess: number;
  diff: number;
  pctOff: number;
}

function getGrade(avgPctOff: number): { emoji: string; label: string; desc: string } {
  if (avgPctOff <= 5) return { emoji: '🏆', label: 'Rent Whisperer', desc: 'You basically work in real estate' };
  if (avgPctOff <= 10) return { emoji: '🔥', label: 'Street Smart', desc: 'You know your NYC market' };
  if (avgPctOff <= 20) return { emoji: '👀', label: 'Getting There', desc: 'Not bad, decent instincts' };
  if (avgPctOff <= 35) return { emoji: '😅', label: 'Tourist Pricing', desc: 'You might need a broker' };
  return { emoji: '💀', label: 'Delusional', desc: 'You need FirstMover in your life' };
}

function getAccuracyColor(pctOff: number): string {
  if (pctOff <= 5) return 'var(--green)';
  if (pctOff <= 15) return '#f59e0b';
  if (pctOff <= 30) return '#f97316';
  return '#ef4444';
}

function formatListedAgo(minutes: number): string {
  if (minutes < 60) return `Listed ${minutes} min ago`;
  if (minutes < 1440) return `Listed ${Math.round(minutes / 60)}h ago`;
  return `Listed ${Math.round(minutes / 1440)}d ago`;
}

export function GuessTheRentGame() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'reveal' | 'results'>('loading');
  const [showAnswer, setShowAnswer] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for shared results in URL
  const sharedResults = searchParams.get('r');

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchListings = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await fetch('/api/guess-the-rent');
      const data = await res.json();
      if (data.length > 0) {
        setListings(data);
        setCurrent(0);
        setResults([]);
        setGuess('');
        setShowAnswer(false);
        setPhase('intro');
      }
    } catch {
      // retry once
      setTimeout(fetchListings, 2000);
    }
  }, []);

  useEffect(() => {
    if (sharedResults) {
      setPhase('results');
      try {
        const decoded = JSON.parse(atob(sharedResults));
        setResults(decoded.map((r: any) => ({
          listing: { area_name: r.n, bedroom_count: r.b, full_bathroom_count: r.ba, price: r.p, photos: [], street: '', unit: '', id: 0, living_area_size: 0 },
          guess: r.g,
          diff: r.g - r.p,
          pctOff: Math.round(Math.abs(r.g - r.p) / r.p * 100),
        })));
      } catch {
        fetchListings();
      }
    } else {
      fetchListings();
    }
  }, [sharedResults, fetchListings]);

  useEffect(() => {
    if (phase === 'playing' && !isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [current, phase, isMobile]);

  const submitGuess = (value?: number) => {
    const parsed = value ?? parseInt(guess.replace(/[^0-9]/g, ''));
    if (!parsed || parsed < 100) return;
    const listing = listings[current];
    const diff = parsed - listing.price;
    const pctOff = Math.round(Math.abs(diff) / listing.price * 100);
    setResults(prev => [...prev, { listing, guess: parsed, diff, pctOff }]);
    setShowAnswer(true);
    setPhase('reveal');
  };

  const next = () => {
    setShowAnswer(false);
    setImgError(false);
    setPhotoIndex(0);
    if (current + 1 >= listings.length) {
      setPhase('results');
      const encoded = btoa(JSON.stringify(
        results.map(r => ({ n: r.listing.area_name, b: r.listing.bedroom_count, ba: r.listing.full_bathroom_count, p: r.listing.price, g: r.guess }))
      ));
      window.history.replaceState({}, '', `/open/tools/guess-the-rent?r=${encoded}`);
    } else {
      setCurrent(prev => prev + 1);
      setGuess('');
      setPhase('playing');
    }
  };

  const startGame = () => {
    setPhase('playing');
  };

  const copyLink = async () => {
    await copyToClipboard(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const playAgain = () => {
    window.history.replaceState({}, '', '/open/tools/guess-the-rent');
    fetchListings();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (phase === 'playing') submitGuess();
      else if (phase === 'reveal') next();
    }
  };

  const listing = listings[current];
  const avgPctOff = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.pctOff, 0) / results.length) : 0;
  const grade = getGrade(avgPctOff);
  const totalOff = results.reduce((s, r) => s + Math.abs(r.diff), 0);

  if (phase === 'loading') {
    return (
      <div className="gtr-container">
        <div className="gtr-loading">
          <div className="gtr-loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="gtr-container">
        <div className="gtr-intro-card">
          <div className="gtr-intro-badge">🏠 NYC RENTAL GAME</div>
          <h1 className="gtr-intro-title">Guess the Rent</h1>
          <p className="gtr-intro-subtitle">
            Think you know what NYC apartments cost?
          </p>
          <div className="gtr-intro-rules">
            <div className="gtr-intro-rule">
              <span className="gtr-intro-rule-icon">📸</span>
              <span>See a real NYC apartment</span>
            </div>
            <div className="gtr-intro-rule">
              <span className="gtr-intro-rule-icon">💰</span>
              <span>Guess the monthly rent</span>
            </div>
            <div className="gtr-intro-rule">
              <span className="gtr-intro-rule-icon">🎯</span>
              <span>5 listings, see how close you get</span>
            </div>
          </div>
          <button className="gtr-btn-primary gtr-btn-full" onClick={startGame}>
            Let&apos;s Play
          </button>
          <p className="gtr-intro-footer">
            Powered by <a href="https://apps.apple.com/us/app/firstmover/id6740444528" target="_blank" rel="noopener noreferrer">FirstMover</a>
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="gtr-container">
        <div className="gtr-results-card">
          <div className="gtr-results-header">
            <span className="gtr-grade-emoji">{grade.emoji}</span>
            <h1 className="gtr-grade-label">{grade.label}</h1>
            <p className="gtr-grade-desc">{grade.desc}</p>
          </div>

          <div className="gtr-score-row">
            <div className="gtr-score-stat">
              <span className="gtr-score-number">{avgPctOff}%</span>
              <span className="gtr-score-label">avg. off</span>
            </div>
            <div className="gtr-score-stat">
              <span className="gtr-score-number">{formatPrice(totalOff)}</span>
              <span className="gtr-score-label">total off</span>
            </div>
            <div className="gtr-score-stat">
              <span className="gtr-score-number">{results.filter(r => r.pctOff <= 10).length}/{results.length}</span>
              <span className="gtr-score-label">nailed it</span>
            </div>
          </div>

          <div className="gtr-results-list">
            {results.map((r, i) => (
              <div key={i} className="gtr-result-row">
                <div className="gtr-result-info">
                  <span className="gtr-result-num">#{i + 1}</span>
                  <div>
                    <strong>{r.listing.area_name}</strong>
                    <span className="gtr-result-beds">{r.listing.bedroom_count}BD / {r.listing.full_bathroom_count}BA</span>
                  </div>
                </div>
                <div className="gtr-result-prices">
                  <div className="gtr-result-actual">
                    <span className="gtr-result-price-label">Actual</span>
                    <span className="gtr-result-price">{formatPrice(r.listing.price)}</span>
                  </div>
                  <div className="gtr-result-guess-col">
                    <span className="gtr-result-price-label">You said</span>
                    <span className="gtr-result-price">{formatPrice(r.guess)}</span>
                  </div>
                  <span className="gtr-result-pct" style={{ color: getAccuracyColor(r.pctOff) }}>
                    {r.diff > 0 ? '+' : ''}{r.pctOff}% {r.diff > 0 ? '↑' : r.diff < 0 ? '↓' : '✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="gtr-results-actions">
            <button className="gtr-btn-primary" onClick={playAgain}>Play Again</button>
            <button className="gtr-btn-secondary" onClick={copyLink}>
              {copyFeedback ? '✓ Copied!' : '🔗 Share Results'}
            </button>
          </div>

          <div className="gtr-cta-card">
            <div className="gtr-cta-icon">⚡</div>
            <h3 className="gtr-cta-title">Stop guessing. Start moving.</h3>
            <p className="gtr-cta-desc">
              FirstMover sends you push notifications when new NYC rentals hit the market.
            </p>
            <a
              href="https://apps.apple.com/us/app/firstmover/id6740444528"
              target="_blank"
              rel="noopener noreferrer"
              className="gtr-btn-cta"
            >
              Get FirstMover
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Playing / Reveal phase
  return (
    <div className="gtr-container" onKeyDown={handleKeyDown}>
      <div className="gtr-progress">
        {listings.map((_, i) => (
          <div key={i} className={`gtr-progress-dot ${i < current ? 'done' : i === current ? 'active' : ''}`} />
        ))}
        <span className="gtr-progress-label">{current + 1} of {listings.length}</span>
      </div>

      <div className="gtr-card">
        <div className="gtr-photo-wrap">
          {!imgError ? (
            <img
              src={listing.photos[photoIndex]}
              alt={`Apartment in ${listing.area_name}`}
              className="gtr-photo"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="gtr-photo-fallback">📸 Photo unavailable</div>
          )}
          {listing.photos.length > 1 && (
            <>
              <button className="gtr-photo-nav gtr-photo-prev" onClick={() => setPhotoIndex(i => (i - 1 + listing.photos.length) % listing.photos.length)} aria-label="Previous photo">‹</button>
              <button className="gtr-photo-nav gtr-photo-next" onClick={() => setPhotoIndex(i => (i + 1) % listing.photos.length)} aria-label="Next photo">›</button>
              <div className="gtr-photo-dots">
                {(() => {
                  const total = listing.photos.length;
                  const maxDots = 5;
                  if (total <= maxDots) {
                    return listing.photos.map((_, i) => (
                      <span key={i} className={`gtr-photo-dot ${i === photoIndex ? 'active' : ''}`} onClick={() => setPhotoIndex(i)} />
                    ));
                  }
                  // Sliding window: keep active dot roughly centered
                  const half = Math.floor(maxDots / 2);
                  let start = Math.max(0, Math.min(photoIndex - half, total - maxDots));
                  const dots = [];
                  for (let i = start; i < start + maxDots; i++) {
                    const isEdge = (i === start && start > 0) || (i === start + maxDots - 1 && start + maxDots < total);
                    dots.push(
                      <span
                        key={i}
                        className={`gtr-photo-dot ${i === photoIndex ? 'active' : ''} ${isEdge ? 'small' : ''}`}
                        onClick={() => setPhotoIndex(i)}
                      />
                    );
                  }
                  return dots;
                })()}
              </div>
            </>
          )}
          {listing.photos.length > 1 && (
            <div className="gtr-photo-badge">
              {photoIndex + 1} / {listing.photos.length}
            </div>
          )}
          {listing.listed_minutes_ago != null && (
            <div className="gtr-listed-ago">
              {formatListedAgo(listing.listed_minutes_ago)}
            </div>
          )}
        </div>

        <div className="gtr-details">
          <div className="gtr-detail-row">
            <div>
              <h2 className="gtr-neighborhood">{listing.area_name}</h2>
              {listing.street && (
                <div className="gtr-address">{listing.street}{listing.unit ? `, ${listing.unit}` : ''}</div>
              )}
            </div>
            <div className="gtr-meta" style={{ fontSize: '16px' }}>
              <span>{listing.bedroom_count === 0 ? 'Studio' : `${listing.bedroom_count}bd`}</span>
              <span className="gtr-meta-dot">·</span>
              <span>{listing.full_bathroom_count}ba</span>
              {listing.living_area_size > 0 && (
                <>
                  <span className="gtr-meta-dot">·</span>
                  <span>{listing.living_area_size.toLocaleString()}sf</span>
                </>
              )}
            </div>
          </div>

          {!showAnswer ? (
            <div className="gtr-input-area">
              <div className="gtr-input-wrap">
                <span className="gtr-input-dollar">$</span>
                {isMobile ? (
                  <div className="gtr-input gtr-input-display">
                    {guess || <span style={{ color: '#ccc' }}>0</span>}
                  </div>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="gtr-input"
                    placeholder=""
                    value={guess}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setGuess(raw ? parseInt(raw).toLocaleString() : '');
                    }}
                  />
                )}
                <span className="gtr-input-mo">/mo</span>
              </div>

              {isMobile ? (
                /* Mobile: in-app numpad */
                <div className="gtr-numpad">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} className="gtr-numpad-key" onClick={() => {
                      const raw = guess.replace(/[^0-9]/g, '') + n;
                      if (raw.length <= 6) setGuess(parseInt(raw).toLocaleString());
                    }}>{n}</button>
                  ))}
                  <button className="gtr-numpad-key gtr-numpad-del" onClick={() => {
                    const raw = guess.replace(/[^0-9]/g, '');
                    if (raw.length > 0) {
                      const trimmed = raw.slice(0, -1);
                      setGuess(trimmed ? parseInt(trimmed).toLocaleString() : '');
                    }
                  }}>⌫</button>
                  <button className="gtr-numpad-key" onClick={() => {
                    const raw = guess.replace(/[^0-9]/g, '') + '0';
                    if (raw.length <= 6) setGuess(parseInt(raw).toLocaleString());
                  }}>0</button>
                  <button
                    className="gtr-numpad-key gtr-numpad-go"
                    onClick={() => submitGuess()}
                    disabled={!guess || parseInt(guess.replace(/[^0-9]/g, '')) < 100}
                  >Go</button>
                </div>
              ) : (
                <button
                  className="gtr-btn-primary gtr-btn-full"
                  onClick={() => submitGuess()}
                  disabled={!guess || parseInt(guess.replace(/[^0-9]/g, '')) < 100}
                >
                  Guess
                </button>
              )}
            </div>
          ) : (
            <div className="gtr-reveal">
              <div className="gtr-reveal-row">
                <div className="gtr-reveal-col">
                  <span className="gtr-reveal-label">Your guess</span>
                  <span className="gtr-reveal-value">{formatPrice(results[results.length - 1].guess)}</span>
                </div>
                <div className="gtr-reveal-col">
                  <span className="gtr-reveal-label">Actual rent</span>
                  <span className="gtr-reveal-value gtr-reveal-actual">{formatPrice(listing.price)}</span>
                </div>
              </div>
              <div className="gtr-reveal-diff" style={{ color: getAccuracyColor(results[results.length - 1].pctOff) }}>
                {results[results.length - 1].pctOff <= 5 ? '🎯 Nailed it!' :
                 results[results.length - 1].pctOff <= 15 ? '👏 Close!' :
                 results[results.length - 1].pctOff <= 30 ? '😬 Not quite' :
                 '💀 Way off'}
                {' - '}{results[results.length - 1].pctOff}% off
              </div>
              <button className="gtr-btn-primary gtr-btn-full" onClick={next}>
                {current + 1 >= listings.length ? 'See Results' : 'Next Listing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
