import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onGoToDashboard, isLandingOnly = false, onToggleMode }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchTab = (tabName) => {
    if (onGoToDashboard) {
      onGoToDashboard(tabName);
    }
  };

  return (
    <div className="landing-container" id="overview">
      {/* Top Navigation */}
      <nav className="landing-nav" aria-label="Landing Navigation">
        <div className="landing-brand">
          <div className="landing-brand-icon">⚡</div>
          <div className="landing-brand-text">
            <h1>Watt<span>Wise</span></h1>
            <p>MERC LT-I Energy & Bill Intelligence</p>
          </div>
        </div>

        <div className="landing-nav-links">
          <button className="landing-nav-link" onClick={() => scrollToSection('why-bills-spike')}>
            Why Bills Spike
          </button>
          <button className="landing-nav-link" onClick={() => scrollToSection('features')}>
            What We Do
          </button>
          <button className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>
            How It Works
          </button>

          {/* View Mode Switcher */}
          {onToggleMode && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#1c1917', border: '1px solid #38332f', borderRadius: '8px', padding: '2px', marginLeft: '0.5rem' }}>
              <button
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isLandingOnly ? '#f59e0b' : 'transparent',
                  color: isLandingOnly ? '#181512' : '#a8a29e',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onToggleMode('landing-only')}
                title="View only the landing page"
              >
                Just Landing Page
              </button>
              <button
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: !isLandingOnly ? '#292524' : 'transparent',
                  color: !isLandingOnly ? '#f5f5f4' : '#a8a29e',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onToggleMode('combined')}
                title="View landing page with dashboard attached on scroll"
              >
                + Dashboard on Scroll
              </button>
            </div>
          )}

          <button
            className="landing-btn-dashboard"
            onClick={() => handleLaunchTab('dashboard')}
          >
            <span>Open Dashboard</span>
            <span>↓</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            <span>Electricity Bills Explained in Plain English</span>
          </div>

          <h2 className="hero-title">
            Stop guessing why your monthly bill <span className="highlight">doubled</span>.
          </h2>

          <p className="hero-description">
            In Maharashtra, electricity isn't billed like groceries. Slabs escalate, taxes multiply, and one hot week of AC can double your bill. WattWise gives you the complete blueprint: audit your bills for discom errors, simulate your home's appliances in 3D, and see where every rupee goes before you pay.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary-large"
              onClick={() => handleLaunchTab('dashboard')}
            >
              <span>Explore Live Dashboard</span>
              <span>↓</span>
            </button>
            <button
              className="btn-secondary-large"
              onClick={() => scrollToSection('why-bills-spike')}
            >
              <span>Why do bills jump?</span>
              <span>📖</span>
            </button>
          </div>

          <div className="hero-metrics">
            <div className="metric-item">
              <span className="metric-val">100%</span>
              <span className="metric-label">MERC Order Compliant</span>
            </div>
            <div className="metric-item">
              <span className="metric-val">4 Slabs</span>
              <span className="metric-label">Telescopic Math Unpacked</span>
            </div>
            <div className="metric-item">
              <span className="metric-val">₹0 Math Errors</span>
              <span className="metric-label">Deterministic Engine</span>
            </div>
          </div>
        </div>

        {/* Hero Illustrative Cutaway & Bill Blueprint */}
        <div className="hero-illustration-wrapper">
          <div className="hero-illustration-tag">
            <span className="tag-badge">Household Energy Blueprint</span>
            <span className="tag-status">Live Simulation Ready</span>
          </div>

          {/* Clean, Non-Neon SVG Illustration */}
          <svg
            viewBox="0 0 540 370"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* Background Base */}
            <rect x="10" y="10" width="520" height="350" rx="12" fill="#181513" stroke="#2e2a27" strokeWidth="1.5" />

            {/* Left Side: House Cutaway */}
            <g transform="translate(25, 30)">
              {/* House Outer Frame */}
              <rect x="0" y="30" width="240" height="280" rx="8" fill="#201d1a" stroke="#443e39" strokeWidth="1.5" />
              {/* Roof Gables */}
              <path d="M-5 30 L120 -5 L245 30 Z" fill="#292522" stroke="#443e39" strokeWidth="1.5" />
              <text x="120" y="20" fill="#a8a29e" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="0.05em">
                2BHK RESIDENCE (NAGPUR)
              </text>

              {/* Room 1: Living Room (Top Left) */}
              <rect x="10" y="42" width="105" height="118" rx="6" fill="#292522" stroke="#38332f" />
              <text x="18" y="58" fill="#d6d3d1" fontSize="9" fontWeight="700">LIVING ROOM</text>
              {/* AC Unit */}
              <rect x="18" y="66" width="50" height="14" rx="2" fill="#38332f" stroke="#78716c" />
              <line x1="22" y1="73" x2="64" y2="73" stroke="#a8a29e" strokeWidth="1" />
              <text x="18" y="90" fill="#f59e0b" fontSize="8" fontWeight="600">1.5T AC (1,450W)</text>
              {/* TV */}
              <rect x="18" y="102" width="38" height="24" rx="2" fill="#1c1917" stroke="#57534e" />
              <text x="18" y="136" fill="#a8a29e" fontSize="7">Smart TV (90W)</text>

              {/* Room 2: Kitchen (Top Right) */}
              <rect x="125" y="42" width="105" height="118" rx="6" fill="#292522" stroke="#38332f" />
              <text x="133" y="58" fill="#d6d3d1" fontSize="9" fontWeight="700">KITCHEN</text>
              {/* Refrigerator */}
              <rect x="133" y="66" width="34" height="60" rx="3" fill="#1c1917" stroke="#57534e" />
              <line x1="133" y1="90" x2="167" y2="90" stroke="#38332f" strokeWidth="1" />
              <rect x="162" y="74" width="2" height="10" rx="1" fill="#a8a29e" />
              <rect x="162" y="96" width="2" height="14" rx="1" fill="#a8a29e" />
              <text x="133" y="136" fill="#10b981" fontSize="8" fontWeight="600">Fridge (180W)</text>

              {/* Room 3: Master Bed (Bottom Left) */}
              <rect x="10" y="170" width="105" height="128" rx="6" fill="#292522" stroke="#38332f" />
              <text x="18" y="186" fill="#d6d3d1" fontSize="9" fontWeight="700">BEDROOM</text>
              {/* Ceiling Fan */}
              <circle cx="62" cy="214" r="7" fill="#38332f" stroke="#a8a29e" />
              <line x1="42" y1="214" x2="82" y2="214" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
              <line x1="62" y1="194" x2="62" y2="234" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
              <text x="18" y="254" fill="#a8a29e" fontSize="8">BLDC Fan (32W)</text>
              <text x="18" y="270" fill="#a8a29e" fontSize="7">LED Lamp (12W)</text>

              {/* Room 4: Bathroom / Utility (Bottom Right) */}
              <rect x="125" y="170" width="105" height="128" rx="6" fill="#292522" stroke="#38332f" />
              <text x="133" y="186" fill="#d6d3d1" fontSize="9" fontWeight="700">BATHROOM</text>
              {/* Geyser */}
              <rect x="133" y="196" width="26" height="42" rx="4" fill="#1c1917" stroke="#e06c43" />
              <circle cx="146" cy="216" r="3" fill="#e06c43" />
              <text x="133" y="254" fill="#e06c43" fontSize="8" fontWeight="600">Geyser (2,000W)</text>
              <text x="133" y="270" fill="#78716c" fontSize="7">15L Storage</text>
            </g>

            {/* Connecting Wire to Meter */}
            <path
              d="M 270 185 L 295 185"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Utility Meter (Middle) */}
            <g transform="translate(295, 135)">
              <rect x="0" y="0" width="46" height="95" rx="6" fill="#201d1a" stroke="#d97706" strokeWidth="1.5" />
              <rect x="6" y="8" width="34" height="22" rx="3" fill="#0f0e0d" stroke="#38332f" />
              <text x="23" y="23" fill="#fbbf24" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                240
              </text>
              <text x="23" y="38" fill="#78716c" fontSize="6.5" textAnchor="middle" fontWeight="600">kWh</text>
              <circle cx="23" cy="56" r="10" fill="#141210" stroke="#443e39" />
              <line x1="23" y1="56" x2="29" y2="52" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <text x="23" y="82" fill="#a8a29e" fontSize="6" textAnchor="middle">MSEDCL</text>
            </g>

            {/* Connecting Wire from Meter to Bill */}
            <path
              d="M 342 185 L 365 185"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Right Side: Transparent Regulatory Bill Card */}
            <g transform="translate(365, 30)">
              {/* Paper Bill Background */}
              <rect x="0" y="0" width="150" height="310" rx="8" fill="#24201d" stroke="#443e39" strokeWidth="1.5" />
              {/* Bill Header */}
              <rect x="0" y="0" width="150" height="34" rx="8" fill="#2e2925" />
              <text x="12" y="16" fill="#f5f5f4" fontSize="9.5" fontWeight="800">MSEDCL LT-I</text>
              <text x="12" y="27" fill="#a8a29e" fontSize="7">Monthly Tariff Audit</text>

              {/* Units Row */}
              <text x="12" y="52" fill="#a8a29e" fontSize="7.5">Total Billed Units:</text>
              <text x="138" y="52" fill="#fafaf9" fontSize="8.5" fontWeight="700" textAnchor="end">240 kWh</text>
              <line x1="12" y1="60" x2="138" y2="60" stroke="#38332f" strokeWidth="1" />

              {/* Slab 1 */}
              <text x="12" y="76" fill="#78716c" fontSize="7">0 - 100 u @ ₹4.41</text>
              <text x="138" y="76" fill="#d6d3d1" fontSize="7.5" textAnchor="end">₹441.00</text>

              {/* Slab 2 */}
              <text x="12" y="94" fill="#f59e0b" fontSize="7">101 - 240 u @ ₹9.64</text>
              <text x="138" y="94" fill="#fbbf24" fontSize="7.5" fontWeight="700" textAnchor="end">₹1,349.60</text>

              {/* Fixed & Wheeling */}
              <text x="12" y="112" fill="#78716c" fontSize="7">Fixed Discom Charge</text>
              <text x="138" y="112" fill="#d6d3d1" fontSize="7.5" textAnchor="end">₹128.00</text>

              <text x="12" y="128" fill="#78716c" fontSize="7">Wheeling (₹1.17/u)</text>
              <text x="138" y="128" fill="#d6d3d1" fontSize="7.5" textAnchor="end">₹280.80</text>

              {/* Fuel & Taxes */}
              <text x="12" y="144" fill="#78716c" fontSize="7">FAC (Fuel Adj.)</text>
              <text x="138" y="144" fill="#d6d3d1" fontSize="7.5" textAnchor="end">₹108.00</text>

              <text x="12" y="160" fill="#78716c" fontSize="7">Govt Duty (16%)</text>
              <text x="138" y="160" fill="#d6d3d1" fontSize="7.5" textAnchor="end">₹369.60</text>

              <line x1="12" y1="172" x2="138" y2="172" stroke="#57534e" strokeWidth="1" strokeDasharray="2 2" />

              {/* Net Payable */}
              <text x="12" y="192" fill="#fafaf9" fontSize="8.5" fontWeight="700">Net Payable</text>
              <text x="138" y="192" fill="#10b981" fontSize="11" fontWeight="800" textAnchor="end">₹2,679</text>

              {/* Verification Stamp */}
              <g transform="translate(14, 218)">
                <rect x="0" y="0" width="122" height="38" rx="4" fill="#1c1917" stroke="#10b981" strokeWidth="1" />
                <circle cx="16" cy="19" r="6" fill="#10b981" />
                <path d="M13 19 L15.5 21.5 L19 16.5" stroke="#181512" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="28" y="16" fill="#10b981" fontSize="7.5" fontWeight="700">MERC ORDER VERIFIED</text>
                <text x="28" y="27" fill="#78716c" fontSize="6.5">0 Math Hallucinations</text>
              </g>

              {/* Layman Tip */}
              <text x="12" y="280" fill="#a8a29e" fontSize="6.8">
                Tip: Keeping units ≤ 100
              </text>
              <text x="12" y="292" fill="#fbbf24" fontSize="6.8">
                saves over 50% per unit!
              </text>
            </g>
          </svg>
        </div>
      </header>

      {/* Section 1: Why Electricity Bills Confuse Everyone */}
      <section className="landing-section" id="why-bills-spike">
        <span className="section-badge">The Core Problem</span>
        <h3 className="section-title">Why does your bill spike without warning?</h3>
        <p className="section-subtitle">
          Unlike water or petrol, electricity costs more per unit the more you use. Here is what actually happens behind your meter every billing cycle.
        </p>

        {/* 3 Mystery Cards */}
        <div className="mystery-grid">
          <div className="mystery-card">
            <div className="mystery-icon-box">🪜</div>
            <h3>The Telescopic Slab Trap</h3>
            <p>
              Your first 100 units cost ₹4.41 each. But the moment you reach unit 101, the cost more than doubles to ₹9.64! If you cross 300 units, it shoots past ₹13. A small 20% rise in AC usage can cause a 50% bill spike.
            </p>
          </div>

          <div className="mystery-card">
            <div className="mystery-icon-box">🧾</div>
            <h3>Discom Calculation Mistakes</h3>
            <p>
              Power distribution companies bill millions of homes using batch scripts. Often, consumers are charged the wrong commercial tariff rate (LT-II instead of LT-I), denied rightful subsidies, or billed with faulty meter multipliers.
            </p>
          </div>

          <div className="mystery-card">
            <div className="mystery-icon-box">⌛</div>
            <h3>End-of-Month Blindness</h3>
            <p>
              You only learn your bill 30 days after the energy was burned. There is no speedometer or fuel gauge telling you that a malfunctioning refrigerator gasket or continuous water geyser is silently burning hundreds of rupees.
            </p>
          </div>
        </div>

        {/* Visual Slab Step-Ladder Infographic */}
        <div className="slab-infographic">
          <div className="slab-header">
            <div>
              <h4>Maharashtra Residential Tariff Slabs (MERC LT-I Domestic)</h4>
              <p>See how the unit price climbs dramatically as your monthly usage increases</p>
            </div>
            <button
              className="landing-btn-dashboard"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
              onClick={() => handleLaunchTab('auditor')}
            >
              Verify Your Slab in Auditor →
            </button>
          </div>

          <div className="slab-tier-steps">
            <div className="slab-tier">
              <span className="tier-range">Tier 1 · 0 - 100 Units</span>
              <div className="tier-rate">
                ₹4.41 <span>/ unit</span>
              </div>
              <p className="tier-note">
                Lifeline tier. Covers lights, ceiling fans, and basic small appliances for compact homes.
              </p>
            </div>

            <div className="slab-tier active-danger">
              <span className="tier-range" style={{ color: '#fbbf24' }}>Tier 2 · 101 - 300 Units</span>
              <div className="tier-rate" style={{ color: '#fbbf24' }}>
                ₹9.64 <span>/ unit</span>
              </div>
              <p className="tier-note">
                <strong>+118% Price Jump!</strong> Where most 2BHK urban homes land once an AC or geyser is introduced.
              </p>
            </div>

            <div className="slab-tier">
              <span className="tier-range">Tier 3 · 301 - 500 Units</span>
              <div className="tier-rate">
                ₹13.61 <span>/ unit</span>
              </div>
              <p className="tier-note">
                Heavy usage tier. Typically reached during peak hot summers with multiple AC units running.
              </p>
            </div>

            <div className="slab-tier">
              <span className="tier-range">Tier 4 · Above 500 Units</span>
              <div className="tier-rate">
                ₹15.57 <span>/ unit</span>
              </div>
              <p className="tier-note">
                Maximum tariff rate. Luxury residential bracket with intensive climate control & heating.
              </p>
            </div>
          </div>

          <div className="slab-footer-note">
            <span>ℹ️</span>
            <span>
              <strong>Additional mandatory charges:</strong> Fixed Discom Charge (₹128/month) + Wheeling Charge (₹1.17/unit) + Fuel Adjustment Charge (FAC) + 16% State Electricity Duty on the total energy bill.
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: What WattWise Does (Feature Cards) */}
      <section className="landing-section" id="features">
        <span className="section-badge">How WattWise Solves This</span>
        <h3 className="section-title">Everything you need to take control of your bill</h3>
        <p className="section-subtitle">
          Built for real Indian households. Explore tools designed to simulate, audit, split, and optimize your monthly power costs.
        </p>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-badge-wrap">
                <div className="feature-icon-badge">🏠</div>
                <span className="feature-pill">Interactive Digital Twin</span>
              </div>
              <h3>3D Virtual Household Simulator</h3>
              <p>
                Step inside 3D models of typical 1BHK, 2BHK, 3BHK, or PG apartments. Flip appliance switches in each room in real time, watch the kilowatt load change, and see which appliance eats the biggest slice of your budget.
              </p>
            </div>
            <button
              className="feature-action-btn"
              onClick={() => handleLaunchTab('home3d')}
            >
              <span>Launch 3D Household Simulator</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-badge-wrap">
                <div className="feature-icon-badge">🧾</div>
                <span className="feature-pill">Rupee-Accurate Engine</span>
              </div>
              <h3>MERC Regulatory Bill Auditor</h3>
              <p>
                Suspect you were overcharged? Enter your billed units and amount. WattWise recalculates every single slab, fixed fee, wheeling rate, and 16% tax against official MERC orders to pinpoint exact billing discrepancies and print a dispute sheet.
              </p>
            </div>
            <button
              className="feature-action-btn"
              onClick={() => handleLaunchTab('auditor')}
            >
              <span>Audit Your Past Bill</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-badge-wrap">
                <div className="feature-icon-badge">💡</div>
                <span className="feature-pill">ROI & Upgrades</span>
              </div>
              <h3>What-If Savings Lab</h3>
              <p>
                Will buying a 5-star inverter AC actually save you money? What if you adjust the thermostat from 18°C to 24°C, or install a 3kW rooftop solar setup? Simulate your real annual rupee savings before spending a single rupee.
              </p>
            </div>
            <button
              className="feature-action-btn"
              onClick={() => handleLaunchTab('whatif')}
            >
              <span>Explore Savings Scenarios</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-card-top">
              <div className="feature-badge-wrap">
                <div className="feature-icon-badge">👥</div>
                <span className="feature-pill">Shared Living</span>
              </div>
              <h3>Fair Roommate Bill Splitter</h3>
              <p>
                Stop having awkward arguments over electric bills in shared flats. Calculate fair payments based on who actually runs heavy appliances like ACs or personal desktop rigs, instead of a blunt and unfair 50/50 division.
              </p>
            </div>
            <button
              className="feature-action-btn"
              onClick={() => handleLaunchTab('splitter')}
            >
              <span>Split Shared Flat Bills</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="landing-section" id="how-it-works">
        <span className="section-badge">Simple 3-Step Process</span>
        <h3 className="section-title">How to explore WattWise</h3>
        <p className="section-subtitle">
          No signups or complicated hardware required. Jump right into the interactive dashboard below.
        </p>

        <div className="steps-container">
          <div className="step-box">
            <div className="step-number">1</div>
            <h4>Pick Your Home Archetype</h4>
            <p>
              Choose from standard profiles: 1BHK in Nashik, 2BHK in Nagpur, 3BHK in Pune, or a Student PG Flat. Or select your real DISCOM (MSEDCL, Tata Power, Adani, BEST).
            </p>
          </div>

          <div className="step-box">
            <div className="step-number">2</div>
            <h4>Scroll Down to the Dashboard</h4>
            <p>
              Explore the 3D home simulator or switch to the Energy Radar to view real-time wattage, month-end projected bills, and live slab status.
            </p>
          </div>

          <div className="step-box">
            <div className="step-number">3</div>
            <h4>Audit, Optimize & Save</h4>
            <p>
              Audit past paper bills, calculate what-if energy upgrades, fairly split roommate expenses, or ask the multilingual AI copilot in English, Hindi, or Marathi.
            </p>
          </div>
        </div>
      </section>

      {/* Launchpad CTA at Bottom of Landing Page */}
      <div className="landing-launchpad">
        <div className="launchpad-card">
          <h2>Ready to explore your household energy?</h2>
          <p>
            {isLandingOnly
              ? 'Click below to reveal and scroll into the live interactive dashboard and 3D digital twin.'
              : 'Scroll down or click below to launch the live interactive dashboard and 3D digital twin.'}
          </p>
          <button
            className="btn-primary-large"
            onClick={() => handleLaunchTab('dashboard')}
          >
            <span>{isLandingOnly ? 'Enter Live Dashboard & 3D Simulator' : 'Launch Live Dashboard & Simulator'}</span>
            <span>↓</span>
          </button>
          {!isLandingOnly && (
            <div className="scroll-indicator-arrow">
              <span>Scroll down to interact</span>
              <span>↓</span>
            </div>
          )}
        </div>
      </div>

      {/* Entrance Banner directly leading into the Dashboard */}
      {!isLandingOnly && (
        <div className="dashboard-entrance-banner">
          <div className="dashboard-entrance-text">
            <span>⚡</span>
            <span><strong>WattWise Live Workspace:</strong> Use the interactive tools, 3D rooms, and bill engine below.</span>
          </div>
          <button
            className="landing-nav-link"
            style={{ fontSize: '0.8rem', color: '#fbbf24' }}
            onClick={() => scrollToSection('overview')}
          >
            ↑ Back to Overview
          </button>
        </div>
      )}
    </div>
  );
}
