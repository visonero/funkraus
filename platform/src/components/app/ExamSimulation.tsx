"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import AppIcon from "./AppIcon";
import { startExam, submitExam } from "@/lib/course/exam-actions";
import { EXAM_DURATION_SECONDS, EXAM_PASS_THRESHOLD, EXAM_QUESTION_COUNT } from "@/lib/course/exam";
import type { ExamResultDetail, ExamState, Track } from "@/lib/course/types";

// A pass with more than this much time still on the clock earns the extra "you finished fast" line.
const FAST_FINISH_REMAINING_SECONDS = 30 * 60;

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function ExamSimulation({ lessonId, track, initialState }: { lessonId: string; track: Track; initialState: ExamState }) {
  const [state, setState] = useState<ExamState>(initialState);
  const [result, setResult] = useState<ExamResultDetail | null>(null);
  const [remainingAtSubmit, setRemainingAtSubmit] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const endsAt = useMemo(() => (state.mode === "in-progress" ? new Date(state.startedAtIso).getTime() + state.durationSeconds * 1000 : null), [state]);
  const [remaining, setRemaining] = useState(() => (endsAt ? (endsAt - Date.now()) / 1000 : 0));

  function begin() {
    setError(null);
    startTransition(async () => {
      const res = await startExam(lessonId, track);
      if (res.ok) {
        setResult(null);
        setAnswers({});
        setState(res.state);
      } else {
        setError(res.error);
      }
    });
  }

  function submit(attemptId: string, finalAnswers: Record<string, number>, questionIds: string[], remainingAtCall: number) {
    startTransition(async () => {
      const payload = Object.entries(finalAnswers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
      const res = await submitExam(attemptId, payload, questionIds);
      if (res.ok) {
        setRemainingAtSubmit(remainingAtCall);
        setResult(res.result);
        setState({ mode: "start", lastResult: { score: res.result.score, passed: res.result.passed, submittedAtIso: new Date().toISOString() } });
      } else {
        setError(res.error);
      }
    });
  }

  // Jump to the top so the pass/fail result is immediately visible instead of staying scrolled
  // down at the question list / submit button.
  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [result]);

  // Countdown; auto-submits once when time runs out.
  useEffect(() => {
    if (state.mode !== "in-progress" || !endsAt) return;
    const attemptId = state.attemptId;
    const questionIds = state.questions.map((q) => q.id);
    let submitted = false;
    const tick = () => {
      const left = (endsAt - Date.now()) / 1000;
      setRemaining(left);
      if (left <= 0 && !submitted) {
        submitted = true;
        submit(attemptId, answers, questionIds, 0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, endsAt]);

  if (result) {
    const wrong = result.breakdown.filter((b) => !b.isCorrect);
    return (
      <section style={{ marginTop: 28 }}>
        <div className={result.passed ? "glass-strong dash-card" : "glass dash-card"} style={{ textAlign: "center", padding: "32px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: result.passed ? "#0b7a55" : "var(--pink)" }}>
            {result.passed ? "Bestanden" : "Nicht bestanden"}
          </p>
          <p style={{ marginTop: 8, fontSize: 44, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            {result.score} / {result.total}
          </p>
          <p style={{ marginTop: 4, fontSize: 14, color: "var(--text-faint)" }}>Bestanden ab {result.threshold} von {result.total} richtigen Antworten.</p>
          {result.passed && remainingAtSubmit > FAST_FINISH_REMAINING_SECONDS && (
            <p style={{ marginTop: 16, fontSize: 15, fontWeight: 700, color: "#0b7a55" }}>
              🚀 Wow, du hast die Prüfung in nur {Math.round((EXAM_DURATION_SECONDS - remainingAtSubmit) / 60)} Minuten bestanden! Das zeigt: Du bist bestens vorbereitet.
            </p>
          )}
          {result.passed && (
            <p style={{ marginTop: 10, fontSize: 15.5, fontWeight: 700 }}>Du bist jetzt bereit für die echte Prüfung! 🎉</p>
          )}
          <button onClick={begin} disabled={pending} className="btn-accent" style={{ marginTop: 20, padding: "12px 26px", borderRadius: 999, fontSize: 14.5 }}>
            {pending ? "Wird gestartet…" : "Erneut versuchen"}
          </button>
        </div>

        {wrong.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Falsch beantwortet ({wrong.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {wrong.map((b) => (
                <div key={b.questionId} className="glass dash-card">
                  <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45 }}>{b.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                    {b.options.map((option, i) => {
                      let state = "";
                      if (i === b.correctIndex) state = " is-correct";
                      else if (i === b.selectedIndex) state = " is-wrong";
                      return (
                        <div key={i} className={`quiz-option${state}`}>
                          <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
                          <span style={{ flex: 1 }}>{option}</span>
                        </div>
                      );
                    })}
                  </div>
                  {b.explanation && (
                    <p style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(47,155,234,0.08)", fontSize: 14, lineHeight: 1.6, color: "var(--text-dim)" }}>
                      {b.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  if (state.mode === "start") {
    return (
      <section className="glass-strong dash-card" style={{ marginTop: 28, padding: "28px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
            <AppIcon name="exam" size={20} />
          </span>
          <div>
            <p className="dash-card-title">Prüfungssimulation</p>
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>
              {EXAM_QUESTION_COUNT} zufällige Fragen aus dem offiziellen Katalog, 60 Minuten Zeit, {EXAM_PASS_THRESHOLD} richtige Antworten zum Bestehen.
            </p>
          </div>
        </div>
        {state.lastResult && (
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: state.lastResult.passed ? "#0b7a55" : "var(--pink)" }}>
            Letzter Versuch: {state.lastResult.score} von {EXAM_QUESTION_COUNT} — {state.lastResult.passed ? "bestanden" : "nicht bestanden"}.
          </p>
        )}
        <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--text-faint)" }}>
          Lädst du die Seite während der Prüfung neu, startet die Beantwortung neu — die Zeit läuft aber weiter.
        </p>
        <button onClick={begin} disabled={pending} className="btn-accent" style={{ marginTop: 20, padding: "12px 26px", borderRadius: 999, fontSize: 14.5 }}>
          {pending ? "Wird gestartet…" : "Prüfung starten"}
        </button>
        {error && <p style={{ marginTop: 14, fontSize: 13.5, color: "#c0334d" }}>{error}</p>}
      </section>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <section style={{ marginTop: 28 }}>
      <div
        className="glass-strong"
        style={{ position: "sticky", top: 12, zIndex: 5, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", color: remaining < 300 ? "var(--pink)" : "var(--text)" }}>
          ⏱ {formatClock(remaining)}
        </span>
        <span style={{ fontSize: 13.5, color: "var(--text-faint)", fontWeight: 600 }}>
          {answeredCount} von {EXAM_QUESTION_COUNT} beantwortet
        </span>
        <button onClick={() => submit(state.attemptId, answers, state.questions.map((q) => q.id), remaining)} disabled={pending} className="btn-accent" style={{ padding: "9px 20px", borderRadius: 999, fontSize: 13.5 }}>
          {pending ? "Wird abgegeben…" : "Prüfung abgeben"}
        </button>
      </div>

      {error && <p style={{ marginTop: 14, fontSize: 13.5, color: "#c0334d" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        {state.questions.map((q, qi) => (
          <div key={q.id} className="glass dash-card">
            <span className="label" style={{ color: "var(--text-faint)" }}>
              Frage {qi + 1} von {state.questions.length}
            </span>
            <p style={{ marginTop: 8, fontSize: 15.5, fontWeight: 600, lineHeight: 1.45 }}>{q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {q.options.map((option, i) => (
                <button
                  key={i}
                  className={`quiz-option${answers[q.id] === i ? " is-selected" : ""}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                >
                  <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{option}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={() => submit(state.attemptId, answers, state.questions.map((q) => q.id), remaining)} disabled={pending} className="btn-accent" style={{ padding: "12px 26px", borderRadius: 999, fontSize: 14.5 }}>
          {pending ? "Wird abgegeben…" : "Prüfung abgeben"}
        </button>
      </div>
    </section>
  );
}
