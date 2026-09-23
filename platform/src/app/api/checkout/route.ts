import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  // The client only enables this request once the AGB/Widerrufsrecht checkbox is ticked, but the
  // server re-checks it here too (never trust a disabled-button as the only enforcement) and records
  // it on the Stripe session as evidence the waiver under § 356 Abs. 5 BGB was actually presented.
  const body = await request.json().catch(() => null);
  if (body?.agbAccepted !== true) {
    return NextResponse.json({ error: "agb_not_accepted" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    allow_promotion_codes: true,
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, agb_accepted: "true", agb_accepted_at: new Date().toISOString() },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/#preis`,
  });

  return NextResponse.json({ url: session.url });
}
