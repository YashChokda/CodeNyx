import { useState } from 'react';

export default function CrisisCard({ crisis, options, onSubmit, result, loading }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="glass-card animate-slide-up mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <p className="text-gray-200 font-medium">{crisis}</p>
      </div>
      <div className="space-y-2 mb-4">
        {options.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)} disabled={!!result}
            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
              selected === i ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-dark-border bg-dark-lighter text-gray-400 hover:border-gray-500'
            } ${result ? 'opacity-60 cursor-default' : ''}`}>
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && !result && (
        <button onClick={() => onSubmit(options[selected])} disabled={loading} className="btn-primary text-sm px-6 py-2">
          {loading ? 'Evaluating...' : 'Submit Response'}
        </button>
      )}
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-dark-lighter border border-dark-border animate-fade-in">
          <p className="text-sm text-gray-300 mb-2"><strong className="text-amber-400">Evaluation:</strong> {result.evaluation}</p>
          <p className="text-sm text-gray-300 mb-2"><strong className="text-amber-400">Consequence:</strong> {result.consequence}</p>
          <p className="text-sm text-gray-300"><strong className="text-amber-400">Better Alternative:</strong> {result.better_alternative}</p>
        </div>
      )}
    </div>
  );
}
