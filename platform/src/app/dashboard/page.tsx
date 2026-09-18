import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import CheckoutButton from "@/components/CheckoutButton";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import { createClient } from "@/lib/supabase/server";

const PRICE = "349";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: purchase }, { data: profile }] = await Promise.all([
    supabase.from("purchases").select("status").eq("user_id", user.id).eq("status", "paid").maybeSingle(),
    supabase.from("profiles").select("full_name, email, newsletter_opt_in").eq("id", user.id).single(),
  ]);

  const hasAccess = Boolean(purchase);
  const displayName = profile?.full_name || user.email;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <SignOutButton />
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 32px 80px" }}>
        <div className="glass-strong" style={{ borderRadius: 28, padding: 40, textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>Mein Profil</span>
          <h1 style={{ marginTop: 12, fontSize: 26, fontWeight: 700 }}>
            Willkommen, <span className="grad">{displayName}</span>
          </h1>
        </div>

        <div className="glass-strong" style={{ borderRadius: 24, padding: 32, marginTop: 24, textAlign: "center" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Kursinhalt</h2>
          {hasAccess ? (
            <p style={{ marginTop: 12, fontSize: 14.5, color: "var(--text-dim)" }}>
              ✅ Kauf bestätigt — dein Zugang ist freigeschaltet. Die Kursmodule selbst erscheinen hier, sobald die
              Inhalte hochgeladen sind.
            </p>
          ) : (
            <>
              <p style={{ marginTop: 12, fontSize: 14.5, color: "var(--text-dim)" }}>
                Du hast den Kurs noch nicht freigeschaltet.
              </p>
              <CheckoutButton price={PRICE} />
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <ProfileSettingsForm
            userId={user.id}
            initialFullName={profile?.full_name ?? ""}
            initialEmail={profile?.email ?? user.email ?? ""}
            initialNewsletterOptIn={profile?.newsletter_opt_in ?? false}
          />
        </div>
      </div>
    </div>
  );
}
