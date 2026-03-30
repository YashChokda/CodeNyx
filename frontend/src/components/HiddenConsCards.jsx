import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const severityConfig = {
  High: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', icon: '🔴' },
  Medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', icon: '🟡' },
  Low: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)', icon: '🟢' },
};

const categoryIcons = {
  Financial: '💰',
  Operational: '⚙️',
  Community: '👥',
  Government: '🏛️',
};

export default function HiddenConsCards({ cons, onContinue }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [allRevealed, setAllRevealed] = useState(false);

  useEffect(() => {
    if (!cons || cons.length === 0) return;
    setVisibleCount(0);
    setAllRevealed(false);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= cons.length) {
        clearInterval(interval);
        setTimeout(() => setAllRevealed(true), 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [cons]);

  if (!cons || cons.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.25)',
          }}>⚠️</div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#f1f5f9' }}>
            Hidden Cons Revealed
          </h3>
          <p className="text-xs" style={{ color: '#64748b' }}>
            Real-world blindspots that first-time founders always miss
          </p>
        </div>
        <div className="ml-auto text-xs font-mono px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
          {visibleCount} / {cons.length}
        </div>
      </motion.div>

      {/* Cards */}
      <div className="space-y-4">
        {cons.map((con, index) => {
          const sev = severityConfig[con.severity] || severityConfig.Medium;
          const catIcon = categoryIcons[con.category] || '📋';

          return (
            <AnimatePresence key={index}>
              {index < visibleCount && (
                <motion.div
                  initial={{ opacity: 0, x: -60, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: 'rgba(17, 24, 39, 0.7)',
                    border: `1px solid ${sev.border}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 0 25px ${sev.bg}, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                >
                  {/* Glow accent on left edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: sev.color }} />

                  <div className="flex items-start gap-4 pl-3">
                    {/* Number badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-bold text-sm" style={{ color: '#f1f5f9' }}>{con.title}</h4>
                        {/* Severity badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                          {sev.icon} {con.severity}
                        </span>
                        {/* Category tag */}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {catIcon} {con.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                        {con.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Continue button — only after all cards appear */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 22 }}
            className="mt-8 text-center"
          >
            <button
              onClick={onContinue}
              className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2"
            >
              <span>I understand, continue</span>
              <span>→</span>
            </button>
            <p className="text-xs mt-3" style={{ color: '#475569' }}>
              Acknowledging these risks will make your idea stronger
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
