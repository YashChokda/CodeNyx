const API = 'http://localhost:5000/api/gemini';
const post = (endpoint, body) =>
  fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => { if (!r.ok) throw new Error('API error'); return r.json(); });

export const getHiddenCons = (data) => post('/hidden-cons', data);
export const getRipple = (data) => post('/ripple', data);
export const getSuggestions = (data) => post('/suggestions', data);
export const getMentorLetter = (data) => post('/mentor-letter', data);
export const getGovChat = (data) => post('/gov-chat', data);
export const getCrisisEval = (data) => post('/crisis-eval', data);
export const getArchetype = (data) => post('/archetype', data);
export const getEcosystemNode = (data) => post('/ecosystem-node', data);
