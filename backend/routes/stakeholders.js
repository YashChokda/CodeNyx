const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { CohereClient } = require('cohere-ai');

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

// ── API 1: Groq (replacing Gemini) ───────────────────────────────────────────
async function callGroqPrimaryStakeholders(domain, problem, idea) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  const stakeholders = [
    { name: 'Government Policy Advisor', role: 'a cautious bureaucrat who cares about compliance and national policy alignment' },
    { name: 'Rural Community Leader', role: 'a practical village head who represents grassroots needs and local trust' },
    { name: 'Impact Investor', role: 'a data-driven investor who only cares about scale, measurable impact, and financial returns' },
  ];

  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.6, max_tokens: 400,
      });
      const text = resp.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return { reaction: 'Unable to connect.', concern: e.message, support_condition: 'Fix API', verdict: 'SKEPTICAL', stakeholder_name: s.name, stakeholder_role: s.role };
    }
  }));
}

// ── API 2: Groq ───────────────────────────────────────────────────────────────
async function callGroqStakeholders(domain, problem, idea) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  const stakeholders = [
    { name: 'Corporate CSR Head', role: 'a pragmatic corporate executive managing brand reputation and CSR budget targets' },
    { name: 'Young Beneficiary', role: 'a 19-year-old from the target community, skeptical but cautiously hopeful about change' },
    { name: 'Competing NGO Director', role: 'an experienced but territorial NGO head who will candidly point out gaps and overlaps' },
  ];

  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      });
      const text = resp.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return { reaction: 'Unable to connect.', concern: e.message, support_condition: 'Fix API', verdict: 'SKEPTICAL', stakeholder_name: s.name, stakeholder_role: s.role };
    }
  }));
}

// ── API 3: Mistral ────────────────────────────────────────────────────────────
async function callMistralStakeholders(domain, problem, idea) {
  const client = new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1'
  });

  const stakeholders = [
    { name: 'Social Media Influencer', role: 'a digital influencer who cares deeply about virality, public perception, and authentic causes' },
    { name: 'Academic Researcher', role: 'a demanding researcher who requires evidence, citations, and rigorously measurable outcomes' },
    { name: 'Local Journalist', role: 'a sharp local journalist who asks hard questions about transparency, accountability, and real impact' },
  ];

  return Promise.all(stakeholders.map(async (s) => {
    try {
      const resp = await client.chat.completions.create({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      });
      const text = resp.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return { reaction: 'Unable to connect.', concern: e.message, support_condition: 'Fix API', verdict: 'SKEPTICAL', stakeholder_name: s.name, stakeholder_role: s.role };
    }
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
      const resp = await cohere.chat({
        model: 'command-r',
        message: buildStakeholderPrompt(s.name, s.role, domain, problem, idea),
        temperature: 0.7,
      });
      const text = (resp.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return { reaction: 'Unable to connect.', concern: e.message, support_condition: 'Fix API', verdict: 'SKEPTICAL', stakeholder_name: s.name, stakeholder_role: s.role };
    }
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
      const resp = await client.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: buildStakeholderPrompt(s.name, s.role, domain, problem, idea) }],
        temperature: 0.7, max_tokens: 400,
      });
      const text = resp.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return { reaction: 'Unable to connect.', concern: e.message, support_condition: 'Fix API', verdict: 'SKEPTICAL', stakeholder_name: s.name, stakeholder_role: s.role };
    }
  }));
}

// ── POST /api/stakeholders ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { domain, problem, idea } = req.body;
    if (!domain || !problem || !idea) return res.status(400).json({ error: 'Missing fields' });

    // Call all 5 APIs in parallel
    const [groqPrimaryResults, groqResults, mistralResults, cohereResults, openrouterResults] =
      await Promise.all([
        callGroqPrimaryStakeholders(domain, problem, idea),
        callGroqStakeholders(domain, problem, idea),
        callMistralStakeholders(domain, problem, idea),
        callCohereStakeholders(domain, problem, idea),
        callOpenRouterStakeholders(domain, problem, idea),
      ]);

    const stakeholders = [
      ...groqPrimaryResults,
      ...groqResults,
      ...mistralResults,
      ...cohereResults,
      ...openrouterResults,
    ];

    res.json({ stakeholders });
  } catch (err) {
    console.error('/stakeholders error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
