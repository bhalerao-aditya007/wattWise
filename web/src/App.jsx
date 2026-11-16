import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import HomeSimulator3D from './components/HomeSimulator3D';
import DashboardPage from './pages/DashboardPage';
import BillCheckerPage from './pages/BillCheckerPage';
import WhatIfLabPage from './pages/WhatIfLabPage';
import BillSplitPage from './pages/BillSplitPage';
import DevicesPage from './pages/DevicesPage';
import CopilotChatPage from './pages/CopilotChatPage';
import RealityCheckPage from './pages/RealityCheckPage';
import AdminPage from './pages/AdminPage';
import { fetchDbHealth } from './services/api';

const HOUSEHOLDS = [
  { id: 1, name: 'Sharma Residence (2BHK, Nagpur)', archetype: '2BHK', load: '3.0 kW' },
  { id: 2, name: 'Kulkarni Compact (1BHK, Nashik)', archetype: '1BHK', load: '1.5 kW' },
  { id: 3, name: 'Verma Villa (3BHK, Pune)', archetype: '3BHK', load: '5.0 kW' },
  { id: 4, name: 'Students PG Flat (Nagpur)', archetype: 'PG_Flat', load: '3.0 kW' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLandingOnly, setIsLandingOnly] = useState(true);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(1);
  const [activeArchetype, setActiveArchetype] = useState('2BHK');
  const [liveAppliances, setLiveAppliances] = useState([]);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  // Live Database Health State & Modal
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbHealth, setDbHealth] = useState(null);
  const [isPingingDb, setIsPingingDb] = useState(false);

  const checkDbHealth = async () => {
    setIsPingingDb(true);
    try {
      const data = await fetchDbHealth();
      setDbHealth(data);
    } catch (err) {
      console.warn('DB health check warning:', err);
      setDbHealth({
        status: 'warning',
        database: {
          type: 'Dual-Mode In-Memory Fallback',
          isConnected: false,
          readyStateText: 'Offline / Standalone Cache',
          latencyMs: 0
        },
        collectionCounts: {
          households: 4,
          appliances: 31,
          meterreadings: 80,
          bills: 3
        }
      });
    } finally {
      setIsPingingDb(false);
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown-wrapper')) {
        setShowToolsDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

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

  // Helper for "More Tools" label
  const getMoreTabLabel = (tab) => {
    switch (tab) {
      case 'splitter': return 'Fair Splitter';
      case 'devices': return 'IoT Hardware';
      case 'copilot': return 'AI Copilot';
      case 'reality': return 'Reality Check';
      case 'admin': return 'Admin & Stats';
      default: return 'More Tools';
    }
  };

  const getMoreTabIcon = (tab) => {
    switch (tab) {
      case 'splitter': return '👥';
      case 'devices': return '🔌';
      case 'copilot': return '💬';
      case 'reality': return '⚖️';
      case 'admin': return '📊';
      default: return '🛠️';
    }
  };

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
          {/* De-cluttered, Sleek Top Header */}
          <header className="app-header">
            {/* Left: Brand Identity & Household Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
                    MERC LT-I Intelligence
                  </div>
                </div>
              </a>

              {/* Household Selector Dropdown */}
              <select
                className="select-household"
                value={selectedHouseholdId}
                onChange={handleHouseholdChange}
                aria-label="Active Household Archetype"
                title="Switch between the 4 monitored Indian household archetypes"
              >
                {HOUSEHOLDS.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} · {h.load}
                  </option>
                ))}
              </select>

              {/* Quick Compact Guide Button */}
              <button
                className="btn-back-to-guide"
                onClick={() => {
                  const el = document.getElementById('overview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Read Layman Guide & Overview"
              >
                <span>📖</span>
                <span>Guide</span>
              </button>
            </div>

            {/* Center: Clean Primary Navigation + More Tools Menu */}
            <nav className="nav-tab-bar" aria-label="Main Navigation">
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                title="Live Energy & Slab Intelligence Radar"
              >
                <span>📊</span>
                <span>Radar</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'home3d' ? 'active' : ''}`}
                onClick={() => setActiveTab('home3d')}
                title="3D Virtual Interactive Household Simulator"
              >
                <span>🏠</span>
                <span>3D Home</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'auditor' ? 'active' : ''}`}
                onClick={() => setActiveTab('auditor')}
                title="MERC LT-I Statutory Bill Auditor & CGRF Dispute Slip"
              >
                <span>🧾</span>
                <span>Auditor</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
                onClick={() => setActiveTab('whatif')}
                title="What-If Intervention & Savings Lab"
              >
                <span>💡</span>
                <span>Savings Lab</span>
              </button>

              {/* De-cluttering "More Tools" Dropdown */}
              <div className="nav-dropdown-wrapper">
                <button
                  className={`nav-dropdown-btn ${['splitter', 'devices', 'copilot', 'reality', 'admin'].includes(activeTab) ? 'active' : ''}`}
                  onClick={() => setShowToolsDropdown(prev => !prev)}
                  title="Access additional modules: Fair Splitter, IoT, Copilot, Reality Check, DB Admin"
                >
                  <span>{getMoreTabIcon(activeTab)}</span>
                  <span>{getMoreTabLabel(activeTab)}</span>
                  <span style={{ fontSize: '0.65rem', marginLeft: '0.2rem', opacity: 0.7 }}>
                    {showToolsDropdown ? '▲' : '▼'}
                  </span>
                </button>

                {showToolsDropdown && (
                  <div className="nav-dropdown-menu">
                    <button
                      className={`nav-dropdown-item ${activeTab === 'splitter' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('splitter'); setShowToolsDropdown(false); }}
                    >
                      <span style={{ fontSize: '1rem' }}>👥</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Fair Splitter</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flatmate equity &amp; AC weighted split</div>
                      </div>
                    </button>

                    <button
                      className={`nav-dropdown-item ${activeTab === 'devices' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('devices'); setShowToolsDropdown(false); }}
                    >
                      <span style={{ fontSize: '1rem' }}>🔌</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>IoT Hardware</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Smart plug MQTT telemetry</div>
                      </div>
                    </button>

                    <button
                      className={`nav-dropdown-item ${activeTab === 'copilot' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('copilot'); setShowToolsDropdown(false); }}
                    >
                      <span style={{ fontSize: '1rem' }}>💬</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>AI Copilot</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deterministic billing assistant</div>
                      </div>
                    </button>

                    <button
                      className={`nav-dropdown-item ${activeTab === 'reality' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('reality'); setShowToolsDropdown(false); }}
                    >
                      <span style={{ fontSize: '1rem' }}>⚖️</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Reality Check</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Guess vs Sim vs Measured error &amp; gap</div>
                      </div>
                    </button>

                    <button
                      className={`nav-dropdown-item ${activeTab === 'admin' ? 'active' : ''}`}
                      onClick={() => { setActiveTab('admin'); setShowToolsDropdown(false); }}
                    >
                      <span style={{ fontSize: '1rem' }}>📊</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Admin &amp; Power BI</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aggregated cross-household SQL metrics</div>
                      </div>
                    </button>

                    <div className="nav-dropdown-divider" />

                    <button
                      className="nav-dropdown-item"
                      onClick={() => {
                        setShowToolsDropdown(false);
                        setShowDbModal(true);
                        checkDbHealth();
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>🍃</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#34d399' }}>Live DB Inspector</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Check MongoDB Atlas connection &amp; counts</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Live Connection & Status Pills */}
            <div className="header-actions">
              <div className="status-pill" title="Live Household Power Draw">
                <span className="status-dot live" />
                <span style={{ color: 'var(--accent-amber)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(liveWatts).toLocaleString('en-IN')} W
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Live</span>
              </div>

              {/* Clickable DB Status Badge */}
              <div
                className="status-pill clickable"
                onClick={() => {
                  setShowDbModal(true);
                  checkDbHealth();
                }}
                title="Click to inspect live MongoDB Atlas database connection & collections"
              >
                <span className={`status-dot ${dbHealth?.database?.isConnected ? 'live' : 'warning'}`} />
                <span style={{ color: dbHealth?.database?.isConnected ? '#34d399' : 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>
                  {dbHealth?.database?.isConnected ? '🍃 DB: Atlas Connected' : 'DB: In-Memory'}
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

            {/* 8. Reality Check & Unexplained Load Calibration */}
            {activeTab === 'reality' && (
              <RealityCheckPage />
            )}

            {/* 9. Admin & Power BI Relational Specs */}
            {activeTab === 'admin' && (
              <AdminPage />
            )}
          </main>
        </section>
      )}

      {/* Live Database Health & Inspector Modal */}
      {showDbModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', padding: '1.75rem', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🍃</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Database Status &amp; Live Connection
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Dual-Mode Repository (MongoDB Atlas Cloud M0 + In-Memory Store)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Status Card */}
            <div style={{ background: dbHealth?.database?.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${dbHealth?.database?.isConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-accent)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`status-dot ${dbHealth?.database?.isConnected ? 'live' : 'warning'}`} />
                  <strong style={{ fontSize: '0.92rem', color: dbHealth?.database?.isConnected ? '#34d399' : 'var(--accent-amber-light)' }}>
                    {dbHealth?.database?.isConnected ? 'MongoDB Atlas Cluster Connected' : 'Dual-Mode Fallback Active'}
                  </strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Latency: <strong>{dbHealth?.database?.latencyMs || 0} ms</strong>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                <div>Cluster Host: <span style={{ color: 'var(--text-primary)' }}>{dbHealth?.database?.host || 'cluster0.2dbjxwm.mongodb.net'}</span></div>
                <div>Database Name: <span style={{ color: 'var(--text-primary)' }}>{dbHealth?.database?.name || 'wattwise'}</span></div>
                <div>ReadyState: <span style={{ color: 'var(--text-primary)' }}>{dbHealth?.database?.readyState === 1 ? '1 (Connected)' : '0 (Local)'}</span></div>
                <div>Last Checked: <span style={{ color: 'var(--text-primary)' }}>{new Date().toLocaleTimeString()}</span></div>
              </div>
            </div>

            {/* Collections Document Counts */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.6rem' }}>
              📁 Live MongoDB Collections &amp; Document Counts
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {Object.entries(dbHealth?.collectionCounts || {}).map(([col, count]) => (
                <div key={col} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {col}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                💡 Direct endpoint check: <code style={{ color: 'var(--accent-sky)' }}>GET /health</code> or <code style={{ color: 'var(--accent-sky)' }}>GET /api/v1/admin/db-health</code>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={checkDbHealth}
                  disabled={isPingingDb}
                  className="toolbar-btn"
                  style={{ background: 'var(--bg-surface)', padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                >
                  {isPingingDb ? 'Pinging...' : '🔄 Ping DB Now'}
                </button>
                <button
                  onClick={() => setShowDbModal(false)}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
