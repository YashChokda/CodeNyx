import { createContext, useContext, useState } from 'react';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [domain, setDomain] = useState('');
  const [problem, setProblem] = useState('');
  const [idea, setIdea] = useState('');
  const [hiddenCons, setHiddenCons] = useState([]);
  const [decisions, setDecisions] = useState({
    targetAudience: '', reach: 1000, language: '',
    resources: { people: 25, technology: 25, outreach: 25, operations: 25 },
    team: [], budget: '', strategy: ''
  });
  const [rippleScores, setRippleScores] = useState(null);
  const [rippleExplanations, setRippleExplanations] = useState(null);
  const [mentorGhost, setMentorGhost] = useState('');
  const [iterationCount, setIterationCount] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  return (
    <AppContext.Provider value={{
      user, setUser, domain, setDomain, problem, setProblem,
      idea, setIdea, hiddenCons, setHiddenCons,
      decisions, setDecisions, rippleScores, setRippleScores,
      rippleExplanations, setRippleExplanations,
      mentorGhost, setMentorGhost,
      iterationCount, setIterationCount,
      simulationComplete, setSimulationComplete,
    }}>
      {children}
    </AppContext.Provider>
  );
}
