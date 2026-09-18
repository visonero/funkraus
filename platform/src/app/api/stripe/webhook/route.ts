import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `webhook_signature_invalid: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;

    if (userId) {
      const supabaseAdmin = createAdminClient();
      const { error } = await supabaseAdmin.from("purchases").upsert(
        {
          user_id: userId,
          stripe_checkout_session_id: session.id,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          amount_cents: session.amount_total,
          currency: session.currency,
          status: "paid",
        },
        { onConflict: "stripe_checkout_session_id" },
      );

      if (error) {
        console.error("Failed to record purchase:", error);
        return NextResponse.json({ error: "db_write_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
