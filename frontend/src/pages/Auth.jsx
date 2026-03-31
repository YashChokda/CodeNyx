import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FloatingOrb = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState('');

  const { currentUser, signup, login, logout } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, show a welcome-back screen
  if (currentUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#0d0d1a' }}>
        {/* Background orbs */}
        <FloatingOrb style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(255,179,71,0.12) 0%, transparent 70%)',
          top: '-100px', left: '-100px'
        }} />
        <FloatingOrb style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(100,60,255,0.1) 0%, transparent 70%)',
          bottom: '-80px', right: '-80px'
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,179,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,179,71,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="glass-card amber-glow-card overflow-hidden"
            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,179,71,0.08)' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #4ade80, #22c55e, transparent)' }} />
            <div className="p-8 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))',
                  border: '1px solid rgba(74,222,128,0.3)',
                  boxShadow: '0 0 30px rgba(74,222,128,0.2)'
                }}>
                <span className="text-3xl">👋</span>
              </div>
              <h1 className="text-2xl font-bold mb-1" style={{
                fontFamily: 'Georgia, serif',
                color: '#f1f5f9',
              }}>
                Welcome Back!
              </h1>
              <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>
                You're signed in as
              </p>
              <p className="text-base font-semibold mb-6" style={{ color: '#ffb347' }}>
                {currentUser.displayName || currentUser.email}
              </p>

              <motion.button
                onClick={() => navigate('/domain')}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%' }}
              >
                <span>🚀</span>
                <span>Continue to App</span>
                <span>→</span>
              </motion.button>

              <button
                onClick={async () => {
                  try { await logout(); } catch (e) { console.error(e); }
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: '#f87171',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(248,113,113,0.12)'}
                onMouseLeave={e => e.target.style.background = 'rgba(248,113,113,0.06)'}
              >
                🚪 Sign Out & Switch Account
              </button>

              <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
                Empowering young innovators to build India's future 🇮🇳
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!formData.displayName.trim()) return setError('Please enter your name.') || triggerShake();
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.') || triggerShake();
      if (formData.password.length < 6) return setError('Password must be at least 6 characters.') || triggerShake();
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(formData.email, formData.password, formData.displayName);
        setSuccess('Account created! Redirecting...');
      } else {
        await login(formData.email, formData.password);
        setSuccess('Welcome back! Redirecting...');
      }
      setTimeout(() => navigate('/domain'), 1200);
    } catch (err) {
      triggerShake();
      const msg = err.code;
      if (msg === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.');
      else if (msg === 'auth/user-not-found') setError('No account found with this email.');
      else if (msg === 'auth/wrong-password' || msg === 'auth/invalid-credential') setError('Incorrect password. Please try again.');
      else if (msg === 'auth/invalid-email') setError('Please enter a valid email address.');
      else if (msg === 'auth/too-many-requests') setError('Too many attempts. Please wait a moment.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#0d0d1a' }}>

      {/* Ambient background orbs */}
      <FloatingOrb style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,179,71,0.12) 0%, transparent 70%)',
        top: '-100px', left: '-100px'
      }} />
      <FloatingOrb style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(100,60,255,0.1) 0%, transparent 70%)',
        bottom: '-80px', right: '-80px'
      }} />
      <FloatingOrb style={{
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(255,179,71,0.06) 0%, transparent 70%)',
        top: '40%', right: '15%'
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,179,71,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,179,71,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 w-full max-w-md mx-4 ${shaking ? 'shake' : ''}`}
      >
        {/* Card */}
        <div className="glass-card amber-glow-card overflow-hidden"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,179,71,0.08)' }}>

          {/* Top accent line */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #ffb347, #ff8c00, transparent)' }} />

          <div className="p-8 sm:p-10">
            {/* Logo + Branding */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,179,71,0.2), rgba(255,140,0,0.1))',
                  border: '1px solid rgba(255,179,71,0.3)',
                  boxShadow: '0 0 30px rgba(255,179,71,0.2)'
                }}>
                <span className="text-3xl">🚀</span>
              </div>
              <h1 className="text-3xl font-bold mb-1" style={{
                fontFamily: 'Georgia, serif',
                background: 'linear-gradient(135deg, #ffb347, #ff8c00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                Vision of Venture
              </h1>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Social Entrepreneurship Simulator
              </p>
            </motion.div>

            {/* Mode Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex rounded-xl p-1 mb-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,179,71,0.1)' }}
            >
              {['login', 'signup'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setError(''); setSuccess(''); setFormData({ email: '', password: '', displayName: '', confirmPassword: '' }); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                  style={{
                    background: mode === tab ? 'linear-gradient(135deg, #ffb347, #ff8c00)' : 'transparent',
                    color: mode === tab ? '#0d0d1a' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Display Name — signup only */}
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="field-label">Your Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: '#64748b' }}>👤</span>
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          placeholder="Full name"
                          className="input-field"
                          style={{ paddingLeft: '42px' }}
                          required={mode === 'signup'}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="field-label">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: '#64748b' }}>✉️</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="input-field"
                        style={{ paddingLeft: '42px' }}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="field-label">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: '#64748b' }}>🔒</span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                        className="input-field"
                        style={{ paddingLeft: '42px' }}
                        required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                    </div>
                  </div>

                  {/* Confirm Password — signup only */}
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="field-label">Confirm Password</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: '#64748b' }}>🔑</span>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat your password"
                          className="input-field"
                          style={{ paddingLeft: '42px' }}
                          required={mode === 'signup'}
                          autoComplete="new-password"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{
                      background: 'rgba(248,113,113,0.1)',
                      border: '1px solid rgba(248,113,113,0.3)',
                      color: '#f87171'
                    }}
                  >
                    <span>⚠️</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{
                      background: 'rgba(74,222,128,0.1)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      color: '#4ade80'
                    }}
                  >
                    <span>✅</span>
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(13,13,26,0.3)', borderTopColor: '#0d0d1a' }} />
                    <span>AI is thinking...</span>
                    <span className="w-2 h-2 rounded-full pulse-amber" style={{ background: '#0d0d1a' }} />
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <span>→</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs" style={{ color: '#475569' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <button
              onClick={switchMode}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,179,71,0.06)',
                border: '1px solid rgba(255,179,71,0.2)',
                color: '#ffb347',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,179,71,0.12)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,179,71,0.06)'}
            >
              {mode === 'login' ? '✨ Create a free account' : '← Back to Sign In'}
            </button>

            {/* Footer tagline */}
            <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
              Empowering young innovators to build India's future 🇮🇳
            </p>
          </div>
        </div>

        {/* Floating features list below card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-6 mt-6"
        >
          {['🧠 AI Mentor', '⚡ Ripple Engine', '👥 15 Stakeholders'].map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-xs flex items-center gap-1"
              style={{ color: '#475569' }}
            >
              <span>{feat}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
