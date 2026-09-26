import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { askTower, speak, speechAvailable, transcribe } from "@/lib/tower/ai";
import { costMicroUsd, TOWER } from "@/lib/tower/config";
import { checkCanTurn } from "@/lib/tower/limits";
import { getScenario } from "@/lib/tower/scenarios";
import { getStore } from "@/lib/tower/store";

export const runtime = "nodejs";
export const maxDuration = 45;

const fail = (error: string, status = 400, extra: object = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

// One radio transmission: audio (or typed text) in, transcript + tower answer + tower voice out.
// Every limit is checked here on the server; nothing the browser sends can raise a limit.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melde dich erneut an.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Ungültige Anfrage.");
  }

  const store = getStore();
  const row = await store.get(String(form.get("sessionId") ?? ""));
  if (!row || row.userId !== user.id) return fail("Übung nicht gefunden.", 404);
  const scenario = getScenario(row.scenarioId);
  if (!scenario) return fail("Übung nicht gefunden.", 404);

  const check = await checkCanTurn(row);
  if (!check.ok) return fail(check.error, check.code === "rate" ? 429 : 403, { code: check.code });

  const audio = form.get("audio");
  const typed = String(form.get("text") ?? "").replace(/[\u0000-\u001f]+/g, " ").trim();
  const hasAudio = audio instanceof File && audio.size > 0;
  if (!hasAudio && !typed) return fail("Es kam nichts an. Bitte sprich noch einmal.");
  if (hasAudio && audio.size > TOWER.limits.maxAudioBytes) return fail("Die Aufnahme ist zu lang. Fasse dich kürzer, wie im echten Funk.");
  if (hasAudio && !speechAvailable()) return fail("Die Spracheingabe ist gerade nicht verfügbar. Du kannst den Funkspruch stattdessen tippen.");

  // Claim the turn before any paid call so parallel requests cannot bypass the rate limit.
  row.lastTurnAt = new Date().toISOString();
  await store.save(row);

  const usage = { ...row.usage };
  const persistCost = async () => {
    row.usage = usage;
    row.costMicroUsd = costMicroUsd(usage, TOWER.llmModel);
    await store.save(row);
  };

  try {
    let pilotText = typed;
    if (hasAudio) {
      const claimed = Math.min(Number(form.get("duration")) || 5, TOWER.limits.maxAudioSeconds);
      usage.sttSeconds += Math.max(1, claimed);
      pilotText = await transcribe(audio, audio.name || "funk.webm", scenario.language);
    }
    pilotText = pilotText.slice(0, TOWER.limits.maxTranscriptChars);
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

    row.transcript = [...row.transcript, { role: "pilot", text: pilotText }, { role: "tower", text: answer.tower, ok: answer.ok }];
    row.turns += 1;
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
  }
}
