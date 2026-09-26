import type { ReactNode } from "react";
import { C, Cloud, Glider, PlaneSide, Tower, Txt, arcPath, polar } from "./svgkit";

// More pictograms for the "glyphs" scene (220 x 220 viewBox): people, places, services and broadcasts.
export type GlyphName2 =
  | "g-glider"
  | "g-trainer"
  | "g-car"
  | "g-agency"
  | "g-law"
  | "g-globe"
  | "g-clock"
  | "g-imc"
  | "g-atc"
  | "g-fis"
  | "g-alarm"
  | "g-advisory"
  | "g-tower"
  | "g-taxi"
  | "g-radio"
  | "g-gliderfield"
  | "g-info"
  | "g-atis"
  | "g-volmet"
  | "g-sigmet"
  | "g-pilot"
  | "g-start"
  | "g-flex"
  | "g-modern"
  | "g-help"
  | "g-12m";

type GlyphProps = { frame: number; fps: number; flash?: boolean };

const Disc = ({ fill = "#e3f0fc" }: { fill?: string }) => <circle cx={110} cy={110} r={100} fill={fill} />;
const Ring = ({ color = C.deep, frame, fps, cx = 110, cy = 110, from = 30, count = 3, base = 34 }: { color?: string; frame: number; fps: number; cx?: number; cy?: number; from?: number; count?: number; base?: number }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const ph = ((frame / fps) * 0.9 + i / count) % 1;
      return <circle key={i} cx={cx} cy={cy} r={base + ph * from} fill="none" stroke={color} strokeWidth={5} opacity={0.75 * (1 - ph)} />;
    })}
  </g>
);

