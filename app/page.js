'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { publicAgents } from './lib/agents';

const AGENTS = publicAgents();
const QUICK_COMMANDS = [
  'Activate Titan and publish the next PostForge carousel',
  'Pull Titan on screen and show next action',
  'Give me an agent status report',
  'What should Zeus escalate today?',
  'Prepare Alfa for a faceless reel workflow',
  'Show revenue command summary',
  'Which agent should I activate next?'
];

const TITAN_PILLAR_SEQUENCE = ['news', 'tool', 'income', 'transformation', 'automation'];
const TITAN_PILLAR_LABELS = {
  news: 'AI News Breakdown',
  tool: 'AI Tool Drop',
  income: 'AI Income Update',
  transformation: 'AI Transformation',
  automation: 'AI Automation Win'
};
const TITAN_JOB_STEPS = [
  { id: 'refresh', label: 'Refresh sources' },
  { id: 'select', label: 'Select latest' },
  { id: 'generate', label: 'Generate plan' },
  { id: 'image-0', label: 'Create image 1' },
  { id: 'image-1', label: 'Create image 2' },
  { id: 'image-2', label: 'Create image 3' },
  { id: 'image-3', label: 'Create image 4' },
  { id: 'image-4', label: 'Create image 5' },
  { id: 'image-5', label: 'Create image 6' },
  { id: 'publish', label: 'Publish' }
];
const JOB_HISTORY_LIMIT = 25;

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
  const [jobs, setJobs] = useState([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('OpenAI voice channel idle. Tap the core or Record voice.');
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const activeAgents = useMemo(() => AGENTS.filter(agent => agent.status === 'active').length, []);
  const buildingAgents = useMemo(() => AGENTS.filter(agent => agent.status === 'building').length, []);
  const runningJob = useMemo(() => jobs.find(job => job.status === 'running' || job.status === 'queued'), [jobs]);
  const runningAgentId = runningJob?.agentId || '';
  const activeJobCount = useMemo(() => jobs.filter(job => job.status === 'running' || job.status === 'queued').length, [jobs]);
  const completedJobCount = useMemo(() => jobs.filter(job => job.status === 'completed').length, [jobs]);
  const failedJobCount = useMemo(() => jobs.filter(job => job.status === 'failed').length, [jobs]);

  function isTitanAutomationCommand(text) {
    const clean = String(text || '').toLowerCase();
    return /\btitan\b/.test(clean) && /\b(activate|run|start|publish|post|execute|launch|carousel|postforge)\b/.test(clean);
  }

  function nextTitanPillar() {
    if (typeof window === 'undefined') return TITAN_PILLAR_SEQUENCE[0];
    const index = Number(window.localStorage.getItem('andy_titan_pillar_index') || '0');
    return TITAN_PILLAR_SEQUENCE[index % TITAN_PILLAR_SEQUENCE.length];
  }

  function advanceTitanPillar() {
    if (typeof window === 'undefined') return;
    const index = Number(window.localStorage.getItem('andy_titan_pillar_index') || '0');
    window.localStorage.setItem('andy_titan_pillar_index', String((index + 1) % TITAN_PILLAR_SEQUENCE.length));
  }

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('andy_agent_jobs');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setJobs(parsed.slice(0, JOB_HISTORY_LIMIT));
    } catch {
      window.localStorage.removeItem('andy_agent_jobs');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('andy_agent_jobs', JSON.stringify(jobs.slice(0, JOB_HISTORY_LIMIT)));
  }, [jobs]);

  const speak = useCallback(async (text) => {
    const clean = String(text || '').trim();
    if (!clean || typeof window === 'undefined') return;

    try {
      audioRef.current?.pause();
      setSpeaking(true);
      setVoiceStatus('ANDY is speaking through OpenAI voice...');
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'OpenAI voice playback failed.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        setVoiceStatus('OpenAI voice channel idle. Tap the core or Record voice.');
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        setVoiceStatus('Voice playback failed. The text reply is still ready.');
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (error) {
      setSpeaking(false);
      setVoiceStatus(error.message || 'Voice playback failed. The text reply is still ready.');
    }
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
      if (isTitanAutomationCommand(clean)) {
        enqueueAgentJob('titan', clean);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Command failed');
      setReply(data.reply);
      await speak(data.reply);

      const match = AGENTS.find(agent => clean.toLowerCase().includes(agent.name.toLowerCase()) || clean.toLowerCase().includes(agent.id));
      if (match) {
        setSelectedAgent(match);
        setActiveTab('command');
      }
    } catch (error) {
      const message = error.message || 'Command failed.';
      setReply(message);
      await speak(message);
    } finally {
      setLoading(false);
    }
  }

  function updateJob(nextJob) {
    setJobs(prev => prev.map(job => job.id === nextJob.id ? nextJob : job));
  }

  function enqueueAgentJob(agentId, cleanCommand) {
    const agent = AGENTS.find(item => item.id === agentId);
    if (!agent) {
      setReply(`No agent found for ${agentId}.`);
      return;
    }

    const pillar = nextTitanPillar();
    const job = {
      id: `${agentId}-${Date.now()}`,
      agentId,
      agentName: agent.name,
      command: cleanCommand,
      pillar,
      pillarFull: TITAN_PILLAR_LABELS[pillar],
      format: 'Carousel',
      status: 'queued',
      currentStep: 0,
      progress: 0,
      steps: agentId === 'titan' ? TITAN_JOB_STEPS : [],
      data: {},
      log: [{ at: new Date().toISOString(), message: `${agent.name} queued from command: ${cleanCommand}` }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setJobs(prev => [job, ...prev].slice(0, JOB_HISTORY_LIMIT));
    setSelectedAgent(agent);
    setActiveTab('command');
    setReply(`${agent.name} job queued, Vineet. I will execute it step-by-step and keep the queue status visible.`);
    setVoiceStatus(`${agent.name} queued. Polling the executor step-by-step...`);
    void processAgentJob(job);
  }

  async function processAgentJob(initialJob) {
    let currentJob = { ...initialJob, status: 'running' };
    updateJob(currentJob);
    try {
      while (currentJob.status === 'queued' || currentJob.status === 'running') {
        const stepLabel = currentJob.steps?.[currentJob.currentStep]?.label || 'Next step';
        setVoiceStatus(`${currentJob.agentName} executing: ${stepLabel}...`);

        const res = await fetch('/api/jobs/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: currentJob })
        });
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(text.slice(0, 260) || 'Job step returned non-JSON.');
        }
        if (!res.ok || data.error) throw new Error(data.error || 'Job step failed.');
        currentJob = data.job;
        updateJob(currentJob);

        if (currentJob.status === 'completed' || currentJob.status === 'failed') break;
        await new Promise(resolve => setTimeout(resolve, 900));
      }

      if (currentJob.status === 'completed') {
        if (currentJob.agentId === 'titan') advanceTitanPillar();
        const nextPillar = nextTitanPillar();
        const result = currentJob.result || {};
        const sourceHeadline = result.source?.headline || currentJob.summary || 'latest verified source';
        const message = [
          `${currentJob.agentName} completed ${currentJob.pillarFull || 'the job'}.`,
          `Source: ${sourceHeadline}.`,
          result.permalink ? `Published: ${result.permalink}.` : result.mediaId ? `Published media ID: ${result.mediaId}.` : '',
          currentJob.agentId === 'titan' ? `Next Titan run: ${TITAN_PILLAR_LABELS[nextPillar]}.` : ''
        ].filter(Boolean).join(' ');
        setReply(message);
        await speak(message);
      } else {
        throw new Error(currentJob.error || `${currentJob.agentName} job failed.`);
      }
    } catch (error) {
      const failed = {
        ...currentJob,
        status: 'failed',
        error: error.message || 'Job failed.',
        updatedAt: new Date().toISOString(),
        log: [...(currentJob.log || []), { at: new Date().toISOString(), message: `Failed: ${error.message || 'Job failed.'}` }]
      };
      updateJob(failed);
      const message = `${failed.agentName || 'Agent'} stopped: ${failed.error}`;
      setReply(message);
      await speak(message);
    } finally {
      setLoading(false);
      setVoiceStatus('OpenAI voice channel idle. Tap the core or Record voice.');
    }
  }

  function clearCompletedJobs() {
    setJobs(prev => prev.filter(job => job.status === 'running' || job.status === 'queued'));
  }

  function clearAllJobs() {
    setJobs([]);
  }

  async function startVoice() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceStatus('Mic recording is unavailable in this browser. Use Chrome on HTTPS, or type the command.');
      return;
    }

    try {
      audioRef.current?.pause();
      setSpeaking(false);
      setCommand('');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data?.size) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setListening(false);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        audioChunksRef.current = [];
        if (!blob.size) {
          setVoiceStatus('No audio captured. Check microphone permission and try again.');
          return;
        }
        await transcribeAndSend(blob);
      };

      recorder.start();
      setListening(true);
      setVoiceStatus('Recording through OpenAI voice. Speak naturally, then tap Stop and transcribe.');
    } catch (error) {
      setListening(false);
      const blocked = error.name === 'NotAllowedError' || error.name === 'SecurityError';
      setVoiceStatus(blocked
        ? 'Microphone blocked. Click the browser lock icon and allow microphone for this site.'
        : error.message || 'Could not start microphone recording.');
    }
  }

  function stopVoice() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      setVoiceStatus('Stopping recording. Sending audio to OpenAI...');
      recorder.stop();
      return;
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setListening(false);
  }

  async function transcribeAndSend(blob) {
    try {
      setVoiceStatus('OpenAI is transcribing your command...');
      const form = new FormData();
      form.append('audio', blob, 'andy-command.webm');
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OpenAI transcription failed.');
      setCommand(data.text);
      setVoiceStatus(`Captured: "${data.text}"`);
      await sendCommand(data.text);
    } catch (error) {
      setVoiceStatus(error.message || 'OpenAI transcription failed. Type the command and try again.');
    }
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
                <button className={`andy-core ${listening ? 'listening' : ''}`} onClick={listening ? stopVoice : startVoice} aria-label="Record voice command">
                  <span className="core-face" />
                </button>
                <button className="voice-btn" onClick={listening ? stopVoice : startVoice}>
                  {listening ? 'Stop and transcribe' : speaking ? 'ANDY speaking' : 'Record voice'}
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
                        <strong>{runningAgentId === selectedAgent.id ? 'EXECUTING' : selectedAgent.status === 'active' ? 'RUNNING' : 'READY'}</strong>
                      </div>
                    ))}
                  </div>
                  {selectedAgent.url && <p><a href={selectedAgent.url} target="_blank" rel="noreferrer">Open {selectedAgent.name}</a></p>}
                </div>
              )}

              <div className="queue-panel">
                <div className="queue-head">
                  <div>
                    <div className="panel-label">Agent queue</div>
                    <strong>{jobs.length ? `${jobs.length} job${jobs.length === 1 ? '' : 's'}` : 'No jobs queued'}</strong>
                    {!!jobs.length && (
                      <span className="queue-counts">{activeJobCount} active / {completedJobCount} done / {failedJobCount} failed</span>
                    )}
                  </div>
                  <div className="queue-actions">
                    {jobs.some(job => job.status === 'completed' || job.status === 'failed') && (
                      <button className="ghost-btn compact" onClick={clearCompletedJobs}>Clear done</button>
                    )}
                    {!!jobs.length && <button className="ghost-btn compact" onClick={clearAllJobs}>Clear all</button>}
                  </div>
                </div>
                <div className="queue-list">
                  {jobs.length === 0 && <p className="muted">Say “activate Titan” to create the first autonomous job.</p>}
                  {jobs.map(job => {
                    const step = job.steps?.[job.currentStep]?.label || (job.status === 'completed' ? 'Complete' : 'Waiting');
                    const publishProof = Boolean(job.result?.permalink || job.result?.mediaId);
                    const completedWithoutProof = job.status === 'completed' && job.agentId === 'titan' && !publishProof;
                    const jobClass = completedWithoutProof ? 'completed warning' : job.status;
                    return (
                      <article className={`queue-job ${jobClass}`} key={job.id}>
                        <div className="queue-job-top">
                          <strong>{job.agentName}</strong>
                          <span>{completedWithoutProof ? 'NO PUBLISH PROOF' : job.status}</span>
                        </div>
                        <p>{job.pillarFull || job.command}</p>
                        <div className="progress-track">
                          <span style={{ width: `${job.progress || 0}%` }} />
                        </div>
                        <small>
                          {completedWithoutProof
                            ? 'Completed locally, but no Instagram media ID/permalink was returned. Clear and rerun this job.'
                            : job.status === 'completed'
                              ? 'Published step completed'
                              : job.status === 'failed' ? job.error : step}
                        </small>
                        {job.log?.slice(-6).map(entry => (
                          <em key={`${job.id}-${entry.at}`}>{entry.message}</em>
                        ))}
                        {job.result?.permalink && <a href={job.result.permalink} target="_blank" rel="noreferrer">Open post</a>}
                        {job.result?.mediaId && <em>Instagram media ID: {job.result.mediaId}</em>}
                        {(job.log?.length > 6 || job.result?.source || job.result?.hook) && (
                          <details className="job-history">
                            <summary>View full history</summary>
                            {job.result?.source?.headline && <p>Source: {job.result.source.headline}</p>}
                            {job.result?.hook && <p>Hook: {job.result.hook}</p>}
                            {job.log?.map(entry => (
                              <div key={`${job.id}-full-${entry.at}`}>
                                <time>{new Date(entry.at).toLocaleTimeString()}</time>
                                <span>{entry.message}</span>
                              </div>
                            ))}
                          </details>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
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
