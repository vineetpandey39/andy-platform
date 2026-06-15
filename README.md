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
OPENAI_API_KEY=your_openai_key
```

Recommended:

```bash
ANTHROPIC_MODEL=claude-sonnet-4-6
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=onyx
ANDY_CODEWORD=andy activate
ANDY_SESSION_SECRET=use_a_long_random_secret
ANDY_WEBHOOK_SECRET=use_a_long_random_secret
POSTFORGE_URL=https://postforge-ai-one.vercel.app
POSTFORGE_API_SECRET=use_the_same_value_as_postforge
```

## Voice Input

Voice commands use browser microphone recording plus server-side OpenAI transcription and OpenAI TTS. Use Chrome on HTTPS, allow microphone permission from the browser address bar, then click **Record voice**, speak, and click **Stop and transcribe**.

## Titan Automation

Commands such as `activate Titan`, `run Titan`, or `post with Titan` create an Agent Queue job in ANDY. The job is executed step-by-step with polling so Vercel does not need one long request. Titan rotates through News, Tools, Income, Transform, and Automation, then calls PostForge to refresh verified sources, select the latest item, generate a carousel plan, create carousel images, and publish to Instagram.

For cost protection, set the same `POSTFORGE_API_SECRET` value in both ANDY and PostForge. ANDY sends it as `x-postforge-secret` when Titan calls PostForge.

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
