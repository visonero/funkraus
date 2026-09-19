import AppIcon from "@/components/app/AppIcon";
import PageHeader from "@/components/app/PageHeader";
import CheckoutButton from "@/components/CheckoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/course/demo";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const PRICE = "349";
const STATUS_LABEL: Record<string, { text: string; bg: string; color: string }> = {
  paid: { text: "Bezahlt", bg: "rgba(52,211,153,0.16)", color: "#0b7a55" },
  pending: { text: "Ausstehend", bg: "rgba(47,155,234,0.12)", color: "var(--sky-deep)" },
  refunded: { text: "Erstattet", bg: "rgba(255,143,179,0.18)", color: "#c0447a" },
};

type Purchase = {
  id: string;
  stripe_checkout_session_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: string;
  created_at: string;
};

async function getReceiptUrl(sessionId: string | null) {
  if (!sessionId) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });
    const intent = session.payment_intent;
    if (intent && typeof intent !== "string") {
      const charge = intent.latest_charge;
      if (charge && typeof charge !== "string") return charge.receipt_url ?? null;
    }
  } catch {
    // Receipt link is a nicety — the payment row is still shown without it.
  }
  return null;
}

export default async function PaymentsPage() {
  const user = (await getCurrentUser())!;

  let purchases: Purchase[] = [];
  if (isDemoMode()) {
    purchases = [
      { id: "demo", stripe_checkout_session_id: null, amount_cents: 34900, currency: "eur", status: "paid", created_at: new Date().toISOString() },
    ];
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("purchases")
      .select("id, stripe_checkout_session_id, amount_cents, currency, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    purchases = (data ?? []) as Purchase[];
  }

  const receipts = await Promise.all(purchases.map((p) => (p.status === "paid" ? getReceiptUrl(p.stripe_checkout_session_id) : null)));
  const paid = purchases.find((p) => p.status === "paid");
  const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" });

  return (
    <div className="app-container" style={{ maxWidth: 860 }}>
      <PageHeader eyebrow="Konto" title={<>Zahlungen &amp; <span className="grad">Rechnungen</span></>} subtitle="Dein Kauf, dein Zugang und alle Belege an einem Ort." />

      <div className="glass-strong dash-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
        <span className="dash-icon" style={{ width: 52, height: 52, background: paid ? "rgba(52,211,153,0.16)" : "rgba(47,155,234,0.12)", color: paid ? "#0f9f6e" : "var(--sky)" }}>
          <AppIcon name={paid ? "check" : "lock"} size={24} />
        </span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
            {paid ? "BZF I & II Kurs — Zugang aktiv" : "Noch kein Kurs gekauft"}
          </p>
          <p style={{ marginTop: 4, fontSize: 14, color: "var(--text-dim)" }}>
            {paid
              ? `Gekauft am ${dateFormat.format(new Date(paid.created_at))} · lebenslanger Zugriff, kein Abo.`
              : "Einmal zahlen, sofort starten, lebenslanger Zugriff."}
          </p>
        </div>
        {!paid && (
          <div style={{ width: 280, maxWidth: "100%" }}>
            <CheckoutButton price={PRICE} marginTop={0} />
          </div>
        )}
      </div>

      <div className="glass dash-card" style={{ marginTop: 20 }}>
        <p className="dash-card-title">Zahlungsverlauf</p>
        {purchases.length === 0 ? (
          <p style={{ marginTop: 14, fontSize: 14, color: "var(--text-faint)" }}>Noch keine Zahlungen vorhanden.</p>
        ) : (
          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Beschreibung</th>
                  <th>Betrag</th>
                  <th>Status</th>
                  <th>Beleg</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, i) => {
                  const status = STATUS_LABEL[p.status] ?? { text: p.status, bg: "rgba(30,58,95,0.08)", color: "var(--text-dim)" };
                  const amount =
                    p.amount_cents === null
                      ? "–"
                      : new Intl.NumberFormat("de-DE", { style: "currency", currency: (p.currency ?? "eur").toUpperCase() }).format(p.amount_cents / 100);
                  return (
                    <tr key={p.id}>
                      <td>{dateFormat.format(new Date(p.created_at))}</td>
                      <td>BZF I &amp; II Online-Kurs</td>
                      <td style={{ fontWeight: 700 }}>{amount}</td>
                      <td>
                        <span className="module-track" style={{ background: status.bg, color: status.color }}>{status.text}</span>
                      </td>
                      <td>
                        {receipts[i] ? (
                          <a href={receipts[i]!} target="_blank" rel="noopener noreferrer" style={{ color: "var(--sky-deep)", fontWeight: 600 }}>
                            Ansehen ↗
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-faint)" }}>–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
