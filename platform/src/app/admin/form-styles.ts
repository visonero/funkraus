import type { CSSProperties } from "react";

export const field: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--line-strong)",
  background: "rgba(255,255,255,0.7)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--text)",
};

export const label: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-dim)",
};

export const smallBtn: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  fontSize: 13,
  border: "1.5px solid var(--line-strong)",
  background: "rgba(255,255,255,0.6)",
  color: "var(--text)",
};

export const dangerBtn: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  fontSize: 13,
  border: "1.5px solid rgba(192,51,77,0.35)",
  background: "rgba(192,51,77,0.08)",
  color: "#c0334d",
};
