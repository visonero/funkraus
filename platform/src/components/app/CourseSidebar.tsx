"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppIcon from "./AppIcon";
import { ProgressBar } from "./charts";
import type { CourseModule } from "@/lib/course/types";

const TRACK_LABEL = { bzf2: "BZF II · Deutscher Luftraum", bzf1: "BZF I · Englisch & International" } as const;

export default function CourseSidebar({
  modules,
  locked,
  percent,
}: {
  modules: CourseModule[];
  locked: boolean;
  percent: number;
}) {
  const pathname = usePathname();
  const activeChapterId = pathname.startsWith("/dashboard/course/") ? pathname.split("/")[3] : null;
  const activeModule = modules.find((m) => m.chapters.some((c) => c.id === activeChapterId));
  const defaultModule = activeModule ?? modules.find((m) => !m.completed) ?? modules[0];

  // Manual toggles win; otherwise the module of the open chapter (or the next unfinished one) is expanded.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [mobileOpenForPath, setMobileOpenForPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenForPath === pathname;
  const isExpanded = (m: CourseModule) => toggled[m.id] ?? m.id === defaultModule?.id;

  const chaptersTotal = modules.reduce((sum, m) => sum + m.chapters.length, 0);
  const chaptersDone = modules.reduce((sum, m) => sum + m.chaptersDone, 0);

  return (
    <aside className="glass course-side" aria-label="Kursinhalt">
      <button
        className="course-side-toggle"
        onClick={() => setMobileOpenForPath(mobileOpen ? null : pathname)}
        aria-expanded={mobileOpen}
      >
        <AppIcon name="course" size={18} />
        <span style={{ flex: 1, textAlign: "left" }}>Kursübersicht</span>
        <span style={{ display: "inline-flex", transform: mobileOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>
          <AppIcon name="chevron" size={18} />
        </span>
      </button>

      <div className={`course-side-body${mobileOpen ? " is-open" : ""}`}>
        <Link href="/dashboard/course" className="course-side-head">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Kursinhalt</span>
          <div style={{ marginTop: 10 }}>
            <ProgressBar percent={percent} height={7} />
          </div>
          <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>
            {locked ? "Vorschau — Kurs noch nicht freigeschaltet" : `${chaptersDone} von ${chaptersTotal} Kapiteln abgeschlossen`}
          </span>
        </Link>

        {modules.length === 0 && (
          <p style={{ padding: "8px 18px 18px", fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Module veröffentlicht.</p>
        )}

        <div style={{ padding: "0 10px 12px" }}>
          {modules.map((m, i) => {
            const expanded = isExpanded(m);
            const showTrack = i === 0 || modules[i - 1].track !== m.track;
            return (
              <div key={m.id}>
                {showTrack && <p className="app-nav-heading" style={{ padding: "14px 10px 6px" }}>{TRACK_LABEL[m.track]}</p>}
                <button
                  className="course-module-btn"
                  onClick={() => setToggled((prev) => ({ ...prev, [m.id]: !expanded }))}
                  aria-expanded={expanded}
                >
                  <span className={`app-num${m.completed ? " is-done" : ""}`}>
                    {m.completed ? <AppIcon name="check" size={13} /> : Number(m.num) || m.num}
                  </span>
                  <span style={{ flex: 1, textAlign: "left", fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{m.title}</span>
                  <span style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>
                    {m.chaptersDone}/{m.chapters.length}
                  </span>
                  <span style={{ display: "inline-flex", color: "var(--text-faint)", transform: expanded ? "rotate(90deg)" : "none", transition: "transform .2s" }}>
                    <AppIcon name="chevron" size={15} />
                  </span>
                </button>

                {expanded && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "2px 0 8px 14px", paddingLeft: 10, borderLeft: "2px solid var(--line)" }}>
                    {m.chapters.length === 0 && (
                      <span style={{ padding: "6px 10px", fontSize: 12.5, color: "var(--text-faint)" }}>Kapitel folgen</span>
                    )}
                    {m.chapters.map((c) => {
                      const active = c.id === activeChapterId;
                      const inner = (
                        <>
                          <span style={{ color: c.completed ? "#0f9f6e" : "var(--text-faint)", display: "inline-flex" }}>
                            <AppIcon name={locked ? "lock" : c.type} size={15} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.35 }}>{c.title}</span>
                          {c.completed && (
                            <span className="app-num is-done" style={{ width: 18, height: 18 }}>
                              <AppIcon name="check" size={11} />
                            </span>
                          )}
                        </>
                      );
                      return locked ? (
                        <span key={c.id} className="course-chapter is-locked">{inner}</span>
                      ) : (
                        <Link key={c.id} href={`/dashboard/course/${c.id}`} className={`course-chapter${active ? " is-active" : ""}`}>
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
