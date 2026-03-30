import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dimensions = [
  { key: 'community', label: 'Community Trust', icon: '👥', emoji: '🤝' },
  { key: 'finance', label: 'Financial Viability', icon: '💰', emoji: '📊' },
  { key: 'government', label: 'Government Relations', icon: '🏛️', emoji: '📋' },
  { key: 'partnerships', label: 'Partnership Potential', icon: '🤝', emoji: '🌐' },
];

function getScoreColor(score) {
  if (score >= 70) return { main: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', glow: 'rgba(74,222,128,0.15)' };
  if (score >= 40) return { main: '#ffb347', bg: 'rgba(255,179,71,0.12)', border: 'rgba(255,179,71,0.3)', glow: 'rgba(255,179,71,0.15)' };
  return { main: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', glow: 'rgba(248,113,113,0.15)' };
}

function getViabilityStyle(label) {
  switch (label) {
    case 'High Potential': return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', icon: '🚀' };
    case 'Needs Work': return { color: '#ffb347', bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.3)', icon: '🔧' };
    case 'Risky': return { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)', icon: '⚠️' };
    case 'Critical Issues': return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: '🚨' };
    default: return { color: '#ffb347', bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.3)', icon: '📊' };
  }
}

// Animated circular progress ring using SVG
function CircularRing({ score, size = 130, strokeWidth = 8, color, delay = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const pct = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - pct, 3);
        const current = Math.round(eased * score);
        setAnimatedScore(current);
        if (pct < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [score, delay]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: 'stroke-dashoffset 0.1s ease',
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Score number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color, fontFamily: 'Georgia, serif' }}>
          {animatedScore}
        </span>
        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100</span>
      </div>
    </div>
  );
}

export default function RippleRings({ data, loading }) {
  const [expandedKey, setExpandedKey] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton viability card */}
        <div className="skeleton h-24 rounded-2xl" />
        {/* Skeleton rings */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const viabilityStyle = getViabilityStyle(data.viability_label);

  return (
    <div className="space-y-5">
      {/* Overall Viability Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: viabilityStyle.bg,
          border: `1px solid ${viabilityStyle.border}`,
          boxShadow: `0 0 40px ${viabilityStyle.bg}`,
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-8xl pointer-events-none select-none"
          style={{ transform: 'translate(20%, -20%)' }}>
          {viabilityStyle.icon}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <CircularRing
              score={data.overall_viability || 0}
              size={80}
              strokeWidth={6}
              color={viabilityStyle.color}
              delay={200}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{viabilityStyle.icon}</span>
              <h3 className="font-bold text-base" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
                Overall Viability
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: viabilityStyle.bg, color: viabilityStyle.color, border: `1px solid ${viabilityStyle.border}` }}>
              {data.viability_label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4 Dimension Rings */}
      <div className="grid grid-cols-2 gap-4">
        {dimensions.map((dim, idx) => {
          const score = data.scores?.[dim.key] || 0;
          const colors = getScoreColor(score);
          const isExpanded = expandedKey === dim.key;

          return (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * idx + 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-4 cursor-pointer relative overflow-hidden group"
              style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 20px ${colors.glow}`,
              }}
              onClick={() => setExpandedKey(isExpanded ? null : dim.key)}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 30%, ${colors.glow}, transparent 70%)` }} />

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Ring */}
                <CircularRing
                  score={score}
                  size={110}
                  strokeWidth={7}
                  color={colors.main}
                  delay={300 + idx * 200}
                />

                {/* Label */}
                <div className="mt-3 mb-2">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-sm">{dim.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.main }}>
                      {dim.label}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-[11px] leading-relaxed" style={{ color: '#94a3b8' }}>
                  {data.explanations?.[dim.key]}
                </p>

                {/* Expand indicator */}
                <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                  <span>{isExpanded ? '▲ Less' : '▼ Details'}</span>
                </div>
              </div>

              {/* Expanded section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {/* Risk */}
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">⚠️</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>Risk</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                          {data.risks?.[dim.key]}
                        </p>
                      </div>
                      {/* Improvement */}
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">💡</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>Improve</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                          {data.improvements?.[dim.key]}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
