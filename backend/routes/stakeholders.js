const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { CohereClient } = require('cohere-ai');

// ── Timeout wrapper — returns fallback after 15s ─────────────────────────────
function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), ms)),
  ]);
}

// ── Helper: build stakeholder prompt ─────────────────────────────────────────
function buildStakeholderPrompt(name, role, domain, problem, idea) {
  return `You are ${name} — ${role}. You have just heard about a social initiative:
Domain: ${domain}
Problem being solved: ${problem}
Proposed solution: ${idea}

Based on your specific perspective and expertise, respond with:
1. Your initial reaction (1 sentence — honest and in character)
2. Your biggest concern about this idea (1 sentence)
3. What would make you want to support or engage with this (1 sentence)
4. Your verdict: INTERESTED / SKEPTICAL / OPPOSED (pick one)

Return ONLY this JSON:
{
  "reaction": "sentence",
  "concern": "sentence",
  "support_condition": "sentence",
  "verdict": "INTERESTED",
  "stakeholder_name": "${name}",
  "stakeholder_role": "${role}"
}`;
}

// ── Fallback stakeholder response ─────────────────────────────────────────────
function fallback(name, role, reason) {
  return { reaction: 'Unable to reach this stakeholder at the moment.', concern: reason, support_condition: 'Retry later', verdict: 'SKEPTICAL', stakeholder_name: name, stakeholder_role: role };
}

// ── Parse AI response safely ──────────────────────────────────────────────────
function parseResponse(text, name, role) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    data.stakeholder_name = data.stakeholder_name || name;
    data.stakeholder_role = data.stakeholder_role || role;
    if (!['INTERESTED', 'SKEPTICAL', 'OPPOSED'].includes(data.verdict)) data.verdict = 'SKEPTICAL';
    return data;
  } catch {
    return fallback(name, role, 'Could not parse response');
  }
}

// ── API 1: Groq (Primary — replacing Gemini) ─────────────────────────────────
async function callGroqPrimaryStakeholders(domain, problem, idea) {
  const client = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' });
  const stakeholders = [
    { name: 'Government Policy Advisor', role: 'a cautious bureaucrat who cares about compliance and national policy alignment' },
    { name: 'Rural Community Leader', role: 'a practical village head who represents grassroots needs and local trust' },
    { name: 'Impact Investor', role: 'a data-driven investor who only cares about scale, measurable impact, and financial returns' },
  ];
  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await withTimeout(client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.6, max_tokens: 400,
      }));
      return parseResponse(resp.choices[0].message.content, s.name, s.role);
    } catch (e) { console.error(`[Groq-Primary] ${s.name}:`, e.message); return fallback(s.name, s.role, e.message); }
  }));
}

// ── API 2: Groq ───────────────────────────────────────────────────────────────
async function callGroqStakeholders(domain, problem, idea) {
  const client = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' });
  const stakeholders = [
    { name: 'Corporate CSR Head', role: 'a pragmatic corporate executive managing brand reputation and CSR budget targets' },
    { name: 'Young Beneficiary', role: 'a 19-year-old from the target community, skeptical but cautiously hopeful about change' },
    { name: 'Competing NGO Director', role: 'an experienced but territorial NGO head who will candidly point out gaps and overlaps' },
  ];
  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await withTimeout(client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      }));
      return parseResponse(resp.choices[0].message.content, s.name, s.role);
    } catch (e) { console.error(`[Groq] ${s.name}:`, e.message); return fallback(s.name, s.role, e.message); }
  }));
}

// ── API 3: Mistral ────────────────────────────────────────────────────────────
async function callMistralStakeholders(domain, problem, idea) {
  const client = new OpenAI({ apiKey: process.env.MISTRAL_API_KEY, baseURL: 'https://api.mistral.ai/v1' });
  const stakeholders = [
    { name: 'Social Media Influencer', role: 'a digital influencer who cares deeply about virality, public perception, and authentic causes' },
    { name: 'Academic Researcher', role: 'a demanding researcher who requires evidence, citations, and rigorously measurable outcomes' },
    { name: 'Local Journalist', role: 'a sharp local journalist who asks hard questions about transparency, accountability, and real impact' },
  ];
  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await withTimeout(client.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      }));
      return parseResponse(resp.choices[0].message.content, s.name, s.role);
    } catch (e) { console.error(`[Mistral] ${s.name}:`, e.message); return fallback(s.name, s.role, e.message); }
  }));
}

