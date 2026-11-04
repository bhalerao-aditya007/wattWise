import React, { useState, useEffect } from 'react';
import { runWhatIf } from '../services/api';

export default function WhatIfLabPage({ householdId = 1 }) {
  const [upgradeAc, setUpgradeAc] = useState(true);
  const [acSetpoint, setAcSetpoint] = useState(24);
  const [upgradeFans, setUpgradeFans] = useState(true);
  const [cutAcHours, setCutAcHours] = useState(2);
  const [solarKw, setSolarKw] = useState(0);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    runWhatIf(householdId, {
      upgradeAcTo5Star: upgradeAc,
      upgradeFansToBldc: upgradeFans,
      reduceAcHoursBy: cutAcHours,
      solarKw: solarKw,
      acSetpointC: acSetpoint
    }, {
      acSetpointC: acSetpoint
    }).then(res => {
      if (mounted) {
        setResult(res);
        setLoading(false);
      }
    }).catch(err => {
      console.error('What-If error:', err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [householdId, upgradeAc, acSetpoint, upgradeFans, cutAcHours, solarKw]);

  const savings = result?.savings;
  const baseline = result?.baseline;
  const simulated = result?.simulated;

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Simulation-Powered Decision Support
        </span>
        <h2 className="view-title">What-If Savings Lab</h2>
        <p className="view-desc">
          Test appliance efficiency upgrades, thermostat habits, and solar net-metering to see exact rupee savings before purchasing hardware.
        </p>
      </div>

      <div className="grid-2">
        {/* Left Column: Interventions Controls */}
        <div className="card-panel">
          <h3 className="card-title">
            <span>⚙️</span>
            <span>Simulate Practical Interventions</span>
          </h3>

          {/* Lever 1: AC Inverter 5-Star */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                Upgrade AC to 5-Star Inverter
              </strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                ISEER 5.0 efficiency replaces fixed compressor draw (~30% saving)
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={upgradeAc}
                onChange={(e) => setUpgradeAc(e.target.checked)}
              />
              <span className="slider-toggle" />
            </label>
          </div>

          {/* Lever 2: AC Setpoint Slider */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                AC Thermostat Setpoint
              </strong>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {acSetpoint}°C
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="28"
              step="1"
              value={acSetpoint}
              onChange={(e) => setAcSetpoint(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>18°C (High Load)</span>
              <span>24°C (BEE Standard)</span>
              <span>28°C (Max Economy)</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>
              💡 Raising AC by 1°C reduces compressor work by ~6% in Nagpur summer climate.
            </span>
          </div>

          {/* Lever 3: BLDC Fans */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                Convert to 28W 5-Star BLDC Fans
              </strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Cuts fan electricity consumption from 75W to 28W (62% reduction)
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={upgradeFans}
                onChange={(e) => setUpgradeFans(e.target.checked)}
              />
              <span className="slider-toggle" />
            </label>
          </div>

          {/* Lever 4: Cut AC runtime */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Cut AC Daily Runtime
              </strong>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-sky)' }}>
                -{cutAcHours} hrs/day
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={cutAcHours}
              onChange={(e) => setCutAcHours(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-sky)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.3rem' }}>
              Turn off AC 2 hours earlier during sleep utilizing ceiling fan circulation.
            </span>
          </div>

          {/* Lever 5: Solar PV */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Rooftop Solar PV Net-Metering
              </strong>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {solarKw} kWp
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={solarKw}
              onChange={(e) => setSolarKw(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>0 kW (Grid Only)</span>
              <span>2 kW (~240 units/mo)</span>
              <span>5 kW (~600 units/mo)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Verified Financial & Energy Savings */}
        <div className="card-panel">
          <h3 className="card-title">
            <span>💰</span>
            <span>Projected Monthly & Annual Savings</span>
          </h3>

          {/* Savings Highlight Hero */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-emerald)', fontWeight: 800 }}>
              VERIFIED TARIFF-CALCULATED SAVINGS
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399' }}>
                ₹{(savings?.monthlyRupeesSaved || 0).toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>/ month</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontWeight: 600 }}>
              ₹{(savings?.annualRupeesSaved || (savings?.monthlyRupeesSaved || 0) * 12).toLocaleString('en-IN')} saved annually ({savings?.percentageReduction || 0}% reduction)
            </div>
          </div>

          {/* Comparison Cards: Before vs After */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BASELINE CONSUMPTION</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {baseline?.totalUnits || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kWh</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ₹{(baseline?.monthlyBill || 0).toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>AFTER INTERVENTIONS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                {simulated?.totalUnits || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kWh</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                ₹{(simulated?.monthlyBill || 0).toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>

          {/* Breakdown per intervention */}
          {result?.breakdown && result.breakdown.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Differential Savings Breakdown
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {result.breakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>+₹{item.rupeesSaved}/mo ({item.unitsSaved} kWh)</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
