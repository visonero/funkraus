"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Site-wide events that need no changes in the pages themselves:
//  cta_signup_click     every link to the registration ("location" = id of the page section it sits in)
//  sales_video_play     first play of the landing page video, sales_video_complete when it ends
export default function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a");
      const href = link?.getAttribute("href") ?? "";
      if (!link || !href.startsWith("/login?mode=signup")) return;
      const location = link.closest("[data-loc]")?.getAttribute("data-loc") || link.closest("[id]")?.id || "page";
      track("cta_signup_click", { location, label: (link.textContent ?? "").trim().slice(0, 40) });
    };

    let played = false;
    const onPlay = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      if (played || !video?.currentSrc?.includes("sales-video")) return;
      played = true;
      track("sales_video_play");
    };
    const onEnded = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      if (video?.currentSrc?.includes("sales-video")) track("sales_video_complete");
    };

    document.addEventListener("click", onClick);
    // media events do not bubble, so they are caught in the capture phase
    document.addEventListener("play", onPlay, true);
    document.addEventListener("ended", onEnded, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("ended", onEnded, true);
    };
  }, []);

  return null;
}
