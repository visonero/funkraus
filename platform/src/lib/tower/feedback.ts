import type { Scenario } from "./scenarios";
import type { Feedback, TranscriptEntry } from "./store";

// The feedback is built from the mistakes the tower recorded during the practice, in plain code. There is no second
// AI pass that could turn a speech-recognition slip (accent, "Old Time" instead of "Waldheim") into a mistake, and
// the star rating depends only on real mistakes: missing elements, wrong order, phraseology, wrong numbers, read-backs.

export function buildFeedback(scenario: Scenario, transcript: TranscriptEntry[], completed: boolean): Feedback {
  const pilot = transcript.filter((t) => t.role === "pilot");
  const total = scenario.steps.length;

  if (pilot.length === 0) {
    return { zusammenfassung: "Du hast in dieser Übung noch keinen Funkspruch gesendet.", gut: [], verbessern: [], bewertung: 1 };
  }

  const withIssues = pilot.filter((t) => (t.issues?.length ?? 0) > 0);
  const stepsDone = Math.min(total, transcript.filter((t) => t.role === "tower" && t.ok).length);
  const firstTryClean = transcript.filter((t, i) => t.role === "pilot" && (t.issues?.length ?? 0) === 0 && transcript[i + 1]?.ok !== false).length;

  // Rating: only real mistakes count. An unfinished practice cannot get more than 3 stars.
  let rating = Math.max(1, 5 - withIssues.length);
  if (!completed) rating = Math.min(rating, 3);

  const summary = completed
    ? withIssues.length === 0
      ? "Sehr gut! Du hast alle Schritte richtig durchlaufen, mit vollständigen Meldungen und korrekten Rückbestätigungen."
      : `Du hast alle ${total} Schritte geschafft. In ${withIssues.length} ${withIssues.length === 1 ? "Funkspruch" : "Funksprüchen"} gab es inhaltliche Fehler, siehe unten.`
    : withIssues.length === 0
      ? `Bis hierhin war alles richtig, aber du hast nur ${stepsDone} von ${total} Schritten geschafft. Führe die Übung das nächste Mal bis zum Ende durch.`
      : `Du hast ${stepsDone} von ${total} Schritten geschafft. In ${withIssues.length} ${withIssues.length === 1 ? "Funkspruch" : "Funksprüchen"} gab es inhaltliche Fehler, siehe unten.`;

  const gut: string[] = [];
  if (completed) gut.push("Du hast den gesamten Ablauf bis zum Ende durchgespielt.");
  if (firstTryClean > 0) gut.push(`${firstTryClean} von ${pilot.length} Funksprüchen waren gleich beim ersten Mal inhaltlich richtig.`);
  const readbackSteps = scenario.steps.map((s, i) => (s.towerLine === "" ? i : -1)).filter((i) => i >= 0);
  const readbacks = pilot.filter((t) => t.step !== undefined && readbackSteps.includes(t.step));
  if (readbacks.length > 0 && readbacks.every((t) => (t.issues?.length ?? 0) === 0)) gut.push("Deine Rückbestätigungen waren vollständig.");

  const verbessern = withIssues.slice(0, 4).map((t) => ({
    gesagt: t.text,
    besser: t.better ?? "",
    grund: (t.issues ?? []).map((i) => i.text).join(" "),
  }));

  return { zusammenfassung: summary, gut: gut.slice(0, 3), verbessern, bewertung: rating };
}
