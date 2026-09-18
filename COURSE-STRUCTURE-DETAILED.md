# Course Structure — Internal Detailed Spec

_Internal reference only — not for the landing page. This is the exact content-block sequencing for every chapter: what type of content comes in what order, how long each video/audio piece is, how many quiz questions, what PDFs. Pairs with [COURSE-STRUCTURE-PUBLIC.md](COURSE-STRUCTURE-PUBLIC.md) (the marketing-facing summary of the same structure) and [BUSINESS-STRATEGY.md](BUSINESS-STRATEGY.md) (why this business/content approach was chosen)._

## Design principles behind this structure

1. **Alternate content types constantly.** No chapter is "just a video" or "just a quiz." Every chapter cycles through video → text → audio → quiz so attention resets every 2–4 minutes. This directly answers the "don't be boring" requirement.
2. **Video is reserved for where it earns its cost.** Full-motion video is used only for: (a) short hook intros that create narrative pull, and (b) content that is genuinely visual — reading a chart, airspace diagrams, cockpit instruments, ATIS boards. Everything else — phraseology drills, listening comprehension, dialogue practice — uses **audio-only** clips or text.
3. **This isn't just a cost hack — it's more exam-realistic.** The actual BZF exam (both the radio-simulation and the real cockpit environment) is 100% audio: pilots never see the person they're talking to. Practicing phraseology as audio-only listening/speaking drills is closer to the real skill than watching a video of it. The storage savings are a side effect of doing the pedagogy correctly, not a compromise.
4. **Audio is roughly 10–20x cheaper to store and stream than video at the same duration** (a compressed voice-only audio track runs ~1MB/minute vs. ~10–20MB/minute for compressed video). Shifting the bulk of the ~40+ dialogue examples and simulation exercises to audio, rather than video, is the single biggest lever on the storage-cost concern you raised.
5. **The official BNetzA question catalog is distributed throughout the course, not dumped in one giant bank.** Each module ends with a themed quiz drawn only from the subset of the ~254–261 official questions relevant to that module's topic, so practice is always tied to what was just taught. Module 6 and 10 then pull the full catalog together in exam-format simulations.

## The reusable chapter template

Every "lesson" (the unit inside a module — roughly what Aviation Hero calls a "Videolektion") follows this same beat pattern, adjusted in length by topic:

| # | Block type | Typical length | Purpose |
|---|---|---|---|
| 1 | **Hook video** | 45–90 sec | Sets up a concrete scenario/question ("You're cleared to land, but the tower says something you don't expect — what now?"). Animated or narrated, not talking-head. |
| 2 | **Text + diagram section** | 1–2 min read | Explains the underlying concept plainly, with a static diagram/graphic (airspace cross-section, radio-call structure, etc.). No video cost at all. |
| 3 | **Teaching video** _(only if visual)_ | 1.5–3 min | Demonstrates the procedure where seeing something matters (e.g. reading a VFR chart symbol, ATIS board). Skipped entirely for audio-only topics (Modules 2, 5, 7 mostly skip this block). |
| 4 | **Audio listening drill** | 1–3 min audio | A real-style radio exchange (voice actor or synthesized ATC + pilot voices) the student listens to, then answers "what should the readback have been?" |
| 5 | **Quick-check quiz** | 3–5 questions | Immediate low-stakes check pulled from the official question bank subset for this lesson's topic. |
| 6 | **Speak-aloud practice prompt** | text-guided | Student reads a target phrase aloud against a reference audio clip (no video, no recording/grading infra needed for v1 — just practice). |
| 7 | **Text section: edge cases & common mistakes** | 1 min read | The "gotchas" — what trips people up in the real exam. Also where the downloadable PDF cheat-sheet is offered. |
| 8 | **Lesson quiz** | 8–12 questions | Slightly deeper check, still themed, feeds into the module-end quiz pool. |

Every 2–3 lessons within a module, insert one **interactive radio-simulation scenario**: a branching audio/text exercise where the student hears an ATC call and picks/types the correct response from realistic options, with immediate feedback — this is the self-paced substitute for Aviation Hero's live Zoom coaching hours, at a fraction of the production cost since it's audio + branching logic, not a live instructor.

## Module-by-module chapter breakdown

### Module 1 — Luftfahrt-Basiswissen für Einsteiger

The one module where video is genuinely justified throughout — this is visual/spatial content (airspace, charts).

| Lesson | Topic | Hook video | Teaching video | Audio | Quiz Qs | PDF |
|---|---|---|---|---|---|---|
| 1.1 | Luftraumstruktur (Klassen G/E/D/C, Kontrollzonen) | 60s | 3min (animated airspace diagram) | – | 5 | Luftraum-Übersicht |
| 1.2 | Flugplatzarten (kontrolliert/unkontrolliert, AFIS) | 60s | 2.5min | – | 5 | – |
| 1.3 | ICAO-Kartenkunde (Symbole, Platzrundenhöhen) | 60s | 3min | – | 5 | Karten-Symbol-Spickzettel |
| 1.4 | Rufzeichen, Transponder-Grundlagen | 45s | 2min | 1min (Beispiel-Rufzeichen hören) | 5 | – |
| 1.5 | Rechtliche Grundlagen (FlugfunkV, wer braucht was) | 45s | 2min | – | 5 | – |
| 1.6 | Wetterinformationen verstehen (METAR/TAF Basics) | 60s | 2.5min | – | 5 | METAR-Decoder-Karte |
| **Module quiz** | cumulative | | | | **20 (mixed)** | |

