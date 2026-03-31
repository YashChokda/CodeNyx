import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CostCalculator from '../components/CostCalculator';
import GovChat from '../components/GovChat';
import { getSession } from '../hooks/useSessionData';

const tabs = [
  { key: 'cost', label: 'Cost Estimator', icon: '💰', color: '#ffb347' },
  { key: 'gov',  label: 'Gov Guide',      icon: '🏛️', color: '#a78bfa' },
];

export default function CostAndGovGuide() {
  const [activeTab, setActiveTab] = useState('cost');
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Get data from navigation state, sessionStorage, or userProfile
  const session = getSession();
  const problem = state?.problem || session.problem || userProfile?.currentIdea?.problem || '';
  const idea = state?.idea || session.idea || userProfile?.currentIdea?.idea || '';
  const domain = state?.domain || session.domain || userProfile?.domain || 'General';

  const handleLogout = async () => {
    try { await logout(); navigate('/auth'); } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#0d0d1a' }}>
      {/* ─── Background effects ─── */}
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: '#f87171',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; e.target.style.borderColor = 'rgba(248,113,113,0.5)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(248,113,113,0.08)'; e.target.style.borderColor = 'rgba(248,113,113,0.25)'; }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </motion.nav>

      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 text-center px-5 pt-5 pb-2"
      >
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)', color: '#ffb347' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffb347', animation: 'pulse-amber 1.5s ease-in-out infinite' }} />
            Planning & Compliance Tools
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
          Plan Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #ffb347, #ff8c00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Launch</span>
        </h1>
        <p className="text-xs" style={{ color: '#64748b' }}>
          Estimate costs and navigate Indian government procedures for your initiative
        </p>
      </motion.div>

      {/* ─── Tab Navigation ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-20 flex items-center justify-center gap-2 px-5 py-3"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                background: isActive ? `${tab.color}15` : 'rgba(17,24,39,0.5)',
                border: `1px solid ${isActive ? `${tab.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? tab.color : '#64748b',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 20px ${tab.color}10` : 'none',
              }}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeToolTab"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: tab.color }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto px-5 sm:px-8 pb-20">
        <AnimatePresence mode="wait">
          {/* ─── COST ESTIMATOR TAB ─── */}
          {activeTab === 'cost' && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto py-4"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)' }}>
                  💰
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                    Cost Estimator
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Build your team, set operations, and get AI budget analysis
                  </p>
                </div>
              </div>

              <CostCalculator idea={idea} domain={domain} />
            </motion.div>
          )}

          {/* ─── GOV GUIDE TAB ─── */}
          {activeTab === 'gov' && (
            <motion.div
              key="gov"
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
                  🏛️
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                    Government Navigation Guide
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Navigate Indian bureaucratic systems — registrations, permits, schemes, and compliance
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <GovChat />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom nav hint ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-30 py-4 px-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to top, rgba(13,13,26,0.98) 60%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/refine', { state: { problem, idea, domain } })}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <span>←</span> Back to Refinement
          </button>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
        >
          <span>📊</span>
          <span>View Dashboard</span>
          <span>→</span>
        </button>
      </motion.div>
    </div>
  );
}
