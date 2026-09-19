import PageHeader from "@/components/app/PageHeader";
import PasswordForm from "@/components/app/PasswordForm";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = (await getCurrentUser())!;
  const profile = await getCurrentProfile(user.id);

  return (
    <div className="app-container" style={{ maxWidth: 720 }}>
      <PageHeader eyebrow="Konto" title={<><span className="grad">Einstellungen</span></>} subtitle="Deine persönlichen Daten, Newsletter und Passwort." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ProfileSettingsForm
          userId={user.id}
          initialFullName={profile?.full_name ?? ""}
          initialEmail={profile?.email ?? user.email ?? ""}
          initialNewsletterOptIn={profile?.newsletter_opt_in ?? false}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