export const GLYPHS2: Record<GlyphName2, (p: GlyphProps) => ReactNode> = {
  "g-glider": () => (
    <g>
      <Disc />
      <path d="M20,120 C60,112 100,108 200,104 L200,112 C120,122 80,126 20,128 Z" fill={C.gray} />
      <path d="M96,110 C110,92 150,90 170,104 Z" fill="#fff" stroke={C.gray} strokeWidth={4} />
      <path d="M22,122 L12,94 L26,94 L44,120 Z" fill={C.gray} />
      <path d="M40,148 C90,140 150,146 190,160" fill="none" stroke={C.deep} strokeWidth={5} strokeDasharray="10 12" strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  "g-trainer": () => (
    <g>
      <Disc />
      <g transform="translate(112 118) scale(1.15)">
        <PlaneSide x={0} y={0} s={1} fill={C.deep} />
      </g>
      <circle cx={104} cy={104} r={11} fill="#ffd9b8" />
      <circle cx={126} cy={104} r={11} fill="#f4c7a0" />
      <path d="M92,98 h24 M114,98 h24" stroke="#1c2b3a" strokeWidth={5} strokeLinecap="round" />
    </g>
  ),
  "g-car": ({ frame, fps }) => (
    <g>
      <Disc />
      <rect x={40} y={112} width={132} height={42} rx={12} fill={C.deep} />
      <path d="M62,112 L80,84 H132 L152,112 Z" fill="#7fc4f5" stroke={C.deep} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={72} cy={156} r={15} fill="#1c2b3a" />
      <circle cx={144} cy={156} r={15} fill="#1c2b3a" />
      <line x1={148} y1={84} x2={148} y2={46} stroke={C.text} strokeWidth={5} />
      <Ring color={C.green} frame={frame} fps={fps} cx={148} cy={44} from={26} base={8} />
    </g>
  ),
  "g-agency": () => (
    <g>
      <Disc />
      <polygon points="110,34 186,80 34,80" fill={C.deep} />
      {[54, 84, 114, 144].map((x) => (
        <rect key={x} x={x} y={88} width={18} height={58} fill="#fff" stroke={C.deep} strokeWidth={4} />
      ))}
      <rect x={34} y={148} width={152} height={16} rx={4} fill={C.deep} />
      <line x1={110} y1={34} x2={110} y2={12} stroke={C.text} strokeWidth={5} />
      <path d="M110,12 h32 v18 h-32 z" fill={C.amber} />
    </g>
  ),
  "g-law": () => (
    <g>
      <Disc />
      <rect x={52} y={36} width={116} height={148} rx={12} fill="#fff" stroke={C.deep} strokeWidth={6} />
      <rect x={52} y={36} width={20} height={148} rx={8} fill={C.deep} />
      <Txt x={122} y={126} size={76} fill={C.deep} weight={800}>
        §
      </Txt>
    </g>
  ),
  "g-globe": ({ frame, fps }) => {
    const sway = Math.sin(frame / fps) * 10;
    return (
      <g>
        <Disc />
        <circle cx={110} cy={110} r={68} fill="#7fc4f5" stroke={C.deep} strokeWidth={6} />
        <ellipse cx={110} cy={110} rx={30 + sway} ry={68} fill="none" stroke="#fff" strokeWidth={5} />
        <line x1={110} y1={42} x2={110} y2={178} stroke="#fff" strokeWidth={5} />
        <path d="M44,90 H176 M44,132 H176" stroke="#fff" strokeWidth={5} />
      </g>
    );
  },
  "g-clock": ({ frame, fps }) => (
    <g>
      <Disc />
      <circle cx={110} cy={110} r={72} fill="#fff" stroke={C.deep} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x0, y0] = polar(110, 110, 58, i * 30);
        const [x1, y1] = polar(110, 110, 68, i * 30);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gray} strokeWidth={4} />;
      })}
      <line x1={110} y1={110} x2={polar(110, 110, 44, (frame / fps) * 12)[0]} y2={polar(110, 110, 44, (frame / fps) * 12)[1]} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
      <line x1={110} y1={110} x2={polar(110, 110, 58, (frame / fps) * 144)[0]} y2={polar(110, 110, 58, (frame / fps) * 144)[1]} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
      <circle cx={110} cy={110} r={7} fill={C.text} />
    </g>
  ),
  "g-imc": () => (
    <g>
      <Disc fill="#dfe6ee" />
      <Cloud x={112} y={78} s={0.85} fill="#b7c3d0" />
      <circle cx={110} cy={150} r={38} fill="#1c2b3a" stroke="#fff" strokeWidth={5} />
      <line x1={80} y1={150} x2={140} y2={150} stroke="#7fe3ff" strokeWidth={5} />
      <polygon points="110,138 118,156 102,156" fill="#f59e0b" />
    </g>
  ),
  "g-atc": () => (
    <g>
      <Disc />
      <Tower x={82} y={92} s={1.0} />
      <rect x={122} y={62} width={64} height={84} rx={8} fill="#fff" stroke={C.deep} strokeWidth={5} />
      <path d="M134,96 l10,10 l22,-24" fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={134} y={118} width={40} height={6} rx={3} fill="#c9d6e4" />
      <rect x={134} y={130} width={28} height={6} rx={3} fill="#c9d6e4" />
    </g>
  ),
  "g-fis": () => (
    <g>
      <Disc />
      <circle cx={110} cy={96} r={52} fill={C.green} />
      <Txt x={110} y={118} size={78} fill="#fff" weight={800}>
        i
      </Txt>
      <rect x={50} y={160} width={120} height={16} rx={8} fill={C.green} opacity={0.35} />
    </g>
  ),
  "g-alarm": ({ frame, fps }) => {
    const on = Math.sin((frame / fps) * 9) > 0;
    return (
      <g>
        <Disc fill={on ? "#fde2e6" : "#e3f0fc"} />
        <path d="M60,150 C60,90 72,56 110,56 C148,56 160,90 160,150 Z" fill={C.red} />
        <rect x={50} y={150} width={120} height={16} rx={8} fill={C.text} />
        <circle cx={110} cy={48} r={9} fill={C.red} />
        {[-1, 1].map((d) => (
          <path key={d} d={`M${110 + d * 78},${86} l${d * 22},-10 M${110 + d * 84},${110} l${d * 26},0`} stroke={C.red} strokeWidth={6} strokeLinecap="round" opacity={on ? 1 : 0.3} />
        ))}
      </g>
    );
  },
  "g-advisory": () => (
    <g>
      <Disc />
      <path d="M48,52 h124 a14,14 0 0 1 14,14 v60 a14,14 0 0 1 -14,14 h-64 l-30,28 v-28 h-30 a14,14 0 0 1 -14,-14 v-60 a14,14 0 0 1 14,-14 z" fill="#fff" stroke={C.deep} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={110} cy={88} r={22} fill="#ffd54a" />
      <rect x={100} y={108} width={20} height={14} rx={4} fill={C.gray} />
    </g>
  ),
  "g-tower": () => (
    <g>
      <Disc />
      <Tower x={110} y={98} s={1.5} />
    </g>
  ),
  "g-taxi": () => (
    <g>
      <Disc />
      <path d="M30,168 L30,120 L190,120" fill="none" stroke="#c5ccd4" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M30,168 L30,120 L190,120" fill="none" stroke="#f5c542" strokeWidth={3} strokeDasharray="10 8" />
      <g transform="translate(108 96) rotate(90) scale(0.62)">
        <path d="M0,-40 C5,-40 7,-30 7,-20 L7,-8 L46,-4 C48,-4 48,6 46,6 L7,4 L7,24 L22,30 C24,31 24,38 22,38 L0,34 L-22,38 C-24,38 -24,31 -22,30 L-7,24 L-7,4 L-46,6 C-48,6 -48,-4 -46,-4 L-7,-8 L-7,-20 C-7,-30 -5,-40 0,-40 Z" fill={C.deep} stroke="#fff" strokeWidth={3} />
      </g>
    </g>
  ),
  "g-radio": ({ frame, fps }) => (
    <g>
      <Disc />
      <rect x={58} y={104} width={104} height={64} rx={8} fill="#fff" stroke={C.amber} strokeWidth={6} />
      <polygon points="48,104 110,64 172,104" fill={C.amber} />
      <rect x={98} y={130} width={24} height={38} fill={C.amber} opacity={0.5} />
      <line x1={110} y1={64} x2={110} y2={26} stroke={C.text} strokeWidth={5} />
      <Ring color={C.amber} frame={frame} fps={fps} cx={110} cy={26} from={34} base={8} />
    </g>
  ),
  "g-gliderfield": () => (
    <g>
      <Disc />
      <rect x={20} y={150} width={180} height={14} rx={7} fill="#cfe6d2" />
      <g transform="translate(110 92) scale(1.25)">
        <Glider x={0} y={0} rot={0} s={0.9} fill={C.gray} />
      </g>
      <path d="M40,60 C70,40 120,44 150,60" fill="none" stroke={C.deep} strokeWidth={5} strokeDasharray="8 10" strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  "g-info": () => (
    <g>
      <Disc />
      <circle cx={110} cy={98} r={54} fill={C.green} />
      <Txt x={110} y={122} size={80} fill="#fff" weight={800}>
        i
      </Txt>
      <path d="M62,166 a48,20 0 0 0 96,0" fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
    </g>
  ),
  "g-atis": ({ frame, fps }) => (
    <g>
      <Disc />
      <path d="M46,88 L82,88 L124,52 L124,168 L82,132 L46,132 Z" fill={C.amber} />
      {[0, 1, 2].map((i) => {
        const ph = ((frame / fps) * 1.2 + i / 3) % 1;
        return <path key={i} d={arcPath(126, 110, 24 + i * 22, 60, 120)} fill="none" stroke={C.amber} strokeWidth={7} strokeLinecap="round" opacity={0.3 + 0.7 * (1 - Math.abs(ph - 0.5) * 2)} />;
      })}
    </g>
  ),
  "g-volmet": ({ frame, fps }) => (
    <g>
      <Disc />
      <line x1={110} y1={170} x2={110} y2={78} stroke={C.text} strokeWidth={7} />
      <polygon points="110,66 92,170 128,170" fill="none" stroke={C.text} strokeWidth={5} />
      <circle cx={110} cy={64} r={11} fill={C.deep} />
      {[0, 1, 2].map((i) => {
        const ph = ((frame / fps) * 0.9 + i / 3) % 1;
        return (
          <g key={i} opacity={1 - ph}>
            <circle cx={110} cy={64} r={22 + ph * 52} fill="none" stroke={C.deep} strokeWidth={5} />
          </g>
        );
      })}
    </g>
  ),
  "g-sigmet": ({ frame, fps }) => {
    const flash = Math.sin((frame / fps) * 7) > 0.2;
    return (
      <g>
        <Disc fill="#e6e0f7" />
        <Cloud x={110} y={84} s={0.9} fill="#6b7a8f" />
        <polygon points="118,88 90,140 112,140 100,182 140,122 116,122 130,88" fill={flash ? "#ffd54a" : "#e0a100"} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      </g>
    );
  },
  "g-pilot": () => (
    <g>
      <Disc />
      <circle cx={110} cy={92} r={34} fill="#ffd9b8" />
      <path d="M72,84 C72,48 148,48 148,84 Z" fill="#1c2b3a" />
      <rect x={68} y={82} width={84} height={8} rx={4} fill="#1c2b3a" />
      <path d="M60,176 C60,136 160,136 160,176 Z" fill={C.deep} />
      <path d="M84,140 l26,22 l26,-22" fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M170,66 l-24,10 l24,4 l-6,10 l24,-10 l-10,-8 z" fill={C.amber} />
    </g>
  ),
  "g-start": ({ frame, fps }) => (
    <g>
      <Disc />
      <line x1={70} y1={186} x2={70} y2={40} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
      <path d={`M70,44 C100,${34 + Math.sin((frame / fps) * 4) * 6} 120,${60 - Math.sin((frame / fps) * 4) * 6} 168,48 L168,110 C120,${122 - Math.sin((frame / fps) * 4) * 6} 100,${96 + Math.sin((frame / fps) * 4) * 6} 70,108 Z`} fill={C.green} />
      <Txt x={112} y={92} size={46} fill="#fff" weight={800}>
        0
      </Txt>
    </g>
  ),
  "g-flex": ({ frame, fps }) => (
    <g>
      <Disc />
      <circle cx={110} cy={110} r={66} fill="#fff" stroke={C.deep} strokeWidth={8} />
      <line x1={110} y1={110} x2={110} y2={64} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
      <line x1={110} y1={110} x2={polar(110, 110, 46, (frame / fps) * 90)[0]} y2={polar(110, 110, 46, (frame / fps) * 90)[1]} stroke={C.sky2} strokeWidth={6} strokeLinecap="round" />
      <circle cx={110} cy={110} r={7} fill={C.text} />
      <path d="M170,46 l14,-10 l-2,18 z M50,178 l-14,10 l2,-18 z" fill={C.green} />
    </g>
  ),
  "g-modern": ({ frame, fps }) => {
    const p = ((frame / fps) * 0.3) % 1;
    return (
      <g>
        <Disc />
        <rect x={40} y={48} width={140} height={92} rx={10} fill="#1c2b3a" />
        <rect x={48} y={56} width={124} height={76} rx={6} fill="#eaf4fd" />
        <rect x={58} y={70} width={70} height={10} rx={5} fill="#c9d6e4" />
        <rect x={58} y={90} width={104} height={10} rx={5} fill="#c9d6e4" />
        <rect x={58} y={112} width={104} height={12} rx={6} fill="#dfe8f2" />
        <rect x={58} y={112} width={104 * (0.35 + p * 0.5)} height={12} rx={6} fill={C.sky} />
        <rect x={26} y={142} width={168} height={12} rx={6} fill="#3b4c60" />
      </g>
    );
  },
  "g-help": ({ frame, fps }) => {
    const bob = Math.sin((frame / fps) * 3) * 3;
    return (
      <g>
        <Disc />
        <path d="M36,58 h84 a12,12 0 0 1 12,12 v40 a12,12 0 0 1 -12,12 h-46 l-22,20 v-20 h-16 a12,12 0 0 1 -12,-12 v-40 a12,12 0 0 1 12,-12 z" fill="#fff" stroke={C.deep} strokeWidth={6} strokeLinejoin="round" transform={`translate(0 ${bob})`} />
        <Txt x={78} y={112 + bob} size={54} fill={C.deep} weight={800}>
          ?
        </Txt>
        <path d="M188,116 h-70 a12,12 0 0 0 -12,12 v34 a12,12 0 0 0 12,12 h36 l20,16 v-16 h14 a12,12 0 0 0 12,-12 v-34 a12,12 0 0 0 -12,-12 z" fill={C.green} transform={`translate(0 ${-bob})`} />
        <path d="M128,152 l12,12 l24,-26" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${-bob})`} />
      </g>
    );
  },
  "g-12m": () => (
    <g>
      <Disc />
      <rect x={42} y={50} width={136} height={122} rx={16} fill="#fff" stroke={C.deep} strokeWidth={7} />
      <rect x={42} y={50} width={136} height={38} rx={16} fill={C.deep} />
      <rect x={68} y={38} width={10} height={26} rx={5} fill={C.text} />
      <rect x={142} y={38} width={10} height={26} rx={5} fill={C.text} />
      <Txt x={110} y={148} size={64} fill={C.deep} weight={800}>
        12
      </Txt>
      <Txt x={110} y={76} size={22} fill="#fff" weight={700}>
        MONATE
      </Txt>
    </g>
  ),
};
