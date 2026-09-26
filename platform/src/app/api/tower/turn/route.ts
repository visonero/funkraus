import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { askTower, speak, speechAvailable, transcribe } from "@/lib/tower/ai";
import { costMicroUsd, TOWER } from "@/lib/tower/config";
import { checkCanTurn } from "@/lib/tower/limits";
import { normalizeTranscript } from "@/lib/tower/normalize";
import { getScenario } from "@/lib/tower/scenarios";
import { getStore } from "@/lib/tower/store";

export const runtime = "nodejs";
export const maxDuration = 45;

const fail = (error: string, status = 400, extra: object = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

// One radio transmission: audio (or typed text) in, transcript + tower answer + tower voice out.
// Every limit is checked here on the server; nothing the browser sends can raise a limit.
export async function POST(req: Request) {
  // Only requests from our own pages (blocks cross-site form posts even if a cookie were sent).
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return fail("Ungültige Anfrage.", 403);
    } catch {
      return fail("Ungültige Anfrage.", 403);
    }
  }

  // Refuse oversized bodies before anything is read into memory.
  const length = Number(req.headers.get("content-length") ?? 0);
  if (!length) return fail("Ungültige Anfrage.", 411);
  if (length > TOWER.limits.maxBodyBytes) return fail("Die Aufnahme ist zu lang. Fasse dich kürzer, wie im echten Funk.", 413);

  const user = await getCurrentUser();
  if (!user) return fail("Bitte melde dich erneut an.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Ungültige Anfrage.");
  }

  const store = getStore();
  let row;
  try {
    row = await store.get(String(form.get("sessionId") ?? ""));
  } catch (e) {
    console.error("[tower] session read failed", e);
    return fail("Das Funktraining ist gerade nicht erreichbar. Bitte versuch es später noch einmal.", 503);
  }
  // Same answer for "does not exist" and "belongs to someone else", so ids cannot be probed.
  if (!row || row.userId !== user.id) return fail("Übung nicht gefunden.", 404);
  const scenario = getScenario(row.scenarioId, row.variant);
  if (!scenario) return fail("Übung nicht gefunden.", 404);

  const check = await checkCanTurn(row);
  if (!check.ok) return fail(check.error, check.code === "rate" ? 429 : check.code === "unavailable" ? 503 : 403, { code: check.code });

  const audio = form.get("audio");
  const typed = String(form.get("text") ?? "").replace(/[\u0000-\u001f]+/g, " ").trim();
  const hasAudio = audio instanceof File && audio.size > 0;
  if (!hasAudio && !typed) return fail("Es kam nichts an. Bitte sprich noch einmal.");
  if (hasAudio && audio.size > TOWER.limits.maxAudioBytes) return fail("Die Aufnahme ist zu lang. Fasse dich kürzer, wie im echten Funk.", 413);
  if (hasAudio && !speechAvailable()) return fail("Die Spracheingabe ist gerade nicht verfügbar. Du kannst den Funkspruch stattdessen tippen.");

  // Book the transmission atomically (session status, turn cap, spacing, "no other transmission in progress")
  // before any paid call. Parallel requests cannot pass this together.
  let claimed = false;
  try {
    claimed = await store.claimTurn(row.id, TOWER.limits.minSecondsBetweenTurns, TOWER.limits.maxTurnsPerSession);
  } catch (e) {
    console.error("[tower] claim failed", e);
    return fail("Das Funktraining ist gerade nicht erreichbar. Bitte versuch es später noch einmal.", 503);
  }
  if (!claimed) return fail("Bitte einen Moment warten, bis der Tower geantwortet hat.", 429, { code: "rate" });
  row.turns += 1;
  row.lastTurnAt = new Date().toISOString();

  const usage = { ...row.usage };
  const persistCost = async () => {
    row.usage = usage;
    row.costMicroUsd = costMicroUsd(usage, TOWER.llmModel);
    await store.save(row);
  };

  try {
    let pilotText = typed;
    if (hasAudio) {
      const claimedSeconds = Math.min(Number(form.get("duration")) || 5, TOWER.limits.maxAudioSeconds);
      const stt = await transcribe(audio, audio.name || "funk.webm", scenario.language);
      // Bill the length the provider measured, never less than what the browser claimed.
      usage.sttSeconds += Math.max(1, stt.seconds, claimedSeconds);
      if (stt.seconds > TOWER.limits.maxAudioSeconds + 3) {
        await persistCost();
        return fail("Die Aufnahme ist zu lang. Fasse dich kürzer, wie im echten Funk.", 413);
      }
      pilotText = stt.text;
    }
    pilotText = normalizeTranscript(pilotText.slice(0, TOWER.limits.maxTranscriptChars), scenario);
    if (!pilotText) {
      await persistCost();
      return fail("Ich habe nichts verstanden. Halte die Sprechtaste gedrückt und sprich etwas deutlicher.", 200, { empty: true });
    }

    const answer = await askTower(scenario, row.step, row.transcript, pilotText);
    usage.inputTokens += answer.inputTokens;
    usage.outputTokens += answer.outputTokens;

    let voice: { base64: string; chars: number } | null = null;
    try {
      voice = await speak(answer.tower, scenario.language);
    } catch (e) {
      console.error("[tower] tts failed", e);
    }
    if (voice) usage.ttsChars += voice.chars;

    row.transcript = [
      ...row.transcript,
      { role: "pilot", text: pilotText, step: row.step, issues: answer.issues, better: answer.better },
      { role: "tower", text: answer.tower, ok: answer.ok },
    ];
    if (answer.ok) row.step += 1;
    const done = row.step >= scenario.steps.length;
    if (done) {
      row.status = "completed";
      row.endedAt = new Date().toISOString();
    }
    await persistCost();

    return NextResponse.json({
      ok: true,
      transcript: pilotText,
      stepOk: answer.ok,
      tower: { text: answer.tower, audio: voice?.base64 ?? null },
      step: row.step,
      turns: row.turns,
      maxTurns: TOWER.limits.maxTurnsPerSession,
      done,
      nextSituation: done ? null : scenario.steps[row.step].situation,
    });
  } catch (e) {
    console.error("[tower] turn failed", e);
    await persistCost().catch(() => {});
    return fail("Der Tower antwortet gerade nicht. Bitte versuch es gleich noch einmal.", 502);
  } finally {
    await store.release(row.id).catch(() => {});
  }
}
