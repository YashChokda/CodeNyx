const colorMap = { green: '#22c55e', red: '#ef4444', orange: '#f97316', yellow: '#eab308' };
const iconMap = { green: '🚀', red: '⚠️', orange: '⚡', yellow: '🔶' };

export default function OutcomeCard({ title, description, color = 'green' }) {
  const c = colorMap[color] || colorMap.green;
  return (
    <div className="glass-card animate-slide-up" style={{ borderColor: `${c}44` }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{iconMap[color] || '📊'}</span>
        <h4 className="font-heading text-lg" style={{ color: c }}>{title}</h4>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
