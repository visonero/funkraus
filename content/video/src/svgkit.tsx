import type { ReactNode } from "react";
import { measure } from "./fit";
import { colors, jakarta, poppins } from "./theme";

export const C = {
  sky: colors.sky,
  deep: colors.skyDeep,
  cyan: colors.sky2,
  text: colors.text,
  dim: colors.textDim,
  green: "#0f9f6e",
  red: "#d6336c",
  amber: "#f59e0b",
  gray: "#6b8296",
  line: "rgba(30,58,95,0.16)",
  paper: "#ffffff",
  ground: "#e9f3ea",
  runway: "#3b4a5a",
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
// Eased 0..1 progress of an animation that starts `delay` seconds after `since` reaches 0 and lasts `dur` seconds.
export const prog = (since: number, delay: number, dur: number) => easeInOut((since - delay) / dur);
export const fade = (since: number, delay = 0, dur = 0.5) => clamp01((since - delay) / dur);

export type Tone = "green" | "red" | "white";
export const toneColor = (tone?: Tone, fallback: string = C.deep) => (tone === "green" ? C.green : tone === "red" ? C.red : tone === "white" ? C.gray : fallback);

type TxtProps = {
  x: number;
  y: number;
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  font?: "p" | "j";
  opacity?: number;
  rotate?: number;
  children: ReactNode;
};
export function Txt({ x, y, size = 28, weight = 700, fill = C.text, anchor = "middle", font = "p", opacity = 1, rotate, children }: TxtProps) {
  return (
    <text
      x={x}
      y={y}
      fontFamily={font === "p" ? poppins : jakarta}
      fontWeight={font === "p" ? weight : Math.min(weight, 600)}
      fontSize={size}
      fill={fill}
      textAnchor={anchor}
      opacity={opacity}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ userSelect: "none" }}
    >
      {children}
    </text>
  );
}

// Top view of a light single-engine aircraft, nose pointing up. rot = heading in degrees (0 = up, clockwise).
export function Plane({ x, y, rot = 0, s = 1, fill = C.deep, opacity = 1 }: { x: number; y: number; rot?: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      <path
        d="M0,-40 C5,-40 7,-30 7,-20 L7,-8 L46,-4 C48,-4 48,6 46,6 L7,4 L7,24 L22,30 C24,31 24,38 22,38 L0,34 L-22,38 C-24,38 -24,31 -22,30 L-7,24 L-7,4 L-46,6 C-48,6 -48,-4 -46,-4 L-7,-8 L-7,-20 C-7,-30 -5,-40 0,-40 Z"
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line x1={-11} y1={-43} x2={11} y2={-43} stroke={fill} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

// Arrow-head markers, referenced as url(#arrow-<name>).
export function Defs() {
  const marker = (name: string, color: string) => (
    <marker key={name} id={`arrow-${name}`} viewBox="0 0 12 12" refX="8" refY="6" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M1,1 L11,6 L1,11 Z" fill={color} />
    </marker>
  );
  return (
    <defs>
      {marker("deep", C.deep)}
      {marker("green", C.green)}
      {marker("red", C.red)}
      {marker("text", C.text)}
      {marker("amber", C.amber)}
      {marker("gray", C.gray)}
    </defs>
  );
}

// A line/path that draws itself (progress 0..1). Works for any path via pathLength normalisation.
export function Draw({ d, p, stroke = C.deep, width = 8, arrow, dash, opacity = 1 }: { d: string; p: number; stroke?: string; width?: number; arrow?: string; dash?: string; opacity?: number }) {
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ?? "1"}
      strokeDashoffset={dash ? 0 : 1 - p}
      markerEnd={arrow && p > 0.98 ? `url(#arrow-${arrow})` : undefined}
      opacity={opacity}
    />
  );
}

export function Label({ x, y, w, h, text, fill = C.deep, color = "#fff", size = 24, opacity = 1 }: { x: number; y: number; w?: number; h?: number; text: string; fill?: string; color?: string; size?: number; opacity?: number }) {
  const width = Math.max(w ?? 0, Math.ceil(measure(text, poppins, 700, size)) + 40);
  const height = h ?? Math.round(size * 1.8);
  return (
    <g opacity={opacity}>
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx={height / 2} fill={fill} />
      <Txt x={x} y={y + size * 0.35} size={size} fill={color}>
        {text}
      </Txt>
    </g>
  );
}

// Point on a polyline at fraction t (0..1), plus the heading of the segment in degrees (0 = up, clockwise).
export function along(points: [number, number][], t: number) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  let d = clamp01(t) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] === 0 ? 0 : Math.min(1, d / lengths[i]);
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      return { x: lerp(x0, x1, f), y: lerp(y0, y1, f), heading: (Math.atan2(x1 - x0, -(y1 - y0)) * 180) / Math.PI };
    }
    d -= lengths[i];
  }
  return { x: points[0][0], y: points[0][1], heading: 0 };
}

export const polyPath = (points: [number, number][]) => points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");

// ---- shared drawing helpers -------------------------------------------------------------------------------


