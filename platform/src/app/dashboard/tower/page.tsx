import PageHeader from "@/components/app/PageHeader";
import TowerPractice from "@/components/app/TowerPractice";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCourseAccess } from "@/lib/course/data";
import { isDemoMode } from "@/lib/course/demo";
import { speechAvailable, towerMode } from "@/lib/tower/ai";
import { TOWER } from "@/lib/tower/config";
import { getUsageSummary } from "@/lib/tower/limits";
import { publicScenarios } from "@/lib/tower/scenarios";

export default async function TowerPage() {
  const user = (await getCurrentUser())!;
  const hasAccess = await hasCourseAccess(user.id);
  const mode = towerMode();
  // Prepared answers only exist for local development; production stays closed until an API key is set.
  const closed = !TOWER.enabled || (mode === "mock" && !isDemoMode());
  const usage = await getUsageSummary(user.id, hasAccess);

  return (
    <div className="app-container" style={{ maxWidth: 980 }}>
      <PageHeader
        eyebrow="Üben"
        title={<>Funktraining mit dem <span className="grad">Tower</span></>}
        subtitle="Übe echten Funkverkehr: Du sprichst per Sprechtaste, der Tower antwortet mit Stimme, und am Ende bekommst du Feedback zu deinen Funksprüchen."
      />
      {closed ? (
        <div className="glass dash-card">
          <p style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Das Funktraining ist gerade nicht verfügbar. Schau bald wieder vorbei.
          </p>
        </div>
      ) : (
        <TowerPractice scenarios={publicScenarios()} usage={usage} mode={mode} speech={speechAvailable()} />
      )}
    </div>
  );
}
