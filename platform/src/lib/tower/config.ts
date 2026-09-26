// Limits, models and prices for the AI tower practice. Everything that costs money is capped here and enforced
// on the server for every request (see limits.ts). Env variables override the defaults.

const num = (name: string, fallback: number) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && process.env[name] !== undefined && process.env[name] !== "" ? v : fallback;
};

export const TOWER = {
  // Master kill switch: TOWER_ENABLED=0 stops every call immediately.
  enabled: process.env.TOWER_ENABLED !== "0",

  llmModel: process.env.TOWER_MODEL ?? "claude-haiku-4-5-20251001",
  ttsModel: process.env.TOWER_TTS_MODEL ?? "eleven_flash_v2_5",
  sttModel: process.env.TOWER_STT_MODEL ?? "scribe_v1",
  voiceId: process.env.TOWER_VOICE_ID ?? "j46AY0iVY3oHcnZbgEJg",

  limits: {
    // Per session
    maxTurnsPerSession: num("TOWER_MAX_TURNS", 16),
    maxSessionMinutes: num("TOWER_MAX_SESSION_MINUTES", 20),
    maxAudioSeconds: num("TOWER_MAX_AUDIO_SECONDS", 15),
    maxAudioBytes: num("TOWER_MAX_AUDIO_BYTES", 250_000),
    maxBodyBytes: num("TOWER_MAX_BODY_BYTES", 300_000),
    maxTranscriptChars: num("TOWER_MAX_TRANSCRIPT_CHARS", 300),
    minSecondsBetweenTurns: num("TOWER_MIN_SECONDS_BETWEEN_TURNS", 2),
    llmMaxTokens: num("TOWER_LLM_MAX_TOKENS", 320),
    ttsMaxChars: num("TOWER_TTS_MAX_CHARS", 250),
    historyTurnsSent: num("TOWER_HISTORY_TURNS_SENT", 6),

    // Per user
    maxSessionsPerDay: num("TOWER_MAX_SESSIONS_PER_DAY", 5),
    userMonthlyBudgetUsd: num("TOWER_USER_MONTHLY_BUDGET_USD", 2.5),
    freeTrialSessions: num("TOWER_FREE_TRIAL_SESSIONS", 1),

    // Whole platform
    globalMonthlyBudgetUsd: num("TOWER_GLOBAL_MONTHLY_BUDGET_USD", 60),
    // Free trial practices get their own small budget, so free-account farming can never use up the paying users' share.
    trialMonthlyBudgetUsd: num("TOWER_TRIAL_MONTHLY_BUDGET_USD", 5),
  },
} as const;

// USD per million tokens [input, output]. Unknown models are priced like the most expensive tier so a model
// change can never make the accounting look cheaper than it is.
const LLM_PRICES: Record<string, [number, number]> = {
  "claude-haiku-4-5-20251001": [1, 5],
  "claude-sonnet-5": [2, 10],
};
const FALLBACK_LLM_PRICE: [number, number] = [10, 50];

const TTS_USD_PER_1K_CHARS: Record<string, number> = {
  eleven_flash_v2_5: 0.05,
  eleven_turbo_v2_5: 0.05,
  eleven_multilingual_v2: 0.1,
};
const STT_USD_PER_HOUR = 0.4; // scribe_v1; billed conservatively (scribe_v2 is listed at 0.22)

export type Usage = { inputTokens: number; outputTokens: number; ttsChars: number; sttSeconds: number };
export const ZERO_USAGE: Usage = { inputTokens: 0, outputTokens: 0, ttsChars: 0, sttSeconds: 0 };

// Cost in micro-USD (1,000,000 = 1 USD), integer so sums never drift.
export function costMicroUsd(u: Usage, llmModel: string): number {
  const [pin, pout] = LLM_PRICES[llmModel] ?? FALLBACK_LLM_PRICE;
  const llm = u.inputTokens * pin + u.outputTokens * pout; // tokens * $/MTok = micro-USD
  const tts = u.ttsChars * (TTS_USD_PER_1K_CHARS[TOWER.ttsModel] ?? 0.1) * 1000; // chars * $/1k chars * 1000 = micro-USD
  const stt = (u.sttSeconds / 3600) * STT_USD_PER_HOUR * 1_000_000;
  return Math.round(llm + tts + stt);
}

export const usd = (micro: number) => micro / 1_000_000;

// Spoken-form fixes applied before text-to-speech (same idea as content/voices.json).
export const PRONUNCIATIONS: Record<string, string> = {
  Echo: "Ecko",
  QNH: "Ku En Ha",
  hPa: "Hektopascal",
};
