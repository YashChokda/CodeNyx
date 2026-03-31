import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const domains = [
  {
    id: 'mental-health',
    icon: '🧠',
    title: 'Mental Health',
    description: 'Break stigma and build accessible mental wellness systems for communities.',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    shadow: 'rgba(167, 139, 250, 0.3)',
    bg: 'rgba(167, 139, 250, 0.08)',
  },
  {
    id: 'education',
    icon: '📚',
    title: 'Education',
    description: 'Bridge learning gaps and reimagine education for underserved learners.',
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    shadow: 'rgba(96, 165, 250, 0.3)',
    bg: 'rgba(96, 165, 250, 0.08)',
  },
  {
    id: 'sustainability',
    icon: '🌱',
    title: 'Sustainability',
    description: 'Create circular solutions for waste, energy, and environmental resilience.',
    gradient: 'linear-gradient(135deg, #4ade80, #16a34a)',
    shadow: 'rgba(74, 222, 128, 0.3)',
    bg: 'rgba(74, 222, 128, 0.08)',
  },
  {
    id: 'healthcare',
    icon: '🏥',
    title: 'Healthcare',
    description: 'Deliver affordable, last-mile healthcare to those who need it most.',
    gradient: 'linear-gradient(135deg, #f87171, #dc2626)',
    shadow: 'rgba(248, 113, 113, 0.3)',
    bg: 'rgba(248, 113, 113, 0.08)',
  },
  {
    id: 'women-empowerment',
    icon: '👩',
    title: 'Women Empowerment',
    description: 'Advance gender equity through economic, social, and legal empowerment.',
    gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
    shadow: 'rgba(244, 114, 182, 0.3)',
    bg: 'rgba(244, 114, 182, 0.08)',
  },
  {
    id: 'rural-development',
    icon: '🏘️',
    title: 'Rural Development',
    description: 'Transform rural livelihoods through infrastructure, tech, and opportunity.',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    shadow: 'rgba(251, 191, 36, 0.3)',
    bg: 'rgba(251, 191, 36, 0.08)',
  },
  {
    id: 'youth-employment',
    icon: '💼',
    title: 'Youth Employment',
    description: 'Equip India\'s youth with skills, mentorship, and pathways to meaningful work.',
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
    shadow: 'rgba(251, 146, 60, 0.3)',
    bg: 'rgba(251, 146, 60, 0.08)',
  },
  {
    id: 'digital-literacy',
    icon: '🌐',
    title: 'Digital Literacy',
    description: 'Close the digital divide and empower communities with tech fluency.',
    gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)',
    shadow: 'rgba(34, 211, 238, 0.3)',
    bg: 'rgba(34, 211, 238, 0.08)',
  },
];

export default function DomainSelect() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const { currentUser, setUserProfile, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSelect = (domain) => {
    if (saving) return;
    setSelected(domain.id);
    setSaving(true);

    // Update profile locally first, navigate instantly
    setUserProfile((prev) => ({ ...prev, domain: domain.title }));
    navigate('/idea');

    // Save to Firestore in background (fire-and-forget)
    updateDoc(doc(db, 'users', currentUser.uid), { domain: domain.title })
      .catch(err => console.error('Error saving domain:', err));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#0d0d1a' }}>
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,179,71,0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(100,60,255,0.06) 0%, transparent 50%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,179,71,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,179,71,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Top bar */}
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
          }}>
            Vision of Venture
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
            {currentUser?.displayName || currentUser?.email}
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

      {/* Main content */}
      <div className="relative z-10 w-full px-8 sm:px-16 lg:px-24 xl:px-32 pb-16 flex-1 flex flex-col justify-center items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 mt-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{
              background: 'rgba(255,179,71,0.1)',
              border: '1px solid rgba(255,179,71,0.25)',
              color: '#ffb347',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
            Step 1 of 4
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{
            fontFamily: 'Georgia, serif',
            color: '#f1f5f9',
            letterSpacing: '-0.5px',
          }}>
            Choose Your <span style={{
              background: 'linear-gradient(135deg, #ffb347, #ff8c00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Impact Domain</span>
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: '#64748b', lineHeight: 1.7 }}>
            Pick the area where you want to create social impact. This will shape your AI analysis, stakeholder network, and mentor guidance.
          </p>
        </motion.div>

        {/* Domain Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
        >
          {domains.map((domain) => {
            const isSelected = selected === domain.id;
            const isHovered = hoveredId === domain.id;
            const isDisabled = saving && !isSelected;

            return (
              <motion.button
                key={domain.id}
                variants={itemVariants}
                onClick={() => handleSelect(domain)}
                onMouseEnter={() => setHoveredId(domain.id)}
                onMouseLeave={() => setHoveredId(null)}
                disabled={isDisabled}
                className="relative text-left rounded-2xl p-5 transition-all duration-300 group"
                style={{
                  background: isSelected
                    ? domain.bg
                    : isHovered
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(17, 24, 39, 0.6)',
                  border: `1.5px solid ${isSelected
                    ? domain.shadow.replace('0.3', '0.6')
                    : isHovered
                      ? 'rgba(255,179,71,0.2)'
                      : 'rgba(255,255,255,0.05)'}`,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  boxShadow: isSelected
                    ? `0 0 30px ${domain.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                    : isHovered
                      ? `0 8px 30px rgba(0,0,0,0.3), 0 0 20px ${domain.shadow.replace('0.3', '0.08')}`
                      : '0 2px 10px rgba(0,0,0,0.2)',
                  transform: isHovered && !isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  backdropFilter: 'blur(12px)',
                }}
                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
              >
                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: domain.gradient, color: '#fff', fontWeight: 'bold' }}
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-all duration-300"
                  style={{
                    background: isSelected || isHovered
                      ? domain.bg.replace('0.08', '0.15')
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isSelected || isHovered
                      ? domain.shadow.replace('0.3', '0.25')
                      : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {domain.icon}
                </div>

                {/* Title */}
                <h3 className="font-bold text-base mb-1.5 transition-colors duration-300"
                  style={{ color: isSelected || isHovered ? '#f1f5f9' : '#cbd5e1' }}>
                  {domain.title}
                </h3>

                {/* Description */}
                <p className="text-xs leading-relaxed transition-colors duration-300"
                  style={{ color: isSelected || isHovered ? '#94a3b8' : '#475569' }}>
                  {domain.description}
                </p>

                {/* Bottom accent bar */}
                <div className="mt-4 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: domain.gradient }}
                    initial={{ width: '0%' }}
                    animate={{ width: isSelected ? '100%' : isHovered ? '50%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Loading state after selection */}
        <AnimatePresence>
          {saving && selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 mt-8"
            >
              <span className="w-2 h-2 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
              <span className="text-sm font-medium" style={{ color: '#ffb347' }}>
                Setting up your {domains.find(d => d.id === selected)?.title} workspace...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(13,13,26,0.95), transparent)',
          color: '#334155',
        }}
      >
        Click a domain to begin your entrepreneurship simulation
      </motion.div>
    </div>
  );
}
