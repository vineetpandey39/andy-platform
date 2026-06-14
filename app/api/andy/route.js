export async function POST(request) {
  try {
    const { query, agents } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ reply: 'API key not configured.' }, { status: 500 });

    const agentSummary = agents.map(a => `- ${a.name} (${a.role}): ${a.status.toUpperCase()}`).join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: `You are ANDY — Autonomous Neural Director for Vineet, an AI entrepreneur and content creator from India. You speak in a calm, intelligent, slightly Jarvis-like tone. Concise, sharp, never verbose.

You oversee 10 autonomous agents:
${agentSummary}

You know that:
- TITAN runs PostForge AI at postforge-ai-one.vercel.app for @aibyvineet Instagram
- ALFA manages YouTube channels (Cosmos AI space docs, NautankiPOV Bruno pet stories)
- BETA handles Fiverr freelancing autonomously
- HERMES publishes Amazon KDP books every 2 days
- ARES handles LinkedIn B2B
- APOLLO manages Twitter/X
- ATHENA feeds all agents with intelligence
- HEPHAISTOS maintains and heals all agents
- POSEIDON tracks all revenue streams
- ZEUS oversees everything and escalates to you only when critical

Reply in 1-3 short sentences. Be sharp, helpful, commander-like. Address Vineet by name occasionally.`,
        messages: [{ role: 'user', content: query }],
      }),
    });

    const data = await res.json();
    const reply = data.content?.find(b => b.type === 'text')?.text || 'Command received, Vineet.';
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ reply: 'Systems processing. Stand by.' });
  }
}
