import React, { useState } from 'react';
import { auditRealBill } from '../services/api';

export default function BillCheckerPage() {
  const [units, setUnits] = useState(210);
  const [amount, setAmount] = useState(3550);
  const [billMonth, setBillMonth] = useState('2024-07');
  const [auditResult, setAuditResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAudit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await auditRealBill(Number(units), Number(amount), billMonth);
      setAuditResult(res);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetUnits, presetAmount, month) => {
    setUnits(presetUnits);
    setAmount(presetAmount);
    setBillMonth(month);
    auditRealBill(presetUnits, presetAmount, month).then(setAuditResult);
  };

  const copyDisputeSlip = () => {
    if (!auditResult) return;
    const text = `DISPUTE MEMORANDUM TO CONSUMER GRIEVANCE REDRESSAL FORUM (MERC)\n` +
      `Subject: Disputed Electricity Bill for Month ${billMonth}\n` +
      `Units Stated: ${auditResult.unitsBilled} kWh\n` +
      `Billed Amount: ₹${auditResult.amountBilled}\n` +
      `Statutory Recomputed Amount (MERC Case No. 226 of 2022): ₹${auditResult.amountRecomputed}\n` +
      `Overcharge Discrepancy: ₹${auditResult.difference}\n` +
      `Reason: ${auditResult.mismatchReason || 'Incorrect tariff slab or fixed charge rate tier applied.'}\n` +
      `Verified via WattWise Deterministic Tariff Engine.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Maharashtra Electricity Regulatory Commission (MERC Case No. 226 of 2022)
        </span>
        <h2 className="view-title">MSEDCL Regulatory Bill Auditor</h2>
        <p className="view-desc">
          Audit paper bills against official telescopic slab tariffs, fixed charges, wheeling, FAC, and 16% electricity duty.
        </p>
      </div>

      {/* Golden Test Presets */}
      <div className="card-panel" style={{ padding: '1rem', background: 'rgba(28, 25, 23, 0.7)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          VERIFIED GOLDEN TEST BENCHMARKS:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
            onClick={() => loadPreset(342, 4206, '2024-05')}
          >
            ✅ Summer Valid Bill (342 kWh, ₹4,206)
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
            onClick={() => loadPreset(240, 2679, '2024-06')}
          >
            ✅ Monsoon Valid Bill (240 kWh, ₹2,679)
          </button>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
            onClick={() => loadPreset(210, 3550, '2024-07')}
          >
            ⚠️ Injected July Overcharge (210 kWh billed ₹3,550 vs ₹2,287)
          </button>
        </div>
      </div>

      {/* Grid: Form Input + Audit Result */}
      <div className="grid-2">
        {/* Left: Enter Bill Data */}
        <div className="card-panel">
          <h3 className="card-title">
            <span>📝</span>
            <span>Enter Electricity Bill Details</span>
          </h3>

          <form onSubmit={handleAudit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Billing Month</label>
              <input
                type="month"
                className="text-input"
                value={billMonth}
                onChange={(e) => setBillMonth(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label">Units Billed (kWh on paper bill)</label>
              <input
                type="number"
                className="text-input"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                min="0"
                step="1"
                required
              />
            </div>

            <div>
              <label className="input-label">Total Amount Billed (₹ on paper bill)</label>
              <input
                type="number"
                className="text-input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                step="1"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Recomputing via MERC Engine...' : 'Run Deterministic Audit'}
            </button>
          </form>
        </div>

        {/* Right: Audit Result & Receipt Breakdown */}
        <div className="card-panel">
          <h3 className="card-title">
            <span>🔍</span>
            <span>Audit Outcome</span>
          </h3>

          {auditResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Verdict Banner */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: auditResult.isMismatch ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: `1px solid ${auditResult.isMismatch ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '1rem', color: auditResult.isMismatch ? '#f43f5e' : '#10b981' }}>
                    {auditResult.isMismatch ? '⚠️ Discrepancy Detected!' : '✅ Bill Verified Accurate'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {auditResult.isMismatch ? `Difference: ₹${Math.abs(auditResult.difference)}` : '0 Variance'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                  {auditResult.mismatchReason || 'This bill strictly matches official MSEDCL LT-I statutory charges.'}
                </p>
              </div>

              {/* Comparison Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>BILLED BY DISCOM</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>₹{auditResult.amountBilled.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>MERC RECOMPUTED</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>₹{auditResult.amountRecomputed.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Itemized Receipt Breakdown */}
              {auditResult.recomputedBreakdown && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Statutory Charge Breakdown (MSEDCL LT-I)
                  </span>
                  <table className="receipt-table" style={{ marginTop: '0.5rem' }}>
                    <tbody>
                      <tr>
                        <td>Fixed Monthly Charge</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{auditResult.recomputedBreakdown.fixedCharges}</td>
                      </tr>
                      {auditResult.recomputedBreakdown.slabBreakdown.filter(s => s.unitsInSlab > 0).map(s => (
                        <tr key={s.slabOrder}>
                          <td>Energy: {s.range} ({s.unitsInSlab} units @ ₹{s.rate})</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{s.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>Wheeling Charges ({auditResult.unitsBilled} units @ ₹1.28)</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{auditResult.recomputedBreakdown.wheelingCharges}</td>
                      </tr>
                      <tr>
                        <td>Fuel Adjustment Charge (FAC @ ₹0.35)</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{auditResult.recomputedBreakdown.facCharges}</td>
                      </tr>
                      <tr>
                        <td>Electricity Duty (Maharashtra 16%)</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{auditResult.recomputedBreakdown.dutyAmount}</td>
                      </tr>
                      <tr style={{ borderTop: '1px solid var(--border-accent)', color: 'var(--accent-amber)' }}>
                        <td><strong>Net Statutory Total</strong></td>
                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem' }}>₹{auditResult.recomputedBreakdown.totalBill}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Dispute Export Action */}
              {auditResult.isMismatch && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={copyDisputeSlip}
                  style={{ borderColor: 'var(--border-accent)', color: 'var(--accent-amber-light)' }}
                >
                  {copied ? '✅ Dispute Memorandum Copied to Clipboard!' : '📋 Copy CGRF Dispute Memorandum'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Enter your paper bill values or click a golden benchmark above to run the deterministic audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
