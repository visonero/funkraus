import type { ReactNode } from "react";
import type { DiagramFn } from "./diagrams1";
import { Bubble, C, Compass, Dimension, Label, Plane, Station, Txt, arcPath, clamp01, fade, lerp, polar, prog } from "./svgkit";

// ---------------------------------------------------------------------------------------------------------
// VOR indicator: rotating compass card (OBS), needle (CDI) with dots (2 degrees each) and a TO / FROM / OFF flag.
// needle: -2.5 .. 2.5 dots (negative = left)
// ---------------------------------------------------------------------------------------------------------
type Indicator = { cx: number; cy: number; r: number; course: number; needle: number; flag: "to" | "from" | "off"; hlObs?: number; hlNeedle?: number; hlDots?: number; opacity?: number };

const CARD: [number, string][] = [
  [0, "N"],
  [30, "3"],
  [60, "6"],
  [90, "E"],
  [120, "12"],
  [150, "15"],
  [180, "S"],
  [210, "21"],
  [240, "24"],
  [270, "W"],
  [300, "30"],
  [330, "33"],
];

export function VorIndicator({ cx, cy, r, course, needle, flag, hlObs = 0, hlNeedle = 0, hlDots = 0, opacity = 1 }: Indicator) {
  const dot = r * 0.2;
  const nx = cx + needle * dot;
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="#2b3948" />
      <circle cx={cx} cy={cy} r={r - 14} fill="#0f1a24" />
      {/* rotating card */}
      <g transform={`rotate(${-course} ${cx} ${cy})`}>
        {Array.from({ length: 36 }, (_, i) => {
          const [x0, y0] = polar(cx, cy, r - 32, i * 10);
          const [x1, y1] = polar(cx, cy, r - 16, i * 10);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#d5e1ec" strokeWidth={i % 3 === 0 ? 4 : 2} />;
        })}
        {CARD.map(([deg, label]) => {
          const [x, y] = polar(cx, cy, r - 58, deg);
          return (
            <Txt key={deg} x={x} y={y + r * 0.055} size={r * 0.13} fill={deg === 0 ? "#ff8fa8" : "#eaf2fa"} rotate={deg}>
              {label}
            </Txt>
          );
        })}
      </g>
      {/* course index */}
      <polygon points={`${cx},${cy - r + 8} ${cx - 13},${cy - r - 14} ${cx + 13},${cy - r - 14}`} fill="#f5c542" />
      {/* deviation dots */}
      {[-2, -1, 1, 2].map((d) => (
        <circle key={d} cx={cx + d * dot} cy={cy} r={r * 0.028} fill="none" stroke="#eaf2fa" strokeWidth={4} />
      ))}
      {hlDots > 0 && (
        <g opacity={hlDots}>
          <circle cx={cx + dot} cy={cy} r={r * 0.075} fill="none" stroke="#f5c542" strokeWidth={5} />
          <circle cx={cx + 2 * dot} cy={cy} r={r * 0.075} fill="none" stroke="#f5c542" strokeWidth={5} />
        </g>
      )}
      {/* needle */}
      {hlNeedle > 0 && <rect x={nx - 14} y={cy - r * 0.5} width={28} height={r} rx={14} fill="#f5c542" opacity={0.35 * hlNeedle} />}
      <rect x={nx - 4} y={cy - r * 0.5} width={8} height={r} rx={3} fill="#fff" />
      {/* fixed aircraft symbol */}
      <g fill="#fff">
        <rect x={cx - 3} y={cy - 22} width={6} height={44} />
        <rect x={cx - 30} y={cy - 4} width={60} height={7} />
      </g>
      {/* flag */}
      <g transform={`translate(${cx + r * 0.36} ${cy - r * 0.36})`}>
        {flag === "to" && <polygon points="0,-24 20,14 -20,14" fill="#fff" />}
        {flag === "from" && <polygon points="0,24 20,-14 -20,-14" fill="#fff" />}
        {flag === "off" && (
          <g>
            <rect x={-26} y={-16} width={52} height={32} fill="#d6336c" />
            <path d="M-26,-16 L26,16 M-26,16 L26,-16" stroke="#fff" strokeWidth={4} />
          </g>
        )}
        <Txt x={0} y={r * 0.22} size={r * 0.1} fill={flag === "off" ? "#ff8fa8" : "#fff"}>
          {flag === "to" ? "TO" : flag === "from" ? "FROM" : "OFF"}
        </Txt>
      </g>
      {/* OBS knob */}
      <g transform={`translate(${cx - r * 0.8} ${cy + r * 0.86})`}>
        {hlObs > 0 && <circle r={r * 0.17} fill="#f5c542" opacity={0.4 * hlObs} />}
        <circle r={r * 0.11} fill="#94a3b8" stroke="#fff" strokeWidth={4} />
        <path d={arcPath(0, 0, r * 0.16, -60, 110)} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
}

