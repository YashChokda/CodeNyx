import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getSession } from '../hooks/useSessionData';

// ── Color helpers ─────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 70) return '#4ade80';
  if (s >= 40) return '#ffb347';
  return '#f87171';
}

function getViabilityLabel(s) {
  if (s >= 70) return { label: 'High Potential', icon: '🚀', color: '#4ade80' };
  if (s >= 50) return { label: 'Needs Work', icon: '🔧', color: '#ffb347' };
  if (s >= 30) return { label: 'Risky', icon: '⚠️', color: '#fb923c' };
  return { label: 'Critical Issues', icon: '🚨', color: '#f87171' };
}

// ── Animated Score ────────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number' || isNaN(value)) return;
    const start = performance.now();
    function tick(now) {
      const pct = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(eased * value));
      if (pct < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, duration]);
  return (
    <span className="text-3xl font-black" style={{ color, fontFamily: 'Georgia, serif', textShadow: `0 0 20px ${color}40` }}>
      {display}
    </span>
  );
}

// ── Score Card ────────────────────────────────────────────────────────────────
function ScoreCard({ label, value, icon, color, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden group"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${color}10, transparent 70%)` }} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="text-2xl mb-2">{icon}</span>
        <AnimatedNumber value={value} color={color} />
        <span className="text-[10px] font-medium mt-1" style={{ color: '#64748b' }}>/ 100</span>
        <span className="text-xs font-bold uppercase tracking-wider mt-2" style={{ color }}>
          {label}
        </span>
        {sub && <span className="text-[10px] mt-1" style={{ color: '#475569' }}>{sub}</span>}
      </div>
    </motion.div>
  );
}

