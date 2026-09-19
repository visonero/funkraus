import type { CSSProperties, ReactNode } from "react";

type RingStyle = CSSProperties & { "--circ": number };

export function ProgressRing({
  id,
  percent,
  size = 168,
  stroke = 14,
  children,
}: {
  id: string;
  percent: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const val = (Math.min(100, Math.max(0, percent)) / 100) * circ;
  const style: RingStyle = { "--circ": circ };

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${percent} Prozent`}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f9bea" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,58,95,0.08)" strokeWidth={stroke} />
        <circle
          className="chart-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${val} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={style}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

export type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  size = 156,
  stroke = 22,
  children,
}: {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const gap = total > 0 && segments.filter((s) => s.value > 0).length > 1 ? 3 : 0;
  let offset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,58,95,0.08)" strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s) => {
            if (s.value <= 0) return null;
            const len = (s.value / total) * circ;
            const drawn = Math.max(0, len - gap);
            const style: RingStyle = { "--circ": circ };
            const start = offset;
            offset += len;
            return (
              <circle
                key={s.label}
                className="chart-arc"
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${drawn} ${circ}`}
                strokeDashoffset={-start}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={style}
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
          })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ percent, height = 8, color }: { percent: number; height?: number; color?: string }) {
  return (
    <div style={{ height, borderRadius: 999, background: "rgba(30,58,95,0.08)", overflow: "hidden" }}>
      <div
        className="chart-bar-x"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          height: "100%",
          borderRadius: 999,
          background: color ?? "linear-gradient(90deg, var(--sky), var(--sky-2))",
        }}
      />
    </div>
  );
}

export type ColumnDatum = { label: string; values: { name: string; value: number; color: string }[] };

export function ColumnChart({ data, height = 170 }: { data: ColumnDatum[]; height?: number }) {
  const max = Math.max(4, ...data.map((d) => d.values.reduce((sum, v) => sum + v.value, 0)));
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ height, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 11, color: "var(--text-faint)", textAlign: "right", minWidth: 22 }}>
        {ticks.map((t, i) => (
          <span key={i} style={{ lineHeight: 1 }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, height, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
          {ticks.map((_, i) => (
            <div key={i} style={{ borderTop: "1px dashed rgba(30,58,95,0.1)" }} />
          ))}
        </div>
        <div style={{ position: "relative", height, display: "flex", alignItems: "flex-end", gap: 8 }}>
          {data.map((d) => {
            const total = d.values.reduce((sum, v) => sum + v.value, 0);
            return (
              <div
                key={d.label}
                title={d.values.map((v) => `${v.name}: ${v.value}`).join(" · ")}
                style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}
              >
                <div
                  className="chart-bar-y"
                  style={{ width: "100%", maxWidth: 34, height: `${(total / max) * 100}%`, display: "flex", flexDirection: "column-reverse", borderRadius: 8, overflow: "hidden" }}
                >
                  {d.values.map((v) =>
                    v.value > 0 ? <div key={v.name} style={{ height: `${(v.value / total) * 100}%`, background: v.color }} /> : null,
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {data.map((d) => (
            <span key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
