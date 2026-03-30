import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function cleanJSON(text) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

// POST /api/gemini/hidden-cons
router.post('/hidden-cons', async (req, res) => {
  try {
    const { domain, problem, idea } = req.body;
    const prompt = `You are a seasoned social entrepreneur mentor with 20 years of experience in ${domain} in India. A young innovator has shared this:
Problem: ${problem}
Idea: ${idea}

Your job is to reveal the HIDDEN CONS — real-world obstacles that first-time innovators never anticipate but always encounter. These are NOT obvious cons. These are ground-level, India-specific, operational blindspots.

Return exactly 4 hidden cons in this JSON format:
[
  { "title": "short title", "description": "2 sentence explanation of why this is a real problem", "severity": "High/Medium/Low" }
]
Only return JSON, no extra text.`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJSON(result.response.text()));
    res.json(data);
  } catch (error) {
    console.error('Hidden cons error:', error);
    res.status(500).json({ error: 'Failed to generate hidden cons' });
  }
});

// POST /api/gemini/ripple
router.post('/ripple', async (req, res) => {
  try {
    const { domain, decisions, cons } = req.body;
    const prompt = `You are an NGO operations expert. A young social entrepreneur in the domain of ${domain} has made these decisions:
- Target Audience: ${decisions.targetAudience}
- Resource Allocation: People ${decisions.resources.people}%, Technology ${decisions.resources.technology}%, Outreach ${decisions.resources.outreach}%, Operations ${decisions.resources.operations}%
- Team: ${decisions.team.join(', ')}
- Monthly Budget: Rs.${decisions.budget}
- Strategy: ${decisions.strategy}

Their hidden problem cons were: ${cons.map(c => c.title).join(', ')}

Generate a Ripple Effect simulation. Show how each decision ripples across 4 dimensions:
1. Community Trust (0-100)
2. Financial Health (0-100)
3. Government Relations (0-100)
4. Partnership Strength (0-100)

Then give a Mentor Ghost insight.

Return in this exact JSON:
{
  "ripple": { "community": 0, "finance": 0, "government": 0, "partnerships": 0 },
  "ripple_explanations": { "community": "one sentence", "finance": "one sentence", "government": "one sentence", "partnerships": "one sentence" },
  "mentor_ghost": "two sentences of honest mentor advice"
}
Only return JSON.`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJSON(result.response.text()));
    res.json(data);
  } catch (error) {
    console.error('Ripple error:', error);
    res.status(500).json({ error: 'Failed to generate ripple simulation' });
  }
});

// POST /api/gemini/suggestions
router.post('/suggestions', async (req, res) => {
  try {
    const { scores } = req.body;
    const prompt = `Based on these ripple scores: Community Trust: ${scores.community}, Financial Health: ${scores.finance}, Government Relations: ${scores.government}, Partnership Strength: ${scores.partnerships}, give 3 specific, actionable suggestions to improve the weakest dimension. Each suggestion should be 2 sentences, practical, and India-specific. Return as JSON array: [{ "suggestion": "", "dimension": "", "impact": "High/Medium" }]
Only return JSON.`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJSON(result.response.text()));
    res.json(data);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// POST /api/gemini/mentor-letter
router.post('/mentor-letter', async (req, res) => {
  try {
    const { domain, problem, strategy, budget } = req.body;
    const prompt = `You are a veteran NGO mentor. The innovator chose ${domain}, solving "${problem}", with strategy "${strategy}" and budget Rs.${budget}/month. Write a personal mentor letter in 4 sentences: acknowledge their strength, name their biggest risk, give one counter-intuitive advice, end with encouragement. Return plain text only.`;
    const result = await model.generateContent(prompt);
    res.json({ letter: result.response.text() });
  } catch (error) {
    console.error('Mentor letter error:', error);
    res.status(500).json({ error: 'Failed to generate mentor letter' });
  }
});

// POST /api/gemini/gov-chat
router.post('/gov-chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const sysPrompt = 'You are an expert on Indian government procedures for NGOs, social enterprises, and non-profits. Answer only questions related to registration, permits, compliance, and government schemes. Be specific, step-by-step, and cite actual Indian laws/schemes where relevant. Keep answers under 150 words.';
    const govModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: sysPrompt });
    const chatHistory = (history || []).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
    const chat = govModel.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error('Gov chat error:', error);
    res.status(500).json({ error: 'Failed to get government guidance' });
  }
});

// POST /api/gemini/crisis-eval
router.post('/crisis-eval', async (req, res) => {
  try {
    const { crisis, choice, domain } = req.body;
    const prompt = `You are an NGO crisis management expert. A social entrepreneur in ${domain} faced this crisis: "${crisis}". They chose to respond with: "${choice}". Evaluate their choice in this JSON format:
{ "evaluation": "2 sentences on why this was good or bad", "consequence": "1 sentence on what would happen next", "better_alternative": "1 sentence suggesting a better approach if applicable" }
Only return JSON.`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJSON(result.response.text()));
    res.json(data);
  } catch (error) {
    console.error('Crisis eval error:', error);
    res.status(500).json({ error: 'Failed to evaluate crisis response' });
  }
});

// POST /api/gemini/archetype
router.post('/archetype', async (req, res) => {
  try {
    const { domain, decisions, rippleScores } = req.body;
    const prompt = `Based on these decisions by a social entrepreneur: Domain: ${domain}, Target Audience: ${decisions.targetAudience}, Strategy: ${decisions.strategy}, Budget: Rs.${decisions.budget}/month, Team size: ${decisions.team.length} roles. Ripple scores: Community ${rippleScores.community}, Finance ${rippleScores.finance}, Government ${rippleScores.government}, Partnerships ${rippleScores.partnerships}. Generate a creative Leadership Archetype title (like "The Reluctant Pragmatist" or "The Community Champion") and a 2-sentence description. Return JSON: { "title": "The Creative Title", "description": "2 sentences" }
Only return JSON.`;
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJSON(result.response.text()));
    res.json(data);
  } catch (error) {
    console.error('Archetype error:', error);
    res.status(500).json({ error: 'Failed to generate archetype' });
  }
});

// POST /api/gemini/ecosystem-node
router.post('/ecosystem-node', async (req, res) => {
  try {
    const { domain, problem, nodeName } = req.body;
    const prompt = `You are an expert on social entrepreneurship ecosystems in India. The user is working in the domain of ${domain} solving "${problem}". They just clicked on the stakeholder: ${nodeName}. In 2 sentences, tell them: 1. What this stakeholder can specifically offer their initiative 2. The single best way to approach and build a relationship with them. Keep it practical, India-specific, and direct. Return plain text.`;
    const result = await model.generateContent(prompt);
    res.json({ info: result.response.text() });
  } catch (error) {
    console.error('Ecosystem node error:', error);
    res.status(500).json({ error: 'Failed to get ecosystem node info' });
  }
});

export default router;
