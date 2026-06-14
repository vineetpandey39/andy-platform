# 🤖 ANDY — Autonomous Neural Director for You

Your personal AI empire command center. Voice-activated. Codeword-protected. 10 autonomous agents running 24/7.

## 🏛️ The 10 Agents

| Agent | Role | Status |
|-------|------|--------|
| ⚡ TITAN | Instagram / PostForge AI | LIVE |
| 🎬 ALFA | YouTube (Cosmos AI + NautankiPOV) | Building |
| 💼 BETA | Fiverr Freelancing | Planned |
| 📚 HERMES | Amazon KDP Publishing | Planned |
| 🎯 ARES | LinkedIn B2B | Planned |
| ✨ APOLLO | Twitter/X | Planned |
| 🔮 ATHENA | Intelligence & Research | Planned |
| 🔧 HEPHAISTOS | System Maintenance | Planned |
| 💰 POSEIDON | Revenue & Finance | Planned |
| 👑 ZEUS | Master Overseer | Planned |

## 🚀 Deploy to Vercel

1. Push this repo to GitHub
2. Connect to Vercel
3. Add environment variables from `.env.example`
4. Deploy — Andy is live

## 🎙️ Voice Activation

- Click the orb to speak
- Andy responds via Web Speech API (built-in Chrome TTS)
- Codeword: `andy activate` (change in production)

## 🔗 n8n Integration

Andy has a webhook endpoint at `/api/webhook` that n8n agents ping to report activity.

```json
POST /api/webhook
{
  "agent": "titan",
  "event": "post_published", 
  "data": { "posts": 1, "reach": 450 }
}
```
