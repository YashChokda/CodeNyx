import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES = [
  { key: 'fieldCoordinator',  label: 'Field Coordinator',  emoji: '🧭', salary: 18000 },
  { key: 'communityManager',  label: 'Community Manager',  emoji: '🤝', salary: 22000 },
  { key: 'techLead',          label: 'Tech Lead',          emoji: '💻', salary: 45000 },
  { key: 'financeManager',    label: 'Finance Manager',    emoji: '📊', salary: 28000 },
  { key: 'programHead',       label: 'Program Head',       emoji: '🎯', salary: 35000 },
  { key: 'intern',            label: 'Intern / Volunteer', emoji: '🎓', salary: 5000  },
];

// ── Operations definitions ────────────────────────────────────────────────────
const OPS = [
  { key: 'office',    label: 'Office / Space Rental',    emoji: '🏢', min: 8000,  max: 25000 },
  { key: 'travel',    label: 'Travel & Field Visits',    emoji: '🚗', min: 5000,  max: 15000 },
  { key: 'marketing', label: 'Marketing & Outreach',     emoji: '📢', min: 3000,  max: 20000 },
  { key: 'tech',      label: 'Technology / Software',    emoji: '🖥️', min: 2000,  max: 10000 },
  { key: 'events',    label: 'Events & Workshops',       emoji: '🎪', min: 5000,  max: 30000 },
];

