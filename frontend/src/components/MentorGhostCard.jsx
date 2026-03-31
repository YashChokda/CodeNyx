import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const sections = [
  { key: 'opening', label: 'GUT REACTION', icon: '🎯', style: 'italic' },
  { key: 'strength', label: 'STRENGTH', icon: '💪', style: 'normal' },
  { key: 'fatal_flaw', label: 'FATAL FLAW', icon: '💀', style: 'normal' },
  { key: 'counterintuitive', label: 'COUNTERINTUITIVE', icon: '🔮', style: 'normal' },
  { key: 'immediate_action', label: '7-DAY ACTION', icon: '⚡', style: 'normal' },
];

function MentorScoreBadge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const pct = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setAnimatedScore(Math.round(eased * score));
      if (pct < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [score]);

  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#ffb347' : '#f87171';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className="text-4xl font-black" style={{
          color,
          fontFamily: 'Georgia, serif',
          textShadow: `0 0 30px ${color}60, 0 0 60px ${color}20`,
        }}>
          {animatedScore}
        </div>
        <div className="absolute -inset-3 rounded-full opacity-20 blur-xl" style={{ background: color }} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
        Mentor Confidence
      </span>
    </div>
  );
}

export default function MentorGhostCard({ data, loading, problem, idea, domain }) {
  const [visibleSections, setVisibleSections] = useState(0);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatUsed, setChatUsed] = useState(false);

  useEffect(() => {
    if (!data) return;
    setVisibleSections(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleSections(count);
      if (count >= sections.length + 1) { // +1 for score
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [data]);

  const handleAskMentor = async () => {
    if (!chatQuestion.trim() || chatLoading || chatUsed) return;
    setChatLoading(true);
    try {
      const res = await axios.post('/api/gemini/mentor-chat', {
        problem, idea, domain,
        question: chatQuestion,
        mentorContext: data,
      });
      setChatAnswer(res.data.answer);
      setChatUsed(true);
    } catch (err) {
      setChatAnswer('The mentor is currently unavailable. Please try again later.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-16 rounded-2xl" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Ghost Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(30,20,50,0.9))',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 0 40px rgba(139,92,246,0.08)',
        }}
      >
        {/* Floating ghost bg */}
        <div className="absolute top-2 right-3 text-5xl opacity-10 pointer-events-none select-none"
          style={{ animation: 'float 3s ease-in-out infinite' }}>👻</div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 20px rgba(139,92,246,0.1)',
            }}>
            👻
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm" style={{ color: '#e2e8f0', fontFamily: 'Georgia, serif' }}>
              The Ghost Mentor
            </h3>
            <p className="text-[10px]" style={{ color: '#7c3aed' }}>
              Failed 3 NGOs, built 1 that changed millions of lives
            </p>
          </div>
          {visibleSections > sections.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <MentorScoreBadge score={data.mentor_score || 0} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mentor Sections */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <AnimatePresence key={sec.key}>
            {idx < visibleSections && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: sec.key === 'fatal_flaw'
                    ? 'rgba(248,113,113,0.06)'
                    : sec.key === 'strength'
                    ? 'rgba(74,222,128,0.06)'
                    : sec.key === 'counterintuitive'
                    ? 'rgba(139,92,246,0.06)'
                    : 'rgba(17,24,39,0.6)',
                  border: `1px solid ${
                    sec.key === 'fatal_flaw' ? 'rgba(248,113,113,0.2)'
                    : sec.key === 'strength' ? 'rgba(74,222,128,0.2)'
                    : sec.key === 'counterintuitive' ? 'rgba(139,92,246,0.2)'
                    : 'rgba(255,255,255,0.06)'
                  }`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Label */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{sec.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{
                    color: sec.key === 'fatal_flaw' ? '#f87171'
                      : sec.key === 'strength' ? '#4ade80'
                      : sec.key === 'counterintuitive' ? '#a78bfa'
                      : '#ffb347'
                  }}>
                    {sec.label}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed" style={{
                  color: '#e2e8f0',
                  fontStyle: sec.style === 'italic' ? 'italic' : 'normal',
                  fontSize: sec.key === 'opening' ? '15px' : '13px',
                  fontFamily: sec.key === 'opening' ? 'Georgia, serif' : 'inherit',
                }}>
                  {sec.key === 'opening' && '"'}{data[sec.key]}{sec.key === 'opening' && '"'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Ask the Mentor Chat Box */}
      {visibleSections > sections.length && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(17,24,39,0.6)',
            border: '1px solid rgba(139,92,246,0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">💬</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
              Ask the Mentor
            </span>
            {chatUsed && (
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
                1/1 used
              </span>
            )}
          </div>

          {!chatUsed ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={chatQuestion}
                onChange={e => setChatQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskMentor()}
                placeholder="Ask one follow-up question..."
                className="input-field flex-1 text-xs"
                style={{ padding: '10px 14px', fontSize: '12px' }}
                disabled={chatLoading}
              />
              <button
                onClick={handleAskMentor}
                disabled={!chatQuestion.trim() || chatLoading}
                className="btn-primary px-4 py-2 text-xs flex-shrink-0"
                style={{ fontSize: '12px' }}
              >
                {chatLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full pulse-amber" style={{ background: '#0d0d1a' }} />
                    Thinking...
                  </span>
                ) : 'Ask →'}
              </button>
            </div>
          ) : null}

          {/* Chat Answer */}
          <AnimatePresence>
            {chatAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl p-3"
                style={{
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">👻</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                    Mentor Reply
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#cbd5e1' }}>
                  {chatAnswer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
