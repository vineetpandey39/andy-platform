import { isAuthed } from '../../../lib/session';

export const maxDuration = 60;

export async function POST(request) {
  try {
    if (!isAuthed(request)) {
      return Response.json({ error: 'Andy is locked. Authenticate first.' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'OPENAI_API_KEY is not configured in Vercel.' }, { status: 500 });
    }

    const form = await request.formData();
    const audio = form.get('audio');
    if (!audio || typeof audio === 'string') {
      return Response.json({ error: 'Audio file is required.' }, { status: 400 });
    }

    const body = new FormData();
    body.append('file', audio, audio.name || 'andy-command.webm');
    body.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe');
    body.append('response_format', 'json');
    body.append('prompt', 'The speaker is giving commands to ANDY, a Jarvis-style AI assistant. Common words include ANDY, Jarvis, Titan, PostForge, carousel, Instagram, agent, activate, publish, news, tools, income, transform, automation.');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `OpenAI transcription failed ${res.status}: ${err.slice(0, 260)}` }, { status: 502 });
    }

    const data = await res.json();
    const text = String(data.text || '').trim();
    if (!text) {
      return Response.json({ error: 'No speech was detected. Try again closer to the mic.' }, { status: 422 });
    }

    return Response.json({ text });
  } catch (error) {
    return Response.json({ error: error.message || 'Voice transcription failed.' }, { status: 500 });
  }
}
