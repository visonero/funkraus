export type FeatureIconType = "book" | "audio" | "radio" | "check" | "badge" | "infinity";

export default function FeatureIcon({ type, size = 34 }: { type: FeatureIconType; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none" };

  switch (type) {
    case "book":
      return (
        <svg {...common}>
          <g className="icon-book-pages">
            <path d="M24 12c-4-3-9-4-14-3v22c5-1 10 0 14 3" stroke="var(--sky)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path className="icon-book-page" d="M24 12c4-3 9-4 14-3v22c-5-1-10 0-14 3" stroke="var(--sky-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="24" y1="12" x2="24" y2="34" stroke="var(--sky-deep)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "audio":
      return (
        <svg {...common}>
          <g className="icon-audio-bars">
            <rect x="9" y="20" width="4" height="8" rx="2" fill="var(--sky)" className="bar b1" />
            <rect x="16" y="14" width="4" height="20" rx="2" fill="var(--sky-2)" className="bar b2" />
            <rect x="23" y="8" width="4" height="32" rx="2" fill="var(--sky-deep)" className="bar b3" />
            <rect x="30" y="14" width="4" height="20" rx="2" fill="var(--sky-2)" className="bar b4" />
            <rect x="37" y="20" width="4" height="8" rx="2" fill="var(--sky)" className="bar b5" />
          </g>
        </svg>
      );
    case "radio":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="3.5" fill="var(--sky-deep)" />
          <circle className="icon-ring r1" cx="24" cy="24" r="10" stroke="var(--sky)" strokeWidth="2" fill="none" />
          <circle className="icon-ring r2" cx="24" cy="24" r="17" stroke="var(--sky-2)" strokeWidth="2" fill="none" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="18" stroke="var(--line-strong)" strokeWidth="2.5" fill="none" />
          <path className="icon-check-path" d="M15 24l6.5 6.5L33 18" stroke="var(--sky)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <path d="M24 6l5 3 5.8-1 1 5.8 3 5-3 5-1 5.8-5.8-1-5 3-5-3-5.8 1-1-5.8-3-5 3-5 1-5.8 5.8 1z" fill="none" stroke="var(--sky-deep)" strokeWidth="2" strokeLinejoin="round" />
          <path className="icon-badge-shine" d="M8 24 h32" stroke="var(--sky)" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    case "infinity":
      return (
        <svg {...common}>
          <path
            className="icon-infinity-path"
            d="M14 24c0-5 4-8 8-4s6 8 10 4 2-8-4-4-6 8-10 4-4-9 4-9-8 4-8 9z"
            stroke="var(--sky)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
  }
}
