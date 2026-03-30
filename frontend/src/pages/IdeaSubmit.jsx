import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import HiddenConsCards from '../components/HiddenConsCards';
import axios from 'axios';

export default function IdeaSubmit() {
  const [problem, setProblem] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hiddenCons, setHiddenCons] = useState(null);
  const [phase, setPhase] = useState('input'); // 'input' | 'loading' | 'cons'

  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const domain = userProfile?.domain || 'General';

  const handleLogout = async () => {
    try { await logout(); navigate('/auth'); } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (problem.length < 50) {
      setError('Problem statement must be at least 50 characters.');
      return;
    }
    if (idea.length < 50) {
      setError('Solution idea must be at least 50 characters.');
      return;
    }

    setPhase('loading');
    setLoading(true);

    try {
      const res = await axios.post('/api/gemini/hidden-cons', { problem, idea, domain });
      setHiddenCons(res.data.cons);
      setPhase('cons');

      // Save idea to Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        currentIdea: { problem, idea },
      });
    } catch (err) {
      console.error('Hidden cons error:', err);
      setError(err.response?.data?.error || 'Failed to analyze idea. Check your Gemini API key.');
      setPhase('input');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/engines', {
      state: { problem, idea, domain, hiddenCons },
    });
  };

  const charColor = (count, min) => {
    if (count === 0) return '#475569';
    if (count < min) return '#fbbf24';
    return '#4ade80';
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#0d0d1a' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 30% 20%, rgba(255,179,71,0.06) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(100,60,255,0.05) 0%, transparent 50%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,179,71,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,179,71,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Top Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
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
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            {currentUser?.displayName || currentUser?.email}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(248,113,113,0.08)'; }}
          >🚪 Sign Out</button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-16">
        <AnimatePresence mode="wait">
          {/* ─── PHASE: INPUT ─── */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl"
            >
              {/* Step badge */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex justify-center mb-5"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)', color: '#ffb347' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
                  Step 2 of 4
                </div>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2" style={{
                fontFamily: 'Georgia, serif', color: '#f1f5f9', letterSpacing: '-0.5px',
              }}>
                Share Your <span style={{
                  background: 'linear-gradient(135deg, #ffb347, #ff8c00)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Big Idea</span>
              </h1>
              <p className="text-center text-sm mb-8" style={{ color: '#64748b' }}>
                Tell us about the problem you've observed and your proposed solution
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Problem textarea */}
                <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(255,179,71,0.12)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="field-label flex items-center gap-2 mb-0">
                      <span className="text-base">🔍</span> What problem are you solving?
                    </label>
                    <span className="text-xs font-mono" style={{ color: charColor(problem.length, 50) }}>
                      {problem.length}/50+
                    </span>
                  </div>
                  <textarea
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    placeholder="Describe the real-world problem you've observed in your community..."
                    className="input-field resize-none"
                    rows={4}
                    style={{ fontSize: '14px', lineHeight: '1.7' }}
                  />
                  {problem.length > 0 && problem.length < 50 && (
                    <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>
                      {50 - problem.length} more characters needed
                    </p>
                  )}
                </div>

                {/* Solution textarea */}
                <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(255,179,71,0.12)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="field-label flex items-center gap-2 mb-0">
                      <span className="text-base">💡</span> What is your solution idea?
                    </label>
                    <span className="text-xs font-mono" style={{ color: charColor(idea.length, 50) }}>
                      {idea.length}/50+
                    </span>
                  </div>
                  <textarea
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    placeholder="Describe your innovative solution – how will it work on the ground?"
                    className="input-field resize-none"
                    rows={4}
                    style={{ fontSize: '14px', lineHeight: '1.7' }}
                  />
                  {idea.length > 0 && idea.length < 50 && (
                    <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>
                      {50 - idea.length} more characters needed
                    </p>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                    >
                      <span>⚠️</span> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || problem.length < 50 || idea.length < 50}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%' }}
                >
                  <span>🔮</span>
                  <span>Reveal Hidden Cons</span>
                  <span>→</span>
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ─── PHASE: LOADING ─── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full"
                  style={{ border: '3px solid rgba(255,179,71,0.1)' }} />
                <div className="absolute inset-0 rounded-full animate-spin"
                  style={{ border: '3px solid transparent', borderTopColor: '#ffb347', animationDuration: '1s' }} />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🔮</div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-base mb-1" style={{ color: '#f1f5f9' }}>
                  AI is thinking...
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
                  <span className="text-xs" style={{ color: '#64748b' }}>
                    Analyzing your idea for hidden blindspots
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE: HIDDEN CONS ─── */}
          {phase === 'cons' && (
            <motion.div
              key="cons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full"
            >
              <HiddenConsCards cons={hiddenCons} onContinue={handleContinue} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(13,13,26,0.95), transparent)', color: '#334155' }}
      >
        Your idea is analyzed by AI to reveal operational blindspots
      </motion.div>
    </div>
  );
}
