import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getGovChat, getCrisisEval } from '../api/gemini';
import CrisisCard from '../components/CrisisCard';
import Spinner from '../components/Spinner';

const allCrises = [
  { crisis: 'A key donor just withdrew ₹2,00,000 from your project mid-month', options: ['Cut team salaries temporarily', 'Launch emergency crowdfunding campaign', 'Pause non-critical operations and renegotiate'] },
  { crisis: 'Your field coordinator quit 3 days before a major community event', options: ['Cancel the event and reschedule', 'Step in personally and lead the event', 'Promote a junior team member as interim coordinator'] },
  { crisis: 'The government changed a policy that makes your program non-compliant', options: ['Shut down operations until policy is clear', 'Hire a legal advisor immediately to assess impact', 'Pivot your program model to comply with new rules'] },
  { crisis: 'A social media post about your NGO went viral for the wrong reasons', options: ['Ignore it and let it blow over', 'Issue a detailed public statement immediately', 'Engage a PR firm and respond strategically'] },
  { crisis: 'Your app crashed during your biggest outreach campaign', options: ['Switch to manual processes immediately', 'Push a hotfix and notify users about the issue', 'Postpone the campaign until tech is stable'] },
  { crisis: 'A competing NGO started operating in your area offering cash incentives', options: ['Match their cash incentives to retain community', 'Double down on trust-building and unique value', 'Propose a collaboration with the competing NGO'] },
];

export default function Advanced() {
  const { domain } = useApp();
  const [module, setModule] = useState(null);

  // GOV CHAT STATE
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef(null);

  // CRISIS STATE
  const [crises] = useState(() => {
    const shuffled = [...allCrises].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  });
  const [crisisResults, setCrisisResults] = useState({});
  const [crisisLoading, setCrisisLoading] = useState({});

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await getGovChat({ message: input, history });
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, something went wrong. Try again.' }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleCrisis = async (idx, choice) => {
    setCrisisLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const data = await getCrisisEval({ crisis: crises[idx].crisis, choice, domain });
      setCrisisResults(prev => ({ ...prev, [idx]: data }));
    } catch (e) { console.error(e); }
    setCrisisLoading(prev => ({ ...prev, [idx]: false }));
  };

  if (!module) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-heading text-3xl text-amber-400 mb-2">Advanced Modules</h1>
          <p className="text-gray-400">Unlocked after your first simulation</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <button onClick={() => setModule('gov')} className="glass-card text-left animate-slide-up group">
            <span className="text-4xl mb-3 block">🏛️</span>
            <h3 className="font-heading text-lg text-amber-400 mb-1">Government Approval Simulator</h3>
            <p className="text-sm text-gray-400">Ask questions about NGO registration, permits, and compliance</p>
          </button>
          <button onClick={() => setModule('crisis')} className="glass-card text-left animate-slide-up stagger-2 group">
            <span className="text-4xl mb-3 block">🔥</span>
            <h3 className="font-heading text-lg text-amber-400 mb-1">Risk Management Scenarios</h3>
            <p className="text-sm text-gray-400">Face real crisis scenarios and test your decision-making</p>
          </button>
        </div>
      </div>
    );
  }

  if (module === 'gov') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => setModule(null)} className="text-sm text-gray-500 hover:text-amber-400 mb-4 transition-colors">← Back to modules</button>
        <h1 className="font-heading text-2xl text-amber-400 mb-6">🏛️ Government Approval Simulator</h1>
        <div className="glass-card flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-96">
            {messages.length === 0 && <p className="text-gray-500 text-sm italic">Ask about NGO registration, permits, compliance, or government schemes...</p>}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-amber-400/20 text-amber-300 rounded-br-sm' : 'bg-dark-lighter text-gray-300 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && <div className="flex justify-start"><div className="px-4 py-2 bg-dark-lighter rounded-2xl"><span className="text-amber-400 animate-pulse text-sm">Thinking...</span></div></div>}
            <div ref={chatEnd} />
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="input-field flex-1" placeholder="Type your question..." />
            <button onClick={sendMessage} disabled={chatLoading} className="btn-primary px-6">Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => setModule(null)} className="text-sm text-gray-500 hover:text-amber-400 mb-4 transition-colors">← Back to modules</button>
      <h1 className="font-heading text-2xl text-amber-400 mb-6">🔥 Risk Management Scenarios</h1>
      {crises.map((c, i) => (
        <CrisisCard key={i} crisis={c.crisis} options={c.options}
          onSubmit={(choice) => handleCrisis(i, choice)}
          result={crisisResults[i]} loading={crisisLoading[i]} />
      ))}
    </div>
  );
}
