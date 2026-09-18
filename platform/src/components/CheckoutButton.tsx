"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ price }: { price: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", { method: "POST" });

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
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-accent"
        style={{
          display: "block",
          width: "100%",
          marginTop: 32,
          padding: 17,
          borderRadius: 999,
          fontSize: 16,
          border: "none",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Einen Moment…" : `Jetzt freischalten — €${price}`}
      </button>
      {error && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#c0334d" }}>{error}</p>
      )}
    </div>
  );
}