const Ground = () => <rect x={0} y={0} width={1040} height={640} fill="#f4f8fd" />;

// ---------------------------------------------------------------------------------------------------------
// Steps: sender on the ground, receiver on board, own bearing (Eigenpeilung)
// ---------------------------------------------------------------------------------------------------------
export const vorIntro: DiagramFn = ({ since, frame }) => {
  const sx = 300;
  const sy = 470;
  const px = 720;
  const py = 190;
  const wave = (frame % 60) / 60;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={0} y={520} width={1040} height={120} fill="#cfe6d2" />
      {/* beams in all directions */}
      {since[0] > 0 &&
        Array.from({ length: 24 }, (_, i) => {
          const a = i * 15;
          const [x1, y1] = polar(sx, sy, 60, a);
          const [x2, y2] = polar(sx, sy, 60 + 330 * clamp01(prog(since[0], 0, 1.4)), a);
          if (a > 90 && a < 270) return null;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.sky} strokeWidth={3} opacity={0.35} />;
        })}
      {since[0] > 0 && [0, 1, 2].map((k) => <circle key={k} cx={sx} cy={sy} r={70 + ((wave + k / 3) % 1) * 260} fill="none" stroke={C.sky} strokeWidth={3} opacity={(1 - ((wave + k / 3) % 1)) * 0.5} />)}
      <Station x={sx} y={sy} s={1.5} />
      {since[0] > 0 && <Label x={sx} y={sy + 90} text="Sender am Boden" fill={C.text} opacity={fade(since[0], 0.3)} />}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0)}>
          <Plane x={px} y={py} rot={200} s={1} />
          <Label x={px + 40} y={py - 90} text="Empfänger an Bord" fill={C.deep} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <line x1={sx + 40} y1={sy - 40} x2={px - 30} y2={py + 50} stroke={C.green} strokeWidth={6} strokeDasharray="14 10" markerEnd="url(#arrow-green)" />
          <Bubble x={700} y={400} text="Eigenpeilung" stroke={C.green} tail="none" size={30} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Steps: the radial, magnetic north as reference, radial = QDR
