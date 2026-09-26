"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { finishTowerSession, startTowerSession } from "@/lib/tower/actions";
import type { UsageSummary } from "@/lib/tower/limits";
import type { PublicScenario } from "@/lib/tower/scenarios";
import type { Feedback } from "@/lib/tower/store";
import AppIcon from "./AppIcon";

type LogEntry = { role: "pilot" | "tower"; text: string; ok?: boolean };
type Phase = "pick" | "run" | "feedback";

const MAX_RECORD_SECONDS = 15;
const MIN_RECORD_MS = 500;
const nowMs = () => Date.now();

// ---------- Radio sound: narrow the voice like a real aircraft radio and add squelch noise ----------

function radioCurve(amount: number) {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function noiseBurst(ctx: AudioContext, seconds: number, volume: number) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * volume;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  return src;
}

async function playRadio(ctx: AudioContext, base64: string): Promise<void> {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const buffer = await ctx.decodeAudioData(bytes.buffer);

  const voice = ctx.createBufferSource();
  voice.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 380;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3100;
  const shaper = ctx.createWaveShaper();
  shaper.curve = radioCurve(9);
  const gain = ctx.createGain();
  gain.gain.value = 0.85;
  voice.connect(hp).connect(lp).connect(shaper).connect(gain).connect(ctx.destination);

  const hiss = noiseBurst(ctx, buffer.duration + 0.5, 0.012);
  hiss.connect(ctx.destination);
  const click = noiseBurst(ctx, 0.07, 0.09);
  click.connect(ctx.destination);

  const start = ctx.currentTime + 0.05;
  click.start(start);
  hiss.start(start);
  voice.start(start + 0.12);
  const end = start + 0.12 + buffer.duration;
  const tail = noiseBurst(ctx, 0.09, 0.09);
  tail.connect(ctx.destination);
  tail.start(end + 0.03);

  await new Promise<void>((resolve) => {
    tail.onended = () => resolve();
  });
}

// ---------- Component ----------

