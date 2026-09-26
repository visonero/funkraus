"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { hasCourseAccess } from "@/lib/course/data";
import { isDemoMode } from "@/lib/course/demo";
import { towerMode } from "./ai";
import { buildFeedback } from "./feedback";
import { checkCanStart } from "./limits";
import { getScenario, pickVariant, scenarioExists, type FlightInfo } from "./scenarios";
import { getStore, type Feedback } from "./store";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const GENERIC = "Das hat leider nicht geklappt. Bitte versuch es gleich nochmal.";

export async function startTowerSession(scenarioId: string): Promise<Result<{ sessionId: string; situation: string; stepCount: number; mode: "live" | "mock"; info: FlightInfo }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };
  if (!scenarioExists(scenarioId)) return { ok: false, error: "Diese Übung gibt es nicht." };

  const mode = towerMode();
  // Prepared answers are for local development only. In production the feature stays closed until an API key exists.
  if (mode === "mock" && !isDemoMode()) return { ok: false, error: "Das Funktraining ist noch nicht freigeschaltet." };

  const hasAccess = await hasCourseAccess(user.id);
  const check = await checkCanStart(user.id, hasAccess);
  if (!check.ok) return { ok: false, error: check.error };

  try {
    const store = getStore();
    // Only one running session per user: close anything still open.
    const recent = await store.forUserSince(user.id, new Date(Date.now() - 2 * 3600 * 1000).toISOString());
    for (const s of recent.filter((r) => r.status === "active")) {
      const row = await store.get(s.id);
      if (row) await store.save({ ...row, status: "ended", endedAt: new Date().toISOString() });
    }
    // Random variant (aircraft, callsign, aerodrome, values), different from the last one this learner had.
    const previous = (await store.forUserSince(user.id, new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()))
      .filter((r) => r.scenarioId === scenarioId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
    const variant = pickVariant(scenarioId, previous?.variant);
    const scenario = getScenario(scenarioId, variant)!;
    const row = await store.create(user.id, scenarioId, variant, mode, !hasAccess);
    return { ok: true, sessionId: row.id, situation: scenario.steps[0].situation, stepCount: scenario.steps.length, mode, info: scenario.info };
  } catch (e) {
    if (e instanceof Error && e.message === "ACTIVE_SESSION_EXISTS") return { ok: false, error: "Es läuft bereits eine Übung. Bitte warte einen Moment und versuch es dann noch einmal." };
    console.error("[tower] start failed", e);
    return { ok: false, error: GENERIC };
  }
}

export async function finishTowerSession(sessionId: string): Promise<Result<{ feedback: Feedback; completed: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };
  try {
    const store = getStore();
    const row = await store.get(sessionId);
    if (!row || row.userId !== user.id) return { ok: false, error: "Übung nicht gefunden." };
    if (row.busyUntil && new Date(row.busyUntil).getTime() > Date.now()) return { ok: false, error: "Der Tower antwortet noch. Bitte warte einen Moment." };
    const completed = row.status === "completed";
    if (row.feedback) return { ok: true, feedback: row.feedback, completed };

    const scenario = getScenario(row.scenarioId, row.variant);
    if (!scenario) return { ok: false, error: GENERIC };

    // Built from the mistakes recorded during the practice, so no extra AI call (and no cost) is needed.
    const feedback = buildFeedback(scenario, row.transcript, completed);
    row.feedback = feedback;
    row.status = completed ? "completed" : "ended";
    row.endedAt = new Date().toISOString();
    await store.save(row);
    return { ok: true, feedback, completed };
  } catch (e) {
    console.error("[tower] finish failed", e);
    return { ok: false, error: GENERIC };
  }
}
