import Link from "next/link";
import AppIcon from "@/components/app/AppIcon";
import LessonQuiz from "@/components/app/LessonQuiz";
import PageHeader from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/session";
import { getFlaggedQuestions } from "@/lib/course/study";

export default async function FlaggedPage() {
  const user = (await getCurrentUser())!;
  const questions = await getFlaggedQuestions(user.id);

  return (
    <div className="app-container" style={{ maxWidth: 860 }}>
      <PageHeader
        eyebrow="Lernen"
        title={<>Gemerkte <span className="grad">Fragen</span></>}
        subtitle="Alle Fragen, die du zum späteren Üben gespeichert hast. Beantworte sie hier noch einmal; mit „Gemerkt“ nimmst du eine Frage wieder aus der Liste."
      />
      {questions.length === 0 ? (
        <div className="glass dash-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="dash-icon" style={{ background: "rgba(47,155,234,0.12)", color: "var(--sky)" }}>
            <AppIcon name="bookmark" size={22} />
          </span>
          <p style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Noch keine Fragen gemerkt. Tippe bei einer Übungsfrage auf „Merken“, um sie hier zu sammeln.{" "}
            <Link href="/dashboard/course" style={{ color: "var(--sky-deep)", fontWeight: 600 }}>Zum Kurs</Link>
          </p>
        </div>
      ) : (
        <LessonQuiz questions={questions} flaggedIds={questions.map((q) => q.id)} hideOnUnflag />
      )}
    </div>
  );
}
