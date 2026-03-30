import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import RippleRings from '../components/RippleRings';
import MentorGhostCard from '../components/MentorGhostCard';
import StakeholderGrid from '../components/StakeholderGrid';

const tabs = [
  { key: 'ripple', label: 'Ripple Effect', icon: '⚡', color: '#ffb347' },
  { key: 'mentor', label: 'Mentor Ghost', icon: '👻', color: '#a78bfa' },
  { key: 'ecosystem', label: 'Ecosystem Unlock', icon: '🗺️', color: '#4ade80' },
];

export default function MainEngines() {
  const [activeTab, setActiveTab] = useState('ripple');
  const [rippleData, setRippleData] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [stakeholderData, setStakeholderData] = useState(null);
  const [rippleLoading, setRippleLoading] = useState(true);
  const [mentorLoading, setMentorLoading] = useState(true);
  const [stakeholderLoading, setStakeholderLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from IdeaSubmit navigation state
  const { problem, idea, domain } = location.state || {};

  useEffect(() => {
    if (!problem || !idea || !domain) {
      navigate('/idea', { replace: true });
      return;
    }
    fetchAllEngines();
  }, []);

  const fetchAllEngines = async () => {
    setRippleLoading(true);
    setMentorLoading(true);
    setStakeholderLoading(true);
    setError('');

    // Call all 3 engines in parallel
    const ripplePromise = axios.post('/api/gemini/ripple', { problem, idea, domain })
      .then(res => {
        setRippleData(res.data);
        setRippleLoading(false);
        return res.data;
      })
      .catch(err => {
        console.error('Ripple error:', err);
        setRippleLoading(false);
        return null;
      });

    const stakeholderPromise = axios.post('/api/stakeholders', { problem, idea, domain })
      .then(res => {
        setStakeholderData(res.data.stakeholders);
        setStakeholderLoading(false);
      })
      .catch(err => {
        console.error('Stakeholder error:', err);
        setStakeholderLoading(false);
      });

    // Mentor needs ripple scores ideally, but we fire it at the same time for speed
    // It will use default scores if ripple hasn't returned yet
    const mentorPromise = ripplePromise.then(rippleResult => {
      const rippleScores = rippleResult?.scores || { community: 50, finance: 50, government: 50, partnerships: 50 };
      return axios.post('/api/gemini/mentor', { problem, idea, domain, rippleScores })
        .then(res => {
          setMentorData(res.data);
          setMentorLoading(false);
        })
        .catch(err => {
          console.error('Mentor error:', err);
          setMentorLoading(false);
        });
    });

    await Promise.all([ripplePromise, mentorPromise, stakeholderPromise]);
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/auth'); } catch (e) { console.error(e); }
  };

  const handleContinueToRefine = () => {
    navigate('/refine', {
      state: { problem, idea, domain, rippleData, mentorData, stakeholderData },
    });
  };

  // Loading status for each engine
  const getEngineStatus = (key) => {
    switch (key) {
      case 'ripple': return rippleLoading ? 'loading' : rippleData ? 'ready' : 'error';
      case 'mentor': return mentorLoading ? 'loading' : mentorData ? 'ready' : 'error';
      case 'ecosystem': return stakeholderLoading ? 'loading' : stakeholderData ? 'ready' : 'error';
      default: return 'loading';
    }
  };

  if (!problem || !idea || !domain) return null;

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

      {/* Top Navigation */}
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
            Round 1
          </span>
          <button onClick={() => navigate('/dashboard')}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', cursor: 'pointer' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(74,222,128,0.15)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(74,222,128,0.08)'; }}
          >📊 Dashboard</button>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            {currentUser?.displayName || currentUser?.email?.split('@')[0]}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(248,113,113,0.08)'; }}
          >🚪</button>
        </div>
      </motion.nav>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-20 flex items-center justify-center gap-2 px-5 py-3"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const status = getEngineStatus(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                background: isActive
                  ? `${tab.color}15`
                  : 'rgba(17,24,39,0.5)',
                border: `1px solid ${isActive ? `${tab.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? tab.color : '#64748b',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 20px ${tab.color}10` : 'none',
              }}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>

              {/* Status indicator */}
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: status === 'loading' ? '#ffb347'
                  : status === 'ready' ? '#4ade80'
                  : '#f87171',
                animation: status === 'loading' ? 'pulse-amber 1.5s ease-in-out infinite' : 'none',
                boxShadow: status === 'ready' ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
              }} />

              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: tab.color }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 pb-24">
        <AnimatePresence mode="wait">
          {/* ─── RIPPLE EFFECT ─── */}
          {activeTab === 'ripple' && (
            <motion.div
              key="ripple"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto py-4"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)' }}>
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                    Ripple Effect Analysis
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    How your idea impacts community, finance, government, and partnerships
                  </p>
                </div>
              </div>

              <RippleRings data={rippleData} loading={rippleLoading} />
            </motion.div>
          )}

          {/* ─── MENTOR GHOST ─── */}
          {activeTab === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto py-4"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  👻
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                    Ghost Mentor
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Brutally honest mentorship from someone who's been there
                  </p>
                </div>
              </div>

              <MentorGhostCard
                data={mentorData}
                loading={mentorLoading}
                problem={problem}
                idea={idea}
                domain={domain}
              />
            </motion.div>
          )}

          {/* ─── ECOSYSTEM UNLOCK ─── */}
          {activeTab === 'ecosystem' && (
            <motion.div
              key="ecosystem"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto py-4"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
                  🗺️
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                    Ecosystem Unlock
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    15 stakeholders powered by 5 different AI models evaluate your idea
                  </p>
                </div>
              </div>

              <StakeholderGrid data={stakeholderData} loading={stakeholderLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-30 py-4 px-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to top, rgba(13,13,26,0.98) 60%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Engine status dots */}
          {tabs.map(tab => {
            const status = getEngineStatus(tab.key);
            return (
              <div key={tab.key} className="flex items-center gap-1.5 text-[10px]" style={{ color: '#475569' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{
                  background: status === 'loading' ? '#ffb347'
                    : status === 'ready' ? '#4ade80'
                    : '#f87171',
                  animation: status === 'loading' ? 'pulse-amber 1.5s ease-in-out infinite' : 'none',
                }} />
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{status === 'loading' ? 'Analyzing...' : status === 'ready' ? 'Ready' : 'Error'}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinueToRefine}
          disabled={rippleLoading || mentorLoading || stakeholderLoading}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
        >
          <span>Refine Your Idea</span>
          <span>→</span>
        </button>
      </motion.div>

      {/* Float animation keyframe (for ghost) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
