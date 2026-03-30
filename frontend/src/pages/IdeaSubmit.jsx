import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getHiddenCons } from '../api/gemini';
import Spinner from '../components/Spinner';

const severityColor = { High: '#ef4444', Medium: '#f97316', Low: '#eab308' };

export default function IdeaSubmit() {
  const { domain, problem, setProblem, idea, setIdea, hiddenCons, setHiddenCons } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(hiddenCons.length > 0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cons = await getHiddenCons({ domain, problem, idea });
      setHiddenCons(cons);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error getting AI analysis. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <span className="text-xs uppercase tracking-widest text-amber-400/60">{domain}</span>
        <h1 className="font-heading text-3xl text-amber-400 mt-1 mb-2">Submit Your Idea</h1>
        <p className="text-gray-400">Tell us about the problem you want to solve</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div>
            <label className="block text-sm text-gray-300 mb-2">What problem are you solving?</label>
            <textarea value={problem} onChange={e => setProblem(e.target.value)}
              className="input-field min-h-[120px] resize-y" required placeholder="Describe the real-world problem..." />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">What is your solution idea?</label>
            <textarea value={idea} onChange={e => setIdea(e.target.value)}
              className="input-field min-h-[120px] resize-y" required placeholder="Describe your solution approach..." />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze with AI ✦'}
          </button>
        </form>
      ) : loading ? (
        <Spinner text="Uncovering hidden blindspots..." />
      ) : (
        <div className="space-y-5">
          <h2 className="font-heading text-xl text-amber-400 animate-fade-in">⚠️ Hidden Cons Revealed</h2>
          <div className="grid gap-4">
            {hiddenCons.map((con, i) => (
              <div key={i} className={`glass-card animate-slide-up stagger-${i + 1}`}
                style={{ borderLeftWidth: 4, borderLeftColor: severityColor[con.severity] || '#ffb347' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-base text-gray-200">{con.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${severityColor[con.severity]}22`, color: severityColor[con.severity] }}>
                    {con.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{con.description}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/decisions')} className="btn-primary w-full mt-6">
            Continue to Decision Phase →
          </button>
        </div>
      )}
    </div>
  );
}
