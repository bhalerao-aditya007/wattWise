import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import HomeSimulator3D from './components/HomeSimulator3D';
import DashboardPage from './pages/DashboardPage';
import BillCheckerPage from './pages/BillCheckerPage';
import WhatIfLabPage from './pages/WhatIfLabPage';
import BillSplitPage from './pages/BillSplitPage';
import DevicesPage from './pages/DevicesPage';
import CopilotChatPage from './pages/CopilotChatPage';
import { fetchHouseholdData } from './services/api';

const HOUSEHOLDS = [
  { id: 1, name: 'Sharma Residence (2BHK, Nagpur)', archetype: '2BHK', load: '3.0 kW' },
  { id: 2, name: 'Kulkarni Compact (1BHK, Nashik)', archetype: '1BHK', load: '1.5 kW' },
  { id: 3, name: 'Verma Villa (3BHK, Pune)', archetype: '3BHK', load: '5.0 kW' },
  { id: 4, name: 'Students PG Flat (Nagpur)', archetype: 'PG_Flat', load: '3.0 kW' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'home3d', 'auditor', 'whatif', 'splitter', 'devices', 'copilot'
  const [isLandingOnly, setIsLandingOnly] = useState(true); // Default to true: displays only the landing page initially
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(1);
  const [activeArchetype, setActiveArchetype] = useState('2BHK');
  const [liveAppliances, setLiveAppliances] = useState([]);
  const [isDbOnline, setIsDbOnline] = useState(true);

  // Transition handler from landing page into dashboard
  const handleGoToDashboard = (tab = 'dashboard') => {
    if (tab) setActiveTab(tab);
    setIsLandingOnly(false);
    setTimeout(() => {
      const target = document.getElementById('dashboard-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Switch household handler
  const handleHouseholdChange = (e) => {
    const id = Number(e.target.value);
    setSelectedHouseholdId(id);
    const found = HOUSEHOLDS.find(h => h.id === id);
    if (found) {
      setActiveArchetype(found.archetype);
    }
  };

  // Calculate live draw from active 3D appliances
  const liveWatts = liveAppliances.reduce((acc, a) => {
    if (!a.is_on) return acc + (a.rated_w * 0.02);
    if (a.model_kind === 'thermostatic') return acc + (a.rated_w * 0.75);
    if (a.model_kind === 'cyclic') return acc + (a.rated_w * 0.42);
    return acc + a.rated_w;
  }, 0);

  return (
    <div className="app-container">
      {/* 1. Layman-First Illustrative Landing Page (Seen First on Load) */}
      <LandingPage
        onGoToDashboard={handleGoToDashboard}
        isLandingOnly={isLandingOnly}
        onToggleMode={(mode) => setIsLandingOnly(mode === 'landing-only')}
      />

      {/* 2. Interactive Dashboard Workspace (Revealed on click / scroll mode) */}
      {!isLandingOnly && (
        <section id="dashboard-section" className="dashboard-section" aria-label="Interactive Energy Workspace">
        {/* Sleek Sober Header */}
        <header className="app-header">
          {/* Left: Brand Identity & Quick Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <a
              href="#overview"
              className="brand-badge"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('overview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Return to Layman Guide & Overview"
            >
              <div className="brand-icon">⚡</div>
              <div>
                <div className="brand-title">
                  Watt<span>Wise</span>
                </div>
                <div className="brand-subtitle">
                  MERC LT-I Energy & Bill Intelligence
                </div>
              </div>
            </a>

            {/* Quick Button back to Overview */}
            <button
              className="btn-back-to-guide"
              onClick={() => {
                const el = document.getElementById('overview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Read Layman Guide & Overview"
            >
              <span>📖</span>
              <span>Guide & Overview</span>
            </button>

            {/* Household Selector Dropdown */}
            <select
              className="select-household"
              value={selectedHouseholdId}
              onChange={handleHouseholdChange}
              aria-label="Active Household Archetype"
            >
              {HOUSEHOLDS.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.load}
                </option>
              ))}
            </select>
          </div>

          {/* Center: Clean Navigation Tabs */}
          <nav className="nav-tab-bar" aria-label="Main Navigation">
            <button
              className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span>📊</span>
              <span>Energy Radar</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'home3d' ? 'active' : ''}`}
              onClick={() => setActiveTab('home3d')}
            >
              <span>🏠</span>
              <span>3D Virtual Home</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'auditor' ? 'active' : ''}`}
              onClick={() => setActiveTab('auditor')}
            >
              <span>🧾</span>
              <span>Bill Auditor</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatif')}
            >
              <span>💡</span>
              <span>Savings Lab</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'splitter' ? 'active' : ''}`}
              onClick={() => setActiveTab('splitter')}
            >
              <span>👥</span>
              <span>Fair Splitter</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
              onClick={() => setActiveTab('devices')}
            >
              <span>🔌</span>
              <span>IoT Hardware</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
              onClick={() => setActiveTab('copilot')}
            >
              <span>💬</span>
              <span>AI Copilot</span>
            </button>
          </nav>

          {/* Right: Live Connection & Status Pill */}
          <div className="header-actions">
            <div className="status-pill" title="Live Household Power Draw">
              <span className="status-dot live" />
              <span style={{ color: 'var(--accent-amber)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(liveWatts).toLocaleString('en-IN')} W
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Live</span>
            </div>

            <div className="status-pill" title="Dual-Mode Database Engine: Connected">
              <span className="status-dot live" />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                DB Active
              </span>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="main-viewport">
          {/* 1. Live Energy & Slab Intelligence Radar */}
          {activeTab === 'dashboard' && (
            <DashboardPage householdId={selectedHouseholdId} />
          )}

          {/* 2. Fullscreen 3D Virtual Household View */}
          {activeTab === 'home3d' && (
            <HomeSimulator3D
              archetype={activeArchetype}
              onAppliancesChanged={(activeList) => setLiveAppliances(activeList)}
              liveWattsTotal={liveWatts}
            />
          )}

          {/* 3. MERC Regulatory Bill Auditor */}
          {activeTab === 'auditor' && (
            <BillCheckerPage />
          )}

          {/* 4. What-If Savings Lab */}
          {activeTab === 'whatif' && (
            <WhatIfLabPage householdId={selectedHouseholdId} />
          )}

          {/* 5. Fair Shared Bill Splitter */}
          {activeTab === 'splitter' && (
            <BillSplitPage />
          )}

          {/* 6. Hardware & IoT Telemetry Center */}
          {activeTab === 'devices' && (
            <DevicesPage householdId={selectedHouseholdId} />
          )}

          {/* 7. Multilingual AI Copilot */}
          {activeTab === 'copilot' && (
            <CopilotChatPage householdId={selectedHouseholdId} />
          )}
        </main>
      </section>
      )}
    </div>
  );
}