// ---------------------------------------------------------------------------------------------------------
export const vorRadial: DiagramFn = ({ since }) => {
  const cx = 470;
  const cy = 330;
  const r = 250;
  const radial = 60;
  return (
    <g>
      <Ground />
      <Compass cx={cx} cy={cy} r={r} labels={false} />
      {Array.from({ length: 36 }, (_, i) => {
        const [x, y] = polar(cx, cy, r - 24, i * 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.sky} strokeWidth={1.5} opacity={0.22} />;
      })}
      {(() => {
        const [x, y] = polar(cx, cy, r - 26, radial);
        return since[0] > 0 ? <line x1={cx} y1={cy} x2={cx + (x - cx) * prog(since[0], 0, 1)} y2={cy + (y - cy) * prog(since[0], 0, 1)} stroke={C.deep} strokeWidth={9} strokeLinecap="round" markerEnd={since[0] > 1.1 ? "url(#arrow-deep)" : undefined} /> : null;
      })()}
      {since[0] > 0 && (() => {
        const [x, y] = polar(cx, cy, r + 46, radial);
        return <Label x={x + 20} y={y - 6} text="Radial" fill={C.deep} opacity={fade(since[0], 0.6)} />;
      })()}
      <Station x={cx} y={cy} s={0.9} />
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r - 8} stroke={C.red} strokeWidth={7} strokeLinecap="round" markerEnd="url(#arrow-red)" />
          <Label x={cx - 150} y={cy - r - 22} text="missweisend Nord" fill={C.red} />
          <path d={arcPath(cx, cy, 110, 0, radial)} fill="none" stroke={C.amber} strokeWidth={7} strokeLinecap="round" />
          {(() => {
            const [x, y] = polar(cx, cy, 148, radial / 2);
            return (
              <Txt x={x + 14} y={y + 8} size={26} fill={C.amber}>
                060°
              </Txt>
            );
          })()}
        </g>
      )}
      {since[2] > 0 &&
        (() => {
          const [x, y] = polar(cx, cy, 170, radial);
          return (
            <g opacity={fade(since[2], 0, 0.5)}>
              <Plane x={x} y={y} rot={radial + 180} s={0.7} fill={C.deep} />
              <Bubble x={x + 200} y={y + 110} text="QDR 060°" stroke={C.green} tail="none" size={30} />
            </g>
          );
        })()}
      {since[2] > 0 && (
        <Txt x={850} y={560} size={22} fill={C.dim} opacity={fade(since[2], 0.6)}>
          Peilung von der Station
        </Txt>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Steps: OBS (course selector), CDI needle, one dot = 2 degrees
// ---------------------------------------------------------------------------------------------------------
export const vorInstrument: DiagramFn = ({ since, frame }) => {
  const cx = 470;
  const cy = 320;
  const r = 235;
  const course = since[0] > 0 ? lerp(230, 320, prog(since[0], 0.3, 2.6)) : 230;
  let needle = 0;
  if (since[1] > 0) needle = Math.sin(clamp01(since[1] / 4.5) * Math.PI * 2) * 2 * clamp01(since[1] * 1.5) * (since[2] > 0 ? 0 : 1);
  if (since[2] > 0) needle = lerp(needle, -1, prog(since[2], 0, 0.8));
  const obsHl = since[0] > 0 && since[1] < 0 ? 0.6 + 0.4 * Math.sin(frame / 5) : 0;
  return (
    <g>
      <Ground />
      <VorIndicator cx={cx} cy={cy} r={r} course={course} needle={needle} flag="to" hlObs={obsHl} hlNeedle={since[1] > 0 && since[2] < 0 ? 1 : 0} hlDots={since[2] > 0 ? 1 : 0} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0.2)}>
          <line x1={250} y1={585} x2={cx - r * 0.72} y2={cy + r * 0.8} stroke={C.amber} strokeWidth={4} />
          <Label x={190} y={598} text="OBS = Kurswähler" fill={C.amber} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0.2)}>
          <line x1={cx + 20} y1={cy - r * 0.35} x2={790} y2={200} stroke={C.deep} strokeWidth={4} />
          <Label x={880} y={200} text="CDI = Ablage-Nadel" fill={C.deep} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0.2)}>
          <line x1={cx + r * 0.22} y1={cy + 8} x2={790} y2={400} stroke={C.green} strokeWidth={4} />
          <Label x={880} y={400} text="1 Punkt = 2°" fill={C.green} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Steps: TO (towards the station), FROM (away), passing over the station (TO -> OFF -> FROM)
