"use client";

import { useState, useTransition } from "react";
import AppIcon from "./AppIcon";
import { setChapterCompleted } from "@/lib/course/actions";

export default function CompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await setChapterCompleted(lessonId, !completed);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={pending}
        className={completed ? "btn-ghost" : "btn-accent"}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, fontSize: 14.5, opacity: pending ? 0.7 : 1 }}
      >
        {completed && <AppIcon name="check" size={17} />}
        {pending ? "Speichert…" : completed ? "Abgeschlossen — rückgängig machen" : "Kapitel abschließen"}
      </button>
      {error && <p style={{ marginTop: 10, fontSize: 13, color: "#c0334d" }}>{error}</p>}
    </div>
  );
}
