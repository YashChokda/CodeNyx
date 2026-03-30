/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#0d0d1a', card: '#1a1a2e', border: '#2a2a3e', lighter: '#16162b' },
        amber: { 300: '#ffc966', 400: '#ffb347', 500: '#f5a623', 600: '#e09500' },
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bar-fill': 'barFill 1.2s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 5px #ffb347, 0 0 10px rgba(255,179,71,0.3)' }, '50%': { boxShadow: '0 0 15px #ffb347, 0 0 30px rgba(255,179,71,0.5)' } },
        barFill: { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
      },
    },
  },
  plugins: [],
};
