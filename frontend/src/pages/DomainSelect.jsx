import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const domains = [
  { name: 'Mental Health', icon: '🧠', desc: 'Address psychological wellness and reduce stigma in communities' },
  { name: 'Education', icon: '📚', desc: 'Transform learning access and quality for underserved populations' },
  { name: 'Sustainability', icon: '🌱', desc: 'Build eco-friendly solutions for a greener future' },
  { name: 'Rural Development', icon: '🏘️', desc: 'Empower villages with infrastructure and opportunity' },
  { name: 'Women Empowerment', icon: '💪', desc: 'Drive gender equality and uplift women across India' },
  { name: 'Healthcare', icon: '🏥', desc: 'Improve medical access in remote and underserved regions' },
];

export default function DomainSelect() {
  const { user, domain, setDomain } = useApp();
  const navigate = useNavigate();

  const handleSelect = async (d) => {
    setDomain(d.name);
    try {
      if (user?.uid) await updateDoc(doc(db, 'users', user.uid), { domain: d.name });
    } catch (e) { console.error(e); }
    navigate('/idea');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-heading text-3xl md:text-4xl text-amber-400 mb-2">Choose Your Domain</h1>
        <p className="text-gray-400">Select the area where you want to create real-world impact</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {domains.map((d, i) => (
          <button key={d.name} onClick={() => handleSelect(d)}
            className={`glass-card text-left group stagger-${(i % 4) + 1} animate-slide-up cursor-pointer ${domain === d.name ? 'border-amber-400/60 animate-pulse-glow' : ''}`}>
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{d.icon}</span>
            <h3 className="font-heading text-lg text-amber-400 mb-1">{d.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{d.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
