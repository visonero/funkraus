"use client";

import { useState } from "react";
import { FAQS } from "@/lib/faq";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {FAQS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="glass reveal" style={{ borderRadius: 16, padding: "18px 24px" }}>
            <button className="faq-q" onClick={() => setOpenIndex(isOpen ? -1 : i)}>
              <span>{item.q}</span>
              <span className="faq-icon">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <p style={{ padding: "10px 0 6px", fontSize: 15, color: "var(--text-dim)", maxWidth: 640 }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
