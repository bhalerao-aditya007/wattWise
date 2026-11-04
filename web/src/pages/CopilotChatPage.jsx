import React, { useState } from 'react';
import { askCopilot } from '../services/api';

export default function CopilotChatPage({ householdId = 1 }) {
  const [lang, setLang] = useState('en');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your WattWise Energy Copilot. Ask me questions about your MSEDCL bill, slab tiers, AC savings, or BLDC fan upgrades in English, Hindi, or Marathi.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await askCopilot(text, lang, householdId);
      const aiMsg = { sender: 'ai', text: res.reply, metrics: res.metrics };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an issue retrieving tariff verification.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)', fontWeight: 700 }}>
            Zero-Hallucination Tariff Assistant
          </span>
          <h2 className="view-title">Multilingual Energy Copilot</h2>
          <p className="view-desc">
            Natural language advice grounded strictly in deterministic MSEDCL tariff arithmetic. Numbers come from physics, not LLM guesses.
          </p>
        </div>

        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'en', label: '🇬🇧 English' },
            { id: 'hi', label: '🇮🇳 हिंदी' },
            { id: 'mr', label: '🚩 मराठी' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className="toolbar-btn"
              style={{
                background: lang === l.id ? 'var(--accent-amber)' : 'transparent',
                color: lang === l.id ? '#0c0a09' : 'var(--text-secondary)',
                fontWeight: lang === l.id ? 700 : 500
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try asking:</span>
        <button
          className="btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '999px' }}
          onClick={() => sendMessage('What will I save if I buy a 5-star AC?')}
        >
          💡 "What will I save if I buy a 5-star AC?"
        </button>
        <button
          className="btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '999px' }}
          onClick={() => sendMessage('How much do BLDC fans save per month?')}
        >
          💨 "How much do BLDC fans save?"
        </button>
        <button
          className="btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '999px' }}
          onClick={() => {
            setLang('mr');
            sendMessage('मी एसी ५ स्टार केला तर काय बचत होईल?');
          }}
        >
          🚩 "मी एसी ५ स्टार केला तर काय बचत होईल?"
        </button>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${m.sender === 'user' ? 'user' : 'bot'}`}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Consulting deterministic MERC tariff engine...
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <input
            type="text"
            className="text-input"
            placeholder={lang === 'mr' ? 'येथे प्रश्न विचारा (उदा. एसी सेटपॉईंट २६ केल्यास किती बचत होईल?)...' : lang === 'hi' ? 'यहाँ सवाल पूछें (उदा. 5 स्टार एसी से कितनी बचत होगी?)...' : 'Ask about bills, slab boundaries, or energy savings...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => sendMessage()}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