Video total: ~19 min · Audio: ~1 min · Quiz questions: ~50

### Module 2 — Sprechfunk-Grundlagen & Standardphraseologie

Almost entirely audio-driven — this is rote phraseology, best learned by ear.

| Lesson | Topic | Hook video | Audio drills | Quiz Qs | PDF |
|---|---|---|---|---|---|
| 2.1 | Buchstabiertafel (ICAO-Alphabet) | 45s | 2min (spelling drills) | 5 | Alphabet-Karte |
| 2.2 | Zahlen & Uhrzeiten im Funk | 45s | 2min | 5 | – |
| 2.3 | Aufbau eines Funkspruchs, Kürzelsystem zum Mitschreiben | 60s | 2.5min | 5 | Kürzel-Cheat-Sheet |
| **Module quiz** | | | | **15** | |

Video total: ~2.5 min · Audio: ~6.5 min · Quiz questions: ~30

### Module 3 — Platzverkehr: Rollen, Start & Landung

| Lesson | Topic | Hook video | Teaching video (visual: airport diagram) | Audio (dialogue) | Sim scenario | Quiz Qs |
|---|---|---|---|---|---|---|
| 3.1 | Kontrollierter Flugplatz: ATIS & Rollfreigabe | 60s | 2min | 2min | – | 5 |
| 3.2 | Start & Abflugfreigabe | 45s | 1.5min | 2min | ✓ interactive sim (3min) | 5 |
| 3.3 | Platzrunde & Landefreigabe | 45s | 1.5min | 2min | – | 5 |
| 3.4 | Unkontrollierter Flugplatz: Selbstankündigung | 60s | 1.5min | 2.5min | ✓ interactive sim (3min) | 5 |
| **Module quiz** | | | | | | **20** |

Video total: ~8 min · Audio: ~8.5 min · Sim: ~6 min · Quiz questions: ~40

### Module 4 — Streckenflug & besondere Verfahren

| Lesson | Topic | Hook video | Teaching video | Audio | Sim scenario | Quiz Qs |
|---|---|---|---|---|---|---|
| 4.1 | Überlandflug-Funk & Fluginformationsdienst | 45s | 1.5min | 2min | – | 5 |
| 4.2 | Kontrollzonen-Durchflug | 45s | 1.5min | 2min | ✓ (3min) | 5 |
| 4.3 | Sonder-VFR & Verkehrsinfo | 45s | 1min | 2.5min | – | 5 |
| **Module quiz** | | | | | | **15** |

Video total: ~5.5 min · Audio: ~6.5 min · Sim: ~3 min · Quiz questions: ~30

### Module 5 — Not- und Dringlichkeitsverfahren

Deliberately video-light — this is procedure/phraseology, not visual.

| Lesson | Topic | Hook video | Audio | Quiz Qs | PDF |
|---|---|---|---|---|---|
| 5.1 | MAYDAY-Verfahren | 60s | 2min | 5 | Notfall-Karte |
| 5.2 | PAN PAN (Dringlichkeit) | 45s | 1.5min | 5 | – |
| 5.3 | Funkausfall (NORDO) & Transponder-Codes | 60s | 2min | 5 | – |
| **Module quiz** | | | | **15** | |

Video total: ~2.75 min · Audio: ~5.5 min · Quiz questions: ~30

### Module 6 — BZF II Prüfungssimulation

No new teaching content — pure assessment, built from everything above.

- Interactive mock exam: 100 randomized questions from the full official catalog subset relevant to BZF II, 60-minute timer, 75-correct pass threshold — mirrors the real exam exactly.
- A capstone radio-simulation scenario: a full simulated flight (start → taxi → departure → en-route → arrival → landing) played as one continuous audio exercise with the student responding at each prompt.
- Zero video. Zero new storage cost beyond the audio files already produced for Modules 2–5's drills (largely reused/remixed).

### Module 7 — Englischer Sprechfunk: Grundlagen (BZF I)

| Lesson | Topic | Hook video | Audio | Quiz Qs | PDF |
|---|---|---|---|---|---|
| 7.1 | Englisches Buchstabieralphabet & Zahlen | 45s | 2min | 5 | – |
| 7.2 | Standard-ICAO-Phrasen auf Englisch | 45s | 2.5min | 5 | Englisch-Phrasen-Karte |
| 7.3 | Unterschiede DE/EN Funkverfahren | 45s | 2min | 5 | – |
| **Module quiz** | | | | **15** | |

Video total: ~2.25 min · Audio: ~6.5 min · Quiz questions: ~30

### Module 8 — Englischer Platz- und Streckenverkehr (BZF I)

