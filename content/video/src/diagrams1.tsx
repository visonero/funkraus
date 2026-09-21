import type { ReactNode } from "react";
import { Bubble, C, Draw, Label, Plane, Tower, Txt, along, clamp01, easeInOut, fade, lerp, polar, polyPath, prog } from "./svgkit";

export type DiagramProps = { since: number[]; p: number[]; active: number; frame: number; fps: number; params: Record<string, number | string | boolean> };
export type DiagramFn = (props: DiagramProps) => ReactNode;

const Grass = () => <rect x={0} y={0} width={1040} height={640} fill="#eef6ee" />;

// ---------------------------------------------------------------------------------------------------------
// Aerodrome: apron, taxiway, holding point and runway. params.phase: "taxi" (default) | "start"
// ---------------------------------------------------------------------------------------------------------
const RUNWAY_Y = 150;
const TAXI: [number, number][] = [
  [200, 500],
  [200, 350],
  [640, 350],
  [640, 235],
];

export const airfield: DiagramFn = ({ since, params, frame, active }) => {
  const phase = params.phase ?? "taxi";
  const holdX = 640;
  const holdY = 222;
  const runwayLeft = 120;
  const runwayRight = 940;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);

  let plane = { x: 200, y: 500, heading: 0 };
  let flying = 0;
  if (phase === "taxi") {
    const t = prog(since[0], 0.9, 5.2);
    plane = along(TAXI, t);
  } else {
    // start: taxi to the departure point (step 1), cleared and waiting (step 2), read back, then take-off roll (step 3)
    const t1 = prog(since[0], 0.4, 3.2);
    plane = along([[holdX, 235], [holdX, 200], [holdX - 30, RUNWAY_Y + 10], [300, RUNWAY_Y]], t1);
    if (t1 > 0.92) plane = { ...plane, heading: 90 };
    if (since[2] > 0) {
      const t2 = easeInOut((since[2] - 1.6) / 5.5);
      const x = lerp(300, 900, t2 * t2 * 0.6 + t2 * 0.4);
      plane = { x, y: RUNWAY_Y - 8 * clamp01((t2 - 0.55) / 0.45), heading: 90 };
      flying = clamp01((t2 - 0.5) / 0.5);
    }
  }
  const scale = 0.85 + flying * 0.35;

  return (
    <g>
      <Grass />
      {/* runway */}
      <rect x={runwayLeft} y={RUNWAY_Y - 30} width={runwayRight - runwayLeft} height={60} rx={6} fill={C.runway} />
      <line x1={runwayLeft + 110} y1={RUNWAY_Y} x2={runwayRight - 30} y2={RUNWAY_Y} stroke="#fff" strokeWidth={4} strokeDasharray="30 22" />
      <Txt x={runwayLeft + 50} y={RUNWAY_Y + 9} size={26} fill="#fff" anchor="middle">
        24
      </Txt>
      <Txt x={520} y={RUNWAY_Y - 46} size={24} fill={C.dim}>
        Piste
      </Txt>
      {/* apron and taxiway */}
      <rect x={90} y={440} width={220} height={150} rx={20} fill="#d9dee4" />
      <Txt x={200} y={618} size={22} fill={C.dim}>
        Vorfeld
      </Txt>
      <path d={polyPath(TAXI)} fill="none" stroke="#c5ccd4" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
      <path d={polyPath(TAXI)} fill="none" stroke="#f5c542" strokeWidth={3} strokeDasharray="14 12" strokeLinejoin="round" />
      <Txt x={420} y={336} size={22} fill={C.dim}>
        Rollweg
      </Txt>
      {/* holding point: double line across the taxiway, right at the edge of the runway */}
      <g opacity={0.35 + (phase === "taxi" && since[1] > 0 ? 0.65 : 0)}>
        <line x1={holdX - 26} y1={holdY} x2={holdX + 26} y2={holdY} stroke="#f5c542" strokeWidth={6} />
        <line x1={holdX - 26} y1={holdY + 12} x2={holdX + 26} y2={holdY + 12} stroke="#f5c542" strokeWidth={6} strokeDasharray="10 8" />
      </g>
      {phase === "taxi" && since[1] > 0 && (
        <>
          <circle cx={holdX} cy={holdY + 6} r={38 + pulse * 10} fill="none" stroke="#f5c542" strokeWidth={5} opacity={0.7 - pulse * 0.3} />
          <Label x={holdX + 170} y={holdY + 8} w={200} text="Rollhalt" fill="#c98a00" />
        </>
      )}
      {/* tower */}
      <Tower x={860} y={330} s={0.9} />
      <Txt x={860} y={420} size={22} fill={C.dim}>
        Turm
      </Txt>
      {/* aircraft */}
      <Plane x={plane.x} y={plane.y} rot={plane.heading} s={scale} />
      {/* speech */}
      {phase === "taxi" && since[0] > 0 && since[0] < 5 && <Bubble x={330} y={470} text="ERBITTE ROLLEN" opacity={fade(since[0], 0.1)} tailDx={-90} />}
      {phase === "taxi" && since[2] > 0 && <Bubble x={640} y={318} text="ABFLUGBEREIT" tail="down" tailDx={0} opacity={fade(since[2], 0, 0.4)} />}
      {phase === "start" && active === 0 && <Bubble x={640} y={300} text="ROLLEN SIE ZUM ABFLUGPUNKT" stroke="#3b4a5a" tail="none" opacity={fade(since[0], 0.2)} />}
      {phase === "start" && active === 1 && (
        <>
          <Bubble x={560} y={70} text="PISTE 24, START FREI" stroke="#3b4a5a" tail="none" opacity={fade(since[1], 0, 0.4)} />
          <circle cx={800} cy={RUNWAY_Y - 80} r={14} fill={C.green} opacity={fade(since[1], 0, 0.3)} />
        </>
      )}
      {phase === "start" && active === 2 && <Bubble x={470} y={250} text="PISTE 24, START FREI" opacity={fade(since[2], 0, 0.4)} tail="none" />}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Traffic pattern (left-hand circuit), landing to the east. Steps: downwind, base, final.
// ---------------------------------------------------------------------------------------------------------
const CIR = {
  climb: [[400, 500], [900, 500]] as [number, number][],
  cross: [[900, 500], [900, 160]] as [number, number][],
  down: [[900, 160], [110, 160]] as [number, number][],
  base: [[110, 160], [110, 500]] as [number, number][],
  final: [[110, 500], [400, 500]] as [number, number][],
};

export const circuit: DiagramFn = ({ since }) => {
  const legs: { key: keyof typeof CIR; label: string; sub?: string; pos: [number, number] }[] = [
    { key: "down", label: "Gegenanflug", pos: [505, 108] },
    { key: "base", label: "Queranflug", pos: [232, 330] },
    { key: "final", label: "Endanflug", pos: [255, 555] },
  ];
  const t = [prog(since[0], 0.2, 2.6), prog(since[1], 0.2, 1.8), prog(since[2], 0.2, 2.2)];
  // aircraft position: sits at the start of the downwind, then follows the legs in order
  let plane = { x: 900, y: 160, heading: 270 };
  if (since[2] > 0) plane = along(CIR.final, t[2]);
  else if (since[1] > 0) plane = along(CIR.base, t[1]);
  else if (since[0] > 0) plane = along(CIR.down, t[0]);
  else plane = { x: 900, y: 190, heading: 0 };
  const climb = "M400,500 L900,500";
  return (
    <g>
      <Grass />
      {/* runway */}
      <rect x={400} y={484} width={300} height={32} rx={4} fill={C.runway} />
      <line x1={415} y1={500} x2={685} y2={500} stroke="#fff" strokeWidth={3} strokeDasharray="22 16" />
      <Txt x={550} y={545} size={22} fill={C.dim}>
        Piste, Landerichtung →
      </Txt>
      {/* faint circuit */}
      {[CIR.climb, CIR.cross, CIR.down, CIR.base, CIR.final].map((leg, i) => (
        <path key={i} d={polyPath(leg)} fill="none" stroke="#b9c7d6" strokeWidth={5} strokeDasharray="12 12" strokeLinecap="round" />
      ))}
      <Txt x={790} y={545} size={22} fill="#8da0b3">
        Abflug
      </Txt>
      <Txt x={968} y={330} size={20} fill="#8da0b3" rotate={-90}>
        Querabflug
      </Txt>
      {/* highlighted legs */}
      <Draw d={polyPath(CIR.down)} p={t[0]} stroke={since[0] > 0 && since[1] < 0 ? C.deep : C.sky} width={since[1] < 0 ? 11 : 8} arrow="deep" />
      <Draw d={polyPath(CIR.base)} p={t[1]} stroke={since[1] > 0 && since[2] < 0 ? C.deep : C.sky} width={since[2] < 0 ? 11 : 8} arrow="deep" />
      <Draw d={polyPath(CIR.final)} p={t[2]} stroke={C.deep} width={11} arrow="deep" />
      {legs.map((leg, i) => (
        <Label key={leg.key} x={leg.pos[0]} y={leg.pos[1]} w={leg.label.length * 15 + 50} text={leg.label} fill={i === 2 ? C.green : C.deep} opacity={fade(since[i], 0.25)} />
      ))}
      <Plane x={plane.x} y={plane.y} rot={plane.heading} s={0.8} />
      {/* left turns */}
      {since[2] > 3.5 && (
        <Txt x={600} y={330} size={30} fill={C.dim} opacity={fade(since[2], 3.5, 0.6)}>
          alle Kurven links
        </Txt>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Clock positions around your aircraft. Steps: 12 o'clock, 10 o'clock, distance.
// ---------------------------------------------------------------------------------------------------------
export const clock: DiagramFn = ({ since, frame }) => {
  const cx = 520;
  const cy = 330;
  const ring = 58; // pixels per nautical mile
  const target = polar(cx, cy, ring * 4, -60);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#f4f8fd" />
      {[1, 2, 3, 4].map((n) => (
        <g key={n}>
          <circle cx={cx} cy={cy} r={ring * n} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="6 8" />
          <Txt x={polar(cx, cy, ring * n, 152)[0]} y={polar(cx, cy, ring * n, 152)[1] + 6} size={18} fill={C.dim}>
            {n} NM
          </Txt>
        </g>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const h = i === 0 ? 12 : i;
        const [x, y] = polar(cx, cy, ring * 4 + 44, i * 30);
        const on = (h === 12 && since[0] > 0) || (h === 10 && since[1] > 0);
        return (
          <g key={i}>
            {on && <circle cx={x} cy={y} r={26} fill={h === 12 ? C.sky : C.red} opacity={0.18} />}
            <Txt x={x} y={y + 10} size={on ? 32 : 26} fill={on ? (h === 12 ? C.deep : C.red) : C.dim}>
              {h}
            </Txt>
          </g>
        );
      })}
      {since[0] > 0 && <Draw d={`M${cx},${cy} L${cx},${cy - ring * 4}`} p={prog(since[0], 0, 1)} stroke={C.deep} width={6} dash="4 12" />}
      {since[0] > 0 && <Label x={cx + 130} y={cy - ring * 2.2} w={200} text="genau voraus" fill={C.deep} opacity={fade(since[0], 0.5)} size={22} />}
      {since[1] > 0 && <Draw d={`M${cx},${cy} L${target[0]},${target[1]}`} p={prog(since[1], 0, 1.0)} stroke={C.red} width={6} arrow="red" />}
      {since[1] > 0.9 && (
        <g opacity={fade(since[1], 0.9, 0.4)}>
          <circle cx={target[0]} cy={target[1]} r={34 + pulse * 8} fill={C.red} opacity={0.14} />
          <Plane x={target[0]} y={target[1]} rot={120} s={0.55} fill={C.red} />
          <Label x={target[0] - 10} y={target[1] - 66} w={170} text="unbekannt" fill={C.red} size={22} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.4)}>
          <path d={`M${cx + 22},${cy - 4} L${target[0] + 6},${target[1] + 14}`} stroke={C.amber} strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" />
          <Label x={(cx + target[0]) / 2} y={(cy + target[1]) / 2 - 8} w={170} text="4 Meilen" fill={C.amber} size={24} />
        </g>
      )}
      <Plane x={cx} y={cy} s={0.9} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Route with a control zone (D) and a compulsory reporting point.
//   params.mode = "ctr5"  : call 5 minutes before the reporting point (steps: 5 min, too late)
//   params.mode = "report": when to report (steps: reporting point, entry into D, with clearance)
// ---------------------------------------------------------------------------------------------------------
const Triangle = ({ x, y, filled = true, s = 1, opacity = 1 }: { x: number; y: number; filled?: boolean; s?: number; opacity?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle r={40} fill="#fff" fillOpacity={0.9} stroke={C.text} strokeWidth={4} strokeDasharray="9 7" />
    <polygon points="0,-22 20,14 -20,14" fill={filled ? C.text : "none"} stroke={C.text} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const route: DiagramFn = ({ since, params, frame, active }) => {
  const mode = params.mode ?? "report";
  const zone = { x: 720, y: 300, r: 210 };
  const path: [number, number][] = [[90, 560], [540, 372]];
  const reporting: [number, number] = [540, 372];
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  const zoneOn = mode === "report" ? since[1] > 0 : since[1] > 0;
  let t = 0.3;
  if (mode === "ctr5") t = since[1] > 0 ? 0.46 + 0.54 * prog(since[1], 0.2, 3.2) : 0.46;
  else t = since[2] > 0 ? 0.62 + 0.38 * prog(since[2], 0, 3) : since[1] > 0 ? 0.9 : since[0] > 0 ? 0.6 + 0.4 * prog(since[0], 0.2, 2.6) : 0.35;
  const plane = along(path, clamp01(t));
  const callPoint = along(path, 0.46);
  return (
    <g>
      <Grass />
      <circle cx={zone.x} cy={zone.y} r={zone.r} fill={zoneOn ? "rgba(47,155,234,0.14)" : "rgba(47,155,234,0.06)"} stroke={C.deep} strokeWidth={zoneOn ? 6 : 4} strokeDasharray="16 10" />
      <Txt x={zone.x + 130} y={zone.y - 120} size={40} fill={C.deep}>
        D
      </Txt>
      <Txt x={zone.x} y={zone.y - zone.r - 14} size={22} fill={C.dim}>
        Kontrollzone (Luftraum D)
      </Txt>
      {/* airfield inside */}
      <rect x={zone.x - 70} y={zone.y - 8} width={140} height={16} rx={4} fill={C.runway} transform={`rotate(-20 ${zone.x} ${zone.y})`} />
      {/* route */}
      <path d={polyPath(path)} fill="none" stroke="#b9c7d6" strokeWidth={5} strokeDasharray="12 12" strokeLinecap="round" />
      <path d={`M${reporting[0]},${reporting[1]} L${zone.x - 60},${zone.y + 60}`} fill="none" stroke="#b9c7d6" strokeWidth={5} strokeDasharray="12 12" strokeLinecap="round" />
      <Triangle x={reporting[0]} y={reporting[1]} filled />
      <Txt x={reporting[0] - 10} y={reporting[1] + 78} size={22} fill={C.text}>
        Pflichtmeldepunkt
      </Txt>
      <Plane x={plane.x} y={plane.y} rot={plane.heading} s={0.7} />
      {mode === "ctr5" && since[0] > 0 && (
        <g opacity={fade(since[0], 0.2)}>
          <line x1={callPoint.x - 26} y1={callPoint.y - 62} x2={reporting[0] - 26} y2={reporting[1] - 62} stroke={C.green} strokeWidth={6} markerStart="url(#arrow-green)" markerEnd="url(#arrow-green)" />
          <Label x={(callPoint.x + reporting[0]) / 2 - 40} y={(callPoint.y + reporting[1]) / 2 - 92} text="5 Minuten" fill={C.green} />
          <Bubble x={callPoint.x - 20} y={callPoint.y + 100} text="FUNKKONTAKT" stroke={C.green} tail="up" tailDx={20} />
        </g>
      )}
      {mode === "ctr5" && active === 1 && (
        <g opacity={fade(since[1], 3.4)}>
          <circle cx={reporting[0]} cy={reporting[1]} r={52 + pulse * 6} fill="none" stroke={C.red} strokeWidth={5} />
          <Bubble x={reporting[0] - 40} y={reporting[1] + 110} text="erst jetzt: zu spät!" stroke={C.red} color={C.red} tail="up" tailDx={30} />
        </g>
      )}
      {mode === "report" && active === 0 && (
        <g opacity={fade(since[0], 0.4)}>
          <circle cx={reporting[0]} cy={reporting[1]} r={52 + pulse * 6} fill="none" stroke={C.green} strokeWidth={5} />
          <Bubble x={reporting[0] - 150} y={reporting[1] - 110} text="DGIGA, ÜBER SIERRA" stroke={C.green} tailDx={110} />
        </g>
      )}
      {mode === "report" && active === 1 && (
        <g opacity={fade(since[1], 0.1)}>
          <circle cx={zone.x} cy={zone.y} r={zone.r + 6 + pulse * 6} fill="none" stroke={C.deep} strokeWidth={5} opacity={0.6} />
          <Label x={zone.x} y={zone.y + 70} w={230} text="Einflug in D" fill={C.deep} />
        </g>
      )}
      {mode === "report" && active === 2 && (
        <g opacity={fade(since[2], 0.2)}>
          <Bubble x={290} y={120} text="EINFLUG GENEHMIGT" stroke="#3b4a5a" tail="none" />
          <Bubble x={290} y={205} text="TROTZDEM MELDEN" stroke={C.green} tail="none" />
        </g>
      )}
    </g>
  );
};

