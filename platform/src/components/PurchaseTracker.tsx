"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Fires the GA "purchase" event once per Stripe checkout session (the value comes from the verified session).
export default function PurchaseTracker({ transactionId, value }: { transactionId: string; value: number }) {
  useEffect(() => {
    const key = `funkraus-purchase-${transactionId}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: GA still de-duplicates by transaction_id.
    }
    track("purchase", { transaction_id: transactionId, value, currency: "EUR" });
  }, [transactionId, value]);
  return null;
}
