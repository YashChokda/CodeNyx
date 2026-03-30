import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRipple } from '../api/gemini';
import StatBar from '../components/StatBar';
import MentorGhost from '../components/MentorGhost';
import OutcomeCard from '../components/OutcomeCard';
import Spinner from '../components/Spinner';

export default function Simulation() {
  const { domain, decisions, hiddenCons, rippleScores, setRippleScores, rippleExplanations, setRippleExplanations, mentorGhost, setMentorGhost, setSimulationComplete, iterationCount, setIterationCount } = useApp();
  const [loading, setLoading] = useState(!rippleScores);
  const navigate = useNavigate();

  useEffect(() => {
    if (!rippleScores) runSimulation();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await getRipple({ domain, decisions, cons: hiddenCons });
      setRippleScores(data.ripple);
      setRippleExplanations(data.ripple_explanations);
      setMentorGhost(data.mentor_ghost);
      setSimulationComplete(true);
      setIterationCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Error running simulation. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const getOutcomes = () => {
    if (!rippleScores) return [];
    const outcomes = [];
    if (rippleScores.finance > 60 && rippleScores.community > 60)
      outcomes.push({ title: 'Strong Growth Trajectory', desc: 'Your financial and community foundations are solid for scaling.', color: 'green' });
    if (rippleScores.finance < 40)
      outcomes.push({ title: 'Financial Loss Risk', desc: 'Your budget and resource allocation may not sustain operations.', color: 'red' });
    if (rippleScores.community < 40)
      outcomes.push({ title: 'Poor Community Adoption', desc: 'Community trust needs significant improvement for success.', color: 'orange' });
    if (rippleScores.community < 50 && rippleScores.finance < 50 && rippleScores.government < 50 && rippleScores.partnerships < 50)
      outcomes.push({ title: 'Sustainability Issues Ahead', desc: 'All dimensions need strengthening to avoid project failure.', color: 'red' });
    if (outcomes.length === 0)
      outcomes.push({ title: 'Balanced Approach', desc: 'Your decisions show a mixed profile. Refine to optimize impact.', color: 'yellow' });
    return outcomes;
  };

  const handleRefine = () => {
    setRippleScores(null);
    setRippleExplanations(null);
    navigate('/decisions');
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20"><Spinner text="Running Ripple Factor Simulation..." /></div>;

  const scores = rippleScores;
  const expl = rippleExplanations;
  const colors = { community: '#4ecdc4', finance: '#22c55e', government: '#a78bfa', partnerships: '#ffb347' };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-heading text-3xl text-amber-400 mb-2">Ripple Factor Simulation</h1>
        <p className="text-gray-400">See how your decisions ripple across key dimensions</p>
      </div>

      <div className="glass-card mb-6 animate-slide-up">
        <StatBar label="Community Trust" value={scores.community} color={colors.community} explanation={expl?.community} />
        <StatBar label="Financial Health" value={scores.finance} color={colors.finance} explanation={expl?.finance} />
        <StatBar label="Government Relations" value={scores.government} color={colors.government} explanation={expl?.government} />
        <StatBar label="Partnership Strength" value={scores.partnerships} color={colors.partnerships} explanation={expl?.partnerships} />
      </div>

      <MentorGhost message={mentorGhost} />

      <div className="mt-8">
        <h2 className="font-heading text-xl text-amber-400 mb-4">System Outcomes</h2>
        <div className="grid gap-4">
          {getOutcomes().map((o, i) => <OutcomeCard key={i} {...o} />)}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        {iterationCount < 3 && (
          <button onClick={handleRefine} className="flex-1 px-6 py-3 rounded-xl border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-all">
            🔄 Refine Decisions (Iteration {iterationCount}/3)
          </button>
        )}
        <button onClick={() => navigate('/feedback')} className="btn-primary flex-1">Continue to Feedback →</button>
      </div>

      <div className="flex gap-3 mt-3">
        <button onClick={() => navigate('/ecosystem')} className="flex-1 px-6 py-3 rounded-xl border border-dark-border text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all text-sm">
          🗺️ View My Ecosystem
        </button>
        <button onClick={() => navigate('/advanced')} className="flex-1 px-6 py-3 rounded-xl border border-dark-border text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all text-sm">
          ⚡ Advanced Modules
        </button>
      </div>
    </div>
  );
}
