import { TOWER, usd } from "./config";
import { getStore, type SessionRow } from "./store";

const DAY_MS = 24 * 3600 * 1000;
const THIRTY_DAYS_MS = 30 * DAY_MS;

export type Check = { ok: true } | { ok: false; error: string; code: "disabled" | "session" | "daily" | "budget" | "global" | "trial" | "rate" };

export type UsageSummary = {
  sessionsToday: number;
  sessionsTodayMax: number;
  budgetUsedPercent: number; // share of the user's 30-day budget, 0-100
  freeSessionsLeft: number | null; // null when the user has full access
};

const monthStartIso = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
};

async function userWindow(userId: string) {
  const store = getStore();
  const last30 = await store.forUserSince(userId, new Date(Date.now() - THIRTY_DAYS_MS).toISOString());
  const dayAgo = new Date(Date.now() - DAY_MS).toISOString();
  return {
    last30,
    sessionsToday: last30.filter((s) => s.startedAt >= dayAgo).length,
    spentMicro: last30.reduce((n, s) => n + s.costMicroUsd, 0),
  };
}

export async function getUsageSummary(userId: string, hasAccess: boolean): Promise<UsageSummary> {
  const { sessionsToday, spentMicro } = await userWindow(userId);
  const total = hasAccess ? 0 : await getStore().countForUser(userId);
  return {
    sessionsToday,
    sessionsTodayMax: TOWER.limits.maxSessionsPerDay,
    budgetUsedPercent: Math.min(100, Math.round((usd(spentMicro) / TOWER.limits.userMonthlyBudgetUsd) * 100)),
    freeSessionsLeft: hasAccess ? null : Math.max(0, TOWER.limits.freeTrialSessions - total),
  };
}

// Checked before a new session is created.
export async function checkCanStart(userId: string, hasAccess: boolean): Promise<Check> {
  if (!TOWER.enabled) return { ok: false, code: "disabled", error: "Das Funktraining ist gerade nicht verfügbar." };
  const store = getStore();

  if (!hasAccess) {
    const total = await store.countForUser(userId);
    if (total >= TOWER.limits.freeTrialSessions) {
      return { ok: false, code: "trial", error: "Deine kostenlose Probe-Übung ist verbraucht. Mit dem Vollzugang übst du hier so oft du willst (im Rahmen des Tageslimits)." };
    }
  }

  const { sessionsToday, spentMicro } = await userWindow(userId);
  if (sessionsToday >= TOWER.limits.maxSessionsPerDay) {
    return { ok: false, code: "daily", error: `Du hast heute schon ${TOWER.limits.maxSessionsPerDay} Übungen gemacht. Morgen geht es weiter.` };
  }
  if (usd(spentMicro) >= TOWER.limits.userMonthlyBudgetUsd) {
    return { ok: false, code: "budget", error: "Dein Übungskontingent für diesen Zeitraum ist aufgebraucht. Es füllt sich innerhalb der nächsten Tage wieder auf." };
  }
  if (usd(await store.totalCostSince(monthStartIso())) >= TOWER.limits.globalMonthlyBudgetUsd) {
    return { ok: false, code: "global", error: "Das Funktraining ist für diesen Monat ausgelastet. Bitte versuch es ab dem nächsten Monat wieder." };
  }
  return { ok: true };
}

// Checked before every transmission (each one costs speech recognition, an AI answer and a voice).
export async function checkCanTurn(row: SessionRow): Promise<Check> {
  if (!TOWER.enabled) return { ok: false, code: "disabled", error: "Das Funktraining ist gerade nicht verfügbar." };
  if (row.status !== "active") return { ok: false, code: "session", error: "Diese Übung ist beendet." };
  if (row.turns >= TOWER.limits.maxTurnsPerSession) {
    return { ok: false, code: "session", error: `Maximal ${TOWER.limits.maxTurnsPerSession} Funksprüche pro Übung erreicht. Beende die Übung und sieh dir das Feedback an.` };
  }
  if (Date.now() - new Date(row.startedAt).getTime() > TOWER.limits.maxSessionMinutes * 60_000) {
    return { ok: false, code: "session", error: `Die Übung dauert länger als ${TOWER.limits.maxSessionMinutes} Minuten. Beende sie und starte bei Bedarf eine neue.` };
  }
  if (row.lastTurnAt && Date.now() - new Date(row.lastTurnAt).getTime() < TOWER.limits.minSecondsBetweenTurns * 1000) {
    return { ok: false, code: "rate", error: "Bitte einen Moment warten, bevor du den nächsten Funkspruch sendest." };
  }

  const { spentMicro } = await userWindow(row.userId);
  if (usd(spentMicro) >= TOWER.limits.userMonthlyBudgetUsd) {
    return { ok: false, code: "budget", error: "Dein Übungskontingent ist aufgebraucht. Beende die Übung, um dein Feedback zu sehen." };
  }
  if (usd(await getStore().totalCostSince(monthStartIso())) >= TOWER.limits.globalMonthlyBudgetUsd) {
    return { ok: false, code: "global", error: "Das Funktraining ist für diesen Monat ausgelastet." };
  }
  return { ok: true };
}
