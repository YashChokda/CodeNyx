import { Radar, RadarChart as RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarChart({ scores }) {
  const data = [
    { subject: 'Impact', value: scores.impact || 0 },
    { subject: 'Finance', value: scores.finance || 0 },
    { subject: 'Sustainability', value: scores.sustainability || 0 },
    { subject: 'Efficiency', value: scores.efficiency || 0 },
  ];
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <RC cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#2a2a3e" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Radar name="Scores" dataKey="value" stroke="#ffb347" fill="#ffb347" fillOpacity={0.25} strokeWidth={2} />
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
