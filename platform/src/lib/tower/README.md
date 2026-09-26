# AI tower practice (prototype)

Learner speaks (push-to-talk) -> ElevenLabs speech-to-text -> Claude plays the tower -> ElevenLabs voice, played with a
radio filter in the browser. Ends with written feedback. Scenarios live in `scenarios.ts` (fictional aerodrome Waldheim).

## How the flow is controlled
The server tracks the scenario step. The AI only judges the pilot's last transmission against the current step and
answers as the tower (`{"ok": true|false, "tower": "..."}`). Prompts stay small (about 1,900 characters + the last 6 turns).

## Cost per practice (Claude Haiku 4.5 $1/$5 per MTok, ElevenLabs Flash voice $0.05 per 1k characters, speech-to-text billed at $0.40/h)
| | Tokens (in / out) | Voice characters | Speech seconds | Cost |
|---|---|---|---|---|
| Typical: 10 transmissions + feedback | about 11,500 / 950 | about 880 | about 60 | about $0.07 |
| Worst case: 16 transmissions, every cap hit | about 20,500 / 4,200 | 4,000 | 240 | about $0.27 |

The voice is roughly two thirds of the cost, the AI text about a fifth. Real usage is stored per session
(`tower_sessions`) and shown in the admin area under "Funktraining", so these estimates can be replaced by measured values.

## Limits (all enforced on the server, defaults in `config.ts`, override with TOWER_* env variables)
- per transmission: 15 s recording, 400 KB audio, 300 characters of text, 220 answer tokens, 250 voice characters, 2 s between transmissions
- per practice: 16 transmissions, 20 minutes
- per user: 5 practices per day, budget of $2.50 per rolling 30 days (measured cost), free users 1 trial practice in total
- whole platform: $60 per calendar month, then the feature pauses; `TOWER_ENABLED=0` stops everything at once

Also set spend limits at the providers (Anthropic Console monthly limit, ElevenLabs overage off) as a second safety net.
