# ANDY Platform

ANDY is a JARVIS-style command cockpit for Vineet's autonomous agent network.

## Agents

- TITAN: Instagram and PostForge AI
- ALFA: YouTube content engine
- BETA: Freelance operator
- HERMES: KDP publisher
- ARES: LinkedIn B2B engine
- APOLLO: X growth engine
- ATHENA: Intelligence layer
- HEPHAISTOS: System maintenance
- POSEIDON: Revenue control
- ZEUS: Master overseer

## Vercel Environment Variables

Required:

```bash
ANTHROPIC_API_KEY=your_key
```

Recommended:

```bash
ANTHROPIC_MODEL=claude-sonnet-4-6
ANDY_CODEWORD=andy activate
ANDY_SESSION_SECRET=use_a_long_random_secret
ANDY_WEBHOOK_SECRET=use_a_long_random_secret
```

## Voice Input

Voice recognition uses the browser Web Speech API. Use Chrome on HTTPS, then allow microphone permission from the browser address bar.

## Webhook

n8n agents can report events to:

```bash
POST /api/webhook
Authorization: Bearer $ANDY_WEBHOOK_SECRET
Content-Type: application/json
```

Example body:

```json
{
  "agent": "titan",
  "event": "post_published",
  "data": { "posts": 1, "reach": 450 }
}
```
