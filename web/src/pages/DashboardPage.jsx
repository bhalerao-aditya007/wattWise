import React, { useState, useEffect } from 'react';
import { fetchReadings, fetchHouseholdData, runSimulation } from '../services/api';

export default function DashboardPage({ householdId = 1 }) {
  const [datasetSource, setDatasetSource] = useState('demo');
  const [readingsData, setReadingsData] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchReadings(datasetSource),
      fetchHouseholdData(householdId)
    ]).then(([readingsRes, hhRes]) => {
      if (mounted) {
        setReadingsData(readingsRes);
        setHousehold(hhRes);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Error loading dashboard:', err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [datasetSource, householdId]);

  const forecast = readingsData?.forecast;
  const gauge = forecast?.slabGauge;
  const readings = readingsData?.readings || [];

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
            {household?.household?.discom || 'MSEDCL'} · {household?.household?.category || 'LT-I Domestic'}
          </span>
          <h2 className="view-title">Live Energy & Slab Intelligence</h2>
          <p className="view-desc">
            Regulatory slab monitoring, month-end consumption forecasting, and benchmark comparisons.
          </p>
        </div>

        {/* Dataset Stream Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {[
            { id: 'demo', label: '🏡 Nagpur 2BHK Profile' },
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
                fontWeight: datasetSource === ds.id ? 700 : 500
              }}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Slab Progress Radar Card */}
      <div className="slab-gauge-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
              MSEDCL Telescopic Tariff Radar (FY 2024-25)
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Current Status: {gauge?.currentSlab || 'Slab 1 (0–100 kWh)'} @ ₹{gauge?.currentRate || '4.41'}/unit
            </h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CYCLE PROGRESS</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Day {forecast?.daysElapsed || 20} of {forecast?.daysTotal || 30}
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
          <span>100 kWh (Cliff ₹9.64)</span>
          <span>300 kWh (₹13.61)</span>
          <span>500+ kWh (₹15.72)</span>
        </div>

        {/* Critical Alert Warning when nearing slab cliff */}
        {gauge?.nextSlab && (
          <div style={{ marginTop: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--border-accent)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            Across {forecast?.daysElapsed || 20} logged days
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
            Includes 16% duty & wheeling charges
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

      {/* Daily Consumption History Chart (SVG Native, Zero Lag) */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">
            <span>📈</span>
            <span>Daily Consumption Timeline ({readings.length} Days)</span>
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
                const isHigh = r.daily_units > 10.5;
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
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
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
    </div>
  );
}
