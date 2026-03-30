const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// ── Robust JSON extractor ────────────────────────────────────────────────────
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Strip markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}

  // Try to find JSON array or object in the text
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch {}
  }

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }

  // Fix single quotes to double quotes
  const fixedQuotes = cleaned
    .replace(/'/g, '"')
    .replace(/(\w)"(\w)/g, "$1'$2"); // restore apostrophes in words
  try { return JSON.parse(fixedQuotes); } catch {}

  const arrayMatch2 = fixedQuotes.match(/\[[\s\S]*\]/);
  if (arrayMatch2) {
    try { return JSON.parse(arrayMatch2[0]); } catch {}
  }

  const objMatch2 = fixedQuotes.match(/\{[\s\S]*\}/);
  if (objMatch2) {
    try { return JSON.parse(objMatch2[0]); } catch {}
  }

  throw new Error('Could not parse AI response as JSON');
}

// ── AI Client factory ────────────────────────────────────────────────────────
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');
  return new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
}

function getMistralClient() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not configured');
  return new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' });
}

// ── Call AI with retry and fallback ──────────────────────────────────────────
async function callAI(prompt, retries = 2) {
  const providers = [
    { name: 'Groq', getClient: getGroqClient, model: 'llama-3.3-70b-versatile' },
    { name: 'Mistral', getClient: getMistralClient, model: 'mistral-small-latest' },
  ];

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = provider.getClient();
        const resp = await client.chat.completions.create({
          model: provider.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 1200,
        });
        const text = resp.choices[0].message.content;
        return text;
      } catch (err) {
        console.error(`[${provider.name}] attempt ${attempt + 1} failed:`, err.message);
        if (attempt === retries) continue; // try next provider
        await new Promise(r => setTimeout(r, 300)); // brief wait before retry
      }
    }
  }
  throw new Error('All AI providers failed');
}

