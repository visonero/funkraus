"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className="btn-ghost" style={{ padding: "10px 20px", borderRadius: 999, fontSize: 14, border: "1.5px solid var(--line-strong)" }}>
      Abmelden
    </button>
  );
}