// ── PIE CHART COLORS ──────────────────────────────────────────────────────────
const PIE_COLORS = {
  INTERESTED: '#4ade80',
  SKEPTICAL: '#ffb347',
  OPPOSED: '#f87171',
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const printRef = useRef(null);

  // Data from navigation state OR sessionStorage fallback
  const session = getSession();
  const rippleData = state?.rippleData || session.rippleData || null;
  const mentorData = state?.mentorData || session.mentorData || null;
  const stakeholderData = state?.stakeholderData || session.stakeholderData || null;
  const problem = state?.problem || session.problem || userProfile?.currentIdea?.problem || '';
  const idea = state?.idea || session.idea || userProfile?.currentIdea?.idea || '';
  const domain = state?.domain || session.domain || userProfile?.domain || 'General';
  const iterationCount = state?.iterationCount || session.iterationCount || userProfile?.iterationCount || 1;

  // ── State ──────────────────────────────────────────────────────────────────
  const [iterations, setIterations] = useState([]);
  const [iterLoading, setIterLoading] = useState(true);
  const [archetype, setArchetype] = useState(null);
  const [archetypeLoading, setArchetypeLoading] = useState(false);

  // ── Computed scores ────────────────────────────────────────────────────────
  const overallViability = rippleData?.overall_viability || 0;
  const mentorScore = mentorData?.mentor_score || 0;
  const interested = useMemo(() => (stakeholderData || []).filter(s => s.verdict === 'INTERESTED').length, [stakeholderData]);
  const skeptical = useMemo(() => (stakeholderData || []).filter(s => s.verdict === 'SKEPTICAL').length, [stakeholderData]);
  const opposed = useMemo(() => (stakeholderData || []).filter(s => s.verdict === 'OPPOSED').length, [stakeholderData]);
  const ecosystemPct = stakeholderData ? Math.round((interested / 15) * 100) : 0;

  // Weighted combined score
  const combinedScore = Math.round(overallViability * 0.4 + mentorScore * 0.3 + ecosystemPct * 0.3);
  const viabilityInfo = getViabilityLabel(combinedScore);

  // Stakeholder pie data
  const pieData = useMemo(() => [
    { name: 'Interested', value: interested, fill: PIE_COLORS.INTERESTED },
    { name: 'Skeptical', value: skeptical, fill: PIE_COLORS.SKEPTICAL },
    { name: 'Opposed', value: opposed, fill: PIE_COLORS.OPPOSED },
  ].filter(d => d.value > 0), [interested, skeptical, opposed]);

  // ── Fetch iterations from Firestore ────────────────────────────────────────
  useEffect(() => {
    async function fetchIterations() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'users', currentUser.uid, 'iterations'),
          orderBy('round', 'asc')
        );
        const snapshot = await getDocs(q);
        const iters = [];
        snapshot.forEach(doc => iters.push({ id: doc.id, ...doc.data() }));
        setIterations(iters);
      } catch (err) {
        console.error('Fetch iterations error:', err);
      } finally {
        setIterLoading(false);
      }
    }
    fetchIterations();
  }, [currentUser]);

  // ── Fetch archetype ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchArchetype() {
      if (!rippleData?.scores || archetypeLoading || archetype) return;
      setArchetypeLoading(true);
      try {
        const res = await axios.post('/api/gemini/archetype', {
          scores: {
            ...rippleData.scores,
            overallViability,
            mentorScore,
            ecosystemSupport: ecosystemPct,
          },
          domain,
          iterationCount,
        });
        setArchetype(res.data);
      } catch (err) {
        console.error('Archetype error:', err);
        setArchetype({
          title: 'The Emerging Visionary',
          description: 'You approach social challenges with genuine empathy and creative thinking. Your willingness to iterate and refine shows the resilience needed for long-term impact.',
        });
      } finally {
        setArchetypeLoading(false);
      }
    }
    fetchArchetype();
  }, [rippleData]);

  // ── Download / Print ───────────────────────────────────────────────────────
  const handleDownload = () => {
    window.print();
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/auth'); } catch (e) { console.error(e); }
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const hasData = rippleData || mentorData || stakeholderData;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#0d0d1a' }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,179,71,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139,92,246,0.04) 0%, transparent 50%),
          radial-gradient(circle at 50% 90%, rgba(74,222,128,0.03) 0%, transparent 50%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,179,71,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,179,71,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* ─── Top Navigation ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{
              background: 'linear-gradient(135deg, rgba(255,179,71,0.15), rgba(255,140,0,0.08))',
              border: '1px solid rgba(255,179,71,0.25)',
            }}>🚀</div>
          <span className="font-bold text-sm tracking-wide" style={{
            background: 'linear-gradient(135deg, #ffb347, #ff8c00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Vision of Venture</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
            {domain}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
            Round {iterationCount}
          </span>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            {currentUser?.displayName || currentUser?.email?.split('@')[0]}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(248,113,113,0.08)'; }}
          ><span>🚪</span> Sign Out</button>
        </div>
      </motion.nav>

      {/* ─── Main Content ─── */}
      <div ref={printRef} className="relative z-10 flex-1 w-full overflow-y-auto px-5 sm:px-8 pb-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 pb-4"
        >
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
              Final Dashboard
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
            Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Scorecard</span>
          </h1>
          <p className="text-xs" style={{ color: '#64748b' }}>
            Complete analysis of your social entrepreneurship venture
          </p>
        </motion.div>

        {!hasData ? (
          /* ─── Empty State ─── */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 max-w-md mx-auto"
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
              No Analysis Data Yet
            </h2>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>
              Complete the three-engine analysis first to see your dashboard scores, charts, and archetype.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/idea')}
                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <span>💡</span> Start Analysis
              </button>
              <button
                onClick={() => navigate('/tools', { state: { problem, idea, domain } })}
                className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer' }}
              >
                <span>💰</span> Cost & Gov Tools
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 1 — IDEA SCORECARD                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Combined Final Score Banner */}
              <div
                className="rounded-2xl p-6 mb-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${viabilityInfo.color}10, ${viabilityInfo.color}05)`,
                  border: `1px solid ${viabilityInfo.color}30`,
                  boxShadow: `0 0 60px ${viabilityInfo.color}08`,
                }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 opacity-5 text-9xl pointer-events-none select-none"
                  style={{ transform: 'translate(20%, -20%)' }}>
                  {viabilityInfo.icon}
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="flex flex-col items-center">
                    <AnimatedNumber value={combinedScore} color={viabilityInfo.color} />
                    <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>/ 100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{viabilityInfo.icon}</span>
                      <h3 className="font-bold text-lg" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                        Combined Final Score
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ background: `${viabilityInfo.color}15`, color: viabilityInfo.color, border: `1px solid ${viabilityInfo.color}30` }}>
                      {viabilityInfo.label}
                    </span>
                    <p className="text-[11px] mt-2" style={{ color: '#64748b' }}>
                      Weighted: 40% Viability + 30% Mentor + 30% Ecosystem
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ScoreCard label="Viability" value={overallViability} icon="⚡" color={scoreColor(overallViability)} />
                <ScoreCard label="Mentor" value={mentorScore} icon="👻" color={scoreColor(mentorScore)} />
                <ScoreCard label="Ecosystem %" value={ecosystemPct} icon="🗺️" color={scoreColor(ecosystemPct)} sub={`${interested}/15 interested`} />
                <ScoreCard label="Combined" value={combinedScore} icon="🏆" color={scoreColor(combinedScore)} />
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 2 & 3 — RADAR CHART + PIE CHART (side by side)        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Radar Chart */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📡</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
                    Ripple Dimensions
                  </span>
                </div>
                {rippleData?.scores ? (
                  <RadarChart scores={rippleData.scores} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#475569' }}>
                    No ripple data available
                  </div>
                )}
              </div>

              {/* Pie Chart — Stakeholder Breakdown */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🥧</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>
                    Stakeholder Breakdown
                  </span>
                </div>
                {stakeholderData && pieData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={{ stroke: '#475569' }}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm" style={{ color: '#475569' }}>
                    No stakeholder data available
                  </div>
                )}
                {/* Legend */}
                {stakeholderData && (
                  <div className="flex items-center justify-center gap-5 mt-2">
                    {[
                      { label: 'Interested', count: interested, color: PIE_COLORS.INTERESTED },
                      { label: 'Skeptical', count: skeptical, color: PIE_COLORS.SKEPTICAL },
                      { label: 'Opposed', count: opposed, color: PIE_COLORS.OPPOSED },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                          {item.label} ({item.count})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 4 — ITERATION HISTORY                                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">📈</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                  Iteration History
                </span>
                <span className="ml-auto text-[10px] font-mono" style={{ color: '#475569' }}>
                  {iterations.length} round{iterations.length !== 1 ? 's' : ''} completed
                </span>
              </div>

              {iterLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : iterations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm" style={{ color: '#475569' }}>
                    No iterations saved yet. Refine your idea to see history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {iterations.map((iter, idx) => {
                    const v = iter.overallViability || 0;
                    const m = iter.mentorScore || 0;
                    const s = iter.interestedStakeholders || 0;
                    return (
                      <motion.div
                        key={iter.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {/* Round number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                          R{iter.round}
                        </div>

                        {/* Scores */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">⚡</span>
                            <span className="text-xs font-bold" style={{ color: scoreColor(v) }}>{v}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">👻</span>
                            <span className="text-xs font-bold" style={{ color: scoreColor(m) }}>{m}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">🗺️</span>
                            <span className="text-xs font-bold" style={{ color: scoreColor(Math.round(s / 15 * 100)) }}>{s}/15</span>
                          </div>
                        </div>

                        {/* Progress bar visual */}
                        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${v}%`, background: scoreColor(v), transition: 'width 0.5s ease' }}
                          />
                        </div>

                        {/* Timestamp */}
                        <span className="text-[9px] font-mono flex-shrink-0" style={{ color: '#334155' }}>
                          {iter.timestamp ? new Date(iter.timestamp).toLocaleDateString() : ''}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 5 — AI-GENERATED ARCHETYPE                            */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,179,71,0.06), rgba(139,92,246,0.06))',
                border: '1px solid rgba(255,179,71,0.2)',
                boxShadow: '0 0 60px rgba(255,179,71,0.05), 0 0 100px rgba(139,92,246,0.03)',
              }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl opacity-30 blur-2xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,179,71,0.15), transparent 70%)' }} />

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-base">🏅</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
                    Your Leadership Archetype
                  </span>
                </div>

                {archetypeLoading ? (
                  <div className="space-y-3 py-4">
                    <div className="skeleton h-8 w-48 mx-auto rounded-lg" />
                    <div className="skeleton h-4 w-72 mx-auto rounded" />
                    <div className="skeleton h-4 w-64 mx-auto rounded" />
                  </div>
                ) : archetype ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <h2 className="text-2xl font-black mb-3" style={{
                      fontFamily: 'Georgia, serif',
                      background: 'linear-gradient(135deg, #ffb347, #ff8c00, #a78bfa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none',
                    }}>
                      {archetype.title}
                    </h2>
                    <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: '#cbd5e1' }}>
                      {archetype.description}
                    </p>

                    {/* Decorative badge ring */}
                    <div className="flex justify-center mt-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,179,71,0.15), rgba(139,92,246,0.15))',
                          border: '1px solid rgba(255,179,71,0.3)',
                          color: '#ffb347',
                        }}>
                        <span>✨</span>
                        <span>Domain: {domain}</span>
                        <span>•</span>
                        <span>Round {iterationCount}</span>
                        <span>•</span>
                        <span>Score: {combinedScore}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 6 — MENTOR INSIGHTS SUMMARY                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {mentorData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">👻</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                    Top Mentor Insights
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'strength', label: 'Strength', icon: '💪', color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.15)' },
                    { key: 'fatal_flaw', label: 'Fatal Flaw', icon: '💀', color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.15)' },
                    { key: 'immediate_action', label: '7-Day Action', icon: '⚡', color: '#ffb347', bg: 'rgba(255,179,71,0.06)', border: 'rgba(255,179,71,0.15)' },
                  ].map(item => (
                    <div key={item.key} className="rounded-xl p-3" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>{item.label}</span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                        {mentorData[item.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* IDEA SUMMARY (for print) + ACTION BUTTONS                     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">💡</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
                  Idea Summary
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Problem</div>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#cbd5e1' }}>{problem || 'Not specified'}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Solution</div>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#cbd5e1' }}>{idea || 'Not specified'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.06))',
                    border: '1px solid rgba(74,222,128,0.25)',
                    color: '#4ade80',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.06))'; }}
                >
                  <span>📄</span> Download Summary
                </button>
                <button
                  onClick={() => navigate('/tools', { state: { problem, idea, domain } })}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: 'rgba(255,179,71,0.08)',
                    border: '1px solid rgba(255,179,71,0.25)',
                    color: '#ffb347',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,179,71,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,179,71,0.08)'; }}
                >
                  <span>💰</span> Cost & Gov Guide
                </button>
                <button
                  onClick={() => navigate('/refine', { state: { problem, idea, domain, rippleData, mentorData, stakeholderData, iterationCount } })}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                    border: '1px solid rgba(139,92,246,0.5)',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(139,92,246,0.2)',
                  }}
                >
                  <span>🔄</span> Refine Idea
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          nav { display: none !important; }
          button { display: none !important; }
          * { color: #111 !important; background: white !important; border-color: #ddd !important; box-shadow: none !important; text-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
