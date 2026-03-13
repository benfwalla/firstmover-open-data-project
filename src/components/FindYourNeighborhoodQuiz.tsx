'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowsClockwise, CopySimple, ArrowLeft } from '@phosphor-icons/react';
import { formatPrice, copyToClipboard } from '@/lib/utils';
import commuteData from '@/data/commute-data.json';
import subwayLines from '@/data/neighborhood-subway-lines.json';

const SUBWAY_LINE_COLORS: Record<string, string> = {
  "1": "D82233", "2": "D82233", "3": "D82233",
  "4": "009952", "5": "009952", "6": "009952",
  "7": "9A38A1",
  "A": "0062CF", "C": "0062CF", "E": "0062CF",
  "B": "EB6800", "D": "EB6800", "F": "EB6800", "M": "EB6800",
  "G": "799534",
  "J": "8E5C33", "Z": "8E5C33",
  "L": "7C858C",
  "N": "F6BC26", "Q": "F6BC26", "R": "F6BC26", "W": "F6BC26",
  "SI": "08179C",
  "PATH": "003DA5"
};

const VIBE_MAPPING = {
  'Nightlife & Bars': ['East Village', 'Lower East Side', 'Williamsburg', 'Bushwick', "Hell's Kitchen", 'West Village', 'Astoria', 'Hoboken'],
  'Artsy & Creative': ['Bushwick', 'Greenpoint', 'Fort Greene', 'Clinton Hill', 'Red Hook', 'Gowanus', 'Williamsburg', 'Bed-Stuy', 'Ridgewood'],
  'Chill & Quiet': ['Park Slope', 'Windsor Terrace', 'Ditmas Park', 'Forest Hills', 'Sunnyside', 'Carroll Gardens', 'Woodside', 'Riverdale', 'Pelham Bay', 'Bay Ridge', 'Cobble Hill', 'Inwood', 'Morningside Heights', 'Hamilton Heights', 'Washington Heights', 'Hoboken'],
  'Young Professional': ['Murray Hill', 'Kips Bay', 'Stuyvesant Town', 'Financial District', 'Long Island City', "Hell's Kitchen", 'Midtown East', 'Gramercy Park', 'Hoboken'],
  'Family-Friendly': ['Park Slope', 'Carroll Gardens', 'Bay Ridge', 'Cobble Hill', 'Prospect Heights', 'Forest Hills', 'Riverdale', 'Upper West Side', 'Upper East Side', 'Woodside', 'Sunnyside', 'Ditmas Park'],
  'Foodie Paradise': ['West Village', 'East Village', 'Williamsburg', 'Astoria', 'Jackson Heights', 'Flushing', 'Crown Heights', 'Elmhurst', 'Sunset Park', 'Harlem'],
  'Budget-Friendly': ['Bed-Stuy', 'Ridgewood', 'Flatbush', 'Sunset Park', 'Mott Haven', 'Elmhurst', 'Woodside', 'Sunnyside', 'Washington Heights', 'Inwood', 'East Harlem', 'Pelham Bay', 'Bay Ridge']
};

