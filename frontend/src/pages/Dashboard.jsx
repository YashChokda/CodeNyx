import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getArchetype } from '../api/gemini';
import RadarChart from '../components/RadarChart';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const { domain, decisions, rippleScores, iterationCount } = useApp();
  const [archetype, setArchetype] = useState(null);
  const [loading, setLoading] = useState(true);

  const scores = rippleScores || { community: 0, finance: 0, government: 0, partnerships: 0 };

  const impactScore = Math.min(100, Math.round((scores.community * 0.6 + Math.min(decisions.reach / 1000, 40))));
  const financeScore = Math.min(100, Math.round(scores.finance * 0.7 + (Number(decisions.budget) > 100000 ? 30 : Number(decisions.budget) > 50000 ? 20 : 10)));
  const sustainScore = Math.round((scores.community + scores.finance + scores.government + scores.partnerships) / 4);
  const efficiencyScore = Math.max(0, 100 - iterationCount * 10);

  const radarScores = { impact: impactScore, finance: financeScore, sustainability: sustainScore, efficiency: efficiencyScore };

  useEffect(() => {
    fetchArchetype();
  }, []);

  const fetchArchetype = async () => {
    try {
      const data = await getArchetype({ domain, decisions, rippleScores: scores });
      setArchetype(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const scoreCards = [
    { label: 'Impact Score', value: impactScore, icon: '🎯', color: '#4ecdc4', desc: 'Community reach × trust' },
    { label: 'Financial Viability', value: financeScore, icon: '💰', color: '#22c55e', desc: 'Budget adequacy × health' },
    { label: 'Sustainability', value: sustainScore, icon: '🌱', color: '#a78bfa', desc: 'Average across all dimensions' },
    { label: 'Decision Efficiency', value: efficiencyScore, icon: '⚡', color: '#ffb347', desc: `${iterationCount} refinement iteration(s)` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-heading text-3xl md:text-4xl text-amber-400 mb-2">Final Evaluation Dashboard</h1>
        <p className="text-gray-400">Your comprehensive venture assessment</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {scoreCards.map((sc, i) => (
          <div key={i} className={`glass-card text-center animate-slide-up stagger-${i + 1}`}>
            <span className="text-3xl block mb-2">{sc.icon}</span>
            <p className="text-3xl font-bold mb-1" style={{ color: sc.color }}>{sc.value}</p>
            <p className="font-heading text-sm text-gray-200">{sc.label}</p>
            <p className="text-xs text-gray-500 mt-1">{sc.desc}</p>
          </div>
        ))}
      </div>

      {/* Radar Chart + Archetype */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="glass-card animate-fade-in">
          <h3 className="font-heading text-lg text-amber-400 mb-4 text-center">Performance Radar</h3>
          <RadarChart scores={radarScores} />
        </div>

        <div className="glass-card animate-fade-in flex flex-col items-center justify-center text-center">
          {loading ? <Spinner text="Discovering your archetype..." /> : archetype ? (
            <>
              <span className="text-5xl mb-4">👑</span>
              <h3 className="font-heading text-2xl text-amber-400 mb-3">{archetype.title}</h3>
              <p className="text-gray-300 leading-relaxed max-w-sm">{archetype.description}</p>
              <p className="text-xs text-gray-500 mt-4">Your Leadership Archetype</p>
            </>
          ) : (
            <p className="text-gray-500">Could not load archetype.</p>
          )}
        </div>
      </div>

      {/* Summary Card for Print */}
      <div className="glass-card animate-fade-in" id="printable-summary">
        <div className="text-center mb-6">
          <h3 className="font-heading text-xl text-amber-400">Vision To Venture Summary</h3>
          <p className="text-sm text-gray-400">Domain: {domain} | Strategy: {decisions.strategy}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Target:</span> <span className="text-gray-300">{decisions.targetAudience}</span></div>
          <div><span className="text-gray-500">Reach:</span> <span className="text-gray-300">{decisions.reach?.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Budget:</span> <span className="text-gray-300">₹{Number(decisions.budget || 0).toLocaleString()}/mo</span></div>
          <div><span className="text-gray-500">Team:</span> <span className="text-gray-300">{decisions.team.length} roles</span></div>
          <div><span className="text-gray-500">Community:</span> <span className="text-gray-300">{scores.community}/100</span></div>
          <div><span className="text-gray-500">Finance:</span> <span className="text-gray-300">{scores.finance}/100</span></div>
          <div><span className="text-gray-500">Government:</span> <span className="text-gray-300">{scores.government}/100</span></div>
          <div><span className="text-gray-500">Partnerships:</span> <span className="text-gray-300">{scores.partnerships}/100</span></div>
        </div>
        {archetype && (
          <p className="text-center text-amber-400 font-heading mt-4">"{archetype.title}"</p>
        )}
      </div>

      <button onClick={() => window.print()} className="btn-primary w-full mt-6 no-print">
        🖨️ Download Summary (Print)
      </button>
    </div>
  );
}
