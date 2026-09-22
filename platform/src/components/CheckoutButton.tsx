"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutButton({ price, marginTop = 32 }: { price: string; marginTop?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function handleClick() {
    if (!accepted) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agbAccepted: true }),
    });

    if (res.status === 401) {
      router.push("/login?next=/dashboard");
      return;
    }

    if (!res.ok) {
      setError("Da ist etwas schiefgelaufen. Bitte versuch es gleich nochmal.");
      setLoading(false);
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div style={{ marginTop }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.5, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{ marginTop: 2, flex: "none", width: 15, height: 15 }}
        />
        <span>
          Ich habe die{" "}
          <Link href="/agb" target="_blank" style={{ color: "var(--sky-deep)", textDecoration: "underline" }}>
            AGB
          </Link>{" "}
          gelesen und akzeptiere sie. Mit dem sofortigen Zugriff auf die Kursinhalte stimme ich zu, dass mein
          gesetzliches Widerrufsrecht vorzeitig erlischt, sobald ich die Inhalte abrufe (siehe AGB, Abschnitt
          Widerrufsrecht).
        </span>
      </label>
      <button
        onClick={handleClick}
        disabled={loading || !accepted}
        className="btn-accent"
        style={{
          display: "block",
          width: "100%",
          marginTop: 14,
          padding: 17,
          borderRadius: 999,
          fontSize: 16,
          border: "none",
          opacity: loading || !accepted ? 0.55 : 1,
          cursor: !accepted ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Einen Moment…" : `Jetzt freischalten — €${price}`}
      </button>
      {error && <p style={{ marginTop: 12, fontSize: 13, color: "#c0334d" }}>{error}</p>}
    </div>
  );
}
