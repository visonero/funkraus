"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { hasCourseAccess } from "@/lib/course/data";
import { isDemoMode } from "@/lib/course/demo";
import { makeFeedback, towerMode } from "./ai";
import { costMicroUsd, TOWER } from "./config";
import { checkCanStart } from "./limits";
import { getScenario } from "./scenarios";
import { getStore, type Feedback } from "./store";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const GENERIC = "Das hat leider nicht geklappt. Bitte versuch es gleich nochmal.";

export async function startTowerSession(scenarioId: string): Promise<Result<{ sessionId: string; situation: string; stepCount: number; mode: "live" | "mock" }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };
  const scenario = getScenario(scenarioId);
  if (!scenario) return { ok: false, error: "Diese Übung gibt es nicht." };

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
    const row = await store.create(user.id, scenario.id, mode);
    return { ok: true, sessionId: row.id, situation: scenario.steps[0].situation, stepCount: scenario.steps.length, mode };
  } catch (e) {
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
    const completed = row.status === "completed";
    if (row.feedback) return { ok: true, feedback: row.feedback, completed };

    const scenario = getScenario(row.scenarioId);
    if (!scenario) return { ok: false, error: GENERIC };
    if (!TOWER.enabled) return { ok: false, error: "Das Funktraining ist gerade nicht verfügbar." };

    const { feedback, inputTokens, outputTokens } = await makeFeedback(scenario, row.transcript);
    row.feedback = feedback;
    row.status = completed ? "completed" : "ended";
    row.endedAt = new Date().toISOString();
    row.usage = { ...row.usage, inputTokens: row.usage.inputTokens + inputTokens, outputTokens: row.usage.outputTokens + outputTokens };
    row.costMicroUsd = costMicroUsd(row.usage, TOWER.llmModel);
    await store.save(row);
    return { ok: true, feedback, completed };
  } catch (e) {
    console.error("[tower] finish failed", e);
    return { ok: false, error: GENERIC };
  }
}
