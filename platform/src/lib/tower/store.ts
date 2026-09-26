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
};

export type SessionSummary = Pick<SessionRow, "id" | "userId" | "scenarioId" | "variant" | "status" | "mode" | "turns" | "usage" | "costMicroUsd" | "startedAt">;

export interface TowerStore {
  create(userId: string, scenarioId: string, variant: number, mode: "live" | "mock"): Promise<SessionRow>;
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

const memoryStore: TowerStore = {
  async create(userId, scenarioId, variant, mode) {
    const row: SessionRow = {
      id: crypto.randomUUID(), userId, scenarioId, variant, status: "active", mode, step: 0, turns: 0, transcript: [], feedback: null,
      usage: { inputTokens: 0, outputTokens: 0, ttsChars: 0, sttSeconds: 0 }, costMicroUsd: 0, startedAt: new Date().toISOString(), lastTurnAt: null, endedAt: null,
    };
    memory.set(row.id, row);
    return row;
  },
  async get(id) {
    return memory.get(id) ?? null;
  },
  async save(row) {
    memory.set(row.id, row);
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
});

const SUMMARY_COLUMNS = "id, user_id, scenario_id, variant, status, mode, turns, input_tokens, output_tokens, tts_chars, stt_seconds, cost_micro_usd, started_at";
const summaryFromDb = (r: Db): SessionSummary => {
  const row = fromDb({ ...r, step: 0, transcript: [] });
  return summary(row);
};

const dbStore: TowerStore = {
  async create(userId, scenarioId, variant, mode) {
    const { data, error } = await createAdminClient().from("tower_sessions").insert({ user_id: userId, scenario_id: scenarioId, variant, mode }).select("*").single();
    if (error || !data) throw new Error(error?.message ?? "could not create session");
    return fromDb(data);
  },
  async get(id) {
    const { data } = await createAdminClient().from("tower_sessions").select("*").eq("id", id).maybeSingle();
    return data ? fromDb(data) : null;
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
    const { data } = await createAdminClient().from("tower_sessions").select(SUMMARY_COLUMNS).eq("user_id", userId).gte("started_at", sinceIso);
    return (data ?? []).map(summaryFromDb);
  },
  async countForUser(userId) {
    const { count } = await createAdminClient().from("tower_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId);
    return count ?? 0;
  },
  async totalCostSince(sinceIso) {
    const { data } = await createAdminClient().from("tower_sessions").select("cost_micro_usd").gte("started_at", sinceIso);
    return (data ?? []).reduce((n, r) => n + Number(r.cost_micro_usd), 0);
  },
  async recent(limit) {
    const { data } = await createAdminClient().from("tower_sessions").select(SUMMARY_COLUMNS).order("started_at", { ascending: false }).limit(limit);
    return (data ?? []).map(summaryFromDb);
  },
};

export const getStore = (): TowerStore => (isDemoMode() ? memoryStore : dbStore);
