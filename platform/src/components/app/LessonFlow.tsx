"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { submitAnswer } from "@/lib/course/actions";
import type { Section } from "@/lib/course/sections";
import AppIcon from "./AppIcon";
import CompleteButton from "./CompleteButton";
import QuestionTools from "./QuestionTools";

type Question = { id: string; question: string; options: string[] };
type Result = { selected: number; correct: boolean; correctIndex: number; explanation: string | null };

type Step =
  | { kind: "video"; label: string }
  | { kind: "text"; label: string; section: Section }
  | { kind: "audio"; label: string }
  | { kind: "question"; label: string; question: Question; index: number }
  | { kind: "finish"; label: string };

export type FlowProps = {
  lessonId: string;
  completed: boolean;
  mediaUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  sections: Section[];
  questions: Question[];
  flaggedIds: string[];
  next: { href: string; title: string } | null;
  initialStep: number;
};

const navBtn = { padding: "12px 24px", borderRadius: 999, fontSize: 14.5, fontWeight: 700 } as const;

// The lesson as a guided path: one thing on the screen at a time (video, then text sections, listening exercise,
// one question per screen, finally the PDF and completion). The position lives in the address (?schritt=3),
// so reloading or sharing the link keeps the place.
export default function LessonFlow({ lessonId, completed, mediaUrl, audioUrl, pdfUrl, sections, questions, flaggedIds, next, initialStep }: FlowProps) {
  const steps = useMemo<Step[]>(() => {
    const s: Step[] = [];
    if (mediaUrl) s.push({ kind: "video", label: "Erklärvideo" });
    sections.forEach((section) => s.push({ kind: "text", label: section.title, section }));
    if (audioUrl) s.push({ kind: "audio", label: "Hörübung" });
    questions.forEach((question, index) => s.push({ kind: "question", label: `Frage ${index + 1} von ${questions.length}`, question, index }));
    s.push({ kind: "finish", label: "Abschluss" });
    return s;
  }, [mediaUrl, audioUrl, sections, questions]);

  const [step, setStep] = useState(() => Math.min(Math.max(0, initialStep), steps.length - 1));
  const [results, setResults] = useState<Record<string, Result>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  function go(to: number) {
    setError(null);
    setStep(Math.min(Math.max(0, to), steps.length - 1));
  }

  // Keep the address in sync and bring the top of the lesson into view when the step changes.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("schritt", String(step + 1));
    window.history.replaceState(null, "", url);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Arrow keys move through the lesson (not while typing or answering).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "ArrowRight" && !isLast && (current.kind !== "question" || results[current.question.id])) setStep((s) => Math.min(steps.length - 1, s + 1));
      if (e.key === "ArrowLeft" && !isFirst) setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, isFirst, isLast, results, steps.length]);

  function answer(q: Question, index: number) {
    if (results[q.id] || pendingId) return;
    setPendingId(q.id);
    setError(null);
    startTransition(async () => {
      const res = await submitAnswer(q.id, index);
      if (res.ok) setResults((prev) => ({ ...prev, [q.id]: { selected: index, correct: res.correct, correctIndex: res.correctIndex, explanation: res.explanation } }));
      else setError(res.error);
      setPendingId(null);
    });
  }

  function retry(id: string) {
    setResults((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }

  const answered = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.correct).length;
  const questionResult = current.kind === "question" ? results[current.question.id] : undefined;
  const nextLocked = current.kind === "question" && !questionResult;

  return (
    <div ref={topRef} style={{ marginTop: 22, scrollMarginTop: 16 }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span className="label" style={{ color: "var(--sky)" }}>
          Schritt {step + 1} von {steps.length}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-faint)" }}>{current.label}</span>
      </div>
      <div role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} style={{ display: "flex", gap: 4, marginTop: 10 }}>
        {steps.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Schritt ${i + 1}: ${s.label}`}
            title={s.label}
            style={{
              flex: 1,
              height: 7,
              minWidth: 4,
              borderRadius: 999,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: i === step ? "linear-gradient(100deg,var(--sky),var(--sky-2))" : i < step ? "rgba(47,155,234,0.55)" : "rgba(30,58,95,0.12)",
              transition: "background .25s ease",
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div key={step} className="lesson-step glass-strong" style={{ marginTop: 18, borderRadius: 24, padding: "clamp(18px,3vw,32px)" }}>
        {current.kind === "video" && mediaUrl && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Erklärvideo</h2>
            <div style={{ borderRadius: 18, overflow: "hidden", background: "#0e1a2b" }}>
              <video controls preload="metadata" src={mediaUrl} style={{ display: "block", width: "100%", aspectRatio: "16 / 9" }} />
            </div>
            <p style={{ marginTop: 12, fontSize: 13.5, color: "var(--text-faint)" }}>Schau das Video in Ruhe an. Danach geht es mit dem Text weiter.</p>
          </div>
        )}

        {current.kind === "text" && (
          <div className="prose">
            <h2 style={{ marginTop: 0 }}>{current.section.title}</h2>
            <Markdown remarkPlugins={[remarkGfm]}>{current.section.markdown}</Markdown>
          </div>
        )}

        {current.kind === "audio" && audioUrl && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
                <AppIcon name="audio" size={20} />
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hörübung</h2>
                <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Hör zu und sprich in den Pausen laut mit.</p>
              </div>
            </div>
            <audio controls preload="metadata" src={audioUrl} style={{ display: "block", width: "100%", marginTop: 18 }} />
          </div>
        )}

        {current.kind === "question" && (
          <div>
            <span className="label" style={{ color: "var(--text-faint)" }}>{current.label}</span>
            <p style={{ marginTop: 10, fontSize: 18, fontWeight: 600, lineHeight: 1.45 }}>{current.question.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
              {current.question.options.map((option, i) => {
                let state = "";
                if (questionResult) {
                  if (i === questionResult.correctIndex) state = " is-correct";
                  else if (i === questionResult.selected) state = " is-wrong";
                }
                return (
                  <button key={i} className={`quiz-option${state}`} disabled={Boolean(questionResult) || pendingId === current.question.id} onClick={() => answer(current.question, i)}>
                    <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{option}</span>
                  </button>
                );
              })}
            </div>
            {questionResult?.explanation && (
              <p style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(47,155,234,0.08)", fontSize: 14, lineHeight: 1.6, color: "var(--text-dim)" }}>{questionResult.explanation}</p>
            )}
            {questionResult && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: questionResult.correct ? "#0f9f6e" : "#c0334d" }}>
                  {questionResult.correct ? "Richtig!" : "Leider falsch, die richtige Antwort ist markiert."}
                </span>
                <button onClick={() => retry(current.question.id)} style={{ background: "none", border: "none", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--sky-deep)" }}>
                  Nochmal versuchen
                </button>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <QuestionTools questionId={current.question.id} initialFlagged={flaggedIds.includes(current.question.id)} selectedIndex={questionResult?.selected ?? null} />
            </div>
          </div>
        )}

        {current.kind === "finish" && (
          <div>
            <span className="dash-icon" style={{ background: "rgba(52,211,153,0.16)", color: "#0f9f6e", width: 52, height: 52 }}>
              <AppIcon name="check" size={26} />
            </span>
            <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 800 }}>{completed ? "Kapitel abgeschlossen" : "Fast geschafft"}</h2>
            {questions.length > 0 && (
              <p style={{ marginTop: 8, fontSize: 15, color: "var(--text-dim)" }}>
                {answered === 0
                  ? `Du hast die ${questions.length} Fragen dieses Kapitels noch nicht beantwortet. Du kannst jederzeit zurückgehen.`
                  : `Ergebnis: ${correctCount} von ${answered} beantworteten Fragen richtig${answered < questions.length ? ` (${questions.length - answered} noch offen)` : ""}.`}
              </p>
            )}

            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="glass dash-card course-continue" style={{ marginTop: 20, marginBottom: 0 }}>
                <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
                  <AppIcon name="text" size={22} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>PDF zum Ausdrucken</p>
                  <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Merkblatt öffnen oder herunterladen</p>
                </div>
                <AppIcon name="arrow" size={22} />
              </a>
            )}

            <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <CompleteButton key={lessonId} lessonId={lessonId} completed={completed} />
              {next && (
                <Link href={next.href} className="btn-accent" style={{ ...navBtn, display: "inline-block" }}>
                  Nächstes Kapitel →
                </Link>
              )}
            </div>
            {next && <p style={{ marginTop: 10, fontSize: 13, color: "var(--text-faint)" }}>Weiter mit: {next.title}</p>}
            <p style={{ marginTop: 14 }}>
              <Link href="/dashboard/course" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--sky-deep)" }}>Zur Kursübersicht</Link>
            </p>
          </div>
        )}
      </div>

      {error && <p style={{ marginTop: 12, fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 14px", borderRadius: 10 }}>{error}</p>}

      {/* Navigation */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn-ghost" disabled={isFirst} onClick={() => go(step - 1)} style={{ ...navBtn, opacity: isFirst ? 0.4 : 1 }}>
          ← Zurück
        </button>
        {!isLast && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {nextLocked && (
              <button type="button" onClick={() => go(step + 1)} style={{ background: "none", border: "none", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--text-faint)", textDecoration: "underline" }}>
                Überspringen
              </button>
            )}
            <button type="button" className="btn-accent" disabled={nextLocked} onClick={() => go(step + 1)} style={{ ...navBtn, border: "none", opacity: nextLocked ? 0.45 : 1 }}>
              Weiter →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
