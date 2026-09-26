import { isDemoMode } from "@/lib/course/demo";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Usage } from "./config";

export type IssueKind = "fehlt" | "reihenfolge" | "phraseologie" | "zahl" | "rueckbestaetigung";
export type Issue = { art: IssueKind; text: string };

// Pilot entries carry the step they belonged to and the real mistakes the tower found; tower entries carry ok.
export type TranscriptEntry = { role: "pilot" | "tower"; text: string; ok?: boolean; step?: number; issues?: Issue[]; better?: string };

export type Feedback = {
  zusammenfassung: string;
  gut: string[];
  verbessern: { gesagt: string; besser: string; grund: string }[];
  bewertung: number;
};

export type SessionRow = {
  id: string;
  userId: string;
  scenarioId: string;
  variant: number;
  status: "active" | "completed" | "ended";
  mode: "live" | "mock";
  step: number;
  turns: number;
  transcript: TranscriptEntry[];
  feedback: Feedback | null;
  usage: Usage;
  costMicroUsd: number;
  startedAt: string;
  lastTurnAt: string | null;
  endedAt: string | null;
  busyUntil: string | null;
};

export type SessionSummary = Pick<SessionRow, "id" | "userId" | "scenarioId" | "variant" | "status" | "mode" | "turns" | "usage" | "costMicroUsd" | "startedAt">;

export interface TowerStore {
  create(userId: string, scenarioId: string, variant: number, mode: "live" | "mock", trial: boolean): Promise<SessionRow>;
  // Books one transmission atomically (status, turn cap, spacing). Returns false when the session may not take another turn.
  claimTurn(id: string, minSeconds: number, maxTurns: number): Promise<boolean>;
  // Frees the "transmission in progress" lock set by claimTurn.
  release(id: string): Promise<void>;
  trialCostSince(sinceIso: string): Promise<number>;
  get(id: string): Promise<SessionRow | null>;
  save(row: SessionRow): Promise<void>;
  // Sessions of one user since a point in time (limits: per day, per 30 days, budget).
  forUserSince(userId: string, sinceIso: string): Promise<SessionSummary[]>;
  countForUser(userId: string): Promise<number>;
  totalCostSince(sinceIso: string): Promise<number>;
  recent(limit: number): Promise<SessionSummary[]>;
}

const summary = (r: SessionRow): SessionSummary => ({
  id: r.id, userId: r.userId, scenarioId: r.scenarioId, variant: r.variant, status: r.status, mode: r.mode, turns: r.turns, usage: r.usage, costMicroUsd: r.costMicroUsd, startedAt: r.startedAt,
});

// ---------- In-memory store (local demo mode only; lost on server restart) ----------

const g = globalThis as unknown as { __towerMemory?: Map<string, SessionRow> };
const memory = (g.__towerMemory ??= new Map<string, SessionRow>());
const memoryTrial = new Map<string, boolean>();

const memoryStore: TowerStore = {
  async create(userId, scenarioId, variant, mode, trial) {
    if ([...memory.values()].some((r) => r.userId === userId && r.status === "active")) throw new Error("ACTIVE_SESSION_EXISTS");
    const row: SessionRow = {
      id: crypto.randomUUID(), userId, scenarioId, variant, status: "active", mode, step: 0, turns: 0, transcript: [], feedback: null,
      usage: { inputTokens: 0, outputTokens: 0, ttsChars: 0, sttSeconds: 0 }, costMicroUsd: 0, startedAt: new Date().toISOString(), lastTurnAt: null, endedAt: null, busyUntil: null,
    };
    memory.set(row.id, row);
    memoryTrial.set(row.id, trial);
    return structuredClone(row);
  },
  async claimTurn(id, minSeconds, maxTurns) {
    const row = memory.get(id);
    if (!row || row.status !== "active" || row.turns >= maxTurns) return false;
    if (row.busyUntil && new Date(row.busyUntil).getTime() > Date.now()) return false;
    if (row.lastTurnAt && Date.now() - new Date(row.lastTurnAt).getTime() < minSeconds * 1000) return false;
    row.lastTurnAt = new Date().toISOString();
    row.busyUntil = new Date(Date.now() + 40_000).toISOString();
    row.turns += 1;
    return true;
  },
  async release(id) {
    const row = memory.get(id);
    if (row) row.busyUntil = null;
  },
  async trialCostSince(sinceIso) {
    return [...memory.values()].filter((r) => memoryTrial.get(r.id) && r.startedAt >= sinceIso).reduce((n, r) => n + r.costMicroUsd, 0);
  },
  // Copies in and out, like a database: callers never share one object with the store.
  async get(id) {
    const row = memory.get(id);
    return row ? structuredClone(row) : null;
  },
  async save(row) {
    memory.set(row.id, structuredClone(row));
  },
  async forUserSince(userId, sinceIso) {
    return [...memory.values()].filter((r) => r.userId === userId && r.startedAt >= sinceIso).map(summary);
  },
  async countForUser(userId) {
    return [...memory.values()].filter((r) => r.userId === userId).length;
  },
  async totalCostSince(sinceIso) {
    return [...memory.values()].filter((r) => r.startedAt >= sinceIso).reduce((n, r) => n + r.costMicroUsd, 0);
  },
  async recent(limit) {
    return [...memory.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit).map(summary);
  },
};

