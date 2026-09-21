import type { ReactNode } from "react";
import { C, Txt } from "./svgkit";

// Pictograms for the "glyphs" scene (220 x 220 viewBox). Lamps blink for real when `flash` is set.
export type GlyphName =
  | "lamp-green"
  | "lamp-red"
  | "lamp-white"
  | "flare"
  | "sq-red-yellow"
  | "dumbbell"
  | "landing-t"
  | "number-board"
  | "bent-arrow"
  | "chart-mandatory"
  | "chart-request"
  | "oktas-few"
  | "oktas-sct"
  | "oktas-bkn"
  | "oktas-ovc";

type GlyphProps = { frame: number; fps: number; flash?: boolean };

function Lamp({ color, glow, ring, flash, frame, fps }: { color: string; glow: string; ring: string; flash?: boolean } & Pick<GlyphProps, "frame" | "fps">) {
  const t = frame / fps;
  const on = flash ? (t % 1.0 < 0.5 ? 1 : 0.12) : 1;
  return (
    <g>
      <circle cx={110} cy={110} r={100} fill={glow} opacity={0.22 * on} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={110 + Math.cos(a) * 76} y1={110 + Math.sin(a) * 76} x2={110 + Math.cos(a) * 100} y2={110 + Math.sin(a) * 100} stroke={glow} strokeWidth={7} strokeLinecap="round" opacity={on} />;
      })}
      <circle cx={110} cy={110} r={58} fill="#dfe7ee" stroke={ring} strokeWidth={10} />
      <circle cx={110} cy={110} r={50} fill={color} opacity={on} />
      <circle cx={92} cy={92} r={12} fill="#fff" opacity={0.55 * on} />
    </g>
  );
}

// Sky in eighths: `solid` squares are certainly covered, `maybe` more squares belong to the stated range.
const Oktas = ({ solid, maybe }: { solid: number; maybe: number }) => (
  <g>
    <rect x={14} y={30} width={192} height={160} rx={22} fill="#7cc4f3" />
    {Array.from({ length: 8 }, (_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const covered = i < solid;
      const range = !covered && i < solid + maybe;
      return <rect key={i} x={30 + col * 42} y={52 + row * 62} width={38} height={54} rx={9} fill={covered ? "#ffffff" : range ? "#ffffff" : "#5aaee6"} opacity={covered ? 1 : range ? 0.45 : 0.6} />;
    })}
  </g>
);

const Board = ({ children, fill = "#5b8f6a" }: { children: ReactNode; fill?: string }) => (
  <g>
    <rect x={14} y={14} width={192} height={192} rx={22} fill={fill} />
    {children}
  </g>
);

export const GLYPHS: Record<GlyphName, (props: GlyphProps) => ReactNode> = {
  "lamp-green": (p) => <Lamp color="#2ecc71" glow="#2ecc71" ring="#3b4a5a" {...p} />,
  "lamp-red": (p) => <Lamp color="#ef4444" glow="#ef4444" ring="#3b4a5a" {...p} />,
  "lamp-white": (p) => <Lamp color="#ffffff" glow="#f5b800" ring="#3b4a5a" {...p} />,
  flare: ({ frame, fps }) => {
    const t = frame / fps;
    const pulse = 1 + Math.sin(t * 9) * 0.06;
    return (
      <g>
        <line x1={110} y1={205} x2={110} y2={128} stroke="#94a3b8" strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" />
        <g transform={`translate(110 88) scale(${pulse})`}>
          <circle r={64} fill="#ef4444" opacity={0.2} />
          <polygon
            points={Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
              const r = i % 2 === 0 ? 56 : 26;
              return `${Math.cos(a) * r},${Math.sin(a) * r}`;
            }).join(" ")}
            fill="#ef4444"
          />
          <circle r={16} fill="#fecaca" />
        </g>
      </g>
    );
  },
  "sq-red-yellow": () => (
    <g>
      <clipPath id="sq-clip">
        <rect x={24} y={24} width={172} height={172} rx={10} />
      </clipPath>
      <rect x={24} y={24} width={172} height={172} rx={10} fill="#dc2626" />
      <g clipPath="url(#sq-clip)">
        <line x1={10} y1={10} x2={210} y2={210} stroke="#facc15" strokeWidth={30} />
        <line x1={210} y1={10} x2={10} y2={210} stroke="#facc15" strokeWidth={30} />
      </g>
    </g>
  ),
  dumbbell: () => (
    <Board>
      <rect x={62} y={94} width={96} height={32} fill="#fff" />
      <circle cx={62} cy={110} r={36} fill="#fff" />
      <circle cx={158} cy={110} r={36} fill="#fff" />
    </Board>
  ),
  "landing-t": () => (
    <Board>
      <rect x={46} y={50} width={128} height={30} fill="#fff" />
      <rect x={95} y={50} width={30} height={124} fill="#fff" />
    </Board>
  ),
  "number-board": () => (
    <g>
      <rect x={28} y={50} width={164} height={120} rx={16} fill="#1c2b3a" />
      <Txt x={110} y={132} size={78} fill="#fff" weight={800}>
        27
      </Txt>
    </g>
  ),
  "bent-arrow": () => (
    <Board fill="#fef3c7">
      <polygon points="66,180 66,88 118,88 118,56 176,112 118,168 118,136 98,136 98,180" fill="#f97316" />
    </Board>
  ),
  "chart-mandatory": () => (
    <g>
      <circle cx={110} cy={110} r={88} fill="none" stroke={C.text} strokeWidth={9} strokeDasharray="18 12" strokeLinecap="round" />
      <polygon points="110,52 164,148 56,148" fill={C.text} />
    </g>
  ),
  "oktas-few": () => <Oktas solid={1} maybe={1} />,
  "oktas-sct": () => <Oktas solid={3} maybe={1} />,
  "oktas-bkn": () => <Oktas solid={5} maybe={2} />,
  "oktas-ovc": () => <Oktas solid={8} maybe={0} />,
  "chart-request": () => (
    <g>
      <circle cx={110} cy={110} r={88} fill="none" stroke={C.text} strokeWidth={9} strokeDasharray="18 12" strokeLinecap="round" />
      <polygon points="110,52 164,148 56,148" fill="none" stroke={C.text} strokeWidth={9} strokeLinejoin="round" />
    </g>
  ),
};