const rad = (deg: number) => (deg * Math.PI) / 180;
// Compass-style point: angle 0 = up, clockwise.
export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0},${y0} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1},${y1}`;
};

// Speech bubble. `tail` points to where the speaker is.
export function Bubble({ x, y, text, fill = "#fff", stroke = C.deep, color = C.text, size = 26, tail = "down", tailDx = 0, opacity = 1 }: { x: number; y: number; text: string; fill?: string; stroke?: string; color?: string; size?: number; tail?: "down" | "up" | "none"; tailDx?: number; opacity?: number }) {
  const w = measure(text, poppins, 700, size) + 48;
  const h = size * 1.9;
  const ty = tail === "down" ? y + h / 2 : y - h / 2;
  const dir = tail === "down" ? 1 : -1;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.4} fill={fill} stroke={stroke} strokeWidth={3} />
      {tail !== "none" && <polygon points={`${x + tailDx - 11},${ty - dir * 1.5} ${x + tailDx + 11},${ty - dir * 1.5} ${x + tailDx},${ty + dir * 18}`} fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />}
      {tail !== "none" && <rect x={x + tailDx - 9} y={ty - (dir > 0 ? 5 : -1)} width={18} height={6} fill={fill} />}
      <Txt x={x} y={y + size * 0.35} size={size} fill={color}>
        {text}
      </Txt>
    </g>
  );
}

// Side view of a light aircraft flying to the right.
export function PlaneSide({ x, y, s = 1, fill = C.deep, opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path d="M-62,2 C-62,-12 -34,-18 14,-18 C46,-18 68,-8 72,2 C68,12 46,16 14,16 L-52,12 Z" fill={fill} stroke="#fff" strokeWidth={2} />
      <path d="M-56,-4 L-70,-40 L-50,-40 L-30,-8 Z" fill={fill} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
      <path d="M-14,8 L-44,26 L-20,26 L18,10 Z" fill={fill} opacity={0.75} />
      <path d="M2,-16 C12,-30 30,-30 40,-16 Z" fill="#dff2fd" stroke="#fff" strokeWidth={2} />
      <line x1={76} y1={-14} x2={76} y2={18} stroke={fill} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

export function Cloud({ x, y, s = 1, fill = "#dbe7f3", opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={fill}>
      <circle cx={-70} cy={12} r={38} />
      <circle cx={-20} cy={-14} r={52} />
      <circle cx={46} cy={-4} r={46} />
      <circle cx={92} cy={16} r={32} />
      <rect x={-100} y={10} width={224} height={40} rx={20} />
    </g>
  );
}

// Ground radio beacon (VOR / NDB / direction finder): mast with a cap.
export function Station({ x, y, s = 1, fill = C.text, opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <circle r={26} fill="#fff" stroke={fill} strokeWidth={5} />
      <polygon points="0,-14 12,12 -12,12" fill={fill} />
      <circle r={5} fill="#fff" />
    </g>
  );
}

export function Tower({ x, y, s = 1, fill = "#3b4a5a", opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={fill}>
      <rect x={-8} y={-10} width={16} height={60} />
      <path d="M-30,-10 L30,-10 L22,-38 L-22,-38 Z" />
      <rect x={-18} y={-58} width={36} height={20} rx={4} />
      <rect x={-22} y={50} width={44} height={8} rx={3} />
    </g>
  );
}

export function Compass({ cx, cy, r, opacity = 1, labels = true }: { cx: number; cy: number; r: number; opacity?: number; labels?: boolean }) {
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={C.line} strokeWidth={3} />
      {Array.from({ length: 36 }, (_, i) => {
        const a = i * 10;
        const long = i % 3 === 0;
        const [x0, y0] = polar(cx, cy, r - (long ? 20 : 11), a);
        const [x1, y1] = polar(cx, cy, r, a);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.dim} strokeWidth={long ? 3 : 1.5} opacity={0.6} />;
      })}
      {labels &&
        [0, 90, 180, 270].map((a) => {
          const [x, y] = polar(cx, cy, r - 44, a);
          return (
            <Txt key={a} x={x} y={y + 10} size={28} fill={a === 0 ? C.red : C.dim}>
              {a === 0 ? "N" : a === 90 ? "O" : a === 180 ? "S" : "W"}
            </Txt>
          );
        })}
    </g>
  );
}

export function Glider({ x, y, rot = 0, s = 1, fill = C.gray, opacity = 1 }: { x: number; y: number; rot?: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
      <path d="M0,-38 L4,-32 L4,-6 L56,-3 L56,3 L4,6 L4,26 L15,31 L15,35 L-15,35 L-15,31 L-4,26 L-4,6 L-56,3 L-56,-3 L-4,-6 L-4,-32 Z" fill={fill} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}

// Double-headed dimension line with a label pill in the middle.
export function Dimension({ x1, y1, x2, y2, text, color = C.green, size = 24, opacity = 1, offset = 0 }: { x1: number; y1: number; x2: number; y2: number; text: string; color?: string; size?: number; opacity?: number; offset?: number }) {
  const name = color === C.green ? "green" : color === C.red ? "red" : color === C.amber ? "amber" : "deep";
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={5} markerStart={`url(#arrow-${name})`} markerEnd={`url(#arrow-${name})`} />
      <Label x={mx + offset} y={my} text={text} fill={color} size={size} />
    </g>
  );
}
