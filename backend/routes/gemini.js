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

// ── Fast AI call (with fallback + retry for rate limits) ──────────────────────
async function callAIFast(prompt) {
  // Try Groq first (fastest), then Mistral as fallback
  const providers = [
    { name: 'Groq', getClient: getGroqClient, model: 'llama-3.3-70b-versatile' },
    { name: 'Mistral', getClient: getMistralClient, model: 'mistral-small-latest' },
  ];

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const client = provider.getClient();
        const resp = await client.chat.completions.create({
          model: provider.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 1200,
        });
        return resp.choices[0].message.content;
      } catch (err) {
        const isRateLimit = err.status === 429 || err.message?.includes('429');
        console.error(`[callAIFast/${provider.name}] attempt ${attempt + 1}:`, err.message);
        if (isRateLimit && attempt === 0) {
          await new Promise(r => setTimeout(r, 1500)); // wait before retry
          continue;
        }
        break; // try next provider
      }
    }
  }
  throw new Error('All AI providers failed (rate limited)');
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
    // Return fallback data so the UI never breaks
    res.json({
      scores: { community: 55, finance: 45, government: 50, partnerships: 52 },
      explanations: {
        community: 'Community trust is moderate — you need to demonstrate local commitment and cultural sensitivity.',
        finance: 'Financial sustainability needs a clearer revenue model or diversified funding sources.',
        government: 'Government alignment is neutral — compliance and documentation will be key.',
        partnerships: 'Partnership potential exists but requires active outreach and clear value proposition.'
      },
      risks: {
        community: 'Without grassroots validation, adoption may be slower than expected.',
        finance: 'Over-reliance on grants without earned revenue makes you vulnerable to funding gaps.',
        government: 'Regulatory changes or bureaucratic delays can stall operations unexpectedly.',
        partnerships: 'Competing initiatives may divert potential allies and collaborators.'
      },
      improvements: {
        community: 'Run 3 community listening sessions in the first month to build trust.',
        finance: 'Develop at least one earned revenue stream alongside grant funding.',
        government: 'Engage a compliance advisor early to navigate regulatory requirements.',
        partnerships: 'Create a clear partnership deck showing mutual value for potential allies.'
      },
      overall_viability: 50,
      viability_label: 'Needs Work'
    });
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
    // Return fallback mentor data so the UI never breaks
    res.json({
      opening: 'Your idea has heart, but heart alone doesn\'t keep the lights on — let\'s sharpen the edges.',
      strength: 'You clearly understand the problem space and have genuine empathy for the community you want to serve.',
      fatal_flaw: 'You haven\'t validated whether your target beneficiaries actually want this solution in the form you\'re proposing.',
      counterintuitive: 'Stop building and start listening — spend your first month doing nothing but talking to 50 people in your target community.',
      immediate_action: 'Schedule 10 one-on-one conversations with potential beneficiaries this week and ask them what they actually need.',
      mentor_score: 48
    });
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
const GOV_KEYWORDS = [
  'ngo','trust','section 8','80g','12a','fcra','foreign fund','register',
  'registration','permit','license','welfare','charity','nonprofit','non-profit',
  'tax','government','scheme','grant','csr','niti aayog','ministry','compliance',
  'mca','roc','pan','gst','social enterprise','legal','society','foundation',
  'community program','microfinance','darpan','volunteer','initiative','bylaw',
  'memorandum','startup india','udyam','swachh','pmay',
];
function isGovRelated(q) {
  const lower = q.toLowerCase();
  return GOV_KEYWORDS.some(kw => lower.includes(kw));
}

router.post('/gov-guide', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a valid question.' });
    }

    // Off-topic guard — return polite refusal instead of calling AI
    if (!isGovRelated(question)) {
      return res.json({
        answer: `SUMMARY: I can only answer questions about Indian government procedures for NGOs and social enterprises.\n\nTopics I cover:\n• NGO/Trust/Section 8 company registration\n• Tax exemptions (80G, 12A)\n• FCRA and foreign funding compliance\n• Government schemes (NITI Aayog, Ministry grants)\n• Permits for community programs\n• CSR funding eligibility\n\nPRO TIP: Try one of the starter questions, or rephrase your question to focus on a specific government procedure.\n\nOFFICIAL LINK: https://ngodarpan.gov.in`,
      });
    }

    const systemMsg = `You are India's most knowledgeable guide on government procedures for NGOs, social enterprises, and non-profit organizations. You have deep expertise in Indian law, MCA regulations, FCRA, CSR mandates, and government grant schemes. Answer ONLY questions related to Indian government procedures for social enterprises. Format your answer EXACTLY as:\nSUMMARY: One sentence answer\nSTEPS: Numbered list of exact steps\nKEY DOCUMENTS: Bullet list of required documents\nTIME & COST: Estimated time and approximate cost\nPRO TIP: One insider tip that most people miss\nOFFICIAL LINK: Relevant government website URL\nKeep total response under 200 words. Be specific to India.`;

    // Try Groq first, Mistral as fallback
    const providers = [
      { name: 'Groq', getClient: getGroqClient, model: 'llama-3.3-70b-versatile' },
      { name: 'Mistral', getClient: getMistralClient, model: 'mistral-small-latest' },
    ];

    let answer = null;
    for (const provider of providers) {
      try {
        const client = provider.getClient();
        const resp = await client.chat.completions.create({
          model: provider.model,
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: question },
          ],
          temperature: 0.5,
          max_tokens: 600,
        });
        answer = resp.choices[0].message.content.trim();
        break;
      } catch (err) {
        console.error(`[gov-guide/${provider.name}] failed:`, err.message);
      }
    }

    if (!answer) throw new Error('All providers failed');
    res.json({ answer });
  } catch (err) {
    console.error('/gov-guide error:', err.message);
    // Graceful fallback — never crash the UI
    res.json({
      answer: `SUMMARY: The AI guide is temporarily busy due to high demand. Please try again in a moment.\n\nSTEPS:\n1. Wait 30-60 seconds\n2. Try again or use a starter question\n\nPRO TIP: For immediate help, visit the NGO Darpan portal for official registration guidance.\n\nOFFICIAL LINK: https://ngodarpan.gov.in`,
    });
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
