import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DonutChart from '../components/DonutChart';

const audiences = ['Urban Youth', 'Rural Communities', 'Women', 'Children', 'Elderly', 'All'];
const strategies = [
  { name: 'Grassroots Community Building', icon: '🌿', desc: 'Build from the ground up through local trust' },
  { name: 'Digital-First Outreach', icon: '📱', desc: 'Leverage technology and social media for scale' },
  { name: 'Government Partnership', icon: '🏛️', desc: 'Work with government programs and schemes' },
  { name: 'Corporate CSR Funding', icon: '💼', desc: 'Partner with corporations for sustainable funding' },
  { name: 'Crowdfunding', icon: '🤝', desc: 'Rally community and online supporters' },
];
const roles = [
  { name: 'Field Coordinator', cost: 25000 },
  { name: 'Tech Lead', cost: 60000 },
  { name: 'Community Manager', cost: 30000 },
  { name: 'Finance Head', cost: 45000 },
  { name: 'Legal Advisor', cost: 40000 },
];

export default function Decisions() {
  const { decisions, setDecisions, iterationCount } = useApp();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const d = decisions;
  const update = (key, val) => setDecisions(prev => ({ ...prev, [key]: val }));
  const updateRes = (key, val) => {
    const num = Math.max(0, Math.min(100, Number(val)));
    setDecisions(prev => ({ ...prev, resources: { ...prev.resources, [key]: num } }));
  };
  const resTotal = d.resources.people + d.resources.technology + d.resources.outreach + d.resources.operations;
  const teamCost = roles.filter(r => d.team.includes(r.name)).reduce((s, r) => s + r.cost, 0);
  const budgetOk = Number(d.budget) >= teamCost;

  const toggleTeam = (name) => {
    setDecisions(prev => ({
      ...prev,
      team: prev.team.includes(name) ? prev.team.filter(t => t !== name) : [...prev.team, name]
    }));
  };

  const canNext = () => {
    if (step === 1) return d.targetAudience && d.language;
    if (step === 2) return resTotal === 100;
    if (step === 3) return d.team.length > 0;
    if (step === 4) return d.budget;
    if (step === 5) return d.strategy;
    return false;
  };

  const handleFinish = () => navigate('/simulation');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {iterationCount > 0 && (
        <div className="text-center mb-4">
          <span className="text-xs bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full">
            Iteration {iterationCount + 1} of 3
          </span>
        </div>
      )}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-heading text-3xl text-amber-400 mb-2">Decision-Making Phase</h1>
        <p className="text-gray-400">Step {step} of 5</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1,2,3,4,5].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-amber-400' : 'bg-dark-border'}`} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5 animate-slide-up">
          <h2 className="font-heading text-xl text-gray-200">Define Target Audience</h2>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Who will you serve?</label>
            <select value={d.targetAudience} onChange={e => update('targetAudience', e.target.value)} className="input-field">
              <option value="">Select audience</option>
              {audiences.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Estimated reach in Year 1: <span className="text-amber-400 font-bold">{d.reach.toLocaleString()}</span></label>
            <input type="range" min="100" max="100000" step="100" value={d.reach}
              onChange={e => update('reach', Number(e.target.value))}
              className="w-full accent-amber-400" />
            <div className="flex justify-between text-xs text-gray-500"><span>100</span><span>100,000</span></div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Primary language of community</label>
            <input type="text" value={d.language} onChange={e => update('language', e.target.value)}
              className="input-field" placeholder="e.g. Hindi, Tamil, Marathi" />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5 animate-slide-up">
          <h2 className="font-heading text-xl text-gray-200">Resource Allocation</h2>
          <p className="text-sm text-gray-400">Allocate percentages across areas. Must total 100%. Currently: <span className={resTotal === 100 ? 'text-green-400' : 'text-red-400'}>{resTotal}%</span></p>
          {['people', 'technology', 'outreach', 'operations'].map(key => (
            <div key={key}>
              <label className="text-sm text-gray-300 mb-1 block capitalize">{key}: <span className="text-amber-400">{d.resources[key]}%</span></label>
              <input type="range" min="0" max="100" value={d.resources[key]} onChange={e => updateRes(key, e.target.value)} className="w-full accent-amber-400" />
            </div>
          ))}
          <DonutChart data={[
            { name: 'People', value: d.resources.people },
            { name: 'Technology', value: d.resources.technology },
            { name: 'Outreach', value: d.resources.outreach },
            { name: 'Operations', value: d.resources.operations },
          ]} />
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="font-heading text-xl text-gray-200">Build Your Team</h2>
          {roles.map(r => (
            <label key={r.name} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              d.team.includes(r.name) ? 'border-amber-400/50 bg-amber-400/5' : 'border-dark-border bg-dark-card hover:border-gray-500'}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={d.team.includes(r.name)} onChange={() => toggleTeam(r.name)}
                  className="accent-amber-400 w-4 h-4" />
                <span className="text-gray-200">{r.name}</span>
              </div>
              <span className="text-sm text-amber-400/80">₹{r.cost.toLocaleString()}/mo</span>
            </label>
          ))}
          {d.team.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">Total team cost: <span className="text-amber-400 font-bold">₹{teamCost.toLocaleString()}/mo</span></p>
          )}
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-5 animate-slide-up">
          <h2 className="font-heading text-xl text-gray-200">Plan Budget</h2>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Total monthly budget (₹)</label>
            <input type="number" value={d.budget} onChange={e => update('budget', e.target.value)}
              className="input-field" placeholder="e.g. 200000" />
          </div>
          <div className="glass-card">
            <p className="text-sm text-gray-300">Team cost: <span className="text-amber-400 font-bold">₹{teamCost.toLocaleString()}/mo</span></p>
            <p className="text-sm text-gray-300 mt-1">Your budget: <span className="font-bold" style={{ color: budgetOk ? '#22c55e' : '#ef4444' }}>₹{Number(d.budget || 0).toLocaleString()}/mo</span></p>
            {d.budget && !budgetOk && (
              <p className="text-sm text-red-400 mt-2 flex items-center gap-1">⚠️ Budget doesn't cover team costs. You're ₹{(teamCost - Number(d.budget)).toLocaleString()} short.</p>
            )}
            {d.budget && budgetOk && (
              <p className="text-sm text-green-400 mt-2">✅ Budget covers team costs with ₹{(Number(d.budget) - teamCost).toLocaleString()} remaining.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="font-heading text-xl text-gray-200">Choose Strategy</h2>
          <div className="grid gap-3">
            {strategies.map(s => (
              <button key={s.name} onClick={() => update('strategy', s.name)}
                className={`glass-card text-left flex items-center gap-4 ${d.strategy === s.name ? 'border-amber-400/60 animate-pulse-glow' : ''}`}>
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h3 className="text-gray-200 font-medium">{s.name}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="px-6 py-2 rounded-xl border border-dark-border text-gray-400 hover:text-amber-400 hover:border-amber-400/40 transition-all disabled:opacity-30">
          ← Back
        </button>
        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary px-8 py-2">
            Next →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!canNext()} className="btn-primary px-8 py-2">
            Run Simulation ✦
          </button>
        )}
      </div>
    </div>
  );
}
