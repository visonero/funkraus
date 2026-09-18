"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// Drives every `.reveal` element on the page. Deliberately global (not
// scoped to a ref) — this component has no DOM of its own; its job is to
// animate elements rendered by server components elsewhere on the page.
export default function ScrollRevealInit() {
  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = gsap.utils.toArray<HTMLElement>(".reveal");
    if (prefersReduced || items.length === 0) return;

    gsap.set(items, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });
  }, []);

  return null;
}
