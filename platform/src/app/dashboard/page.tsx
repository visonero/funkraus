import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1180,
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px" }}>
        <div className="glass-strong" style={{ borderRadius: 28, padding: 44, maxWidth: 520, width: "100%", textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>Dein Kursbereich</span>
          <h1 style={{ marginTop: 12, fontSize: 26, fontWeight: 700 }}>
            Willkommen, <span className="grad">{user.email}</span>
          </h1>
          <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--text-dim)" }}>
            Dein Login funktioniert. Kursmodule, Fortschritt und Zahlungsstatus erscheinen hier, sobald Stripe-Checkout
            und die Kursinhalte angebunden sind.
          </p>
        </div>
      </div>
    </div>
  );
}