// ── Fast AI call (single provider, no retry) ─────────────────────────────────
async function callAIFast(prompt) {
  const client = getGroqClient();
  const resp = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 1000,
  });
  return resp.choices[0].message.content;
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/hidden-cons
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/hidden-cons', async (req, res) => {
  try {
    const { problem, idea, domain } = req.body;
    if (!problem || !idea || !domain) return res.status(400).json({ error: 'Missing fields' });

    const prompt = `You are a veteran social entrepreneur mentor with 20 years of experience in ${domain} in India. A young innovator has shared:
Problem: ${problem}
Idea: ${idea}

Your job is to reveal exactly 4 HIDDEN CONS — real-world operational blindspots that first-time social entrepreneurs in India never anticipate but always encounter. These must NOT be obvious. They must be ground-level, India-specific, and operationally brutal.

IMPORTANT: Return ONLY a valid JSON array with exactly 4 objects. No extra text before or after.
[
  { "title": "short title under 6 words", "description": "exactly 2 sentences explaining why this is a real hidden problem", "severity": "High", "category": "Financial" },
  { "title": "short title under 6 words", "description": "exactly 2 sentences explaining why this is a real hidden problem", "severity": "Medium", "category": "Operational" },
  { "title": "short title under 6 words", "description": "exactly 2 sentences explaining why this is a real hidden problem", "severity": "High", "category": "Community" },
  { "title": "short title under 6 words", "description": "exactly 2 sentences explaining why this is a real hidden problem", "severity": "Low", "category": "Government" }
]
severity must be "High" or "Medium" or "Low". category must be "Financial" or "Operational" or "Community" or "Government". Return ONLY the JSON array.`;

    const raw = await callAI(prompt);
    const data = extractJSON(raw);

    // Validate it's an array of 4 items
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Response is not a valid array');
    }

    // Normalize each con
    const cons = data.slice(0, 4).map((con, i) => ({
      title: con.title || `Hidden Con ${i + 1}`,
      description: con.description || 'This is a critical blindspot that needs attention.',
      severity: ['High', 'Medium', 'Low'].includes(con.severity) ? con.severity : 'Medium',
      category: ['Financial', 'Operational', 'Community', 'Government'].includes(con.category) ? con.category : 'Operational',
    }));

    res.json({ cons });
  } catch (err) {
    console.error('/hidden-cons error:', err.message);
    // Return fallback data so the UI doesn't break
    res.json({
      cons: [
        { title: 'Hidden Regulatory Compliance Costs', description: 'Most first-time founders underestimate the licensing fees and legal costs in India. State-level variations mean you might pay 3-5x more than budgeted.', severity: 'High', category: 'Financial' },
        { title: 'Local Gatekeeper Resistance', description: 'Village-level power structures often resist outside intervention regardless of intent. Without local intermediaries, your initiative will be blocked informally.', severity: 'High', category: 'Community' },
        { title: 'Staff Retention in Tier-3 Cities', description: 'Trained field workers in small towns frequently leave for government jobs with better benefits. You will face 40-60% annual turnover in your core team.', severity: 'Medium', category: 'Operational' },
        { title: 'Government Scheme Overlap Issues', description: 'Your initiative may unknowingly duplicate an existing government scheme which creates bureaucratic friction. Officials may view your effort as competition rather than complement.', severity: 'Low', category: 'Government' },
      ]
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/ripple
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/ripple', async (req, res) => {
  try {
    const { problem, idea, domain } = req.body;
    const prompt = `You are an NGO operations expert analyzing a social initiative idea.

Domain: ${domain}
Problem: ${problem}
Idea: ${idea}

Analyze this idea and generate scores (0-100) across 4 dimensions:
1. Community Trust — how much will local communities trust and adopt this
2. Financial Viability — how financially sustainable is this approach
3. Government Relations — how favorable is this to government bodies and policy
4. Partnership Potential — how attractive is this to NGOs, corporates, and allies

For each score give a 1-sentence explanation, one risk, and one improvement action.

Return ONLY this JSON (no other text):
{
  "scores": { "community": 65, "finance": 50, "government": 55, "partnerships": 60 },
  "explanations": { "community": "sentence", "finance": "sentence", "government": "sentence", "partnerships": "sentence" },
  "risks": { "community": "sentence", "finance": "sentence", "government": "sentence", "partnerships": "sentence" },
  "improvements": { "community": "sentence", "finance": "sentence", "government": "sentence", "partnerships": "sentence" },
  "overall_viability": 58,
  "viability_label": "Needs Work"
}
viability_label must be "High Potential" or "Needs Work" or "Risky" or "Critical Issues". Return ONLY JSON.`;

    const raw = await callAIFast(prompt);
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('/ripple error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/mentor
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/mentor', async (req, res) => {
  try {
    const { problem, idea, domain, rippleScores } = req.body;
    const scores = rippleScores || { community: 50, finance: 50, government: 50, partnerships: 50 };
    const prompt = `You are a ghost mentor — a legendary social entrepreneur who built and failed multiple NGOs across India before finally succeeding. You speak directly, sometimes harshly, but always with deep care for the young founder.

The user is working in ${domain}, solving: ${problem}
Their idea: ${idea}
Their current ripple scores: Community ${scores.community}, Finance ${scores.finance}, Government ${scores.government}, Partnerships ${scores.partnerships}

Give them a mentor message. Return ONLY this JSON (no other text):
{
  "opening": "one sentence gut reaction",
  "strength": "single strongest aspect",
  "fatal_flaw": "one thing most likely to kill this idea",
  "counterintuitive": "one piece of unexpected advice",
  "immediate_action": "single most important thing to do in next 7 days",
  "mentor_score": 72
}`;

    const raw = await callAIFast(prompt);
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('/mentor error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/mentor-chat
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/mentor-chat', async (req, res) => {
  try {
    const { problem, idea, domain, question, mentorContext } = req.body;
    const client = getGroqClient();
    const resp = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a ghost mentor — a legendary social entrepreneur. You are having a follow-up conversation with a young founder.

Context:
- Domain: ${domain}
- Problem they're solving: ${problem}
- Their idea: ${idea}
- Your previous advice: ${JSON.stringify(mentorContext)}

Their follow-up question: "${question}"

Answer in 3-5 sentences. Be direct, specific, and in character as a seasoned mentor. Do NOT return JSON — just plain text.`
      }],
      temperature: 0.7,
      max_tokens: 500,
    });
    const answer = resp.choices[0].message.content.trim();
    res.json({ answer });
  } catch (err) {
    console.error('/mentor-chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/budget-check
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/budget-check', async (req, res) => {
  try {
    const { idea, domain, budgetBreakdown } = req.body;
    const prompt = `You are a financial advisor for Indian NGOs and social enterprises.

Initiative: ${idea}
Domain: ${domain}
Monthly Budget Breakdown: ${JSON.stringify(budgetBreakdown)}

Is this budget realistic for this type of initiative in India? Give 3 specific budget optimization tips.

Return ONLY this JSON (no other text):
{
  "assessment": "one sentence overall assessment",
  "realistic": true,
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    const raw = await callAIFast(prompt);
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('/budget-check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/gov-guide
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/gov-guide', async (req, res) => {
  try {
    const { question } = req.body;
    const client = getGroqClient();
    const resp = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are India's most knowledgeable guide on government procedures for NGOs, social enterprises, and non-profit organizations.

Answer ONLY questions related to:
- NGO/Trust/Section 8 company registration
- Tax exemptions (80G, 12A)
- FCRA and foreign funding compliance
- Government schemes and grants (NITI Aayog, Ministry schemes)
- State-level permissions and local body approvals
- CSR funding eligibility

User question: "${question}"

Format your answer as:
SUMMARY: One sentence answer
STEPS: Numbered list of exact steps
KEY DOCUMENTS: Bullet list of required documents
TIME & COST: Estimated time and approximate cost
PRO TIP: One insider tip that most people miss
OFFICIAL LINK: Relevant government website URL if applicable

Keep total response under 200 words. Be specific to India.`
      }],
      temperature: 0.7,
      max_tokens: 800,
    });
    const answer = resp.choices[0].message.content.trim();
    res.json({ answer });
  } catch (err) {
    console.error('/gov-guide error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/gemini/archetype
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/archetype', async (req, res) => {
  try {
    const { scores, domain, iterationCount } = req.body;
    const prompt = `Based on these decisions and scores, give this social entrepreneur a creative leadership archetype title (like "The Reluctant Pragmatist" or "The Community Champion") and a 2-sentence description of their leadership style.

Domain: ${domain}
Scores: ${JSON.stringify(scores)}
Refinement iterations: ${iterationCount}

Return ONLY this JSON (no other text):
{
  "title": "The [Creative Title]",
  "description": "Two sentences describing their leadership style."
}`;

    const raw = await callAIFast(prompt);
    const data = extractJSON(raw);
    res.json(data);
  } catch (err) {
    console.error('/archetype error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