// ---------- Database store ----------

type Db = Record<string, unknown>;

const fromDb = (r: Db): SessionRow => ({
  id: r.id as string,
  userId: r.user_id as string,
  scenarioId: r.scenario_id as string,
  variant: Number(r.variant ?? 0),
  status: r.status as SessionRow["status"],
  mode: r.mode as SessionRow["mode"],
  step: r.step as number,
  turns: r.turns as number,
  transcript: (r.transcript as TranscriptEntry[]) ?? [],
  feedback: (r.feedback as Feedback | null) ?? null,
  usage: { inputTokens: r.input_tokens as number, outputTokens: r.output_tokens as number, ttsChars: r.tts_chars as number, sttSeconds: Number(r.stt_seconds) },
  costMicroUsd: Number(r.cost_micro_usd),
  startedAt: r.started_at as string,
  lastTurnAt: (r.last_turn_at as string | null) ?? null,
  endedAt: (r.ended_at as string | null) ?? null,
  busyUntil: (r.busy_until as string | null) ?? null,
});

const SUMMARY_COLUMNS = "id, user_id, scenario_id, variant, status, mode, turns, input_tokens, output_tokens, tts_chars, stt_seconds, cost_micro_usd, started_at";
const summaryFromDb = (r: Db): SessionSummary => {
  const row = fromDb({ ...r, step: 0, transcript: [] });
  return summary(row);
};

const dbStore: TowerStore = {
  async create(userId, scenarioId, variant, mode, trial) {
    const { data, error } = await createAdminClient().from("tower_sessions").insert({ user_id: userId, scenario_id: scenarioId, variant, mode, trial }).select("*").single();
    if (error?.code === "23505") throw new Error("ACTIVE_SESSION_EXISTS"); // the one-active-session-per-user index
    if (error || !data) throw new Error(error?.message ?? "could not create session");
    return fromDb(data);
  },
  async get(id) {
    // Only ids that look like UUIDs reach the database.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
    const { data, error } = await createAdminClient().from("tower_sessions").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromDb(data) : null;
  },
  async claimTurn(id, minSeconds, maxTurns) {
    const { data, error } = await createAdminClient().rpc("tower_claim_turn", { p_session: id, p_min_seconds: minSeconds, p_max_turns: maxTurns });
    if (error) throw new Error(error.message);
    return data === true;
  },
  async release(id) {
    await createAdminClient().from("tower_sessions").update({ busy_until: null }).eq("id", id);
  },
  async trialCostSince(sinceIso) {
    const { data, error } = await createAdminClient().from("tower_sessions").select("cost_micro_usd").eq("trial", true).gte("started_at", sinceIso);
    if (error) throw new Error(error.message);
    return (data ?? []).reduce((n, r) => n + Number(r.cost_micro_usd), 0);
  },
  async save(row) {
    const { error } = await createAdminClient()
      .from("tower_sessions")
      .update({
        status: row.status, step: row.step, turns: row.turns, transcript: row.transcript, feedback: row.feedback,
        input_tokens: row.usage.inputTokens, output_tokens: row.usage.outputTokens, tts_chars: row.usage.ttsChars, stt_seconds: row.usage.sttSeconds,
        cost_micro_usd: row.costMicroUsd, last_turn_at: row.lastTurnAt, ended_at: row.endedAt,
      })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
  },
  async forUserSince(userId, sinceIso) {
    const { data, error } = await createAdminClient().from("tower_sessions").select(SUMMARY_COLUMNS).eq("user_id", userId).gte("started_at", sinceIso);
    if (error) throw new Error(error.message);
    return (data ?? []).map(summaryFromDb);
  },
  async countForUser(userId) {
    const { count, error } = await createAdminClient().from("tower_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  async totalCostSince(sinceIso) {
    const { data, error } = await createAdminClient().from("tower_sessions").select("cost_micro_usd").gte("started_at", sinceIso);
    if (error) throw new Error(error.message);
    return (data ?? []).reduce((n, r) => n + Number(r.cost_micro_usd), 0);
  },
  async recent(limit) {
    const { data } = await createAdminClient().from("tower_sessions").select(SUMMARY_COLUMNS).order("started_at", { ascending: false }).limit(limit);
    return (data ?? []).map(summaryFromDb);
  },
};

export const getStore = (): TowerStore => (isDemoMode() ? memoryStore : dbStore);
