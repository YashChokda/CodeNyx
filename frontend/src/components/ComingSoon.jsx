import React from 'react';
import { motion } from 'framer-motion';

const ComingSoon = ({ title, emoji, description }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d1a' }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-10 glass-card max-w-md mx-4"
      style={{ border: '1px solid rgba(255,179,71,0.2)' }}
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#ffb347', fontFamily: 'Georgia, serif' }}>{title}</h1>
      <p className="text-sm" style={{ color: '#64748b' }}>{description}</p>
      <div className="mt-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ffb347, transparent)' }} />
    </motion.div>
  </div>
);

export default ComingSoon;