// ── API 4: Cohere ─────────────────────────────────────────────────────────────
async function callCohereStakeholders(domain, problem, idea) {
  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  const stakeholders = [
    { name: 'Philanthropist / Donor', role: 'a seasoned donor who has funded 50+ NGOs and is extremely pattern-matched to failure signals' },
    { name: 'Tech Startup Founder', role: 'a tech entrepreneur who wants to build a scalable tech product around social impact ideas' },
    { name: 'Healthcare Professional', role: 'a frontline doctor or public health expert who evaluates community health and wellness angles' },
  ];
  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await withTimeout(cohere.chat({
        model: 'command-r',
        message: buildStakeholderPrompt(s.name, s.role, domain, problem, idea),
        temperature: 0.7,
      }));
      return parseResponse(resp.text || '', s.name, s.role);
    } catch (e) { console.error(`[Cohere] ${s.name}:`, e.message); return fallback(s.name, s.role, e.message); }
  }));
}

// ── API 5: OpenRouter ─────────────────────────────────────────────────────────
async function callOpenRouterStakeholders(domain, problem, idea) {
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: { 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'Vision of Venture' }
  });
  const stakeholders = [
    { name: 'International Development Org', role: 'a global development expert who evaluates SDG alignment and global fundability' },
    { name: 'Local Government Representative', role: 'a politically cautious elected representative who is constituency-minded and risk averse' },
    { name: 'Former Social Entrepreneur', role: 'a social entrepreneur who tried and failed, giving brutally honest warnings from hard personal experience' },
  ];
  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await withTimeout(client.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      }));
      return parseResponse(resp.choices[0].message.content, s.name, s.role);
    } catch (e) { console.error(`[OpenRouter] ${s.name}:`, e.message); return fallback(s.name, s.role, e.message); }
  }));
}

// ── POST /api/stakeholders ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { domain, problem, idea } = req.body;
    if (!domain || !problem || !idea) return res.status(400).json({ error: 'Missing fields' });

    console.log('[Stakeholders] Calling 5 APIs in parallel...');

    // Each API group has its own timeout — if one group fails, others still return
    const [groqPrimaryResults, groqResults, mistralResults, cohereResults, openrouterResults] =
      await Promise.all([
        callGroqPrimaryStakeholders(domain, problem, idea).catch(() => [fallback('Government Policy Advisor', 'bureaucrat', 'API group failed'), fallback('Rural Community Leader', 'village head', 'API group failed'), fallback('Impact Investor', 'investor', 'API group failed')]),
        callGroqStakeholders(domain, problem, idea).catch(() => [fallback('Corporate CSR Head', 'executive', 'API group failed'), fallback('Young Beneficiary', 'youth', 'API group failed'), fallback('Competing NGO Director', 'NGO head', 'API group failed')]),
        callMistralStakeholders(domain, problem, idea).catch(() => [fallback('Social Media Influencer', 'influencer', 'API group failed'), fallback('Academic Researcher', 'researcher', 'API group failed'), fallback('Local Journalist', 'journalist', 'API group failed')]),
        callCohereStakeholders(domain, problem, idea).catch(() => [fallback('Philanthropist / Donor', 'donor', 'API group failed'), fallback('Tech Startup Founder', 'tech founder', 'API group failed'), fallback('Healthcare Professional', 'doctor', 'API group failed')]),
        callOpenRouterStakeholders(domain, problem, idea).catch(() => [fallback('International Development Org', 'global expert', 'API group failed'), fallback('Local Government Representative', 'politician', 'API group failed'), fallback('Former Social Entrepreneur', 'ex-founder', 'API group failed')]),
      ]);

    const stakeholders = [...groqPrimaryResults, ...groqResults, ...mistralResults, ...cohereResults, ...openrouterResults];
    console.log(`[Stakeholders] Done — ${stakeholders.length} responses, ${stakeholders.filter(s => s.verdict === 'INTERESTED').length} interested`);

    res.json({ stakeholders });
  } catch (err) {
    console.error('/stakeholders error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
