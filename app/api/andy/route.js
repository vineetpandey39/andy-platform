import { agentSummary } from '../../lib/agents';
import { isAuthed } from '../../lib/session';

export const maxDuration = 30;

export async function POST(request) {
  try {
    if (!isAuthed(request)) {
      return Response.json({ error: 'Andy is locked. Authenticate first.' }, { status: 401 });
    }

    const { query = '' } = await request.json();
    const cleanQuery = String(query).trim().slice(0, 1200);
    if (!cleanQuery) {
      return Response.json({ error: 'Command is empty.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY is not configured in Vercel.' }, { status: 500 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 360,
        system: `You are ANDY, Vineet's intelligent command center. You operate in JARVIS mode: calm, alive, precise, loyal, lightly witty, and operational without sounding robotic.

You oversee these autonomous agents:
${agentSummary()}

Rules:
- Reply in 1-3 short sentences.
- If Vineet greets you, asks how you are, or calls you Jarvis, respond naturally as ANDY in JARVIS mode before offering the next useful action.
- If the user asks to activate, route, inspect, or pull an agent, name the exact agent and the next operational step.
- Do not claim a real-world action is complete unless the tool/API is actually connected.
- Keep the tone sharp, loyal, and executive. Address Vineet by name occasionally.
- For voice replies, make the first sentence sound good when spoken aloud.`,
        messages: [{ role: 'user', content: cleanQuery }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Anthropic failed ${res.status}: ${err.slice(0, 220)}` }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.content?.find(block => block.type === 'text')?.text || 'Command received, Vineet. Standing by.';
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message || 'Andy command failed.' }, { status: 500 });
  }
}
