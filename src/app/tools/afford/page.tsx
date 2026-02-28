'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AffordabilityTool() {
  const [salary, setSalary] = useState(75000);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // NYC tax calculation (simplified)
  const calculateTakeHome = (grossSalary: number, status: 'single' | 'married') => {
    // Federal tax (rough brackets)
    let federalTax = 0;
    if (grossSalary > 44725) federalTax = 5226 + (grossSalary - 44725) * 0.22;
    else if (grossSalary > 11000) federalTax = 1100 + (grossSalary - 11000) * 0.12;
    else federalTax = grossSalary * 0.10;

    // NY State tax (rough)
    const nyTax = grossSalary * 0.065;
    
    // NYC tax
    const nycTax = grossSalary * 0.038;
    
    // FICA
    const ficaTax = grossSalary * 0.0765;

    const totalTax = federalTax + nyTax + nycTax + ficaTax;
    return grossSalary - totalTax;
  };

  const takeHome = calculateTakeHome(salary, filingStatus);
  const monthlyTakeHome = takeHome / 12;
  
  // 30% of gross rule
  const maxRentGross = (salary * 0.30) / 12;
  
  // 40x rule  
  const maxRent40x = salary / 40;
  
  // Use the more restrictive of the two
  const maxRent = Math.min(maxRentGross, maxRent40x);

  useEffect(() => {
    loadAffordableNeighborhoods();
  }, [maxRent]);

  const loadAffordableNeighborhoods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/neighborhoods?budget=${Math.round(maxRent)}&beds=1`);
      const data = await response.json();
      
      // Filter to neighborhoods where median 1BR is at or below max rent
      const affordable = data.filter((n: any) => n.median_rents['1br'] <= maxRent);
      setNeighborhoods(affordable.slice(0, 12)); // Top 12 affordable options
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n: number): string => {
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  return (
    <div className="publication-section narrow">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 className="section-title" style={{ fontSize: '40px' }}>NYC Rent by Salary</h1>
          <p className="section-subtitle">
            See what neighborhoods you can actually afford based on your salary and NYC taxes.
          </p>
        </div>

        <div className="stat-card">
          <div className="salary-input-container">
            <label className="input-label">
              Annual Salary
            </label>
            <input
              type="range"
              min="40000"
              max="250000"
              step="5000"
              value={salary}
              onChange={(e) => setSalary(parseInt(e.target.value))}
              className="salary-slider"
            />
            <div className="salary-display">
              {formatPrice(salary)}/year
            </div>
          </div>

          <div className="filing-status-container">
            <label className="input-label">
              Filing Status
            </label>
            <div className="filing-buttons">
              <button
                onClick={() => setFilingStatus('single')}
                className={`filing-button ${filingStatus === 'single' ? 'selected' : ''}`}
              >
                Single
              </button>
              <button
                onClick={() => setFilingStatus('married')}
                className={`filing-button ${filingStatus === 'married' ? 'selected' : ''}`}
              >
                Married
              </button>
            </div>
          </div>

          <div className="affordability-summary">
            <div className="affordability-result">
              <div className="max-rent-display">
                You can afford up to {formatPrice(maxRent)}/month
              </div>
              <div className="take-home-display">
                After taxes: {formatPrice(monthlyTakeHome)}/month take-home
              </div>
            </div>

            <div className="affordability-explanation">
              <strong>The 40x Rule:</strong> Most NYC landlords require your annual salary to be 40x your monthly rent. 
              We've calculated both the 30% of gross income rule and the 40x rule, then used whichever is more restrictive.
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
            Neighborhoods You Can Afford (1BR)
          </h3>
          
          {loading ? (
            <div className="quiz-loading">
              Loading neighborhoods...
            </div>
          ) : neighborhoods.length === 0 ? (
            <div className="no-results-card">
              <h4 className="no-results-title">
                No affordable neighborhoods found
              </h4>
              <p className="no-results-text">
                Unfortunately, there are no NYC neighborhoods where the median 1BR rent is within your budget. 
                You might need to consider roommates, outer boroughs, or increasing your salary target.
              </p>
            </div>
          ) : (
            <div className="neighborhoods-grid">
              {neighborhoods.map((neighborhood, index) => (
                <div key={neighborhood.name} className={`neighborhood-card ${index === 0 ? 'best-fit' : ''}`}>
                  {index === 0 && (
                    <div className="best-fit-badge">
                      BEST FIT
                    </div>
                  )}
                  
                  <h4 className="neighborhood-name">
                    {neighborhood.name}
                  </h4>
                  
                  <div className="neighborhood-rent">
                    {formatPrice(neighborhood.median_rents['1br'])}/mo median
                  </div>
                  
                  <div className="neighborhood-listings">
                    {Math.round(neighborhood.total_listings / 30)} new listings per day
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cta-section">
          <p className="cta-text">
            Want alerts when apartments in your budget hit the market?
          </p>
          <a
            href="https://apps.apple.com/us/app/firstmover/id6740444528"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button-primary"
          >
            Download FirstMover
          </a>
          <Link
            href="/find-your-neighborhood"
            className="cta-button-secondary"
          >
            Find Your Neighborhood
          </Link>
        </div>
      </div>
  );
}