const NEIGHBORHOOD_VIBES: Record<string, string[]> = {
  'Williamsburg': ['🎨 Artsy', '🍻 Nightlife'],
  'Bushwick': ['🎨 Artsy', '💰 Budget-Friendly'],
  'East Village': ['🍻 Nightlife', '🍽️ Foodie'],
  'West Village': ['🍽️ Foodie', '🍻 Nightlife'],
  'Astoria': ['🍽️ Foodie', '💰 Budget-Friendly'],
  'Park Slope': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Crown Heights': ['🎵 Cultural', '🍽️ Foodie'],
  "Hell's Kitchen": ['💼 Professional', '🍻 Nightlife'],
  'Murray Hill': ['💼 Professional', '🎯 Convenient'],
  'Greenpoint': ['🎨 Artsy', '😌 Chill'],
  'Long Island City': ['💼 Professional', '🏗️ Modern'],
  'Financial District': ['💼 Professional', '🏙️ Urban'],
  'Upper West Side': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Upper East Side': ['👨‍👩‍👧‍👦 Family', '💼 Professional'],
  'Carroll Gardens': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Bedford-Stuyvesant': ['🎵 Cultural', '💰 Budget-Friendly'],
  'Flatbush': ['🌍 Diverse', '💰 Budget-Friendly'],
  'Ridgewood': ['🎨 Artsy', '💰 Budget-Friendly'],
  'Jackson Heights': ['🍽️ Foodie', '🌍 Diverse'],
  'Harlem': ['🎵 Cultural', '🍽️ Foodie'],
  'East Harlem': ['🌍 Diverse', '💰 Budget-Friendly'],
  'Sunset Park': ['🌍 Diverse', '💰 Budget-Friendly'],
  'Sunnyside': ['😌 Chill', '💰 Budget-Friendly'],
  'Woodside': ['😌 Chill', '💰 Budget-Friendly'],
  'Elmhurst': ['🍽️ Foodie', '💰 Budget-Friendly'],
  'Forest Hills': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Bay Ridge': ['👨‍👩‍👧‍👦 Family', '💰 Budget-Friendly'],
  'Washington Heights': ['🌍 Diverse', '💰 Budget-Friendly'],
  'Inwood': ['😌 Chill', '💰 Budget-Friendly'],
  'Riverdale': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Mott Haven': ['🏗️ Modern', '💰 Budget-Friendly'],
  'Fort Greene': ['🎨 Artsy', '🍽️ Foodie'],
  'Clinton Hill': ['🎨 Artsy', '😌 Chill'],
  'Cobble Hill': ['👨‍👩‍👧‍👦 Family', '😌 Chill'],
  'Prospect Heights': ['👨‍👩‍👧‍👦 Family', '🍽️ Foodie'],
  'Flushing': ['🍽️ Foodie', '🌍 Diverse'],
  'Gramercy Park': ['💼 Professional', '😌 Chill'],
  'Kips Bay': ['💼 Professional', '🎯 Convenient'],
  'Lower East Side': ['🍻 Nightlife', '🎨 Artsy'],
  'Red Hook': ['🎨 Artsy', '😌 Chill'],
  'Gowanus': ['🎨 Artsy', '🏗️ Modern'],
  'Pelham Bay': ['👨‍👩‍👧‍👦 Family', '💰 Budget-Friendly'],
  'Stuyvesant Town': ['💼 Professional', '😌 Chill'],
  'Windsor Terrace': ['😌 Chill', '👨‍👩‍👧‍👦 Family'],
  'Ditmas Park': ['😌 Chill', '👨‍👩‍👧‍👦 Family'],
  'Midtown East': ['💼 Professional', '🎯 Convenient'],
  'Hoboken': ['💼 Professional', '🍻 Nightlife'],
};

const COMMUTE_HUBS = {
  timesSquare: 'Times Square / Midtown West',
  grandCentral: 'Grand Central / Midtown',
  midtownEast: 'Midtown East',
  penn: 'Penn Station / MSG',
  hudsonYards: 'Hudson Yards',
  fidi: 'Financial District',
  unionSquare: 'Union Square / Flatiron',
  barclays: 'Downtown Brooklyn / Barclays',
  nyu: 'NYU / West Village',
  columbiaCampus: 'Columbia / Morningside Heights',
};

interface QuizState {
  step: number;
  budget: number;
  bedrooms: number | null;
  vibes: string[];
  commute: string | null;
}

interface Neighborhood {
  name: string;
  median_rents: { [key: string]: number };
  total_listings: number;
  daily_avg: number;
}

interface Listing {
  area_name: string;
  price: number;
  bedroom_count: number;
  full_bathroom_count: number;
  living_area_size: number;
  lead_media_photo: string;
  url_path: string;
  street: string;
}

export function FindYourNeighborhoodQuiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<QuizState>({ step: 1, budget: 3000, bedrooms: null, vibes: [], commute: null });
  const [budgetMode, setBudgetMode] = useState<'budget' | 'salary'>('budget');
  const [salary, setSalary] = useState(120000);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [listings, setListings] = useState<{ [key: string]: Listing[] }>({});
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const calculateBudgetFromSalary = (s: number) => Math.round(s / 40);

  useEffect(() => {
    if (budgetMode === 'salary') setQuiz(prev => ({ ...prev, budget: calculateBudgetFromSalary(salary) }));
  }, [salary, budgetMode]);

  useEffect(() => {
    const budget = searchParams.get('budget');
    const beds = searchParams.get('beds');
    const vibes = searchParams.get('vibes');
    const commute = searchParams.get('commute');
    if (budget || beds || vibes || commute) {
      setQuiz(prev => ({ ...prev, step: 4, budget: budget ? parseInt(budget) : 3000, bedrooms: beds ? parseInt(beds) : 1, vibes: vibes ? vibes.split(',') : [], commute: commute || null }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (quiz.step === 4) { loadResults(); updateURLWithResults(); }
  }, [quiz.step]);

  const updateURLWithResults = () => {
    const params = new URLSearchParams();
    params.set('budget', quiz.budget.toString());
    if (quiz.bedrooms) params.set('beds', quiz.bedrooms.toString());
    if (quiz.vibes.length > 0) params.set('vibes', quiz.vibes.join(','));
    if (quiz.commute) params.set('commute', quiz.commute);
    window.history.pushState({}, '', `/open/tools/find-your-neighborhood?${params.toString()}`);
  };

  const loadResults = async () => {
    if (quiz.bedrooms === null) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ beds: quiz.bedrooms.toString(), budget: quiz.budget.toString() });
      const neighData = await fetch(`/api/neighborhoods?${params}`).then(r => r.json());
      const scored = scoreNeighborhoods(neighData).slice(0, 5);
      setNeighborhoods(scored);
      
      await fetchListingsFor(scored.map(n => n.name));

    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const NJ_PENALTY = new Set(['Bayonne','Cliffside Park','Edgewater','Fort Lee','Guttenberg','Hoboken','Jersey City','Kearny','North Bergen','Union City','Weehawken','West New York']);

  const scoreNeighborhoods = (neighborhoods: Neighborhood[]) =>
    neighborhoods.map(n => {
      const vibeScore = quiz.vibes.reduce((score, v) => score + ((VIBE_MAPPING[v as keyof typeof VIBE_MAPPING] || []).includes(n.name) ? 1 : 0), 0);
      let commuteBonus = 0;
      if (quiz.commute) {
        const d = (commuteData as any)[n.name];
        const time = d?.[quiz.commute];
        if (time && time > 0) commuteBonus = Math.max(0, (60 - time) / 60) * 0.4;
      }
      const njPenalty = NJ_PENALTY.has(n.name) ? -0.5 : 0;
      return { ...n, vibeScore, commuteBonus, totalScore: vibeScore + commuteBonus + njPenalty };
    })
      .sort((a: any, b: any) => b.totalScore - a.totalScore || b.total_listings - a.total_listings);

  const getCommuteTime = (name: string): number | null => {
    if (!quiz.commute) return null;
    const d = (commuteData as any)[name];
    return d?.[quiz.commute] || null;
  };

  const nextStep = () => setQuiz(prev => ({ ...prev, step: prev.step + 1 }));
  const selectBedrooms = (beds: number) => setQuiz(prev => ({ ...prev, bedrooms: beds }));
  const toggleVibe = (vibe: string) => setQuiz(prev => ({ ...prev, vibes: prev.vibes.includes(vibe) ? prev.vibes.filter(v => v !== vibe) : [...prev.vibes, vibe] }));
  const selectCommute = (commute: string) => setQuiz(prev => ({ ...prev, commute: prev.commute === commute ? null : commute }));
  const getSubwayLines = (name: string): string[] => (subwayLines as any)[name] || [];
  const getNeighborhoodVibes = (name: string): string[] => NEIGHBORHOOD_VIBES[name] || [];
  const getDailyListingRate = (dailyAvg: number) => Math.max(1, Math.round(dailyAvg));

  const [refreshingNeighborhood, setRefreshingNeighborhood] = useState<string | null>(null);

  const fetchListingsFor = async (names: string[], { refresh = false } = {}) => {
    if (refresh && names.length === 1) setRefreshingNeighborhood(names[0]);
    const results: { [key: string]: Listing[] } = refresh ? {} : {};
    for (const name of names) {
      try {
        const lp = new URLSearchParams({ neighborhood: name, beds: quiz.bedrooms!.toString(), nearPrice: quiz.budget.toString(), limit: '3' });
        const result = await fetch(`/api/listings?${lp}`).then(r => r.json());
        if (result.length > 0) results[name] = result;
      } catch { /* skip */ }
    }
    setListings(prev => refresh ? { ...prev, ...results } : results);
    if (refresh) setRefreshingNeighborhood(null);
  };

  const copyLink = async () => {
    await copyToClipboard(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const reset = () => {
    setQuiz({ step: 1, budget: 3000, bedrooms: null, vibes: [], commute: null });
    setNeighborhoods([]); setListings({});
    router.push('/tools/find-your-neighborhood');
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header" />

      <div className="quiz-content">
        {quiz.step <= 3 && (
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${(quiz.step / 3) * 100}%` }} />
            </div>
            <div className="quiz-progress-text">Step {quiz.step} of 3</div>
          </div>
        )}

        {/* Step 1: Budget + Bedrooms */}
        {quiz.step === 1 && (
          <div className="quiz-step">
            <h2 className="quiz-question">What's your budget and bedroom needs?</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <div className="quiz-mode-toggle">
                <button onClick={() => setBudgetMode('budget')} className={`quiz-button secondary quiz-mode-btn ${budgetMode === 'budget' ? 'selected' : ''}`}>
                  I know my budget
                </button>
                <button onClick={() => setBudgetMode('salary')} className={`quiz-button secondary quiz-mode-btn ${budgetMode === 'salary' ? 'selected' : ''}`}>
                  I know my salary
                </button>
              </div>

              {budgetMode === 'budget' ? (
                <div className="budget-slider-container">
                  <label className="quiz-label">Monthly Budget</label>
                  <input type="range" min="1500" max="10000" step="100" value={quiz.budget}
                    onChange={(e) => setQuiz(prev => ({ ...prev, budget: parseInt(e.target.value) }))} className="budget-slider" />
                  <div className="budget-display">{formatPrice(quiz.budget)}/month</div>
                </div>
              ) : (
                <div>
                  <label className="quiz-label">Annual Salary</label>
                  <input type="range" min="40000" max="400000" step="5000" value={salary}
                    onChange={(e) => setSalary(parseInt(e.target.value))} className="budget-slider" />
                  <div style={{ textAlign: 'center' }}>
                    <div className="quiz-salary-display">{formatPrice(salary)}/year</div>
                    <div className="budget-display">{formatPrice(quiz.budget)}/month budget</div>
                    <div className="quiz-small-note">(Using 40x rule: salary ÷ 40)</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="quiz-label-16">Bedrooms</label>
              <div className="bedroom-options">
                {[0, 1, 2, 3].map(n => (
                  <button key={n} onClick={() => selectBedrooms(n)}
                    className={`bedroom-button ${quiz.bedrooms === n ? 'selected' : ''}`}>
                    {n === 0 ? 'Studio' : n === 3 ? '3+ Bedrooms' : `${n} Bedroom${n > 1 ? 's' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={nextStep} className="quiz-button quiz-continue-btn" disabled={quiz.bedrooms === null}>Continue</button>
          </div>
        )}

        {/* Step 2: Vibe */}
        {quiz.step === 2 && (
          <div className="quiz-step">
            <h2 className="quiz-question">What's your vibe?</h2>
            <p className="quiz-subtitle">Select all that apply, or skip</p>
            <div className="vibe-options">
              {Object.keys(VIBE_MAPPING).map(vibe => (
                <button key={vibe} onClick={() => toggleVibe(vibe)}
                  className={`vibe-button ${quiz.vibes.includes(vibe) ? 'selected' : ''}`}>{vibe}</button>
              ))}
            </div>
            <button onClick={nextStep} className="quiz-button quiz-continue-btn">Continue</button>
          </div>
        )}

        {/* Step 3: Commute */}
        {quiz.step === 3 && (
          <div className="quiz-step">
            <h2 className="quiz-question">Where's your commute?</h2>
            <p className="quiz-subtitle">Select one, or skip</p>
            <div className="commute-options">
              {Object.entries(COMMUTE_HUBS).map(([key, label]) => (
                <button key={key} onClick={() => selectCommute(key)} className={`commute-button ${quiz.commute === key ? 'selected' : ''}`}>{label}</button>
              ))}
            </div>
            <button onClick={nextStep} className="quiz-button quiz-continue-btn">Continue</button>
          </div>
        )}

        {/* Step 4: Results */}
        {quiz.step === 4 && (
          <div className="quiz-step">
            <div className="quiz-results-header">
              <h2 className="quiz-question quiz-results-title">Your top neighborhoods</h2>
              <div className="quiz-results-params">
                <span className="quiz-param-tag">{formatPrice(quiz.budget)}/mo</span>
                <span className="quiz-param-tag">{quiz.bedrooms === 0 ? 'Studio' : `${quiz.bedrooms}BR`}</span>
                {quiz.vibes.map(v => <span key={v} className="quiz-param-tag">{v}</span>)}
                {quiz.commute && (
                  <span className="quiz-param-tag">→ {COMMUTE_HUBS[quiz.commute as keyof typeof COMMUTE_HUBS]}</span>
                )}
              </div>
              {!loading && neighborhoods.length > 0 && (
                <div className="quiz-results-actions-top">
                  <button onClick={copyLink} className="quiz-btn-sm">{copyFeedback ? '✓ Copied' : <><CopySimple size={14} weight="bold" /> Copy link</>}</button>
                  <button onClick={reset} className="quiz-btn-sm"><ArrowLeft size={14} weight="bold" /> Start over</button>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="quiz-loading">Finding your neighborhoods...</div>
            ) : (
              <div className="quiz-results">
                {neighborhoods.map((neighborhood, index) => {
                  const neighListings = listings[neighborhood.name] || [];
                  const commuteTime = getCommuteTime(neighborhood.name);
                  const medianRent = neighborhood.median_rents[`${quiz.bedrooms}br`];
                  const vibes = getNeighborhoodVibes(neighborhood.name);
                  const lines = getSubwayLines(neighborhood.name);
                  const dailyRate = getDailyListingRate(neighborhood.daily_avg || 0);
                  
                  return (
                    <div key={neighborhood.name} className="result-card">
                      <div className="result-rank">#{index + 1}</div>
                      <div className="result-content">
                        <div className="result-header">
                          <h3 className="result-name">{neighborhood.name}</h3>
                          {vibes.length > 0 && (
                            <div className="quiz-vibe-tags">
                              {vibes.map(v => <span key={v} className="quiz-vibe-tag">{v}</span>)}
                            </div>
                          )}
                        </div>
                        
                        <div className="quiz-stats-row">
                          {medianRent > 0 && (
                            <><span className="quiz-median-price">{formatPrice(medianRent)}/mo</span>
                            <span className="quiz-stats-detail">median {quiz.bedrooms === 0 ? 'Studio' : `${quiz.bedrooms}BR`}</span></>
                          )}
                        </div>

                        {(lines.length > 0 || commuteTime) && (
                          <div className="quiz-subway-row">
                            {lines.slice(0, 6).map(line => (
                              <span key={line} className="quiz-subway-icon" style={{ backgroundColor: `#${SUBWAY_LINE_COLORS[line] || '999999'}` }}>{line}</span>
                            ))}
                            {commuteTime && quiz.commute !== 'remote' && (
                              <span className="quiz-commute-text">· ~{commuteTime} min to {COMMUTE_HUBS[quiz.commute as keyof typeof COMMUTE_HUBS]}</span>
                            )}
                          </div>
                        )}

                        {neighListings.length > 0 && (
                          <div className="quiz-listings-section">
                            <div className="quiz-listings-header">
                              <span className="quiz-example-label">Example listings right now:</span>
                              <button className="quiz-refresh-btn" onClick={() => fetchListingsFor([neighborhood.name], { refresh: true })} disabled={refreshingNeighborhood === neighborhood.name}>
                                {refreshingNeighborhood === neighborhood.name ? 'Loading...' : <><span>See more</span> <ArrowsClockwise size={14} weight="bold" /></>}
                              </button>
                            </div>
                            <div className="quiz-listings-row" style={{ opacity: refreshingNeighborhood === neighborhood.name ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                              {neighListings.map((l, li) => (
                                <a key={li} href={`https://streeteasy.com${l.url_path}`} target="_blank" rel="noopener noreferrer" className="quiz-listing-card">
                                  <img src={`https://photos.zillowstatic.com/fp/${l.lead_media_photo}-se_extra_large_1500_800.webp`} alt={`${l.area_name} apartment`} className="quiz-listing-img" />
                                  <div className="quiz-listing-info">
                                    <span className="quiz-listing-price">{formatPrice(l.price)}</span>
                                    <span className="quiz-listing-beds">{l.bedroom_count === 0 ? 'Studio' : `${l.bedroom_count}bd`} {l.full_bathroom_count}ba</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="quiz-cta-rate">~{dailyRate} new listing{dailyRate !== 1 ? 's' : ''} per day for this search</p>
                      </div>
                    </div>
                  );
                })}

                <p className="fm-attribution" style={{ marginTop: '24px', textAlign: 'center' }}>
                  Get alerts for these neighborhoods · <a href="https://firstmovernyc.com" target="_blank" rel="noopener noreferrer">FirstMover</a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
