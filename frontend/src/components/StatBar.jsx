export default function StatBar({ label, value, color = '#ffb347', explanation }) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, animation: 'barFill 1.2s ease forwards', '--bar-width': `${value}%` }} />
      </div>
      {explanation && <p className="text-xs text-gray-400 mt-1.5 italic">{explanation}</p>}
    </div>
  );
}