export default function TowerPractice({
  scenarios,
  usage,
  mode,
  speech,
}: {
  scenarios: PublicScenario[];
  usage: UsageSummary;
  mode: "live" | "mock";
  speech: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [scenario, setScenario] = useState<PublicScenario | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [situation, setSituation] = useState("");
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [turns, setTurns] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = phase === "run" && !busy && !playing && !done;

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [log]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close();
    },
    [],
  );

  const ensureAudio = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };

  async function start(s: PublicScenario) {
    setError(null);
    setStarting(s.id);
    ensureAudio(); // created inside the click so the browser allows playback later
    const res = await startTowerSession(s.id);
    setStarting(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setScenario(s);
    setSessionId(res.sessionId);
    setSituation(res.situation);
    setStep(0);
    setLog([]);
    setTurns(0);
    setDone(false);
    setFeedback(null);
    setPhase("run");
  }

  // Applies a tower answer to the screen and returns its audio (if any) so playback can happen after "busy" ends.
  const applyResult = useCallback((json: Record<string, unknown>): string | null => {
    if (!json.ok) {
      setError(String(json.error ?? "Das hat leider nicht geklappt."));
      return null;
    }
    const tower = json.tower as { text: string; audio: string | null };
    setLog((l) => [...l, { role: "pilot", text: String(json.transcript) }, { role: "tower", text: tower.text, ok: Boolean(json.stepOk) }]);
    setStep(Number(json.step));
    setTurns(Number(json.turns));
    if (json.nextSituation) setSituation(String(json.nextSituation));
    if (json.done) setDone(true);
    return tower.audio;
  }, []);

  async function play(audio: string) {
    if (!ctxRef.current) return;
    setPlaying(true);
    try {
      await playRadio(ctxRef.current, audio);
    } catch {
      // Playback failed: the text is still shown.
    }
    setPlaying(false);
  }

  async function send(body: FormData) {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    body.set("sessionId", sessionId);
    try {
      const res = await fetch("/api/tower/turn", { method: "POST", body });
      const json = await res.json().catch(() => ({ ok: false, error: "Ungültige Antwort vom Server." }));
      const audio = applyResult(json);
      setBusy(false);
      if (audio) await play(audio);
      return;
    } catch {
      setError("Keine Verbindung. Bitte versuch es gleich noch einmal.");
    }
    setBusy(false);
  }

  async function startRecording() {
    if (!canSend || recording) return;
    setError(null);
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      }
    } catch {
      setError("Kein Zugriff auf das Mikrofon. Erlaube das Mikrofon im Browser, oder tippe deinen Funkspruch unten ein.");
      return;
    }
    ensureAudio();
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(streamRef.current, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const ms = nowMs() - startedAtRef.current;
      if (ms < MIN_RECORD_MS) {
        setError("Halte die Sprechtaste gedrückt, solange du sprichst.");
        return;
      }
      const type = rec.mimeType || "audio/webm";
      const form = new FormData();
      form.set("audio", new File([new Blob(chunksRef.current, { type })], type.includes("mp4") ? "funk.m4a" : "funk.webm", { type }));
      form.set("duration", String(Math.ceil(ms / 1000)));
      void send(form);
    };
    recRef.current = rec;
    startedAtRef.current = nowMs();
    rec.start();
    setRecording(true);
    timerRef.current = setTimeout(stopRecording, MAX_RECORD_SECONDS * 1000);
  }

  function stopRecording() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const rec = recRef.current;
    if (rec && rec.state === "recording") rec.stop();
    setRecording(false);
  }

  // Space bar works as the push-to-talk key while no text field is focused.
  useEffect(() => {
    if (phase !== "run") return;
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isField(e.target)) {
        e.preventDefault();
        void startRecording();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isField(e.target)) stopRecording();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, canSend, recording]);

  function sendTyped() {
    const text = typed.trim();
    if (!text || !canSend) return;
    setTyped("");
    ensureAudio();
    const form = new FormData();
    form.set("text", text);
    void send(form);
  }

  async function finish() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    const res = await finishTowerSession(sessionId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setFeedback(res.feedback);
    setPhase("feedback");
    router.refresh();
  }

  function reset() {
    setPhase("pick");
    setScenario(null);
    setSessionId(null);
    setError(null);
  }

  // ---------- Views ----------

  const usageLine = (
    <p style={{ fontSize: 13, color: "var(--text-faint)" }}>
      {usage.freeSessionsLeft !== null
        ? `Probe-Übungen übrig: ${usage.freeSessionsLeft}`
        : `Heute: ${usage.sessionsToday} von ${usage.sessionsTodayMax} Übungen · Monatskontingent: ${usage.budgetUsedPercent} % genutzt`}
    </p>
  );

  if (phase === "pick") {
    return (
      <div>
        {mode === "mock" && (
          <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 14, background: "rgba(255,143,179,0.16)", fontSize: 13.5, color: "var(--text)" }}>
            <strong>Entwicklungsmodus:</strong> Es ist kein KI-Schlüssel hinterlegt, deshalb antwortet der Tower mit vorbereiteten Sätzen und das Feedback ist ein Platzhalter.
          </div>
        )}
        {!speech && (
          <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 14, background: "rgba(47,155,234,0.1)", fontSize: 13.5 }}>
            Spracheingabe und Tower-Stimme sind gerade nicht eingerichtet. Du kannst deine Funksprüche tippen.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {scenarios.map((s) => (
            <div key={s.id} className="glass dash-card" style={{ display: "flex", flexDirection: "column" }}>
              <span className="label" style={{ color: "var(--sky)" }}>{s.level} · {s.language === "de" ? "Deutsch" : "English"}</span>
              <h2 style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>{s.title}</h2>
              <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: "var(--text-dim)", flex: 1 }}>{s.blurb}</p>
              <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--text-faint)" }}>Dein Rufzeichen: {s.callsign}</p>
              <button type="button" onClick={() => void start(s)} disabled={starting !== null} className="btn-accent" style={{ marginTop: 14, padding: "12px 20px", borderRadius: 999, fontSize: 14.5, border: "none", opacity: starting ? 0.7 : 1 }}>
                {starting === s.id ? "Wird gestartet…" : "Übung starten"}
              </button>
            </div>
          ))}
        </div>
        {error && <p style={{ marginTop: 16, fontSize: 14, color: "#c0334d" }}>{error}</p>}
        <div style={{ marginTop: 18 }}>{usageLine}</div>
        <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: "var(--text-faint)", maxWidth: 640 }}>
          Datenschutz: Deine Aufnahme wird nur zur Texterkennung an unseren Dienstleister ElevenLabs gesendet und nicht gespeichert. Der erkannte Text wird zur Auswertung an Anthropic (Claude) übermittelt. Gespeichert werden nur der Text der Übung und die Nutzungsmenge.
        </p>
      </div>
    );
  }

  if (phase === "feedback" && feedback) {
    return (
      <div className="glass-strong dash-card" style={{ maxWidth: 760 }}>
        <span className="label" style={{ color: "var(--sky)" }}>Feedback</span>
        <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>{scenario?.title}</h2>
        <p style={{ marginTop: 6, fontSize: 22, letterSpacing: 2, color: "#f5b301" }} aria-label={`${feedback.bewertung} von 5 Sternen`}>
          {"★".repeat(feedback.bewertung)}
          <span style={{ color: "var(--line-strong)" }}>{"★".repeat(5 - feedback.bewertung)}</span>
        </p>
        <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: "var(--text-dim)" }}>{feedback.zusammenfassung}</p>
        {feedback.gut.length > 0 && (
          <>
            <h3 style={{ marginTop: 20, fontSize: 15, fontWeight: 700 }}>Das war gut</h3>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 14.5, lineHeight: 1.6, color: "var(--text-dim)" }}>
              {feedback.gut.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </>
        )}
        {feedback.verbessern.length > 0 && (
          <>
            <h3 style={{ marginTop: 20, fontSize: 15, fontWeight: 700 }}>Das kannst du verbessern</h3>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
              {feedback.verbessern.map((v, i) => (
                <div key={i} style={{ borderRadius: 14, padding: "12px 14px", background: "rgba(47,155,234,0.08)", fontSize: 14, lineHeight: 1.55 }}>
                  <p style={{ color: "#c0334d" }}>Du: {v.gesagt}</p>
                  <p style={{ color: "#0f9f6e", fontWeight: 600 }}>Besser: {v.besser}</p>
                  <p style={{ color: "var(--text-dim)" }}>{v.grund}</p>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={reset} className="btn-accent" style={{ padding: "12px 22px", borderRadius: 999, fontSize: 14.5, border: "none" }}>Noch eine Übung</button>
        </div>
      </div>
    );
  }

  // Running session
  const stepLabel = scenario ? `Schritt ${Math.min(step + 1, scenario.stepCount)} von ${scenario.stepCount}` : "";
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="glass dash-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span className="label" style={{ color: "var(--sky)" }}>{scenario?.title} · {done ? "Geschafft" : stepLabel}</span>
          <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{turns} Funksprüche</span>
        </div>
        <p style={{ marginTop: 10, fontSize: 15.5, lineHeight: 1.6, fontWeight: 600 }}>{done ? "Alle Schritte sind durch. Beende die Übung und sieh dir dein Feedback an." : situation}</p>
        {scenario && !done && <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-faint)" }}>Dein Rufzeichen: {scenario.callsign}</p>}
      </div>

      <div className="glass" style={{ marginTop: 14, borderRadius: 20, padding: 16, minHeight: 180, maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {log.length === 0 && <p style={{ fontSize: 14, color: "var(--text-faint)" }}>Halte die Sprechtaste gedrückt (oder die Leertaste) und sprich deinen Funkspruch.</p>}
        {log.map((e, i) => (
          <div key={i} style={{ alignSelf: e.role === "pilot" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-faint)", textAlign: e.role === "pilot" ? "right" : "left" }}>
              {e.role === "pilot" ? "Du" : "Tower"}
              {e.role === "tower" && e.ok === false ? " · Rückfrage" : ""}
              {e.role === "tower" && e.ok ? " · ✓" : ""}
            </p>
            <div style={{ borderRadius: 14, padding: "9px 13px", fontSize: 14.5, lineHeight: 1.5, background: e.role === "pilot" ? "rgba(47,155,234,0.14)" : "rgba(255,255,255,0.85)", border: e.role === "tower" && e.ok === false ? "1.5px solid rgba(192,51,77,0.35)" : "1px solid var(--line)" }}>
              {e.text ? e.text : <em style={{ color: "var(--text-faint)" }}>Keine Antwort nötig, du hast richtig bestätigt.</em>}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {error && <p style={{ marginTop: 12, fontSize: 14, color: "#c0334d" }}>{error}</p>}

      {!done && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {speech && (
            <button
              type="button"
              disabled={!canSend && !recording}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                void startRecording();
              }}
              onPointerUp={stopRecording}
              onPointerCancel={stopRecording}
              onContextMenu={(e) => e.preventDefault()}
              className="btn-accent"
              aria-label="Sprechtaste, gedrückt halten"
              style={{ width: 132, height: 132, borderRadius: "50%", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, touchAction: "none", userSelect: "none", opacity: !canSend && !recording ? 0.55 : 1, background: recording ? "linear-gradient(100deg,#e5484d,#c0334d)" : undefined, boxShadow: recording ? "0 0 0 10px rgba(229,72,77,0.18)" : undefined }}
            >
              <AppIcon name="mic" size={34} />
              {recording ? "Sprich jetzt…" : busy ? "Tower antwortet…" : playing ? "Tower spricht…" : "Sprechtaste"}
            </button>
          )}
          <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 520 }}>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTyped()}
              maxLength={300}
              placeholder="Oder Funkspruch tippen…"
              aria-label="Funkspruch tippen"
              style={{ flex: 1, padding: "11px 14px", borderRadius: 999, border: "1.5px solid var(--line-strong)", background: "rgba(255,255,255,0.8)", fontSize: 14.5, fontFamily: "var(--font-body)", color: "var(--text)" }}
            />
            <button type="button" onClick={sendTyped} disabled={!canSend || !typed.trim()} className="btn-ghost" style={{ padding: "11px 18px", borderRadius: 999, fontSize: 14, fontWeight: 700, opacity: !canSend || !typed.trim() ? 0.5 : 1 }}>Senden</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={() => void finish()} disabled={busy || playing} className={done ? "btn-accent" : "btn-ghost"} style={{ padding: "11px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, border: done ? "none" : undefined, opacity: busy || playing ? 0.6 : 1 }}>
          {done ? "Feedback ansehen" : "Übung beenden"}
        </button>
        {busy && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>Einen Moment…</span>}
      </div>
    </div>
  );
}