Mirrors Module 3+4's scenarios, in English — audio can partly reuse the same scenario *logic*, re-recorded in English.

| Lesson | Topic | Hook video | Teaching video | Audio | Sim scenario | Quiz Qs |
|---|---|---|---|---|---|---|
| 8.1 | Kontrollierter Platzverkehr (EN) | 45s | 1.5min | 2.5min | ✓ (3min) | 5 |
| 8.2 | Unkontrollierter Platzverkehr (EN) | 45s | 1min | 2.5min | – | 5 |
| 8.3 | Streckenflug & internationale Besonderheiten (EN) | 45s | 1.5min | 2.5min | ✓ (3min) | 5 |
| **Module quiz** | | | | | | **15** |

Video total: ~4.75 min · Audio: ~7.5 min · Sim: ~6 min · Quiz questions: ~30

### Module 9 — Textübersetzung & Fachvokabular (BZF I)

The exam's English reading/oral-translation component — text-and-audio heavy, minimal video.

| Lesson | Topic | Hook video | Text | Audio (reference reading) | Quiz Qs |
|---|---|---|---|---|---|
| 9.1 | Fachvokabular-Trainer (AIP/NOTAM-Begriffe) | 45s | vocab list + spaced-repetition flashcards | 2min reference pronunciation | 10 |
| 9.2 | Übersetzungstext-Übung 1 (AIP-Auszug) | – | full text | 1.5min reference reading | – |
| 9.3 | Übersetzungstext-Übung 2 (NOTAM-Auszug) | – | full text | 1.5min reference reading | – |
| **Module quiz** | | | | | **10** |

Video total: ~0.75 min · Audio: ~5 min · Quiz questions: ~20 · No PDFs (flashcard trainer replaces them here)

### Module 10 — BZF I Prüfungssimulation

Same format as Module 6, combined: 100-question theory test + translation-text exercise + full English/German mixed radio-simulation capstone. Zero video, reuses existing audio assets.

### Module 11 — Bonus: Nach dem Kurs

| Block | Content |
|---|---|
| Video (talking-head or animated, optional) | 8–10 min: how to register for the exam at a Bundesnetzagentur office, what to bring, exam-day tips, note on the separate ICAO language proficiency test (Level 4, required only if actually transmitting in English, not for the BZF I exam itself) |
| Text | Links/addresses for BNetzA exam locations, registration form walkthrough |

No quiz — this module is informational, not tested.

## Content inventory summary (storage-planning reference)

| Module | Video (min) | Audio (min) | Quiz questions |
|---|---|---|---|
| 1 | 19 | 1 | 50 |
| 2 | 2.5 | 6.5 | 30 |
| 3 | 8 | 14.5 (incl. sims) | 40 |
| 4 | 5.5 | 9.5 (incl. sims) | 30 |
| 5 | 2.75 | 5.5 | 30 |
| 6 | 0 | ~10 (capstone sim) | 100 (full mock exam) |
| 7 | 2.25 | 6.5 | 30 |
| 8 | 4.75 | 13.5 (incl. sims) | 30 |
| 9 | 0.75 | 5 | 20 |
| 10 | 0 | ~10 (capstone sim) | 100 (full mock exam) |
| 11 | 9 | 0 | 0 |
| **Total** | **~55 min video** | **~82 min audio** | **~460 question-instances** (drawing from the ~254–261 unique official questions, reused/rotated across quizzes) |

**Why this matters for the storage-cost question you raised earlier:** ~55 minutes of video at a reasonable streaming bitrate (~1080p, well-compressed H.264, roughly 8–12MB/min) is only **~500–650MB of video for the entire course** — trivial storage/bandwidth cost, nowhere near a concern at any realistic student volume. The ~82 minutes of audio adds negligible additional storage (audio at ~1MB/min ≈ 80MB total). This is dramatically leaner than Aviation Hero's stated 7+ hours of video, while arguably covering more ground (their video hours don't include a self-paced radio-simulation library or the full official question bank as structured quizzes — they rely on live coaching hours for that instead, which is a real production cost for them but doesn't appear in a video-storage bill).

**Caveat:** these are planning-stage time estimates to guide production and cost planning, not a locked script — actual runtimes will shift once real scripts and voiceovers are recorded. Revisit this table once first-draft scripts exist.

## What still needs to happen before this becomes real content

1. Write the actual scripts for every video/audio block above, sourced only from the official BNetzA Fragenkatalog, the DFS phraseology Bekanntmachung, and FlugfunkV (per [BUSINESS-STRATEGY.md](BUSINESS-STRATEGY.md) — no copying from competitor material).
2. Map every one of the ~254–261 official questions to exactly one module/lesson quiz above, so the full catalog is covered with no gaps and no duplication across modules (a simple spreadsheet exercise once the PDF is opened).
3. Record voiceover/audio (a decent USB mic + a script is enough for v1 — this does not need a studio) and produce the small number of visual/animated videos.
4. Run the external instructor/BZF-holder review pass (per BUSINESS-STRATEGY.md's agreed QA gate) against this structure and the scripts before recording final versions, so corrections happen before production, not after.
