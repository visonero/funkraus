import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Neues Passwort — funkraus",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // The recovery link signs the user in via /auth/callback; without that session there is nothing to reset.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=auth_callback_failed");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, background: "var(--bg)" }}>
      <div className="glass-strong" style={{ borderRadius: 28, padding: 44, maxWidth: 420, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: "center" }}>
          Neues <span className="grad">Passwort</span> festlegen
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)", textAlign: "center" }}>
          Wähle ein neues Passwort für {user.email}.
        </p>
        <div style={{ marginTop: 28 }}>
          <ResetPasswordForm />
        </div>
        <Link href="/login" className="nav-link" style={{ display: "block", textAlign: "center", marginTop: 24, fontSize: 13.5 }}>
          ← Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