const SEED_FUNDING = 500000; // ₹5 lakhs

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtFull(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Bar segment ───────────────────────────────────────────────────────────────
function Bar({ label, value, total, color, delay }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-3"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{label}</span>
        <span className="text-[11px] font-mono" style={{ color }}>{fmtFull(value)} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

// ── Role counter ──────────────────────────────────────────────────────────────
function RoleRow({ role, count, onChange }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
      style={{
        background: count > 0 ? 'rgba(255,179,71,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${count > 0 ? 'rgba(255,179,71,0.15)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{role.emoji}</span>
        <div>
          <div className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{role.label}</div>
          <div className="text-[10px]" style={{ color: '#64748b' }}>{fmtFull(role.salary)}/mo</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, count - 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
          style={{
            background: count > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${count > 0 ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: count > 0 ? '#f87171' : '#475569',
            cursor: 'pointer',
          }}
        >−</button>
        <span className="w-6 text-center text-sm font-bold" style={{ color: count > 0 ? '#ffb347' : '#475569' }}>
          {count}
        </span>
        <button
          onClick={() => onChange(Math.min(10, count + 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
          style={{
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.2)',
            color: '#4ade80',
            cursor: 'pointer',
          }}
        >+</button>
      </div>
    </div>
  );
}

// ── Ops slider row ────────────────────────────────────────────────────────────
function OpsRow({ op, enabled, value, onToggle, onValue }) {
  return (
    <div
      className="px-3 py-3 rounded-xl transition-all duration-200"
      style={{
        background: enabled ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${enabled ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
          <div
            className="w-4 h-4 rounded flex items-center justify-center text-[10px] transition-all"
            style={{
              background: enabled ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${enabled ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: '#fff',
            }}
          >{enabled ? '✓' : ''}</div>
          <span className="text-xs">{op.emoji}</span>
          <span className="text-xs font-medium" style={{ color: enabled ? '#e2e8f0' : '#64748b' }}>{op.label}</span>
        </label>
        {enabled && (
          <span className="text-[11px] font-mono" style={{ color: '#a78bfa' }}>{fmtFull(value)}/mo</span>
        )}
      </div>
      {enabled && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
          <input
            type="range"
            min={op.min}
            max={op.max}
            step={1000}
            value={value}
            onChange={e => onValue(Number(e.target.value))}
            className="w-full accent-purple-400"
            style={{ height: '4px' }}
          />
          <div className="flex justify-between text-[9px] mt-0.5" style={{ color: '#475569' }}>
            <span>{fmt(op.min)}</span>
            <span>{fmt(op.max)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CostCalculator({ idea, domain }) {
  // ── Team state ──────────────────────────────────────────────────────────────
  const [team, setTeam] = useState(
    Object.fromEntries(ROLES.map(r => [r.key, 0]))
  );

  // ── Ops state ───────────────────────────────────────────────────────────────
  const [opsEnabled, setOpsEnabled] = useState(
    Object.fromEntries(OPS.map(o => [o.key, false]))
  );
  const [opsValues, setOpsValues] = useState(
    Object.fromEntries(OPS.map(o => [o.key, Math.round((o.min + o.max) / 2 / 1000) * 1000]))
  );

  // ── Beneficiaries ───────────────────────────────────────────────────────────
  const [beneficiaries, setBeneficiaries] = useState(100);

  // ── AI health check state ──────────────────────────────────────────────────
  const [healthCheck, setHealthCheck] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // ── Calculations ────────────────────────────────────────────────────────────
  const teamTotal = useMemo(
    () => ROLES.reduce((sum, r) => sum + r.salary * team[r.key], 0),
    [team]
  );

  const opsTotal = useMemo(
    () => OPS.reduce((sum, o) => sum + (opsEnabled[o.key] ? opsValues[o.key] : 0), 0),
    [opsEnabled, opsValues]
  );

  const monthlyBurn = teamTotal + opsTotal;
  const sixMonthRunway = monthlyBurn * 6;
  const annualBudget = monthlyBurn * 12;
  const costPerBeneficiary = beneficiaries > 0 ? Math.round(monthlyBurn / beneficiaries) : 0;
  const sustainabilityMonths = monthlyBurn > 0 ? Math.floor(SEED_FUNDING / monthlyBurn) : 0;
  const sustainabilityScore = monthlyBurn > 0 ? Math.min(100, Math.round((sustainabilityMonths / 12) * 100)) : 100;

  const teamCount = useMemo(
    () => ROLES.reduce((sum, r) => sum + team[r.key], 0),
    [team]
  );

  // ── Bar chart data ──────────────────────────────────────────────────────────
  const barData = useMemo(() => {
    const items = [];
    ROLES.forEach(r => {
      if (team[r.key] > 0) items.push({ label: `${r.emoji} ${r.label} (×${team[r.key]})`, value: r.salary * team[r.key], color: '#ffb347' });
    });
    OPS.forEach(o => {
      if (opsEnabled[o.key]) items.push({ label: `${o.emoji} ${o.label}`, value: opsValues[o.key], color: '#a78bfa' });
    });
    return items;
  }, [team, opsEnabled, opsValues]);

  // ── AI Budget Health Check ──────────────────────────────────────────────────
  const runHealthCheck = useCallback(async () => {
    if (monthlyBurn === 0) return;
    setHealthLoading(true);
    setHealthCheck(null);
    try {
      const budgetBreakdown = {
        teamSize: teamCount,
        monthlySalaries: teamTotal,
        monthlyOps: opsTotal,
        monthlyBurn,
        beneficiaries,
        costPerBeneficiary,
        roles: ROLES.filter(r => team[r.key] > 0).map(r => ({ role: r.label, count: team[r.key], monthlyCost: r.salary * team[r.key] })),
        operations: OPS.filter(o => opsEnabled[o.key]).map(o => ({ category: o.label, monthlyCost: opsValues[o.key] })),
      };
      const res = await axios.post('/api/gemini/budget-check', { idea, domain, budgetBreakdown });
      setHealthCheck(res.data);
    } catch (err) {
      console.error('Budget check error:', err);
      setHealthCheck({
        assessment: 'Unable to generate AI analysis at this time.',
        realistic: null,
        tips: ['Try again in a moment.'],
      });
    } finally {
      setHealthLoading(false);
    }
  }, [monthlyBurn, teamCount, teamTotal, opsTotal, beneficiaries, costPerBeneficiary, team, opsEnabled, opsValues, idea, domain]);

  // ── Metric card ─────────────────────────────────────────────────────────────
  const Metric = ({ label, value, icon, color = '#ffb347', sub }) => (
    <div className="rounded-xl p-3 text-center" style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
      <div className="text-base mb-1">{icon}</div>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] font-medium" style={{ color: '#64748b' }}>{label}</div>
      {sub && <div className="text-[9px] mt-0.5" style={{ color: '#475569' }}>{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ─── TEAM SECTION ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">👥</span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
            Team Composition
          </span>
          <span className="ml-auto text-[11px] font-mono" style={{ color: teamCount > 0 ? '#4ade80' : '#475569' }}>
            {teamCount} member{teamCount !== 1 ? 's' : ''} · {fmtFull(teamTotal)}/mo
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES.map(role => (
            <RoleRow
              key={role.key}
              role={role}
              count={team[role.key]}
              onChange={v => setTeam(prev => ({ ...prev, [role.key]: v }))}
            />
          ))}
        </div>
      </motion.div>

      {/* ─── OPERATIONS SECTION ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">⚙️</span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
            Operational Costs
          </span>
          <span className="ml-auto text-[11px] font-mono" style={{ color: opsTotal > 0 ? '#a78bfa' : '#475569' }}>
            {fmtFull(opsTotal)}/mo
          </span>
        </div>
        <div className="space-y-2">
          {OPS.map(op => (
            <OpsRow
              key={op.key}
              op={op}
              enabled={opsEnabled[op.key]}
              value={opsValues[op.key]}
              onToggle={() => setOpsEnabled(prev => ({ ...prev, [op.key]: !prev[op.key] }))}
              onValue={v => setOpsValues(prev => ({ ...prev, [op.key]: v }))}
            />
          ))}
        </div>
      </motion.div>

      {/* ─── BENEFICIARIES SLIDER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎯</span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>
            Expected Beneficiaries per Month
          </span>
          <span className="ml-auto text-sm font-bold" style={{ color: '#4ade80' }}>
            {beneficiaries.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={10000}
          step={10}
          value={beneficiaries}
          onChange={e => setBeneficiaries(Number(e.target.value))}
          className="w-full accent-green-400"
          style={{ height: '4px' }}
        />
        <div className="flex justify-between text-[9px] mt-1" style={{ color: '#475569' }}>
          <span>10</span>
          <span>2,500</span>
          <span>5,000</span>
          <span>7,500</span>
          <span>10,000</span>
        </div>
      </motion.div>

      {/* ─── METRICS GRID ─── */}
      {monthlyBurn > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,179,71,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📈</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
              Budget Overview
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <Metric icon="🔥" label="Monthly Burn" value={fmt(monthlyBurn)} color="#f87171" />
            <Metric icon="📅" label="6-Month Runway" value={fmt(sixMonthRunway)} color="#fbbf24" />
            <Metric icon="📆" label="Annual Budget" value={fmt(annualBudget)} color="#ffb347" />
            <Metric icon="👤" label="Cost / Beneficiary" value={fmt(costPerBeneficiary)} color="#a78bfa" sub="per month" />
            <Metric
              icon="⏳"
              label="Sustainability"
              value={`${sustainabilityMonths} mo`}
              color={sustainabilityScore >= 70 ? '#4ade80' : sustainabilityScore >= 40 ? '#fbbf24' : '#f87171'}
              sub={`on ₹5L seed fund`}
            />
            <Metric
              icon="💎"
              label="Sustainability Score"
              value={`${sustainabilityScore}/100`}
              color={sustainabilityScore >= 70 ? '#4ade80' : sustainabilityScore >= 40 ? '#fbbf24' : '#f87171'}
            />
          </div>

          {/* ─── VISUAL BREAKDOWN BAR CHART ─── */}
          {barData.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs">📊</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Allocation Breakdown
                </span>
              </div>
              {barData.map((item, i) => (
                <Bar key={item.label} label={item.label} value={item.value} total={monthlyBurn} color={item.color} delay={i * 0.05} />
              ))}
            </div>
          )}

          {/* ─── AI HEALTH CHECK BUTTON ─── */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.button
              onClick={runHealthCheck}
              disabled={healthLoading || monthlyBurn === 0}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: healthLoading ? 'rgba(255,179,71,0.08)' : 'linear-gradient(135deg, rgba(255,179,71,0.12), rgba(255,140,0,0.08))',
                border: '1px solid rgba(255,179,71,0.25)',
                color: '#ffb347',
                cursor: healthLoading ? 'wait' : 'pointer',
              }}
            >
              {healthLoading ? (
                <>
                  <span className="w-2 h-2 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
                  <span>AI is analyzing your budget...</span>
                </>
              ) : (
                <>
                  <span>🩺</span>
                  <span>Run AI Budget Health Check</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </div>

          {/* ─── HEALTH CHECK RESULTS ─── */}
          <AnimatePresence>
            {healthCheck && (
              <motion.div
                initial={{ opacity: 0, y: 15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-xl p-4"
                style={{
                  background: healthCheck.realistic === false
                    ? 'rgba(248,113,113,0.06)'
                    : healthCheck.realistic === true
                      ? 'rgba(74,222,128,0.06)'
                      : 'rgba(255,179,71,0.06)',
                  border: `1px solid ${
                    healthCheck.realistic === false ? 'rgba(248,113,113,0.2)'
                    : healthCheck.realistic === true ? 'rgba(74,222,128,0.2)'
                    : 'rgba(255,179,71,0.2)'
                  }`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {healthCheck.realistic === true ? '✅' : healthCheck.realistic === false ? '⚠️' : '🩺'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{
                    color: healthCheck.realistic === true ? '#4ade80' : healthCheck.realistic === false ? '#f87171' : '#ffb347'
                  }}>
                    Budget Health Check
                  </span>
                </div>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#cbd5e1' }}>
                  {healthCheck.assessment}
                </p>
                {healthCheck.tips && healthCheck.tips.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      Optimization Tips
                    </div>
                    {healthCheck.tips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-start gap-2 text-[12px] leading-relaxed"
                        style={{ color: '#94a3b8' }}
                      >
                        <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#ffb347' }}>💡</span>
                        <span>{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── EMPTY STATE ─── */}
      {monthlyBurn === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Add team members or enable operations to see your budget estimate
          </p>
        </motion.div>
      )}
    </div>
  );
}
