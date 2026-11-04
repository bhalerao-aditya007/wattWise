import React, { useState } from 'react';

const INITIAL_MEMBERS = [
  {
    id: 1,
    name: 'Rahul Sharma (AC Room)',
    room_name: 'Room 1 (Split AC)',
    has_ac: true,
    measured_units: 185,
    status: 'paid'
  },
  {
    id: 2,
    name: 'Amit Patel (Fan Only)',
    room_name: 'Room 2 (Ceiling Fan)',
    has_ac: false,
    measured_units: 70,
    status: 'pending'
  },
  {
    id: 3,
    name: 'Priya Joshi (Fan Only)',
    room_name: 'Room 3 (Ceiling Fan)',
    has_ac: false,
    measured_units: 65,
    status: 'pending'
  }
];

export default function BillSplitPage() {
  const [totalBillAmount, setTotalBillAmount] = useState(3600);
  const [totalUnits, setTotalUnits] = useState(320);
  const [splitMethod, setSplitMethod] = useState('by_room'); // 'equal' | 'by_room' | 'measured'
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [copied, setCopied] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newHasAc, setNewHasAc] = useState(false);

  // Calculate shares based on method
  const calculatedMembers = members.map(m => {
    let shareRatio = 1;
    if (splitMethod === 'equal') {
      shareRatio = 1 / members.length;
    } else if (splitMethod === 'by_room') {
      // AC rooms weighted 3x higher than non-AC fan rooms
      const totalWeight = members.reduce((acc, cur) => acc + (cur.has_ac ? 3 : 1), 0);
      shareRatio = (m.has_ac ? 3 : 1) / Math.max(1, totalWeight);
    } else {
      // Measured units
      const totalMeasured = members.reduce((acc, cur) => acc + cur.measured_units, 0);
      shareRatio = m.measured_units / Math.max(1, totalMeasured);
    }

    const calculatedRupees = Math.round(totalBillAmount * shareRatio);
    const allocatedUnits = Math.round(totalUnits * shareRatio);

    return {
      ...m,
      calculatedRupees,
      allocatedUnits,
      sharePercent: (shareRatio * 100).toFixed(1)
    };
  });

  const handleToggleStatus = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'paid' ? 'pending' : 'paid' } : a));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setMembers(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newName.trim(),
        room_name: newRoom.trim() || `Room ${prev.length + 1}`,
        has_ac: newHasAc,
        measured_units: newHasAc ? 150 : 65,
        status: 'pending'
      }
    ]);
    setNewName('');
    setNewRoom('');
    setNewHasAc(false);
  };

  const handleDeleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const copyWhatsAppSummary = () => {
    const text = `⚡ WATTWISE FAIR FLAT BILL SPLIT\n` +
      `Total Bill: ₹${totalBillAmount} (${totalUnits} kWh)\n` +
      `Split Method: ${splitMethod === 'by_room' ? 'Weighted (AC vs Fan Rooms)' : splitMethod === 'equal' ? 'Equal Split' : 'Measured Units'}\n\n` +
      calculatedMembers.map(m => `• ${m.name}: ₹${m.calculatedRupees} (${m.sharePercent}%) — [${m.status.toUpperCase()}]`).join('\n') +
      `\n\nVerified via WattWise Fair Split Engine.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Shared Accommodation & Flatmate Equity
        </span>
        <h2 className="view-title">Fair Shared Bill Splitter</h2>
        <p className="view-desc">
          Eliminate flatmate disputes. Rooms with high-draw ACs pay their fair proportional share rather than penalizing low-consumption fan rooms.
        </p>
      </div>

      <div className="grid-2">
        {/* Left: Bill Parameters & Method */}
        <div className="card-panel">
          <h3 className="card-title">
            <span>⚙️</span>
            <span>Split Parameters & Method</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Total Bill Amount (₹)</label>
              <input
                type="number"
                className="text-input"
                value={totalBillAmount}
                onChange={(e) => setTotalBillAmount(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <label className="input-label">Total Units (kWh)</label>
              <input
                type="number"
                className="text-input"
                value={totalUnits}
                onChange={(e) => setTotalUnits(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Fair Allocation Algorithm</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`toolbar-btn ${splitMethod === 'by_room' ? 'active' : ''}`}
                onClick={() => setSplitMethod('by_room')}
                style={{ justifyContent: 'center' }}
              >
                ⚖️ Weighted AC
              </button>
              <button
                type="button"
                className={`toolbar-btn ${splitMethod === 'measured' ? 'active' : ''}`}
                onClick={() => setSplitMethod('measured')}
                style={{ justifyContent: 'center' }}
              >
                📏 Metered
              </button>
              <button
                type="button"
                className={`toolbar-btn ${splitMethod === 'equal' ? 'active' : ''}`}
                onClick={() => setSplitMethod('equal')}
                style={{ justifyContent: 'center' }}
              >
                🤝 Equal
              </button>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>
              {splitMethod === 'by_room' && '💡 AC rooms carry 3x weight due to 1,500W compressor load vs 75W ceiling fans.'}
              {splitMethod === 'measured' && '💡 Uses smart plug sub-meter readings per room for exact unit attribution.'}
              {splitMethod === 'equal' && '💡 Divides total bill evenly across flatmates.'}
            </span>
          </div>

          {/* Add Flatmate Form */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-amber)', display: 'block', marginBottom: '0.5rem' }}>
              + Add Flatmate
            </span>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Name (e.g. Karan)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Room (e.g. Room 4)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Does this room use an Air Conditioner?</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={newHasAc}
                    onChange={(e) => setNewHasAc(e.target.checked)}
                  />
                  <span className="slider-toggle" />
                </label>
              </div>

              <button type="submit" className="btn-outline" style={{ padding: '0.55rem' }}>
                Add Flatmate to Roster
              </button>
            </form>
          </div>
        </div>

        {/* Right: Calculated Shares & Settlement Roster */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <span>👥</span>
              <span>Individual Shares</span>
            </h3>
            <button
              onClick={copyWhatsAppSummary}
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
            >
              {copied ? '✅ Copied!' : '📋 WhatsApp Summary'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {calculatedMembers.map(m => (
              <div
                key={m.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{m.name}</strong>
                    {m.has_ac && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber-light)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                        ❄️ AC Room
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {m.room_name} · ~{m.allocatedUnits} kWh ({m.sharePercent}% share)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      ₹{m.calculatedRupees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(m.id)}
                    style={{
                      background: m.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: m.status === 'paid' ? '#34d399' : 'var(--accent-amber-light)',
                      border: `1px solid ${m.status === 'paid' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-accent)'}`,
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {m.status === 'paid' ? 'PAID ✓' : 'PENDING'}
                  </button>

                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                    title="Remove flatmate"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
