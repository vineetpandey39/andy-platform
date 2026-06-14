'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ── Agent definitions ──────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'titan',
    name: 'TITAN',
    icon: '⚡',
    role: 'Instagram Empire',
    desc: 'Runs PostForge AI daily — refreshes news, generates carousels, posts to @aibyvineet, tracks engagement.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    status: 'active',
    revenue: '₹0',
    tasks: ['Daily carousel posted', '6 slides generated', 'Hashtags optimized'],
    metrics: { posts: 0, reach: 0, engagement: '0%' },
    url: 'https://postforge-ai-one.vercel.app',
    n8n: true,
  },
  {
    id: 'alfa',
    name: 'ALFA',
    icon: '🎬',
    role: 'YouTube Empire',
    desc: 'Manages Cosmos AI & NautankiPOV — scripts, voiceovers, video assembly, uploads, analytics.',
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.3)',
    status: 'building',
    revenue: '₹0',
    tasks: ['Script generation', 'ElevenLabs voiceover', 'Auto-upload to YouTube'],
    metrics: { videos: 0, views: 0, subscribers: 0 },
  },
  {
    id: 'beta',
    name: 'BETA',
    icon: '💼',
    role: 'Freelance Operator',
    desc: 'Scans Fiverr & Upwork for global orders, completes deliverables autonomously, collects payment.',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
    status: 'planned',
    revenue: '₹0',
    tasks: ['Scan for orders', 'Complete deliverables', 'Wire payment'],
    metrics: { orders: 0, delivered: 0, earned: '$0' },
  },
  {
    id: 'hermes',
    name: 'HERMES',
    icon: '📚',
    role: 'Amazon KDP Publisher',
    desc: 'Every 2 days — finds trending KDP keywords, writes a book, formats, uploads, maximizes royalties.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.3)',
    status: 'planned',
    revenue: '₹0',
    tasks: ['Keyword research', 'Book generation', 'KDP upload'],
    metrics: { books: 0, royalties: '$0', rank: '-' },
  },
  {
    id: 'ares',
    name: 'ARES',
    icon: '🎯',
    role: 'LinkedIn B2B Engine',
    desc: 'Posts thought leadership content, generates leads, books discovery calls, nurtures pipeline.',
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.3)',
    status: 'planned',
    revenue: '₹0',
    tasks: ['Post content', 'Generate leads', 'Nurture pipeline'],
    metrics: { connections: 0, leads: 0, calls: 0 },
  },
  {
    id: 'apollo',
    name: 'APOLLO',
    icon: '✨',
    role: 'Twitter/X Viral Engine',
    desc: 'Crafts viral threads, monitors trends, engages followers, builds @aibyvineet presence on X.',
    color: '#F97316',
    glow: 'rgba(249,115,22,0.3)',
    status: 'planned',
    revenue: '₹0',
    tasks: ['Thread generation', 'Trend monitoring', 'Engagement'],
    metrics: { tweets: 0, impressions: 0, followers: 0 },
  },
  {
    id: 'athena',
    name: 'ATHENA',
    icon: '🔮',
    role: 'Intelligence & Research',
    desc: 'Feeds all agents with trend intelligence, competitor analysis, viral content signals 24/7.',
    color: '#EC4899',
    glow: 'rgba(236,72,153,0.3)',
    status: 'planned',
    revenue: 'Support',
    tasks: ['Trend scanning', 'Competitor intel', 'Viral signals'],
    metrics: { signals: 0, reports: 0, accuracy: '0%' },
  },
  {
    id: 'hephaestus',
    name: 'HEPHAISTOS',
    icon: '🔧',
    role: 'System Maintenance',
    desc: 'Monitors all agents for failures, self-heals errors, updates prompts, improves performance.',
    color: '#6366F1',
    glow: 'rgba(99,102,241,0.3)',
    status: 'planned',
    revenue: 'Support',
    tasks: ['Monitor agents', 'Auto-heal errors', 'Optimize prompts'],
    metrics: { uptime: '0%', fixed: 0, optimized: 0 },
  },
  {
    id: 'poseidon',
    name: 'POSEIDON',
    icon: '💰',
    role: 'Revenue & Finance',
    desc: 'Tracks all income streams across all agents, generates P&L reports, flags anomalies.',
    color: '#14B8A6',
    glow: 'rgba(20,184,166,0.3)',
    status: 'planned',
    revenue: 'Tracker',
    tasks: ['Track all revenue', 'P&L reporting', 'Wire transfer alerts'],
    metrics: { total: '₹0', mtd: '₹0', ytd: '₹0' },
  },
  {
    id: 'zeus',
    name: 'ZEUS',
    icon: '👑',
    role: 'Master Overseer',
    desc: 'Oversees all agents, escalates to Andy only on critical decisions, distributes tasks optimally.',
    color: '#EAB308',
    glow: 'rgba(234,179,8,0.3)',
    status: 'planned',
    revenue: 'Command',
    tasks: ['Orchestrate agents', 'Escalate to Andy', 'Optimize workload'],
    metrics: { decisions: 0, escalations: 0, efficiency: '0%' },
  },
];

