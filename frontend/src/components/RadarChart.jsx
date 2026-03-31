import React from 'react';
import { Radar, RadarChart as RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarChart({ scores }) {
  if (!scores) return null;

  const data = [
    { subject: 'Community', value: scores.community || 0, fullMark: 100 },
    { subject: 'Finance', value: scores.finance || 0, fullMark: 100 },
    { subject: 'Government', value: scores.government || 0, fullMark: 100 },
    { subject: 'Partnerships', value: scores.partnerships || 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RC cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,179,71,0.12)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Scores"
            dataKey="value"
            stroke="#ffb347"
            fill="#ffb347"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
