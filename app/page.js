'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { publicAgents } from './lib/agents';

const AGENTS = publicAgents();
const QUICK_COMMANDS = [
  'Pull Titan on screen and show next action',
  'Give me an agent status report',
  'What should Zeus escalate today?',
  'Prepare Alfa for a faceless reel workflow',
  'Show revenue command summary',
  'Which agent should I activate next?'
];

function statusLabel(status) {
  if (status === 'active') return 'LIVE';
  if (status === 'building') return 'BUILDING';
  return 'PLANNED';
}

function agentPosition(index, total) {
  const angle = -90 + (360 / total) * index;
  const radius = 42;
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(rad) * radius}%`,
    top: `${50 + Math.sin(rad) * radius}%`,
    transform: 'translate(-50%, -50%)'
  };
}

export default function Andy() {
  const [unlocked, setUnlocked] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [codeword, setCodeword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('command');
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [command, setCommand] = useState('');
  const [reply, setReply] = useState('Authenticate and I will bring the agent network online.');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voice channel idle. Tap the core or Start voice.');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const activeAgents = useMemo(() => AGENTS.filter(agent => agent.status === 'active').length, []);
  const buildingAgents = useMemo(() => AGENTS.filter(agent => agent.status === 'building').length, []);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        setUnlocked(Boolean(data.authenticated));
        if (data.authenticated) setReply('Welcome back, Vineet. ANDY command core is online.');
      } catch {
        setUnlocked(false);
      } finally {
        setCheckingSession(false);
      }
    }
    check();
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(voice => /Daniel|Google UK|Microsoft Ryan|Alex/i.test(voice.name));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  async function authenticate(event) {
    event.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeword })
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated) throw new Error(data.error || 'Access denied');
      setUnlocked(true);
      setReply('ANDY online. Agent orbit stabilized. Awaiting your command, Vineet.');
      setCodeword('');
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function lock() {
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    setUnlocked(false);
    setReply('Authenticate and I will bring the agent network online.');
    setCommand('');
  }

  async function sendCommand(text = command) {
    const clean = String(text || '').trim();
    if (!clean || loading) return;
    setCommand(clean);
    setLoading(true);
    setReply('Routing command through ANDY core...');

    try {
      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Command failed');
      setReply(data.reply);
      speak(data.reply);

      const match = AGENTS.find(agent => clean.toLowerCase().includes(agent.name.toLowerCase()) || clean.toLowerCase().includes(agent.id));
      if (match) {
        setSelectedAgent(match);
        setActiveTab('command');
      }
    } catch (error) {
      const message = error.message || 'Command failed.';
      setReply(message);
      speak(message);
    } finally {
      setLoading(false);
      setVoiceStatus('Voice channel idle. Tap the core or Start voice.');
    }
  }

  async function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Speech recognition is not available. Use Chrome on HTTPS and allow microphone access.');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch {
      setVoiceStatus('Microphone permission was blocked. Click the lock icon in Chrome and allow microphone.');
      return;
    }

    transcriptRef.current = '';
    setCommand('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setVoiceStatus('Listening. Speak your command now.');
    };

    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ').trim();
      transcriptRef.current = transcript;
      setCommand(transcript);
      setVoiceStatus(transcript ? `Heard: "${transcript}"` : 'Listening...');
    };

    recognition.onerror = event => {
      setListening(false);
      setVoiceStatus(`Voice error: ${event.error}. Check Chrome microphone permission.`);
    };

    recognition.onend = () => {
      setListening(false);
      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) sendCommand(finalTranscript);
      else setVoiceStatus('No voice captured. Try again closer to the microphone.');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  if (checkingSession) {
    return (
      <main className="shell lock-screen">
        <div className="lock-card">
          <div className="andy-head" />
          <h1>ANDY</h1>
          <p className="muted">Booting command core...</p>
        </div>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="shell lock-screen">
        <section className="lock-card">
          <div className="andy-head" />
          <h1>ANDY</h1>
          <p className="muted">Autonomous Neural Director for You. Enter the command codeword to bring the agent network online.</p>
          <form className="code-form" onSubmit={authenticate}>
            <input
              type="password"
              value={codeword}
              onChange={event => setCodeword(event.target.value)}
              placeholder="Codeword"
              autoFocus
            />
            <button className="primary-btn" type="submit">Unlock</button>
          </form>
          {authError && <p className="error">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <nav className="top-nav">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-title">ANDY</div>
            <div className="brand-status">CORE ONLINE</div>
          </div>
        </div>
        <div className="nav-tabs">
          {['command', 'agents', 'revenue'].map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <button className="ghost-btn" onClick={lock}>Lock</button>
      </nav>

      <div className="cockpit">
        {activeTab === 'command' && (
          <section className="command-grid">
            <div className="holo-stage">
              <div className="command-title">
                <p className="panel-label">Autonomous command cockpit</p>
                <h1>ANDY</h1>
                <p className="muted">Speak a command. ANDY pulls the right agent into focus, routes the task, and keeps the empire board visible.</p>
              </div>

              <div className="orbit">
                <div className="orbit-ring" />
                {AGENTS.map((agent, index) => (
                  <div className="ray" key={`ray-${agent.id}`} style={{ transform: `rotate(${-90 + (360 / AGENTS.length) * index}deg)` }} />
                ))}
                <button className={`andy-core ${listening ? 'listening' : ''}`} onClick={listening ? stopVoice : startVoice} aria-label="Start voice command">
                  <span className="core-face" />
                </button>
                <button className="voice-btn" onClick={listening ? stopVoice : startVoice}>
                  {listening ? 'Stop listening' : speaking ? 'ANDY speaking' : 'Start voice'}
                </button>
                {AGENTS.map((agent, index) => (
                  <button
                    key={agent.id}
                    className={`agent-node ${selectedAgent?.id === agent.id ? 'active' : ''}`}
                    style={{ ...agentPosition(index, AGENTS.length), '--agent-color': agent.color }}
                    onClick={() => setSelectedAgent(agent)}
                    title={agent.role}
                  >
                    <strong>{agent.name}</strong>
                    <span className="node-status">{statusLabel(agent.status)}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="side-panel">
              <div className="reply-box">
                <div className="panel-label">Andy says</div>
                <p className="reply-text">{loading ? 'Processing command...' : reply}</p>
              </div>

              <div className="voice-state">
                <span className="dot" />
                <span>{voiceStatus}</span>
              </div>

              <form className="command-form" onSubmit={event => { event.preventDefault(); sendCommand(command); }}>
                <input value={command} onChange={event => setCommand(event.target.value)} placeholder="Type or speak your command..." />
                <button className="primary-btn" disabled={loading} type="submit">Send</button>
              </form>

              <div className="quick-grid">
                {QUICK_COMMANDS.map(item => (
                  <button className="quick-chip" key={item} onClick={() => sendCommand(item)}>{item}</button>
                ))}
              </div>

              {selectedAgent && (
                <div className="agent-detail">
                  <div className="panel-label">Agent in focus</div>
                  <h2 style={{ color: selectedAgent.color }}>{selectedAgent.name}</h2>
                  <p className="muted">{selectedAgent.role}</p>
                  <p>{selectedAgent.desc}</p>
                  <div className="task-list">
                    {selectedAgent.tasks.map(task => (
                      <div key={task}>
                        <span>{task}</span>
                        <strong>{selectedAgent.status === 'active' ? 'RUNNING' : 'READY'}</strong>
                      </div>
                    ))}
                  </div>
                  {selectedAgent.url && <p><a href={selectedAgent.url} target="_blank" rel="noreferrer">Open {selectedAgent.name}</a></p>}
                </div>
              )}
            </aside>
          </section>
        )}

        {activeTab === 'agents' && (
          <section className="wide-panel">
            <p className="panel-label">Agent roster</p>
            <h1>10-agent empire grid</h1>
            <div className="agent-roster">
              {AGENTS.map(agent => (
                <button className="metric-card" key={agent.id} onClick={() => { setSelectedAgent(agent); setActiveTab('command'); }}>
                  <span className="mini-node" style={{ borderColor: agent.color, boxShadow: `0 0 20px ${agent.color}55` }}>{agent.symbol}</span>
                  <strong style={{ color: agent.color }}>{agent.name}</strong>
                  <span>{agent.role}</span>
                  <small>{statusLabel(agent.status)}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'revenue' && (
          <section className="wide-panel">
            <p className="panel-label">Poseidon finance layer</p>
            <h1>Revenue command</h1>
            <div className="revenue-grid">
              <div className="metric-card">
                <span>Active agents</span>
                <strong>{activeAgents}</strong>
                <small>Live operational nodes</small>
              </div>
              <div className="metric-card">
                <span>Building agents</span>
                <strong>{buildingAgents}</strong>
                <small>Next deployment lane</small>
              </div>
              <div className="metric-card">
                <span>MTD revenue</span>
                <strong>Rs 0</strong>
                <small>Connect payment sources next</small>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
