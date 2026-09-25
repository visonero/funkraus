"use client";

import { useState, useTransition } from "react";
import { submitAnswer } from "@/lib/course/actions";
import QuestionTools from "./QuestionTools";

type Question = { id: string; question: string; options: string[] };
type Result = { selected: number; correct: boolean; correctIndex: number; explanation: string | null };

export default function LessonQuiz({ questions, flaggedIds = [], hideOnUnflag = false }: { questions: Question[]; flaggedIds?: string[]; hideOnUnflag?: boolean }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, Result>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function answer(q: Question, index: number) {
    if (results[q.id] || pendingId) return;
    setPendingId(q.id);
    setError(null);
    startTransition(async () => {
      const res = await submitAnswer(q.id, index);
      if (res.ok) {
        setResults((prev) => ({ ...prev, [q.id]: { selected: index, correct: res.correct, correctIndex: res.correctIndex, explanation: res.explanation } }));
      } else {
        setError(res.error);
      }
      setPendingId(null);
    });
  }

  function retry(id: string) {
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r.correct).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q, qi) => {
        if (hidden.has(q.id)) return null;
        const result = results[q.id];
        return (
          <div key={q.id} className="glass dash-card">
            <span className="label" style={{ color: "var(--text-faint)" }}>Frage {qi + 1} von {questions.length}</span>
            <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600, lineHeight: 1.45 }}>{q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {q.options.map((option, i) => {
                let state = "";
                if (result) {
                  if (i === result.correctIndex) state = " is-correct";
                  else if (i === result.selected) state = " is-wrong";
                }
                return (
                  <button
                    key={i}
                    className={`quiz-option${state}`}
                    disabled={Boolean(result) || pendingId === q.id}
                    onClick={() => answer(q, i)}
                  >
                    <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{option}</span>
                  </button>
                );
              })}
            </div>
            {result?.explanation && (
              <p style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(47,155,234,0.08)", fontSize: 14, lineHeight: 1.6, color: "var(--text-dim)" }}>
                {result.explanation}
              </p>
            )}
            <div style={{ marginTop: 16 }}>
              <QuestionTools
                questionId={q.id}
                initialFlagged={flaggedIds.includes(q.id)}
                selectedIndex={result?.selected ?? null}
                onFlagChange={hideOnUnflag ? (f) => !f && setHidden((prev) => new Set(prev).add(q.id)) : undefined}
              />
            </div>
            {result && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: result.correct ? "#0f9f6e" : "#c0334d" }}>
                  {result.correct ? "Richtig!" : "Leider falsch — die richtige Antwort ist markiert."}
                </span>
                <button
                  onClick={() => retry(q.id)}
                  style={{ background: "none", border: "none", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--sky-deep)" }}
                >
                  Nochmal versuchen
                </button>
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <p style={{ fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 14px", borderRadius: 10 }}>{error}</p>
      )}
      {answered === questions.length && questions.length > 0 && (
        <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-dim)" }}>
          Ergebnis: {correct} von {questions.length} richtig.
        </p>
      )}
    </div>
  );
}
