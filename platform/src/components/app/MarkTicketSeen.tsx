"use client";

import { useEffect } from "react";
import { markTicketSeen } from "@/lib/course/study-actions";

// Clears the "N neu" badge once the learner has opened the ticket. Runs after render because the
// action revalidates the dashboard layout, which Next.js doesn't allow while a page is rendering.
export default function MarkTicketSeen({ ticketId }: { ticketId: string }) {
  useEffect(() => {
    void markTicketSeen(ticketId);
  }, [ticketId]);
  return null;
}
