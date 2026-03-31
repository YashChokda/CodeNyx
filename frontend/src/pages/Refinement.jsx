import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { saveSession, getSession } from '../hooks/useSessionData';

const MAX = 5;

function Pill({ label, score, icon }) {
  const c = score >= 70 ? '#4ade80' : score >= 40 ? '#ffb347' : '#f87171';
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${c}08`, border: `1px solid ${c}25` }}>
      <span className="text-sm">{icon}</span>
      <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="text-xs font-bold ml-auto" style={{ color: c }}>{score}</span>
    </div>
  );
}

export default function Refinement() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const session = getSession();
  const { problem: prev_p, idea: prev_i, domain, rippleData, mentorData, stakeholderData, iterationCount: prevIter = 1 } = {
    problem: state?.problem || session.problem || '',
    idea: state?.idea || session.idea || '',
    domain: state?.domain || session.domain || '',
    rippleData: state?.rippleData || session.rippleData || null,
    mentorData: state?.mentorData || session.mentorData || null,
    stakeholderData: state?.stakeholderData || session.stakeholderData || null,
    iterationCount: state?.iterationCount || session.iterationCount || 1,
  };

  const [problem, setProblem] = useState(prev_p || '');
  const [idea, setIdea] = useState(prev_i || '');
  const [busy, setBusy] = useState(false);

  const round = prevIter;
  const nextRound = round + 1;
  const done = round >= MAX;
  const changed = problem !== prev_p || idea !== prev_i;
  const valid = problem.length >= 50 && idea.length >= 50 && changed;

  const viability = rippleData?.overall_viability || 0;
  const mScore = mentorData?.mentor_score || 0;
  const interested = useMemo(() => (stakeholderData || []).filter(s => s.verdict === 'INTERESTED').length, [stakeholderData]);

  // Redirect if no data
  useEffect(() => {
    if (!prev_p || !prev_i || !domain) {
      navigate('/idea', { replace: true });
    }
  }, [prev_p, prev_i, domain, navigate]);

  if (!prev_p || !prev_i || !domain) return null;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);

    // Fire-and-forget Firestore saves — don't block navigation
    try {
      setDoc(doc(db, 'users', currentUser.uid, 'iterations', String(round)), {
        round, problem: prev_p, idea: prev_i, domain,
        rippleScores: rippleData?.scores || null, overallViability: viability,
        mentorScore: mScore, interestedStakeholders: interested, timestamp: new Date().toISOString(),
      }).catch(e => console.error('Save iteration error:', e));

      updateDoc(doc(db, 'users', currentUser.uid), { iterationCount: nextRound, currentIdea: { problem, idea } })
        .catch(e => console.error('Update profile error:', e));
    } catch (e) { console.error('Save error:', e); }

    // Save to session and navigate immediately
    saveSession({ problem, idea, domain, iterationCount: nextRound });
    navigate('/engines', { state: { problem, idea, domain, iterationCount: nextRound }, replace: true });
  };

  const cc = (len, min) => len === 0 ? '#475569' : len < min ? '#fbbf24' : '#4ade80';

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#0d0d1a' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,179,71,0.06) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139,92,246,0.05) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,179,71,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,71,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, rgba(255,179,71,0.15), rgba(255,140,0,0.08))', border: '1px solid rgba(255,179,71,0.25)' }}>🚀</div>
          <span className="font-bold text-sm tracking-wide" style={{ background: 'linear-gradient(135deg, #ffb347, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vision of Venture</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>{domain}</span>
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>Round {round}</span>
          <button onClick={() => navigate('/dashboard')} className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', cursor: 'pointer' }}>📊 Dashboard</button>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            {currentUser?.displayName || currentUser?.email?.split('@')[0]}
          </div>
          <button onClick={async () => { try { await logout(); navigate('/auth'); } catch {} }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer' }} onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; e.target.style.borderColor = 'rgba(248,113,113,0.5)'; }} onMouseLeave={e => { e.target.style.background = 'rgba(248,113,113,0.08)'; e.target.style.borderColor = 'rgba(248,113,113,0.25)'; }}><span>🚪</span> Sign Out</button>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center px-6 sm:px-10 pb-16">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 mt-4">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa', animation: 'pulse-amber 1.5s ease-in-out infinite' }} />
                Refinement Round {round}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
              Refine Your <span style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vision</span>
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {done ? "You've refined your idea 5 times. Time to execute!" : `Modify your idea based on AI feedback. ${MAX - round} refinement${MAX - round === 1 ? '' : 's'} remaining.`}
            </p>
          </motion.div>

          {/* Scores Summary */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📊</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>Round {round} Scores</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Pill label="Viability" score={viability} icon="⚡" />
              <Pill label="Mentor" score={mScore} icon="👻" />
              <Pill label={`${interested}/15 Allies`} score={Math.round(interested / 15 * 100)} icon="🗺️" />
            </div>
            {rippleData?.scores && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[{ k: 'community', l: 'Community', i: '👥' }, { k: 'finance', l: 'Finance', i: '💰' }, { k: 'government', l: 'Gov', i: '🏛️' }, { k: 'partnerships', l: 'Partners', i: '🤝' }].map(d => {
                  const s = rippleData.scores[d.k] || 0; const cl = s >= 70 ? '#4ade80' : s >= 40 ? '#ffb347' : '#f87171';
                  return (<div key={d.k} className="text-center px-2 py-1.5 rounded-lg" style={{ background: `${cl}06`, border: `1px solid ${cl}15` }}><div className="text-[10px]" style={{ color: '#64748b' }}>{d.i} {d.l}</div><div className="text-xs font-bold" style={{ color: cl }}>{s}</div></div>);
                })}
              </div>
            )}
            {mentorData?.fatal_flaw && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1"><span className="text-xs">💀</span><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>Mentor's Fatal Flaw</span></div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>{mentorData.fatal_flaw}</p>
              </div>
            )}
          </motion.div>

          {/* Progress Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Progress</span>
              <span className="text-[10px] font-mono" style={{ color: '#a78bfa' }}>{round}/{MAX}</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX }).map((_, i) => (
                <div key={i} className="flex-1 h-2 rounded-full" style={{ background: i < round ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(255,255,255,0.06)', boxShadow: i < round ? '0 0 8px rgba(139,92,246,0.3)' : 'none' }} />
              ))}
            </div>
          </motion.div>

          {done ? (
            /* Maxed out */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(74,222,128,0.25)', boxShadow: '0 0 40px rgba(74,222,128,0.08)' }}>
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>Time to Execute!</h2>
                <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>You've completed all {MAX} refinement rounds. Your idea has been rigorously tested. Explore the full simulation hub!</p>
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => navigate('/dashboard', { state: { problem, idea, domain, rippleData, mentorData, stakeholderData, iterationCount: round } })} className="btn-primary px-8 py-3 text-sm flex items-center gap-2" style={{ boxShadow: '0 0 30px rgba(255,179,71,0.2)' }}><span>📊</span> View Your Dashboard <span>→</span></button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/tools', { state: { problem, idea, domain } })} className="px-5 py-2 text-sm rounded-xl font-medium flex items-center gap-2" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee', cursor: 'pointer' }}><span>💰</span> Cost & Gov Guide</button>
                    <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-sm rounded-xl font-medium flex items-center gap-2" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', cursor: 'pointer' }}><span>📊</span> Dashboard</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Edit Areas */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
              {/* Problem */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(17,24,39,0.6)', border: `1px solid ${problem !== prev_p ? 'rgba(139,92,246,0.3)' : 'rgba(255,179,71,0.12)'}`, backdropFilter: 'blur(8px)', transition: 'border-color 0.3s' }}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
                    <span className="text-base">🔍</span> Problem Statement
                    {problem !== prev_p && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium normal-case tracking-normal" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>Modified</span>}
                  </label>
                  <span className="text-xs font-mono" style={{ color: cc(problem.length, 50) }}>{problem.length}/50+</span>
                </div>
                <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="Describe the real-world problem..." className="input-field resize-none" rows={4} style={{ fontSize: '14px', lineHeight: '1.7' }} />
                {problem.length > 0 && problem.length < 50 && <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>{50 - problem.length} more characters needed</p>}
              </div>

              {/* Idea */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(17,24,39,0.6)', border: `1px solid ${idea !== prev_i ? 'rgba(139,92,246,0.3)' : 'rgba(255,179,71,0.12)'}`, backdropFilter: 'blur(8px)', transition: 'border-color 0.3s' }}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#ffb347' }}>
                    <span className="text-base">💡</span> Solution Idea
                    {idea !== prev_i && <span className="text-[9px] px-2 py-0.5 rounded-full font-medium normal-case tracking-normal" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>Modified</span>}
                  </label>
                  <span className="text-xs font-mono" style={{ color: cc(idea.length, 50) }}>{idea.length}/50+</span>
                </div>
                <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe your refined solution..." className="input-field resize-none" rows={4} style={{ fontSize: '14px', lineHeight: '1.7' }} />
                {idea.length > 0 && idea.length < 50 && <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>{50 - idea.length} more characters needed</p>}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => navigate('/engines', { state: { problem: prev_p, idea: prev_i, domain, iterationCount: round } })} className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer' }}>
                  <span>←</span> Back to Analysis
                </button>
                <motion.button onClick={submit} disabled={!valid || busy} className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" whileTap={{ scale: 0.98 }} style={{ background: valid ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'rgba(139,92,246,0.15)', color: valid ? '#fff' : '#64748b', border: '1px solid rgba(139,92,246,0.3)', cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 0 25px rgba(139,92,246,0.2)' : 'none', opacity: busy ? 0.7 : 1 }}>
                  {busy ? (<><span className="w-2 h-2 rounded-full" style={{ background: '#fff', animation: 'pulse-amber 1.5s ease-in-out infinite' }} /> Re-analyzing...</>) : (<><span>🔄</span> Run Round {nextRound} Analysis <span>→</span></>)}
                </motion.button>
              </div>
              {!changed && <p className="text-center text-xs mt-2" style={{ color: '#475569' }}>Modify your problem or solution to run a new analysis</p>}
              <div className="flex items-center justify-center mt-4">
                <button onClick={() => navigate('/dashboard', { state: { problem: prev_p, idea: prev_i, domain, rippleData, mentorData, stakeholderData, iterationCount: round } })}
                  className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.06)'; }}
                ><span>📊</span> View Dashboard</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(13,13,26,0.95), transparent)', color: '#334155' }}>
        Each refinement re-runs all three AI engines with your updated idea
      </div>
    </div>
  );
}
