export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="10" cy="30" r="3.4" fill="#2f9bea" />
        <path
          d="M16 24 A11 11 0 0 1 27 13"
          stroke="#2f9bea"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M13.5 27.2 A15.5 15.5 0 0 1 29.2 11.5"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M11 29.8 A19.8 19.8 0 0 1 31.8 9"
          stroke="#2f9bea"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size < 28 ? 18 : 20,
          letterSpacing: "-0.02em",
          color: "var(--text)",
        }}
      >
        funkraus
      </span>
    </div>
  );
}
