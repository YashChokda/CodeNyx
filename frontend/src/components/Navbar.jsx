import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const steps = [
  { path: '/domain', label: 'Domain' },
  { path: '/idea', label: 'Idea' },
  { path: '/decisions', label: 'Decisions' },

  { path: '/feedback', label: 'Feedback' },
  { path: '/advanced', label: 'Advanced' },
  { path: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  if (pathname === '/') return null;

  const currentIdx = steps.findIndex(s => s.path === pathname);
  const progress = currentIdx >= 0 ? ((currentIdx + 1) / steps.length) * 100 : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-dark-border no-print">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate('/domain')} className="font-heading text-lg text-amber-400 font-bold tracking-wide hover:text-amber-300 transition-colors">
          ✦ Vision To Venture
        </button>
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => (
              <button key={s.path} onClick={() => navigate(s.path)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  pathname === s.path ? 'bg-amber-400/20 text-amber-400' :
                  i < currentIdx ? 'text-amber-400/60 hover:text-amber-400' : 'text-gray-500'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-0.5 bg-dark-border">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
    </nav>
  );
}
