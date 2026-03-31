import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stakeholderEmojis = {
  'Government Policy Advisor': '🏛️',
  'Rural Community Leader': '🌾',
  'Impact Investor': '📈',
  'Corporate CSR Head': '💼',
  'Young Beneficiary': '🧑',
  'Competing NGO Director': '🏢',
  'Social Media Influencer': '📱',
  'Academic Researcher': '🎓',
  'Local Journalist': '📰',
  'Philanthropist / Donor': '💎',
  'Tech Startup Founder': '🚀',
  'Healthcare Professional': '⚕️',
  'International Development Org': '🌍',
  'Local Government Representative': '🗳️',
  'Former Social Entrepreneur': '🫡',
};

function getVerdictStyle(verdict) {
  switch (verdict) {
    case 'INTERESTED':
      return {
        color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.35)',
        glow: '0 0 25px rgba(74,222,128,0.15)', label: '✅ Interested', badgeBg: 'rgba(74,222,128,0.12)',
      };
    case 'SKEPTICAL':
      return {
        color: '#ffb347', bg: 'rgba(255,179,71,0.06)', border: 'rgba(255,179,71,0.3)',
        glow: '0 0 20px rgba(255,179,71,0.1)', label: '🤔 Skeptical', badgeBg: 'rgba(255,179,71,0.12)',
      };
    case 'OPPOSED':
      return {
        color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.3)',
        glow: '0 0 20px rgba(248,113,113,0.1)', label: '🔒 Opposed', badgeBg: 'rgba(248,113,113,0.12)',
      };
    default:
      return {
        color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.2)',
        glow: 'none', label: '❓ Unknown', badgeBg: 'rgba(148,163,184,0.12)',
      };
  }
}

function getProgressMessage(count) {
  if (count >= 15) return { text: 'Exceptional! Every stakeholder sees potential in your idea', color: '#4ade80', icon: '🏆' };
  if (count >= 10) return { text: 'Strong ecosystem support. You\'re ready to pilot', color: '#4ade80', icon: '🚀' };
  if (count >= 5) return { text: 'Building traction. Address key concerns to unlock more support', color: '#ffb347', icon: '📈' };
  return { text: 'Your idea needs significant refinement before stakeholders will engage', color: '#f87171', icon: '⚠️' };
}

export default function StakeholderGrid({ data, loading }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const interestedCount = useMemo(() => {
    if (!data) return 0;
    return data.filter(s => s.verdict === 'INTERESTED').length;
  }, [data]);

  const progressMsg = getProgressMessage(interestedCount);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Counter + Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'rgba(17,24,39,0.7)',
          border: `1px solid ${progressMsg.color}30`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center relative"
            style={{
              background: `${progressMsg.color}15`,
              border: `1px solid ${progressMsg.color}30`,
            }}>
            <span className="text-2xl font-black" style={{ color: progressMsg.color, fontFamily: 'Georgia, serif' }}>
              {interestedCount}
            </span>
            <div className="absolute -inset-1 rounded-xl opacity-20 blur-lg" style={{ background: progressMsg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold" style={{ color: '#f1f5f9' }}>
                {interestedCount} of {data.length} stakeholders are interested
              </span>
              <span className="text-sm">{progressMsg.icon}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: '#94a3b8' }}>
              {progressMsg.text}
            </p>
          </div>
        </div>

        {/* Mini verdicts bar */}
        <div className="flex gap-1 mt-3">
          {data.map((s, i) => {
            const vs = getVerdictStyle(s.verdict);
            return (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04 + 0.3 }}
                className="flex-1 h-1.5 rounded-full"
                style={{ background: vs.color, opacity: 0.7, transformOrigin: 'bottom' }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Stakeholder Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {data.map((stakeholder, idx) => {
          const vs = getVerdictStyle(stakeholder.verdict);
          const emoji = stakeholderEmojis[stakeholder.stakeholder_name] || '👤';
          const isExpanded = expandedIdx === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl p-3 cursor-pointer relative overflow-hidden group"
              style={{
                background: vs.bg,
                border: `1px solid ${vs.border}`,
                boxShadow: isExpanded ? vs.glow : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              {/* Verdict glow for INTERESTED */}
              {stakeholder.verdict === 'INTERESTED' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, rgba(74,222,128,0.08), transparent 70%)` }} />
              )}

              {/* Lock icon for OPPOSED */}
              {stakeholder.verdict === 'OPPOSED' && (
                <div className="absolute top-2 right-2 text-xs opacity-40">🔒</div>
              )}

              <div className="relative z-10">
                {/* Avatar + Name */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold leading-tight truncate" style={{ color: '#f1f5f9' }}>
                      {stakeholder.stakeholder_name}
                    </h4>
                    <p className="text-[9px] truncate" style={{ color: '#64748b' }}>
                      {stakeholder.stakeholder_role?.substring(0, 40)}
                    </p>
                  </div>
                </div>

                {/* Verdict badge */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: vs.badgeBg, color: vs.color, border: `1px solid ${vs.border}` }}>
                  {vs.label}
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {/* Reaction */}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5"
                            style={{ color: '#ffb347' }}>💭 Reaction</span>
                          <p className="text-[10px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                            {stakeholder.reaction}
                          </p>
                        </div>
                        {/* Concern */}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5"
                            style={{ color: '#f87171' }}>⚠️ Concern</span>
                          <p className="text-[10px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                            {stakeholder.concern}
                          </p>
                        </div>
                        {/* Support condition */}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5"
                            style={{ color: '#4ade80' }}>✅ Would Support If</span>
                          <p className="text-[10px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                            {stakeholder.support_condition}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
