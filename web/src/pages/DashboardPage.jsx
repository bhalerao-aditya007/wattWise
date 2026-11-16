import React, { useState, useEffect, useCallback } from 'react';
import { fetchReadings, fetchHouseholdData, postDailyReading } from '../services/api';

export default function DashboardPage({ householdId = 1 }) {
  const [datasetSource, setDatasetSource] = useState('demo'); // 'demo' | 'simulated' | 'real' | 'sgcc_normal' | 'sgcc_theft'
  const [readingsData, setReadingsData] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation controls for physics mode
  const [simAmbientTemp, setSimAmbientTemp] = useState(34);
  const [simAcSetpoint, setSimAcSetpoint] = useState(24);

  // User input modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [logUnits, setLogUnits] = useState('9.5');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccessMessage, setLogSuccessMessage] = useState('');

  // Fetch readings & household data
  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchReadings(datasetSource, householdId, {
        ambientTempC: simAmbientTemp,
        acSetpointC: simAcSetpoint
      }),
      fetchHouseholdData(householdId)
    ]).then(([readingsRes, hhRes]) => {
      setReadingsData(readingsRes);
      setHousehold(hhRes);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    });
  }, [datasetSource, householdId, simAmbientTemp, simAcSetpoint]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logUnits || isNaN(Number(logUnits))) return;

    setIsSubmittingLog(true);
    try {
      const res = await postDailyReading(logDate, Number(logUnits), householdId);
      if (res && res.reading) {
        setLogSuccessMessage(`✅ Logged ${Number(logUnits).toFixed(1)} kWh for ${logDate} into database!`);
        setTimeout(() => {
          setLogSuccessMessage('');
          setShowLogModal(false);
        }, 1800);
        // Refresh readings to update radar and forecast
        loadData();
      }
    } catch (err) {
      console.error('Failed to log reading:', err);
      alert('Failed to save reading. Please check backend connection.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const forecast = readingsData?.forecast;
  const gauge = forecast?.slabGauge;
  const readings = readingsData?.readings || [];
  const hhInfo = household?.household;
  const archetype = hhInfo?.archetype || '2BHK';

  // Calculate Safe Daily Budget for slabs
  const daysTotal = forecast?.daysTotal || 30;
  const daysElapsed = forecast?.daysElapsed || Math.min(readings.length, 30);
  const daysRemaining = Math.max(1, daysTotal - daysElapsed);
  const totalUnitsSoFar = forecast?.totalUnitsSoFar || readings.reduce((acc, r) => acc + r.daily_units, 0);

  const safeUnitsPerDaySlab1 = totalUnitsSoFar < 100 ? ((100 - totalUnitsSoFar) / daysRemaining).toFixed(1) : 0;
  const safeUnitsPerDaySlab2 = totalUnitsSoFar < 300 ? ((300 - totalUnitsSoFar) / daysRemaining).toFixed(1) : 0;

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
              {hhInfo?.discom || 'MSEDCL'} · {hhInfo?.category || 'LT-I Domestic'}
            </span>
            <span style={{ fontSize: '0.68rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber-light)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              {hhInfo?.name || `Household #${householdId}`}
            </span>
          </div>
          <h2 className="view-title">Live Energy & Slab Intelligence Radar</h2>
          <p className="view-desc">
            Real-time regulatory slab tracking, linear month-end forecasting, physics simulations, and manual meter input.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* User Input Button */}
          <button
            onClick={() => setShowLogModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 700 }}
            title="Input your manual daily meter reading"
          >
            <span>📝</span>
            <span>+ Log Meter Reading</span>
          </button>

          {/* Dataset Stream Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {[
              { id: 'demo', label: `🏡 ${archetype} Profile` },
              { id: 'simulated', label: '🔬 Physics Sim (3D Model)' },
              { id: 'real', label: '📊 UCI Measured' },
              { id: 'sgcc_normal', label: '⚡ SGCC Normal' },
              { id: 'sgcc_theft', label: '⚠️ SGCC Anomaly' }
            ].map(ds => (
              <button
                key={ds.id}
                onClick={() => setDatasetSource(ds.id)}
                className="toolbar-btn"
                style={{
                  background: datasetSource === ds.id ? 'var(--accent-amber)' : 'transparent',
                  color: datasetSource === ds.id ? '#0c0a09' : 'var(--text-secondary)',
                  fontWeight: datasetSource === ds.id ? 700 : 500,
                  fontSize: '0.76rem',
                  padding: '0.35rem 0.65rem'
                }}
              >
                {ds.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Physics Simulation Live Controls Bar (Visible when in Physics Sim Mode) */}
      {datasetSource === 'simulated' && (
        <div style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🔬</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--accent-sky)' }}>
                Physics SimEngine Active: Grounded in BEE Standard &amp; Ambient Thermodynamics
              </strong>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Simulates consumption for all configured appliances in {hhInfo?.name || 'this archetype'}. Adjust climate &amp; thermostat parameters to see the radar update immediately:
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>☀️ Outdoor Temp:</span>
              <input
                type="range"
                min="26"
                max="45"
                value={simAmbientTemp}
                onChange={(e) => setSimAmbientTemp(Number(e.target.value))}
                style={{ width: '100px', cursor: 'pointer' }}
              />
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', minWidth: '35px' }}>{simAmbientTemp}°C</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>❄️ AC Setpoint:</span>
              <input
                type="range"
                min="18"
                max="28"
                value={simAcSetpoint}
                onChange={(e) => setSimAcSetpoint(Number(e.target.value))}
                style={{ width: '100px', cursor: 'pointer' }}
              />
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-sky)', minWidth: '35px' }}>{simAcSetpoint}°C</strong>
            </div>

            <button
              onClick={() => loadData()}
              className="toolbar-btn"
              style={{ background: 'var(--accent-sky)', color: '#0c0a09', fontWeight: 700, padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
            >
              🔄 Recalculate Physics
            </button>
          </div>
        </div>
      )}

      {/* Primary Slab Progress Radar Card */}
      <div className="slab-gauge-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
                MSEDCL Telescopic Tariff Radar (FY 2024-25)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                • Active Stream: {readingsData?.datasetLabel || 'Active Household Profile'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Current Status: {gauge?.currentSlab || 'Slab 1 (0–100 kWh)'} @ ₹{gauge?.currentRate || '4.41'}/unit
            </h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CYCLE TIMELINE</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Day {forecast?.daysElapsed || daysElapsed} of {forecast?.daysTotal || daysTotal}
            </strong>
          </div>
        </div>

        {/* Progress bar with slab thresholds */}
        <div className="slab-progress-track">
          <div
            className="slab-progress-fill"
            style={{ width: `${Math.min(100, Math.max(5, gauge?.percentageThroughSlab || 35))}%` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>0 kWh (Base ₹4.41)</span>
          <span>100 kWh (Cliff Jump: ₹9.64)</span>
          <span>300 kWh (₹13.61)</span>
          <span>500+ kWh (₹15.72)</span>
        </div>

        {/* Critical Alert Warning when nearing slab cliff */}
        {gauge?.nextSlab && (
          <div style={{ marginTop: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--border-accent)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber-light)' }}>
              ⚠️ <strong>Slab Cliff Alert:</strong> Only <strong>{gauge.unitsRemainingInSlab} units</strong> remaining before entering {gauge.nextSlab}!
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
              Rate Jumps {gauge.penaltyMultiplier}x (₹{gauge.nextRate}/unit)
            </span>
          </div>
        )}
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card-panel">
          <span className="stat-metric-label">Consumed Month-to-Date</span>
          <div className="stat-metric-value" style={{ color: 'var(--accent-amber)' }}>
            {forecast?.totalUnitsSoFar?.toFixed(1) || '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Across {forecast?.daysElapsed || daysElapsed} logged meter readings
          </span>
        </div>

        <div className="card-panel">
          <span className="stat-metric-label">Projected Month-End Units</span>
          <div className="stat-metric-value" style={{ color: 'var(--text-primary)' }}>
            {forecast?.projectedUnitsMonthEnd?.toFixed(0) || '0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Linear trend at {forecast?.avgDailyUnits?.toFixed(1) || '0.0'} units/day
          </span>
        </div>

        <div className="card-panel">
          <span className="stat-metric-label">Projected Month-End Bill</span>
          <div className="stat-metric-value" style={{ color: 'var(--accent-emerald)' }}>
            ₹{forecast?.projectedBill?.toLocaleString('en-IN') || '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Includes 16% duty &amp; wheeling charges
          </span>
        </div>

        <div className="card-panel">
          <span className="stat-metric-label">Daily Average Consumption</span>
          <div className="stat-metric-value" style={{ color: 'var(--accent-sky)' }}>
            {forecast?.avgDailyUnits?.toFixed(2) || '0.00'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kWh/day</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Daily cost: ~₹{Math.round((forecast?.avgDailyUnits || 0) * 11.2)}/day
          </span>
        </div>
      </div>

      {/* Target Slab Budget & Safe Consumption Advisory */}
      <div className="card-panel" style={{ marginTop: '0.5rem' }}>
        <h3 className="card-title">
          <span>🎯</span>
          <span>Target Slab Advisor — Safe Daily Consumption Caps</span>
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
          Calculated dynamically from your actual units logged so far ({forecast?.totalUnitsSoFar?.toFixed(1)} kWh) over the remaining {daysRemaining} days in this billing cycle:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Stay in Slab 1 (&lt; 100 kWh)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>₹4.41/unit</span>
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800, color: Number(safeUnitsPerDaySlab1) > 0 ? 'var(--accent-emerald)' : '#f43f5e' }}>
              {Number(safeUnitsPerDaySlab1) > 0 ? `${safeUnitsPerDaySlab1} kWh/day` : 'Already Exceeded'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Number(safeUnitsPerDaySlab1) > 0 ? `Max allowance for next ${daysRemaining} days` : 'Moved to Slab 2 tier'}
            </span>
          </div>

          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Stay in Slab 2 (&lt; 300 kWh)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 700 }}>₹9.64/unit</span>
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800, color: Number(safeUnitsPerDaySlab2) > 0 ? 'var(--accent-amber)' : '#f43f5e' }}>
              {Number(safeUnitsPerDaySlab2) > 0 ? `${safeUnitsPerDaySlab2} kWh/day` : 'Already Exceeded'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {Number(safeUnitsPerDaySlab2) > 0 ? `Max allowance before entering ₹13.61/unit tier` : 'Exceeded 300 kWh threshold'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Consumption History Chart (SVG Native, Zero Lag) */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="card-title">
            <span>📈</span>
            <span>Daily Consumption Timeline ({readings.length} Recorded Days)</span>
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Source: {readingsData?.datasetLabel || 'Active Meter Stream'}
          </span>
        </div>

        {readings.length > 0 ? (
          <div style={{ width: '100%', height: '180px', marginTop: '1rem', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {(() => {
              const maxUnits = Math.max(...readings.map(r => r.daily_units), 12);
              return readings.map((r, i) => {
                const heightPct = (r.daily_units / maxUnits) * 100;
                const isHigh = r.daily_units > (forecast?.avgDailyUnits ? forecast.avgDailyUnits * 1.15 : 10.5);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={`${r.reading_date}: ${r.daily_units} kWh`}
                  >
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', transform: 'scale(0.85)' }}>
                      {r.daily_units.toFixed(1)}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(6, heightPct)}%`,
                        background: isHigh ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.45)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {r.reading_date ? r.reading_date.slice(8) : i + 1}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading daily meter history...
          </div>
        )}
      </div>

      {/* Manual Reading Input Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '440px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Log Meter Reading</h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Add today's daily consumption for <strong>{hhInfo?.name || `Household #${householdId}`}</strong> to update the live Slab Radar &amp; MongoDB store.
            </p>

            {logSuccessMessage ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                {logSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">Reading Date</label>
                  <input
                    type="date"
                    className="text-input"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Daily Consumption (kWh / Units)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    className="text-input"
                    value={logUnits}
                    onChange={(e) => setLogUnits(e.target.value)}
                    placeholder="e.g. 9.5"
                    required
                  />
                  {/* Quick Presets */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {['4.5', '8.0', '10.5', '14.0'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLogUnits(val)}
                        style={{
                          background: logUnits === val ? 'var(--accent-amber)' : 'var(--bg-primary)',
                          color: logUnits === val ? '#0c0a09' : 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        +{val} kWh
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLog}
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', justifyContent: 'center' }}
                  >
                    {isSubmittingLog ? 'Saving to DB...' : '💾 Save & Update Radar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
