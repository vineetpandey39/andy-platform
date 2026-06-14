// n8n agents ping this endpoint to report their activity to Andy's dashboard
// n8n webhook node → POST https://your-andy-app.vercel.app/api/webhook
// Body: { agent: "titan", event: "post_published", data: { posts: 1, reach: 450 } }

export async function POST(request) {
  try {
    const { agent, event, data } = await request.json();
    // In production: save to Supabase or Vercel KV store
    // For now: log and acknowledge
    console.log(`[ANDY WEBHOOK] Agent: ${agent} | Event: ${event} | Data:`, data);
    return Response.json({ received: true, agent, event, timestamp: new Date().toISOString() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: 'ANDY webhook endpoint live', version: '1.0' });
}
