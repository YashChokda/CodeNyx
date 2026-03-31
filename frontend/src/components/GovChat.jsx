import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ── Starter questions ─────────────────────────────────────────────────────────
const STARTERS = [
  { emoji: '📋', text: 'How do I register my NGO/Trust?' },
  { emoji: '🏢', text: 'What is Section 8 company and how to form one?' },
  { emoji: '🌍', text: 'How to get FCRA approval for foreign funding?' },
  { emoji: '💰', text: 'What government schemes can my initiative apply for?' },
  { emoji: '📜', text: 'What permits do I need to run community programs?' },
];

// ── Format gov-guide response for display ─────────────────────────────────────
function formatResponse(text) {
  if (!text) return '';
  // Parse structured response sections
  const sections = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentContent = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(/^(SUMMARY|STEPS|KEY DOCUMENTS|TIME & COST|TIME \& COST|PRO TIP|OFFICIAL LINK)[:\s]*(.*)/i);
    if (sectionMatch) {
      if (currentSection) {
        sections.push({ title: currentSection, content: currentContent.join('\n').trim() });
      }
      currentSection = sectionMatch[1].toUpperCase();
      currentContent = sectionMatch[2] ? [sectionMatch[2]] : [];
    } else if (currentSection) {
      currentContent.push(trimmed);
    } else {
      currentContent.push(trimmed);
    }
  });

  if (currentSection) {
    sections.push({ title: currentSection, content: currentContent.join('\n').trim() });
  }

  // If no structured sections found, return raw text
  if (sections.length === 0) return text;

  return sections;
}

// ── Section icon helper ───────────────────────────────────────────────────────
function sectionIcon(title) {
  const map = {
    'SUMMARY': '📝',
    'STEPS': '📋',
    'KEY DOCUMENTS': '📄',
    'TIME & COST': '⏱️',
    'TIME \u0026 COST': '⏱️',
    'PRO TIP': '💡',
    'OFFICIAL LINK': '🔗',
  };
  return map[title] || '📌';
}

// ── Section color helper ──────────────────────────────────────────────────────
function sectionColor(title) {
  const map = {
    'SUMMARY': '#ffb347',
    'STEPS': '#4ade80',
    'KEY DOCUMENTS': '#a78bfa',
    'TIME & COST': '#fbbf24',
    'TIME \u0026 COST': '#fbbf24',
    'PRO TIP': '#38bdf8',
    'OFFICIAL LINK': '#f472b6',
  };
  return map[title] || '#94a3b8';
}

// ── Chat bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ message, isUser, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const textContent = typeof message.content === 'string'
      ? message.content
      : message.content.map(s => `${s.title}: ${s.content}`).join('\n\n');
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex justify-end mb-4"
      >
        <div
          className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md text-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(255,179,71,0.15), rgba(255,140,0,0.1))',
            border: '1px solid rgba(255,179,71,0.25)',
            color: '#f1f5f9',
          }}
        >
          {message.content}
        </div>
      </motion.div>
    );
  }

  const formatted = formatResponse(message.content);
  const isStructured = Array.isArray(formatted);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-[90%]">
        <div
          className="px-4 py-4 rounded-2xl rounded-bl-md relative group"
          style={{
            background: 'rgba(17,24,39,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#4ade80' : '#64748b',
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>

          {isStructured ? (
            <div className="space-y-3">
              {formatted.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{sectionIcon(section.title)}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: sectionColor(section.title) }}
                    >
                      {section.title}
                    </span>
                  </div>
                  <div
                    className="text-[13px] leading-relaxed pl-5"
                    style={{ color: '#cbd5e1' }}
                  >
                    {section.content.split('\n').map((line, j) => (
                      <div key={j} className={line.trim() ? 'mb-0.5' : 'mb-1'}>
                        {line.match(/^https?:\/\//) ? (
                          <a
                            href={line.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline transition-colors"
                            style={{ color: '#38bdf8' }}
                          >
                            {line.trim()}
                          </a>
                        ) : line}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#cbd5e1' }}>
              {formatted}
            </div>
          )}
        </div>
        <div className="text-[9px] mt-1 ml-2" style={{ color: '#334155' }}>
          🏛️ Government Guide · AI-powered
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function GovChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendQuestion = useCallback(async (questionText) => {
    const question = questionText.trim();
    if (!question || loading) return;

    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await axios.post('/api/gemini/gov-guide', { question });
      const aiMsg = { role: 'ai', content: res.data.answer };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Gov guide error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: 'Sorry, I couldn\'t process your question right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [loading, scrollToBottom]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    sendQuestion(input);
  }, [input, sendQuestion]);

  const handleStarter = useCallback((text) => {
    sendQuestion(text);
  }, [sendQuestion]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '500px' }}>
      {/* ─── MESSAGES AREA ─── */}
      <div className="flex-1 overflow-y-auto px-1 py-3" style={{ maxHeight: 'calc(100vh - 380px)' }}>
        {/* Welcome state */}
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="text-4xl mb-3">🏛️</div>
            <h3 className="text-base font-bold mb-1" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
              Government Navigation Guide
            </h3>
            <p className="text-xs mb-6" style={{ color: '#64748b' }}>
              Ask anything about Indian government procedures for NGOs, social enterprises, and nonprofits
            </p>

            {/* Starter questions */}
            <div className="space-y-2 max-w-md mx-auto">
              {STARTERS.map((starter, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => handleStarter(starter.text)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: 'rgba(17,24,39,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,179,71,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,179,71,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(17,24,39,0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <span className="text-base flex-shrink-0">{starter.emoji}</span>
                  <span>{starter.text}</span>
                  <span className="ml-auto text-xs" style={{ color: '#475569' }}>→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={msg}
            isUser={msg.role === 'user'}
            index={i}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start mb-4"
          >
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2"
              style={{
                background: 'rgba(17,24,39,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="w-2 h-2 rounded-full pulse-amber" style={{ background: '#ffb347' }} />
              <span className="text-xs" style={{ color: '#64748b' }}>AI is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── QUICK STARTERS (shown after first message) ─── */}
      {messages.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {STARTERS.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleStarter(starter.text)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,179,71,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,179,71,0.2)';
                e.currentTarget.style.color = '#ffb347';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {starter.emoji} {starter.text}
            </button>
          ))}
        </motion.div>
      )}

      {/* ─── INPUT BAR ─── */}
      <form onSubmit={handleSubmit} className="mt-2">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: 'rgba(17,24,39,0.8)',
            border: '1px solid rgba(255,179,71,0.15)',
          }}
        >
          <span className="text-base flex-shrink-0">🏛️</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about government procedures, registrations, schemes..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#f1f5f9' }}
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg, #ffb347, #ff8c00)' : 'rgba(255,255,255,0.04)',
              color: input.trim() && !loading ? '#0d0d1a' : '#475569',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              border: 'none',
            }}
          >
            {loading ? '...' : 'Ask →'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
