import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSuggestions, getMentorLetter } from '../api/gemini';
import Spinner from '../components/Spinner';

const peers = [
  { name: 'Priya Sharma', domain: 'Healthcare', idea: 'Mobile health clinics for tribal areas', avatar: '👩‍⚕️' },
  { name: 'Arjun Mehta', domain: 'Education', idea: 'AI tutoring for rural schools', avatar: '👨‍💻' },
  { name: 'Kavitha Nair', domain: 'Women Empowerment', idea: 'Skill centres for domestic workers', avatar: '👩‍🏫' },
];

export default function Feedback() {
  const { rippleScores, domain, problem, decisions } = useApp();
  const [tab, setTab] = useState(0);
  const [suggestions, setSuggestions] = useState(null);
  const [letter, setLetter] = useState(null);
  const [loadingS, setLoadingS] = useState(false);
  const [loadingL, setLoadingL] = useState(false);

  useEffect(() => {
    if (tab === 0 && !suggestions && rippleScores) fetchSuggestions();
    if (tab === 1 && !letter) fetchLetter();
  }, [tab]);

  const fetchSuggestions = async () => {
    setLoadingS(true);
    try {
      const data = await getSuggestions({ scores: rippleScores });
      setSuggestions(data);
    } catch (e) { console.error(e); }
    finally { setLoadingS(false); }
  };

  const fetchLetter = async () => {
    setLoadingL(true);
    try {
      const data = await getMentorLetter({ domain, problem, strategy: decisions.strategy, budget: decisions.budget });
      setLetter(data.letter);
    } catch (e) { console.error(e); }
    finally { setLoadingL(false); }
  };

  const tabs = ['AI Suggestions', 'Mentor Feedback', 'Peer Collaboration'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-heading text-3xl text-amber-400 mb-2">Feedback Layer</h1>
        <p className="text-gray-400">Insights to strengthen your venture</p>
      </div>

      <div className="flex border-b border-dark-border mb-8">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 pb-3 text-sm font-medium transition-all ${tab === i ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-4">
          {loadingS ? <Spinner text="Generating suggestions..." /> : suggestions ? suggestions.map((s, i) => (
            <div key={i} className={`glass-card animate-slide-up stagger-${i + 1}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">{s.dimension}</span>
                <span className={`text-xs font-medium ${s.impact === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>{s.impact} Impact</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{s.suggestion}</p>
            </div>
          )) : <p className="text-gray-500 text-center">No data yet.</p>}
        </div>
      )}

      {tab === 1 && (
        <div>
          {loadingL ? <Spinner text="Writing your mentor letter..." /> : letter ? (
            <div className="glass-card animate-fade-in" style={{ borderColor: 'rgba(255,179,71,0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✉️</span>
                <h3 className="font-heading text-lg text-amber-400">From Your Mentor</h3>
              </div>
              <p className="text-gray-300 leading-relaxed italic whitespace-pre-wrap">{letter}</p>
              <p className="text-right text-sm text-amber-400/60 mt-4">— Your AI Mentor</p>
            </div>
          ) : <p className="text-gray-500 text-center">Loading...</p>}
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-4">Innovators working on similar domains near you:</p>
          {peers.map((p, i) => (
            <div key={i} className={`glass-card flex items-center justify-between animate-slide-up stagger-${i + 1}`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{p.avatar}</span>
                <div>
                  <h4 className="text-gray-200 font-medium">{p.name}</h4>
                  <p className="text-xs text-amber-400/70">{p.domain}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.idea}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 rounded-lg border border-amber-400/40 text-amber-400 text-sm hover:bg-amber-400/10 transition-all">
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
