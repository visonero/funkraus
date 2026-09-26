# AI tower practice (prototype)

Learner speaks (push-to-talk) -> ElevenLabs speech-to-text -> Claude plays the tower -> ElevenLabs voice, played with a
radio filter in the browser. Ends with written feedback. Scenarios live in `scenarios.ts` (fictional aerodrome Waldheim).

## How the flow is controlled
The server tracks the scenario step. The AI only judges the pilot's last transmission against the current step and
answers as the tower. Its verdict is structured: `{"ok", "tower", "fehler": [{"art", "text"}], "besser"}`.

Each exercise has 5 variants (aircraft, callsign, aerodrome, runway, wind, QNH, positions, times); one is picked at
random when a practice starts and it is never the same one twice in a row.

## Speech recognition is never held against the learner
Accents garble names ("Old Time Tower" for "Waldheim Tower"). Four layers keep that from costing points:
0. `normalize.ts` repairs what the code can know for certain before anything is judged: a callsign in which most words
   match ("Delta Echo Whiskey Papa Cool") becomes the real callsign, and a misheard aerodrome name in front of
   Tower/Turm/Ground/Rollkontrolle becomes the real name. Things that are really missing are left missing.
   The judge also receives a verified "system check" (callsign stated: yes/no) with every message.
1. The judge is told to ignore names, callsign letters, numbers spelled differently and pronunciation, and never to ask
   for a repeat just because something was recognised unclearly.
2. Mistakes can only be of the kinds `fehlt`, `reihenfolge`, `phraseologie`, `zahl`, `rueckbestaetigung`. There is no kind for
   names or pronunciation, and anything else the model reports is dropped (`cleanIssues` in `ai.ts`).
3. The feedback and the star rating are built in plain code from those recorded mistakes (`feedback.ts`). There is no
   second AI pass. Rating = 5 minus the number of transmissions with a real mistake (max. 3 if the practice was not finished).

## Cost per practice (Claude Haiku 4.5 $1/$5 per MTok, ElevenLabs Flash voice $0.05 per 1k characters, speech-to-text billed at $0.40/h)
| | Tokens (in / out) | Voice characters | Speech seconds | Cost |
|---|---|---|---|---|
| Typical: 10 transmissions | about 13,600 / 700 | about 880 | about 60 | about $0.07 |
| Worst case: 16 transmissions, every cap hit | about 24,500 / 5,100 | 4,000 | 240 | about $0.28 |

Each turn sends about 1,000 tokens of instructions plus the last 6 turns. Feedback needs no AI call. The voice is
roughly two thirds of the cost. Real usage is stored per session (`tower_sessions`) and shown in the admin area under
"Funktraining", so these estimates can be replaced by measured values.

## Limits (all enforced on the server, defaults in `config.ts`, override with TOWER_* env variables)
- per transmission: 15 s recording (billed on the length the speech provider measures), 250 KB audio, 300 KB request body, 300 characters of text, 320 answer tokens, 250 voice characters, 2 s between transmissions, one transmission in progress per session
- per practice: 16 transmissions, 20 minutes, at most one running practice per user
- per user: 5 practices per day, budget of $2.50 per rolling 30 days (measured cost)
- free users: 1 trial practice in total; all trials together share $5 per month, so free-account farming cannot use up the paying users' share
- whole platform: $60 per calendar month, then the feature pauses; `TOWER_ENABLED=0` stops everything at once
- every limit check fails closed: if the database cannot be read, the request is refused

## Concurrency and abuse protection
- `tower_claim_turn` (SQL function) books a transmission atomically: status, turn cap, spacing and "no other transmission of this session in progress". Parallel requests cannot pass together or overwrite each other's cost bookkeeping.
- A unique index allows only one active session per user.
- The endpoint only accepts same-origin requests, refuses oversized bodies before reading them, and answers "not found" alike for unknown and foreign session ids.
- `ANTHROPIC_BASE_URL` is ignored in production. Nothing tower-related is sent to the browser except scenario titles; the ideal answers stay on the server.

Also set spend limits at the providers (Anthropic Console monthly limit, ElevenLabs credit limit / overage off) as the final safety net: our numbers are our own accounting, the providers' invoices are the truth.