// ---------------------------------------------------------------------------------------------------------
export const vorToFrom: DiagramFn = ({ since }) => {
  const sx = 300;
  const sy = 330;
  let py = 500;
  let flag: "to" | "from" | "off" = "to";
  let showSecond = false;
  if (since[2] > 0) {
    const t = prog(since[2], 0.4, 6.5);
    py = lerp(520, 140, t);
    flag = py > sy + 26 ? "to" : py > sy - 22 ? "off" : "from";
  } else if (since[1] > 0) {
    flag = "from";
    showSecond = true;
    py = 500;
  }
  const active = since[2] > 0 ? 2 : since[1] > 0 ? 1 : 0;
  return (
    <g>
      <Ground />
      <line x1={sx} y1={70} x2={sx} y2={590} stroke={C.line} strokeWidth={6} strokeDasharray="10 12" />
      <Txt x={sx + 80} y={96} size={22} fill={C.dim}>
        Radial / Kurs
      </Txt>
      <Station x={sx} y={sy} s={1.2} />
      {active === 0 && (
        <g>
          <Plane x={sx} y={470 - 40 * prog(since[0], 0, 3)} s={0.9} />
          <Dimension x1={sx + 90} y1={430} x2={sx + 90} y2={sy + 40} text="zur Station hin" color={C.green} offset={95} />
        </g>
      )}
      {active === 1 && (
        <g>
          <Plane x={sx} y={140 - 20 * prog(since[1], 0, 3)} s={0.9} />
          <Dimension x1={sx + 90} y1={230} x2={sx + 90} y2={100} text="von der Station weg" color={C.red} offset={110} />
        </g>
      )}
      {active === 2 && <Plane x={sx} y={py} s={0.9} />}
      {/* indicator */}
      <VorIndicator cx={790} cy={330} r={170} course={0} needle={0} flag={active === 0 ? "to" : active === 1 ? "from" : flag} />
      <Label x={790} y={560} text={flag === "to" ? "TO = zur Station" : flag === "from" ? "FROM = von der Station" : "OFF"} fill={flag === "to" ? C.green : flag === "from" ? C.red : C.amber} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Steps: needle centred + TO, number at the OBS = course to the station, needle left -> right of the radial
// ---------------------------------------------------------------------------------------------------------
export const vorApproach: DiagramFn = ({ since }) => {
  const sx = 290;
  const sy = 120;
  const lineX = 290;
  const right = since[2] > 0 ? prog(since[2], 0.2, 2.2) : 0;
  const planeX = lerp(lineX, lineX + 110, right);
  const needle = -2 * right;
  const course = 320;
  return (
    <g>
      <Ground />
      <line x1={lineX} y1={sy} x2={lineX} y2={600} stroke={C.deep} strokeWidth={5} strokeDasharray="12 10" opacity={0.6} />
      <Station x={sx} y={sy} s={1.2} />
      <Txt x={sx + 90} y={sy + 8} size={22} fill={C.dim} anchor="start">
        VOR
      </Txt>
      <Plane x={planeX} y={470} s={0.95} />
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0.2)}>
          <line x1={lineX + 60} y1={420} x2={lineX + 60} y2={190} stroke={C.green} strokeWidth={7} markerEnd="url(#arrow-green)" />
          <Label x={lineX + 140} y={300} text="Kurs 320°" fill={C.green} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0.8)}>
          <Bubble x={lineX + 220} y={560} text="rechts vom Radial" stroke={C.amber} tail="up" tailDx={-120} size={26} />
        </g>
      )}
      <VorIndicator cx={800} cy={330} r={195} course={course} needle={needle} flag="to" hlObs={since[1] > 0 && since[2] < 0 ? 1 : 0} hlNeedle={since[2] > 0 ? 1 : since[0] > 0 && since[1] < 0 ? 1 : 0} />
      {since[1] > 0 && since[2] < 0 && (
        <Label x={800} y={62} text="Zahl am Kurswähler: 320°" fill={C.amber} size={22} />
      )}
      {since[2] > 0 && <Label x={800} y={62} text="Nadel links" fill={C.amber} size={24} />}
    </g>
  );
};

export const _c: { c: ReactNode } = { c: null };