const CODEWORD = 'andy activate';

const STATUS_COLORS = {
  active: '#10B981',
  building: '#F59E0B',
  planned: '#6B7280',
};

const STATUS_LABELS = {
  active: '● LIVE',
  building: '◐ BUILDING',
  planned: '○ PLANNED',
};

// ── Main component ─────────────────────────────────────────────────────────
export default function Andy() {
  const [unlocked, setUnlocked] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [andyReply, setAndyReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('command');
  const [pulseOrb, setPulseOrb] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // ── Orb pulse loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => setPulseOrb(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  // ── Codeword login ────────────────────────────────────────────────────────
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (typedCode.toLowerCase().trim() === CODEWORD) {
      setUnlocked(true);
      setAndyReply("Good to have you back, Vineet. All systems online. What shall we build today?");
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 1200);
      setTypedCode('');
    }
  };

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const speakReply = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 0.85;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google UK') || v.name.includes('Alex'));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  // ── Voice recognition ──────────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setVoiceText(transcript);
    };
    rec.onend = () => {
      setListening(false);
      if (voiceText.trim()) handleAndyQuery(voiceText);
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── Andy AI response ─────────────────────────────────────────────────────
  const handleAndyQuery = async (query) => {
    if (!query.trim()) return;
    setReplyLoading(true);
    setAndyReply('');
    try {
      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, agents: AGENTS.map(a => ({ id: a.id, name: a.name, status: a.status, role: a.role })) }),
      });
      const data = await res.json();
      const reply = data.reply || 'Understood. Processing your command.';
      setAndyReply(reply);
      speakReply(reply);
    } catch {
      const fallback = 'Command received. Routing to the appropriate agent now.';
      setAndyReply(fallback);
      speakReply(fallback);
    }
    setReplyLoading(false);
    setVoiceText('');
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (voiceText.trim()) handleAndyQuery(voiceText);
  };

  // ── LOCK SCREEN ───────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050508', position: 'relative', overflow: 'hidden' }}>
        {/* Background grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px', maxWidth: '420px', width: '100%' }}>
          {/* Andy orb */}
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #818CF8, #6366F1 50%, #4338CA)', boxShadow: `0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(99,102,241,0.3)`, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', animation: 'orbPulse 3s ease-in-out infinite' }}>
            🤖
          </div>

          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '28px', fontWeight: '700', letterSpacing: '6px', color: '#818CF8', marginBottom: '6px' }}>A N D Y</div>
          <div style={{ fontSize: '12px', color: '#4B5563', letterSpacing: '3px', marginBottom: '40px', textTransform: 'uppercase' }}>Autonomous Neural Director for You</div>

          <form onSubmit={handleCodeSubmit}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                ref={inputRef}
                type="password"
                value={typedCode}
                onChange={e => setTypedCode(e.target.value)}
                placeholder='Speak the codeword...'
                autoFocus
                style={{ width: '100%', padding: '14px 18px', background: codeError ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.06)', border: `1px solid ${codeError ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.25)'}`, borderRadius: '12px', color: '#E8EAF0', fontSize: '14px', outline: 'none', fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box', transition: 'all 0.2s', letterSpacing: '3px', textAlign: 'center' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366F1, #4338CA)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '2px', fontFamily: "'Space Mono', monospace" }}>
              AUTHENTICATE
            </button>
          </form>

          {codeError && <div style={{ marginTop: '12px', fontSize: '12px', color: '#EF4444', letterSpacing: '1px' }}>⚠ ACCESS DENIED — INVALID CODEWORD</div>}

          <div style={{ marginTop: '32px', fontSize: '11px', color: '#1F2937', letterSpacing: '1px' }}>ANDY v1.0 · 10 AGENTS STANDING BY</div>
        </div>

        <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1);box-shadow:0 0 60px rgba(99,102,241,0.6),0 0 120px rgba(99,102,241,0.3)} 50%{transform:scale(1.05);box-shadow:0 0 80px rgba(99,102,241,0.8),0 0 160px rgba(99,102,241,0.4)} }`}</style>
      </div>
    );
  }

  // ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <style>{`
        @keyframes orbPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.85}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px var(--glow)}50%{box-shadow:0 0 40px var(--glow)}}
        .agent-card:hover{transform:translateY(-2px);transition:transform 0.2s}
        .agent-card{transition:transform 0.2s,box-shadow 0.2s}
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #818CF8, #4338CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', animation: 'orbPulse 3s ease-in-out infinite' }}>🤖</div>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', fontWeight: '700', letterSpacing: '3px', color: '#818CF8' }}>ANDY</div>
            <div style={{ fontSize: '10px', color: '#10B981', letterSpacing: '2px' }}>● ALL SYSTEMS ONLINE</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['command', 'agents', 'revenue'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: activeTab === t ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTab === t ? '#818CF8' : '#4B5563', fontSize: '11px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Space Grotesk', sans-serif" }}>
              {t}
            </button>
          ))}
        </div>

        <button onClick={() => setUnlocked(false)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#374151', fontSize: '11px', cursor: 'pointer' }}>LOCK</button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

        {/* ── COMMAND TAB ────────────────────────────────────────────────── */}
        {activeTab === 'command' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>

            {/* Andy voice orb */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div onClick={listening ? stopListening : startListening} style={{ width: '140px', height: '140px', borderRadius: '50%', background: listening ? 'radial-gradient(circle at 35% 35%, #EF4444, #DC2626)' : speaking ? 'radial-gradient(circle at 35% 35%, #10B981, #059669)' : 'radial-gradient(circle at 35% 35%, #818CF8, #4338CA)', boxShadow: listening ? '0 0 60px rgba(239,68,68,0.7),0 0 120px rgba(239,68,68,0.3)' : speaking ? '0 0 60px rgba(16,185,129,0.7)' : '0 0 60px rgba(99,102,241,0.5)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', cursor: 'pointer', animation: 'orbPulse 2s ease-in-out infinite', userSelect: 'none' }}>
                  {listening ? '🎙️' : speaking ? '🔊' : '🤖'}
                </div>
              </div>

              <div style={{ marginTop: '16px', fontSize: '12px', color: listening ? '#EF4444' : speaking ? '#10B981' : '#4B5563', letterSpacing: '2px', animation: (listening || speaking) ? 'blink 1s infinite' : 'none' }}>
                {listening ? '● LISTENING...' : speaking ? '● ANDY IS SPEAKING...' : 'TAP ORB TO SPEAK'}
              </div>

              {voiceText && (
                <div style={{ marginTop: '12px', maxWidth: '500px', margin: '12px auto 0', padding: '12px 16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', fontSize: '13px', color: '#A5B4FC', fontStyle: 'italic' }}>
                  "{voiceText}"
                </div>
              )}
            </div>

            {/* Andy reply */}
            {(andyReply || replyLoading) && (
              <div style={{ maxWidth: '600px', margin: '0 auto 28px', padding: '18px 22px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', animation: 'slideIn 0.3s ease' }}>
                <div style={{ fontSize: '10px', color: '#4B5563', letterSpacing: '2px', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>ANDY SAYS</div>
                {replyLoading
                  ? <div style={{ color: '#4B5563', fontSize: '14px', animation: 'blink 1s infinite' }}>Processing command...</div>
                  : <div style={{ color: '#C7D2FE', fontSize: '15px', lineHeight: '1.7' }}>{andyReply}</div>
                }
              </div>
            )}

            {/* Text input */}
            <form onSubmit={handleTextSubmit} style={{ maxWidth: '600px', margin: '0 auto 36px', display: 'flex', gap: '8px' }}>
              <input
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                placeholder="Or type your command here..."
                style={{ flex: 1, padding: '13px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#E8EAF0', fontSize: '13px', outline: 'none', fontFamily: "'Space Grotesk', sans-serif" }}
              />
              <button type="submit" style={{ padding: '13px 20px', background: 'linear-gradient(135deg,#6366F1,#4338CA)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Send</button>
            </form>

            {/* Quick command chips */}
            <div style={{ maxWidth: '600px', margin: '0 auto 36px' }}>
              <div style={{ fontSize: '10px', color: '#374151', letterSpacing: '2px', marginBottom: '12px', textAlign: 'center' }}>QUICK COMMANDS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {[
                  "How is Titan performing today?",
                  "Show me today's revenue",
                  "What did Zeus escalate?",
                  "Trigger Titan now",
                  "What's next for Hermes?",
                  "Agent status report",
                ].map(cmd => (
                  <button key={cmd} onClick={() => { setVoiceText(cmd); handleAndyQuery(cmd); }} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', color: '#6B7280', fontSize: '11px', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* Live agent status strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {AGENTS.map(a => (
                <div key={a.id} onClick={() => { setSelectedAgent(a); setActiveTab('agents'); }} className="agent-card" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${a.status === 'active' ? a.color + '40' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>{a.icon}</span>
                    <span style={{ fontSize: '9px', color: STATUS_COLORS[a.status], fontFamily: "'Space Mono', monospace", letterSpacing: '1px' }}>{STATUS_LABELS[a.status]}</span>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: a.color, fontFamily: "'Space Mono', monospace", letterSpacing: '1px' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>{a.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AGENTS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'agents' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            {selectedAgent ? (
              // Agent detail view
              <div>
                <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: '13px', marginBottom: '20px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>← All Agents</button>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${selectedAgent.color}30`, borderRadius: '18px', padding: '28px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `radial-gradient(circle, ${selectedAgent.color}40, ${selectedAgent.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: `0 0 30px ${selectedAgent.glow}` }}>
                      {selectedAgent.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: '700', color: selectedAgent.color, letterSpacing: '2px' }}>{selectedAgent.name}</div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>{selectedAgent.role}</div>
                      <div style={{ fontSize: '11px', color: STATUS_COLORS[selectedAgent.status], marginTop: '2px', letterSpacing: '1px' }}>{STATUS_LABELS[selectedAgent.status]}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.7', marginBottom: '20px' }}>{selectedAgent.desc}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {Object.entries(selectedAgent.metrics).map(([k, v]) => (
                      <div key={k} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: selectedAgent.color, fontFamily: "'Space Mono', monospace" }}>{v}</div>
                        <div style={{ fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{k}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '10px', color: '#374151', letterSpacing: '2px', marginBottom: '8px' }}>AGENT TASKS</div>
                    {selectedAgent.tasks.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedAgent.status === 'active' ? selectedAgent.color : '#374151', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#6B7280' }}>{t}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: selectedAgent.status === 'active' ? selectedAgent.color : '#374151' }}>{selectedAgent.status === 'active' ? 'RUNNING' : 'PENDING'}</span>
                      </div>
                    ))}
                  </div>

                  {selectedAgent.url && (
                    <a href={selectedAgent.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', background: `linear-gradient(135deg, ${selectedAgent.color}, ${selectedAgent.color}99)`, borderRadius: '10px', color: '#000', fontWeight: '700', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px' }}>
                      OPEN {selectedAgent.name} →
                    </a>
                  )}

                  {selectedAgent.status === 'planned' && (
                    <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '10px', fontSize: '12px', color: '#4B5563' }}>
                      🔧 {selectedAgent.name} is on the roadmap. Ask Andy to start building it anytime.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // All agents grid
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#818CF8', letterSpacing: '2px', marginBottom: '4px' }}>AGENT ROSTER</div>
                  <div style={{ fontSize: '12px', color: '#374151' }}>10 autonomous agents · Click any to inspect</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {AGENTS.map(a => (
                    <div key={a.id} onClick={() => setSelectedAgent(a)} className="agent-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${a.status === 'active' ? a.color + '35' : 'rgba(255,255,255,0.05)'}`, borderRadius: '16px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `radial-gradient(circle,${a.color}30,${a.color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: a.status === 'active' ? `0 0 20px ${a.glow}` : 'none' }}>
                          {a.icon}
                        </div>
                        <span style={{ fontSize: '9px', color: STATUS_COLORS[a.status], fontFamily: "'Space Mono', monospace", letterSpacing: '1px', padding: '3px 8px', background: STATUS_COLORS[a.status] + '15', borderRadius: '20px', border: `1px solid ${STATUS_COLORS[a.status]}30` }}>{STATUS_LABELS[a.status]}</span>
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', fontWeight: '700', color: a.color, letterSpacing: '1px', marginBottom: '4px' }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>{a.role}</div>
                      <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>{a.desc.slice(0, 80)}...</div>
                      <div style={{ marginTop: '12px', fontSize: '12px', color: a.color, fontWeight: '600' }}>Revenue: {a.revenue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVENUE TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'revenue' && (
          <div style={{ animation: 'slideIn 0.3s ease' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#818CF8', letterSpacing: '2px', marginBottom: '4px' }}>POSEIDON — REVENUE OVERVIEW</div>
              <div style={{ fontSize: '12px', color: '#374151' }}>All income streams · Tracked by Poseidon agent</div>
            </div>

            {/* Total revenue card */}
            <div style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '18px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', letterSpacing: '2px', marginBottom: '8px' }}>TOTAL EMPIRE REVENUE (MTD)</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '48px', fontWeight: '700', color: '#10B981' }}>₹0</div>
              <div style={{ fontSize: '12px', color: '#374151', marginTop: '8px' }}>Agents are being deployed — revenue tracking activates when agents go live</div>
            </div>

            {/* Revenue per agent */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {AGENTS.filter(a => !['athena','hephaestus','poseidon','zeus'].includes(a.id)).map(a => (
                <div key={a.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{a.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: a.color, fontWeight: '700' }}>{a.name}</div>
                      <div style={{ fontSize: '10px', color: '#374151' }}>{a.role}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', color: '#E8EAF0', fontWeight: '700' }}>{a.revenue}</div>
                  <div style={{ marginTop: '8px', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                    <div style={{ width: a.status === 'active' ? '15%' : '0%', height: '100%', background: a.color, borderRadius: '2px', transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: STATUS_COLORS[a.status], marginTop: '6px', letterSpacing: '1px' }}>{STATUS_LABELS[a.status]}</div>
                </div>
              ))}
            </div>

            {/* Wire transfer summary */}
            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '14px' }}>
              <div style={{ fontSize: '11px', color: '#4B5563', letterSpacing: '2px', marginBottom: '12px', fontFamily: "'Space Mono', monospace" }}>WIRE TRANSFER STATUS</div>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.8' }}>
                🏦 Bank account linked: <span style={{ color: '#6B7280' }}>Not configured</span><br />
                📊 Stripe / Payoneer: <span style={{ color: '#6B7280' }}>Not configured</span><br />
                🔄 Auto-transfer threshold: <span style={{ color: '#6B7280' }}>Not set</span><br />
                <br />
                <span style={{ fontSize: '11px', color: '#374151' }}>Configure in Environment Variables → BANK_ACCOUNT, PAYONEER_KEY, AUTO_TRANSFER_AMOUNT</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
