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

    const { text = '' } = await request.json();
    const input = String(text).trim().slice(0, 1400);
    if (!input) {
      return Response.json({ error: 'Speech text is empty.' }, { status: 400 });
    }

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'onyx',
        input,
        response_format: 'mp3'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `OpenAI speech failed ${res.status}: ${err.slice(0, 260)}` }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'audio/mpeg'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Voice playback failed.' }, { status: 500 });
  }
}
