import { AGENTS } from '../../lib/agents';

function authorized(request) {
  const secret = process.env.ANDY_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(request) {
  try {
    if (!authorized(request)) {
      return Response.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const { agent = '', event = '', data = {} } = await request.json();
    const agentId = String(agent).trim().toLowerCase();
    const eventName = String(event).trim().slice(0, 80);
    const knownAgent = AGENTS.find(item => item.id === agentId);

    if (!knownAgent || !eventName) {
      return Response.json({ error: 'Valid agent and event are required.' }, { status: 400 });
    }

    const payload = {
      received: true,
      agent: knownAgent.id,
      agentName: knownAgent.name,
      event: eventName,
      data,
      timestamp: new Date().toISOString()
    };

    console.log('[ANDY WEBHOOK]', payload);
    return Response.json(payload);
  } catch (error) {
    return Response.json({ error: error.message || 'Webhook failed.' }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    status: 'ANDY webhook endpoint live',
    version: '1.1',
    protected: Boolean(process.env.ANDY_WEBHOOK_SECRET)
  });
}
