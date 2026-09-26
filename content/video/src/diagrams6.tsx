import type { DiagramFn } from "./diagrams1";
import { Bubble, C, Cloud, Dimension, Label, Plane, PlaneSide, Tower, Txt, along, arcPath, clamp01, fade, lerp, polar, prog } from "./svgkit";

// New animated scenes for the free modules (0.1 and 1.1 - 1.3). Panel size 1040 x 640, step i appears on its cue.

const Sky = ({ fill = "#eaf4fd" }: { fill?: string }) => <rect x={0} y={0} width={1040} height={640} fill={fill} />;

// ---------------------------------------------------------------------------------------------------------
// Course journey (0.1): an aircraft flies from stop to stop. params.variant "route" = six stages, "english" = four.
// ---------------------------------------------------------------------------------------------------------
const ROUTE_STOPS: { p: [number, number]; label: string }[] = [
  { p: [110, 520], label: "Basiswissen" },
  { p: [260, 330], label: "Sprechfunk" },
  { p: [440, 470], label: "Platzverkehr" },
  { p: [610, 250], label: "Streckenflug" },
  { p: [790, 400], label: "Notverfahren" },
  { p: [930, 130], label: "Prüfung" },
];
const ENGLISH_STOPS: { p: [number, number]; label: string }[] = [
  { p: [130, 480], label: "Englischer Funk" },
  { p: [370, 300], label: "Texte und Vokabeln" },
  { p: [640, 430], label: "BZF I Prüfung" },
  { p: [900, 170], label: "Bonus" },
];

// The part of a polyline that has been flown (fraction 0..1 of its total length).
function trail(points: [number, number][], t: number) {
  const lens = points.slice(1).map((q, i) => Math.hypot(q[0] - points[i][0], q[1] - points[i][1]));
  let left = clamp01(t) * lens.reduce((a, b) => a + b, 0);
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    d += ` L${lerp(points[i][0], points[i + 1][0], f)},${lerp(points[i][1], points[i + 1][1], f)}`;
    left -= lens[i];
  }
  return d;
}

export const journey: DiagramFn = ({ since, active, frame, params }) => {
  const stops = params.variant === "english" ? ENGLISH_STOPS : ROUTE_STOPS;
  const pts = stops.map((s) => s.p);
  const n = stops.length;
  // The aircraft moves to a stop as soon as the voice reaches it.
  const from = Math.max(active - 1, 0) / (n - 1);
  const to = Math.max(active, 0) / (n - 1);
  const progress = active < 0 ? 0 : lerp(from, to, prog(since[active], 0, 1.7));
  const pos = along(pts, progress);
  const bob = Math.sin(frame / 9) * 4;
  return (
    <g>
      <Sky fill="#e8f3fc" />
      <Cloud x={200} y={120} s={0.7} opacity={0.7} />
      <Cloud x={780} y={540} s={0.6} opacity={0.6} />
      <Cloud x={560} y={90} s={0.5} opacity={0.5} />
      {/* dotted route and the part already flown */}
      <path d={pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ")} fill="none" stroke={C.line} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
      {progress > 0 && <path d={trail(pts, progress)} fill="none" stroke={C.sky} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />}
      {stops.map((s, i) => {
        const lit = since[i] > 0;
        const pop = lit ? 1 + 0.25 * Math.max(0, 1 - since[i] * 2) : 1;
        const lx = s.p[0] > 780 ? s.p[0] - 20 : s.p[0] + 42;
        const anchor = s.p[0] > 780 ? "end" : "start";
        return (
          <g key={i}>
            <g transform={`translate(${s.p[0]} ${s.p[1]}) scale(${pop})`}>
              {lit && <circle r={40} fill={C.sky} opacity={0.18 + 0.1 * Math.sin(frame / 8)} />}
              <circle r={26} fill={lit ? C.deep : "#fff"} stroke={lit ? "#fff" : C.gray} strokeWidth={4} />
              <Txt x={0} y={10} size={28} fill={lit ? "#fff" : C.gray} weight={800}>
                {i + 1}
              </Txt>
            </g>
            <Txt x={lx} y={s.p[1] + 44 * (i % 2 ? -1 : 1) + (i % 2 ? -6 : 22)} size={24} fill={lit ? C.deep : C.gray} anchor={anchor as "start" | "end"} opacity={lit ? 1 : 0.55}>
              {s.label}
            </Txt>
          </g>
        );
      })}
      {/* finish flag on the last stop */}
      {since[n - 1] > 0 && (
        <g transform={`translate(${stops[n - 1].p[0]} ${stops[n - 1].p[1] - 34})`} opacity={fade(since[n - 1], 0.6, 0.5)}>
          <line x1={0} y1={0} x2={0} y2={-46} stroke={C.text} strokeWidth={4} />
          <path d="M0,-46 L36,-38 L0,-28 Z" fill={C.green} />
        </g>
      )}
      <Plane x={pos.x} y={pos.y + bob} rot={pos.heading} s={0.95} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// How a lesson works (0.1). Steps: video, text, audio, questions - the screen changes with each.
// ---------------------------------------------------------------------------------------------------------
export const lessonflow: DiagramFn = ({ since, active, frame }) => {
  const a = Math.max(active, 0);
  const t = since[a];
  const cx = 520;
  const tabs = ["Video", "Text", "Audio", "Fragen"];
  const bars = Array.from({ length: 19 }, (_, i) => 12 + 34 * Math.abs(Math.sin(frame / 7 + i * 0.7)) * (0.5 + 0.5 * Math.sin(i * 0.9 + 1)));
  return (
    <g>
      <Sky fill="#e8f3fc" />
      <g>
        <rect x={130} y={50} width={780} height={540} rx={32} fill="#fff" stroke={C.line} strokeWidth={3} />
        {tabs.map((label, i) => {
          const on = i === a && active >= 0;
          return (
            <g key={label}>
              <rect x={168 + i * 182} y={78} width={166} height={46} rx={23} fill={on ? C.deep : "#eef3f8"} />
              <Txt x={168 + i * 182 + 83} y={110} size={24} fill={on ? "#fff" : C.gray}>
                {label}
              </Txt>
            </g>
          );
        })}
        {/* 0: video */}
        {a === 0 && (
          <g opacity={fade(t, 0, 0.4)}>
            <rect x={190} y={160} width={660} height={340} rx={22} fill="#12233a" />
            <circle cx={cx} cy={320} r={58} fill="#fff" opacity={0.92} />
            <polygon points="500,292 500,348 548,320" fill={C.deep} />
            <rect x={210} y={470} width={620} height={8} rx={4} fill="#3b5068" />
            <rect x={210} y={470} width={620 * clamp01(t / 9)} height={8} rx={4} fill={C.sky2} />
          </g>
        )}
        {/* 1: text with a highlighter moving along the lines */}
        {a === 1 && (
          <g opacity={fade(t, 0, 0.4)}>
            {[0, 1, 2, 3, 4].map((i) => {
              const w = [560, 620, 480, 600, 380][i];
              const hl = clamp01((t - 0.6 - i * 0.7) / 0.7);
              return (
                <g key={i}>
                  <rect x={210} y={172 + i * 62} width={w} height={20} rx={10} fill="#d6e2ee" />
                  {i === 1 || i === 3 ? <rect x={210} y={172 + i * 62} width={w * 0.55 * hl} height={20} rx={10} fill="#ffd54a" opacity={0.9} /> : null}
                </g>
              );
            })}
          </g>
        )}
        {/* 2: listen and speak along */}
        {a === 2 && (
          <g opacity={fade(t, 0, 0.4)}>
            <g transform="translate(300 330)">
              <rect x={-26} y={-64} width={52} height={88} rx={26} fill={C.deep} />
              <path d="M-48,-4 A48,48 0 0 0 48,-4 M0,44 L0,74 M-26,74 L26,74" fill="none" stroke={C.deep} strokeWidth={9} strokeLinecap="round" />
            </g>
            <g transform="translate(400 330)">
              {bars.map((h, i) => (
                <rect key={i} x={i * 22} y={-h / 2} width={12} height={h} rx={6} fill={i < 9 ? C.sky : C.green} />
              ))}
            </g>
            <Label x={520} y={460} w={360} text="Zuhören und mitsprechen" fill={C.deep} size={26} />
          </g>
        )}
        {/* 3: question with answers, the right one ticks */}
        {a === 3 && (
          <g opacity={fade(t, 0, 0.4)}>
            <rect x={200} y={158} width={640} height={82} rx={18} fill="#eaf4fd" />
            <Txt x={228} y={208} size={28} anchor="start" fill={C.text}>
              Offizielle Prüfungsfrage
            </Txt>
            {[0, 1, 2].map((i) => {
              const ok = i === 1 && t > 1.6;
              return (
                <g key={i}>
                  <rect x={200} y={268 + i * 76} width={640} height={60} rx={16} fill={ok ? "#dcf5ea" : "#f3f6fa"} stroke={ok ? C.green : "transparent"} strokeWidth={3} />
                  <rect x={232} y={290 + i * 76} width={[380, 300, 340][i]} height={16} rx={8} fill="#c9d6e4" />
                  {ok && (
                    <path d={`M770,${300 + i * 76} l14,14 l30,-32`} fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </g>
              );
            })}
          </g>
        )}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The certificates as steps (1.1). Steps: BZF II, BZF I, AZF - an aircraft climbs the stairs.
// ---------------------------------------------------------------------------------------------------------
export const ladder: DiagramFn = ({ since, active }) => {
  const steps = [
    { x: 110, h: 150, label: "BZF II", cap: "Deutsch", color: C.sky },
    { x: 400, h: 270, label: "BZF I", cap: "Deutsch + Englisch", color: C.deep },
    { x: 690, h: 390, label: "AZF", cap: "auch Instrumentenflug", color: C.green },
  ];
  const a = Math.max(active, 0);
  const target = steps[a];
  const fromStep = steps[Math.max(a - 1, 0)];
  const k = active < 0 ? 0 : prog(since[a], 0, 1.4);
  const px = lerp(fromStep.x + 130, target.x + 130, k);
  const py = lerp(560 - fromStep.h - 62, 560 - target.h - 62, k) - Math.sin(k * Math.PI) * 30;
  return (
    <g>
      <Sky />
      <Cloud x={840} y={110} s={0.7} opacity={0.65} />
      <Cloud x={240} y={90} s={0.5} opacity={0.5} />
      <rect x={0} y={560} width={1040} height={80} fill="#cfe6d2" />
      {steps.map((s, i) => {
        const grow = since[i] > 0 ? prog(since[i], 0, 0.9) : 0;
        const h = s.h * grow;
        return (
          <g key={s.label}>
            <rect x={s.x} y={560 - h} width={260} height={h} rx={14} fill={s.color} opacity={0.95} />
            {grow > 0.85 && (
              <g opacity={fade(since[i], 0.8, 0.4)}>
                <Txt x={s.x + 130} y={560 - s.h + 62} size={52} fill="#fff" weight={800}>
                  {s.label}
                </Txt>
                <Txt x={s.x + 130} y={560 - s.h + 104} size={22} fill="#fff" font="j" weight={600}>
                  {s.cap}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      {since[2] > 1 && <Label x={820} y={560 - 390 - 130} w={340} text="mind. 18 Jahre und ein BZF" fill={C.amber} size={22} opacity={fade(since[2], 1, 0.5)} />}
      <PlaneSide x={px} y={py} s={0.9} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Places and services (1.2). Steps: CTR, FIR, AIS, SAR, ATIS - each element appears on its cue.
// ---------------------------------------------------------------------------------------------------------
export const places: DiagramFn = ({ since, frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);
  const ax = 330;
  const ay = 330;
  const wave = (x: number, y: number, color: string, dir = 1) =>
    [0, 1, 2].map((i) => <path key={i} d={arcPath(x, y, 22 + i * 16, 60 * dir, 120 * dir)} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.35 + 0.65 * ((frame / 10 + i) % 3 < 1 ? 1 : 0.4)} />);
  return (
    <g>
      <Sky fill="#eef6ee" />
      {/* FIR: the big region */}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.6)}>
          <rect x={26} y={26} width={988} height={588} rx={44} fill="rgba(140,110,240,0.07)" stroke="#8b6cf0" strokeWidth={5} strokeDasharray="18 12" />
          <Label x={230} y={52} w={330} text="FIR: Fluginformationsgebiet" fill="#8b6cf0" size={22} />
        </g>
      )}
      {/* aerodrome */}
      <rect x={ax - 120} y={ay + 60} width={240} height={26} rx={6} fill={C.runway} />
      <line x1={ax - 100} y1={ay + 73} x2={ax + 100} y2={ay + 73} stroke="#fff" strokeWidth={3} strokeDasharray="18 14" />
      <Tower x={ax} y={ay - 6} s={0.8} />
      {/* CTR */}
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <circle cx={ax} cy={ay + 30} r={150 + pulse * 4} fill="rgba(47,155,234,0.10)" stroke={C.deep} strokeWidth={6} />
          <Label x={ax} y={ay - 150} w={200} text="CTR: Kontrollzone" fill={C.deep} size={22} />
        </g>
      )}
      {/* AIS */}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)} transform="translate(790 170)">
          <rect x={-70} y={-20} width={140} height={90} rx={14} fill="#fff" stroke={C.deep} strokeWidth={5} />
          <rect x={-50} y={0} width={70} height={10} rx={5} fill="#c9d6e4" />
          <rect x={-50} y={22} width={100} height={10} rx={5} fill="#c9d6e4" />
          <rect x={-50} y={44} width={54} height={10} rx={5} fill="#c9d6e4" />
          <Label x={0} y={-52} w={230} text="AIS: Flugberatung" fill={C.deep} size={22} />
        </g>
      )}
      {/* SAR */}
      {since[3] > 0 && (
        <g opacity={fade(since[3], 0, 0.5)} transform="translate(840 440)">
          <circle r={54} fill="#fff" stroke={C.red} strokeWidth={10} />
          <circle r={54} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray="28 56" strokeDashoffset={14} />
          <circle r={26} fill="#eef6ee" />
          <Label x={0} y={-92} w={290} text="SAR: Such und Rettung" fill={C.red} size={22} />
        </g>
      )}
      {/* ATIS */}
      {since[4] > 0 && (
        <g opacity={fade(since[4], 0, 0.5)} transform="translate(540 500)">
          <path d="M-30,-14 L-6,-14 L26,-40 L26,40 L-6,14 L-30,14 Z" fill={C.amber} />
          {wave(30, 0, C.amber)}
          <Label x={40} y={72} w={300} text="ATIS: Start und Landeinfos" fill={C.amber} size={22} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Operating hours on a 24 hour clock (1.2). Steps: H24, HJ (daylight), HN (night), HX (undefined)
// ---------------------------------------------------------------------------------------------------------
export const hours: DiagramFn = ({ since, active, frame }) => {
  const cx = 520;
  const cy = 320;
  const r = 215;
  const a = Math.max(active, 0);
  const t = since[a];
  // 24 h dial with noon at the top and midnight at the bottom: 06 h = left, 18 h = right
  const angle = (h: number) => (h - 12) * 15;
  const day: [number, number] = [angle(6), angle(18)];
  const night: [number, number] = [angle(18), angle(30)];
  const hand = angle((frame / 60) * 24);
  const code = ["H24", "HJ", "HN", "HX"][a];
  return (
    <g>
      <Sky />
      <circle cx={cx} cy={cy} r={r + 26} fill="#fff" stroke={C.line} strokeWidth={4} />
      {/* base ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dde8f3" strokeWidth={40} />
      {Array.from({ length: 24 }, (_, i) => {
        const [x0, y0] = polar(cx, cy, r + 26, angle(i));
        const [x1, y1] = polar(cx, cy, r + (i % 6 === 0 ? 4 : 14), angle(i));
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gray} strokeWidth={i % 6 === 0 ? 4 : 2} />;
      })}
      {[0, 6, 12, 18].map((h) => {
        const [x, y] = polar(cx, cy, r - 48, angle(h));
        return (
          <Txt key={h} x={x} y={y + 9} size={26} fill={C.gray}>
            {h}
          </Txt>
        );
      })}
      {/* highlighted ring */}
      {a === 0 && active >= 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.green} strokeWidth={40} opacity={fade(t, 0, 0.6)} />}
      {a === 1 && active >= 0 && <path d={arcPath(cx, cy, r, day[0], day[1])} fill="none" stroke={C.amber} strokeWidth={40} opacity={fade(t, 0, 0.6)} />}
      {a === 2 && active >= 0 && <path d={arcPath(cx, cy, r, night[0], night[1])} fill="none" stroke="#5b6bd6" strokeWidth={40} opacity={fade(t, 0, 0.6)} />}
      {a === 3 && active >= 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.gray} strokeWidth={40} strokeDasharray="14 22" opacity={fade(t, 0, 0.6)} />}
      {/* sun / moon / question mark */}
      {a === 1 && active >= 0 && (
        <g transform={`translate(${polar(cx, cy, r, 0)[0]} ${polar(cx, cy, r, 0)[1]})`} opacity={fade(t, 0.3, 0.5)}>
          <circle r={26} fill="#ffd54a" />
          {Array.from({ length: 8 }, (_, i) => {
            const [x0, y0] = polar(0, 0, 34, i * 45);
            const [x1, y1] = polar(0, 0, 46, i * 45);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffd54a" strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
      )}
      {a === 2 && active >= 0 && (
        <g transform={`translate(${polar(cx, cy, r, 180)[0]} ${polar(cx, cy, r, 180)[1]})`} opacity={fade(t, 0.3, 0.5)}>
          <circle r={26} fill="#eef1ff" />
          <circle cx={11} cy={-7} r={22} fill="#5b6bd6" />
        </g>
      )}
      {/* clock hand only in the ring, the centre stays clean for the text */}
      {active >= 0 && (
        <line x1={polar(cx, cy, r - 60, hand)[0]} y1={polar(cx, cy, r - 60, hand)[1]} x2={polar(cx, cy, r + 18, hand)[0]} y2={polar(cx, cy, r + 18, hand)[1]} stroke={C.text} strokeWidth={7} strokeLinecap="round" opacity={0.75} />
      )}
      <circle cx={cx} cy={cy} r={r - 62} fill="#fff" />
      {/* centre: code and meaning */}
      <Txt x={cx} y={cy + 6} size={78} fill={C.deep} weight={800}>
        {active >= 0 ? code : ""}
      </Txt>
      <Txt x={cx} y={cy + 56} size={24} fill={C.dim} font="j">
        {["Tag und Nacht", "Sonnenauf- bis untergang", "Sonnenunter- bis aufgang", "keine feste Zeit"][a]}
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The five units on one flight (1.3). Steps: height (ft), speed (kt), climb (ft/min), distance (NM), pressure (hPa)
// ---------------------------------------------------------------------------------------------------------
const FLIGHT: [number, number][] = [
  [110, 512],
  [240, 512],
  [560, 215],
  [740, 215],
  [930, 505],
  [990, 512],
];

export const unitsFlight: DiagramFn = ({ since, frame }) => {
  const period = 13;
  const cycle = ((frame / 30) % period) / period;
  const pos = along(FLIGHT, cycle);
  const tilt = (pos.heading - 90) * 0.5;
  const speedLines = since[1] > 0;
  const panel = (i: number) => fade(since[i], 0, 0.5);
  return (
    <g>
      <Sky />
      <Cloud x={520} y={110} s={0.6} opacity={0.6} />
      <rect x={0} y={520} width={1040} height={120} fill="#cfe6d2" />
      {/* airports */}
      <rect x={70} y={512} width={200} height={14} rx={4} fill={C.runway} />
      <rect x={860} y={512} width={150} height={14} rx={4} fill={C.runway} />
      <Tower x={300} y={480} s={0.5} />
      <Tower x={835} y={480} s={0.5} />
      {/* flight path */}
      <path d={FLIGHT.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ")} fill="none" stroke={C.line} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
      {/* 0 height */}
      {since[0] > 0 && (
        <g opacity={panel(0)}>
          <Dimension x1={650} y1={236} x2={650} y2={514} text="Höhe: Fuß (ft)" color={C.green} size={24} />
        </g>
      )}
      {/* 2 climb / descent */}
      {since[2] > 0 && (
        <g opacity={panel(2)}>
          <path d="M320,438 L450,318" stroke={C.amber} strokeWidth={9} strokeLinecap="round" markerEnd="url(#arrow-amber)" />
          <Label x={220} y={372} w={230} text="Steigen: ft/min" fill={C.amber} size={22} />
          <path d="M775,268 L860,398" stroke={C.red} strokeWidth={9} strokeLinecap="round" markerEnd="url(#arrow-red)" />
          <Label x={890} y={330} w={210} text="Sinken: ft/min" fill={C.red} size={22} />
        </g>
      )}
      {/* 3 distance */}
      {since[3] > 0 && (
        <g opacity={panel(3)}>
          <Dimension x1={190} y1={590} x2={930} y2={590} text="Entfernung: Seemeilen (NM)" color={C.deep} size={24} />
        </g>
      )}
      {/* 4 pressure */}
      {since[4] > 0 && (
        <g opacity={panel(4)} transform="translate(120 130)">
          <circle r={64} fill="#fff" stroke={C.deep} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => {
            const [x0, y0] = polar(0, 0, 50, -120 + i * 30);
            const [x1, y1] = polar(0, 0, 60, -120 + i * 30);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gray} strokeWidth={3} />;
          })}
          <line x1={0} y1={0} x2={polar(0, 0, 44, -20 + Math.sin(frame / 20) * 10)[0]} y2={polar(0, 0, 44, -20 + Math.sin(frame / 20) * 10)[1]} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
          <circle r={7} fill={C.text} />
          <Label x={0} y={104} w={230} text="Luftdruck: hPa" fill={C.deep} size={22} />
        </g>
      )}
      {/* aircraft with its speed */}
      <g transform={`translate(${pos.x} ${pos.y}) rotate(${tilt})`}>
        {speedLines &&
          [-22, 0, 22].map((dy, i) => (
            <line key={i} x1={-120 - ((frame * 4 + i * 30) % 60)} y1={dy} x2={-70 - ((frame * 4 + i * 30) % 60)} y2={dy} stroke={C.deep} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
          ))}
        <PlaneSide x={0} y={0} s={0.9} />
      </g>
      {since[1] > 0 && (
        <g opacity={panel(1)}>
          <Label x={520} y={110} w={280} text="Tempo: Knoten (kt)" fill={C.deep} size={22} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Airspace cross-section (1.4). params.mode:
//   house  (intro) floors appear one after the other; steps = C, D, E, G
//   layers  steps = C above FL 100, E down to its base, G below
//   rules   steps = C, D, E, G with the rule for VFR pilots (clearance + radio, or free)
//   ctr     steps = control zone, class D, special VFR
// ---------------------------------------------------------------------------------------------------------
const GROUND = 560;
const yOf = (ft: number) => GROUND - ft * 0.03;
const FL100 = yOf(10000);
const BASE_LEFT = yOf(2500);
const BASE_MID = yOf(1700);
const BASE_RIGHT = yOf(1000);
const CLASS_COLOR = { C: "#7c5cf0", D: "#2f9bea", E: "#0f9f6e", G: "#a3b3c2" };

// Zoomed view of a control zone: a cylinder from the ground up around the aerodrome (1.4, mode "ctr").
function ctrView({ since, frame }: { since: number[]; frame: number }) {
  const cx = 470;
  const top = 190;
  const gy = 540;
  const w = 460;
  const pulse = 1 + 0.02 * Math.sin(frame / 8);
  return (
    <g>
      <Sky />
      <Cloud x={160} y={110} s={0.6} opacity={0.6} />
      <Cloud x={880} y={140} s={0.5} opacity={0.5} />
      <rect x={0} y={gy} width={1040} height={100} fill="#cfe6d2" />
      <rect x={cx - 190} y={gy - 4} width={380} height={14} rx={4} fill={C.runway} />
      <line x1={cx - 170} y1={gy + 3} x2={cx + 170} y2={gy + 3} stroke="#fff" strokeWidth={3} strokeDasharray="20 14" />
      <Tower x={cx + 250} y={gy - 74} s={0.75} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.6)}>
          <rect x={cx - w / 2} y={top} width={w} height={gy - top} rx={40} fill={CLASS_COLOR.D} opacity={0.22 * pulse} stroke={C.deep} strokeWidth={7} strokeDasharray="none" />
          <Label x={cx} y={top - 34} w={330} text="CTR: Kontrollzone" fill={C.deep} size={26} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <Txt x={cx} y={top + 118} size={150} fill={CLASS_COLOR.D} weight={800}>
            D
          </Txt>
          <Label x={cx} y={top + 168} w={380} text="alle CTR in Deutschland" fill={CLASS_COLOR.D} size={24} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <Cloud x={cx - 120} y={top + 250} s={0.8} fill="#c4cfda" />
          <PlaneSide x={cx - 250 + prog(since[2], 0.2, 4) * 330} y={gy - 120} s={0.6} fill={C.amber} />
          <Label x={cx - 60} y={gy - 60} w={330} text="SVFR: Sonderflug" fill={C.amber} size={24} />
        </g>
      )}
    </g>
  );
}

export const airspace: DiagramFn = ({ since, active, frame, params }) => {
  const mode = String(params.mode ?? "layers");
  const t = frame / 30;
  const house = mode === "house";
  if (mode === "ctr") return ctrView({ since, frame });
  // house mode: the floors build up from the ground, independent of the cues
  const reveal = { G: house ? fade(t, 1.0, 0.8) : 1, E: house ? fade(t, 3.0, 0.8) : 1, C: house ? fade(t, 5.0, 0.8) : 1, D: house ? fade(t, 7.0, 0.8) : 1 };
  const hl = (cls: "C" | "D" | "E" | "G") => {
    if (mode === "house" || mode === "rules") return active === ["C", "D", "E", "G"].indexOf(cls);
    if (mode === "layers") return active === ["C", "E", "G"].indexOf(cls);
    return false;
  };
  const glow = (cls: "C" | "D" | "E" | "G") => (hl(cls) ? 0.5 + 0.12 * Math.sin(frame / 6) : 0.22);
  const ctrX = 760;
  const ctrW = 230;
  const ctrTop = yOf(2500);
  return (
    <g>
      <Sky />
      {/* C */}
      <g opacity={reveal.C}>
        <rect x={0} y={40} width={1040} height={FL100 - 40} fill={CLASS_COLOR.C} opacity={glow("C")} />
        <line x1={0} y1={FL100} x2={1040} y2={FL100} stroke={C.deep} strokeWidth={4} strokeDasharray="14 10" />
        <Txt x={44} y={FL100 - 16} size={26} fill={C.deep} anchor="start">
          FL 100
        </Txt>
      </g>
      {/* E: from its base up to FL 100; the base steps down over the terrain (1000 / 1700 / 2500 ft AGL) */}
      <g opacity={reveal.E}>
        <path d={`M0,${FL100} L1040,${FL100} L1040,${BASE_RIGHT} L640,${BASE_RIGHT} L640,${BASE_MID} L340,${BASE_MID} L340,${BASE_LEFT} L0,${BASE_LEFT} Z`} fill={CLASS_COLOR.E} opacity={glow("E")} />
        <path d={`M0,${BASE_LEFT} L340,${BASE_LEFT} L340,${BASE_MID} L640,${BASE_MID} L640,${BASE_RIGHT} L1040,${BASE_RIGHT}`} fill="none" stroke={CLASS_COLOR.E} strokeWidth={4} strokeDasharray="10 8" />
      </g>
      {/* G below */}
      <g opacity={reveal.G}>
        <path d={`M0,${GROUND} L1040,${GROUND} L1040,${BASE_RIGHT} L640,${BASE_RIGHT} L640,${BASE_MID} L340,${BASE_MID} L340,${BASE_LEFT} L0,${BASE_LEFT} Z`} fill={CLASS_COLOR.G} opacity={glow("G") + 0.06} />
      </g>
      {/* ground and aerodrome */}
      <path d={`M0,${GROUND} L1040,${GROUND} L1040,640 L0,640 Z`} fill="#b8d1bb" />
      <rect x={ctrX - 90} y={GROUND - 5} width={180} height={10} rx={3} fill={C.runway} />
      <Tower x={ctrX + 120} y={GROUND - 60} s={0.55} />
      {/* D: the control zone as a cylinder around the aerodrome */}
      {reveal.D > 0 && (
        <g opacity={reveal.D}>
          <rect x={ctrX - ctrW / 2} y={ctrTop} width={ctrW} height={GROUND - ctrTop} rx={26} fill={CLASS_COLOR.D} opacity={glow("D") + 0.12} stroke={C.deep} strokeWidth={5} />
          <Txt x={ctrX} y={ctrTop + 60} size={44} fill="#fff" weight={800}>
            D
          </Txt>
        </g>
      )}
      {/* class letters */}
      {(
        <g>
          <Txt x={190} y={(40 + FL100) / 2 + 30} size={120} fill="#fff" weight={800} opacity={0.9 * reveal.C}>
            C
          </Txt>
          <Txt x={190} y={(FL100 + BASE_LEFT) / 2 + 40} size={120} fill="#fff" weight={800} opacity={0.9 * reveal.E}>
            E
          </Txt>
          <Txt x={170} y={(BASE_LEFT + GROUND) / 2 + 28} size={80} fill="#fff" weight={800} opacity={0.9 * reveal.G}>
            G
          </Txt>
        </g>
      )}
      {/* layers mode annotations */}
      {mode === "layers" && (
        <g>
          {since[0] > 0 && <Label x={640} y={FL100 - 46} w={300} text="oberhalb FL 100" fill={CLASS_COLOR.C} size={24} opacity={fade(since[0], 0, 0.5)} />}
          {since[1] > 0 && (
            <g opacity={fade(since[1], 0, 0.5)}>
              <Label x={600} y={FL100 + 60} w={330} text="E: bis FL 100" fill={CLASS_COLOR.E} size={24} />
              <Label x={170} y={BASE_LEFT - 22} w={190} text="2500 ft AGL" fill={CLASS_COLOR.E} size={20} />
              <Label x={490} y={BASE_MID - 22} w={190} text="1700 ft AGL" fill={CLASS_COLOR.E} size={20} />
              <Label x={960} y={BASE_RIGHT - 22} w={150} text="1000 ft" fill={CLASS_COLOR.E} size={20} />
            </g>
          )}
          {since[2] > 0 && <Label x={480} y={GROUND - 26} w={300} text="G: darunter" fill="#5d7387" size={24} opacity={fade(since[2], 0, 0.5)} />}
        </g>
      )}
      {/* rules mode: what a VFR pilot must do */}
      {mode === "rules" && active >= 0 && (() => {
        const cls = (["C", "D", "E", "G"] as const)[active];
        const needs = cls === "C" || cls === "D";
        const cx = cls === "D" ? ctrX : 640;
        const cy = cls === "C" ? 150 : cls === "D" ? ctrTop - 90 : cls === "E" ? (FL100 + BASE_LEFT) / 2 : GROUND - 90;
        const o = fade(since[active], 0.1, 0.4);
        return (
          <g opacity={o}>
            <Label x={cx} y={cy - 34} w={300} text={needs ? "Freigabe: erforderlich" : "Freigabe: nicht nötig"} fill={needs ? C.red : C.green} size={22} />
            <Label x={cx} y={cy + 14} w={300} text={needs ? "Funk: dauernd" : "Funk: nicht nötig"} fill={needs ? C.red : C.green} size={22} />
          </g>
        );
      })()}
      {/* a passing aircraft for life */}
      <PlaneSide x={((frame * 1.6) % 1300) - 130} y={FL100 - 170} s={0.55} opacity={0.55} />
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Special areas (1.4), seen from above. Steps: RMZ (radio), TMZ (transponder), ED-R (restricted), ED-D (danger)
// ---------------------------------------------------------------------------------------------------------
export const zones: DiagramFn = ({ since, frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);
  const hatch = (id: string, color: string) => (
    <pattern id={id} width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1={0} y1={0} x2={0} y2={22} stroke={color} strokeWidth={8} opacity={0.5} />
    </pattern>
  );
  const at = (i: number) => fade(since[i], 0, 0.5);
  return (
    <g>
      <Sky fill="#eef6ee" />
      <defs>
        {hatch("hatch-red", C.red)}
        {hatch("hatch-amber", "#e0a100")}
      </defs>
      {/* RMZ: radio */}
      {since[0] > 0 && (
        <g opacity={at(0)} transform="translate(270 175)">
          <circle r={112 + pulse * 4} fill="rgba(47,155,234,0.12)" stroke={C.deep} strokeWidth={6} strokeDasharray="18 12" />
          <g transform="translate(0 -6)">
            <rect x={-22} y={-52} width={44} height={70} rx={22} fill={C.deep} />
            <path d="M-40,-6 A40,40 0 0 0 40,-6 M0,34 L0,58 M-22,58 L22,58" fill="none" stroke={C.deep} strokeWidth={8} strokeLinecap="round" />
          </g>
          <Label x={0} y={146} w={230} text="RMZ: Funkpflicht" fill={C.deep} size={22} />
        </g>
      )}
      {/* TMZ: transponder */}
      {since[1] > 0 && (
        <g opacity={at(1)} transform="translate(770 175)">
          <circle r={112 + pulse * 4} fill="rgba(124,92,240,0.12)" stroke="#7c5cf0" strokeWidth={6} strokeDasharray="18 12" />
          <rect x={-56} y={-42} width={112} height={72} rx={12} fill="#1c2b3a" />
          <Txt x={0} y={4} size={30} fill="#7fe3ff" font="j" weight={600}>
            7000
          </Txt>
          <rect x={-56} y={-42} width={112} height={72} rx={12} fill="none" stroke="#7c5cf0" strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={arcPath(0, 34, 30 + i * 22, -50, 50)} fill="none" stroke="#7c5cf0" strokeWidth={5} strokeLinecap="round" opacity={0.3 + 0.7 * ((frame / 9 + i) % 3 < 1 ? 1 : 0.3)} />
          ))}
          <Label x={0} y={146} w={280} text="TMZ: Transponderpflicht" fill="#7c5cf0" size={22} />
        </g>
      )}
      {/* ED-R: restricted */}
      {since[2] > 0 && (
        <g opacity={at(2)} transform="translate(270 465)">
          <path d="M-130,-60 L120,-80 L150,30 L-90,78 Z" fill="url(#hatch-red)" stroke={C.red} strokeWidth={7} strokeLinejoin="round" />
          <circle r={44} fill="#fff" stroke={C.red} strokeWidth={9} />
          <line x1={-30} y1={30} x2={30} y2={-30} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
          <Label x={10} y={128} w={330} text="ED-R: Flugbeschränkung" fill={C.red} size={22} />
        </g>
      )}
      {/* ED-D: danger */}
      {since[3] > 0 && (
        <g opacity={at(3)} transform="translate(770 465)">
          <path d="M-140,-52 L110,-80 L145,40 L-100,74 Z" fill="url(#hatch-amber)" stroke="#e0a100" strokeWidth={7} strokeLinejoin="round" />
          <polygon points="0,-50 46,32 -46,32" fill="#fff" stroke="#e0a100" strokeWidth={9} strokeLinejoin="round" />
          <Txt x={0} y={20} size={40} fill="#e0a100" weight={800}>
            !
          </Txt>
          <Label x={0} y={128} w={300} text="ED-D: Gefahrengebiet" fill="#c98a00" size={22} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The three FIR of Germany (1.4), simplified map. Steps: Bremen, Langen, München.
// ---------------------------------------------------------------------------------------------------------
const GERMANY: [number, number][] = [
  [8.3, 55.0], [9.4, 54.8], [10.9, 54.4], [12.1, 54.2], [13.6, 54.5], [14.3, 53.9], [14.4, 53.2], [14.7, 51.8], [15.0, 51.0], [14.3, 50.9], [12.5, 50.3], [12.2, 50.3],
  [12.8, 49.3], [13.8, 48.6], [13.0, 47.6], [10.9, 47.4], [10.2, 47.3], [9.6, 47.5], [9.2, 47.7], [7.6, 47.6], [8.2, 49.0], [6.4, 49.5], [6.4, 49.8], [6.0, 50.8],
  [6.0, 51.8], [7.0, 52.5], [7.2, 53.4], [8.7, 53.9], [8.6, 54.9],
];
const geo = (lon: number, lat: number): [number, number] => [300 + (lon - 5.8) * 46, 30 + (55.1 - lat) * 72];

export const firMap: DiagramFn = ({ since, frame }) => {
  const outline = GERMANY.map((q, i) => `${i ? "L" : "M"}${geo(q[0], q[1]).join(",")}`).join(" ") + " Z";
  const north = 52.1;
  const south = 49.6;
  const bandY = (lat: number) => geo(0, lat)[1];
  const regions = [
    { name: "Bremen", color: "#2f9bea", y0: 0, y1: bandY(north), city: geo(8.8, 53.1) },
    { name: "Langen", color: "#0f9f6e", y0: bandY(north), y1: bandY(south), city: geo(8.7, 50.0) },
    { name: "München", color: "#f59e0b", y0: bandY(south), y1: 640, city: geo(11.6, 48.1) },
  ];
  const pulse = 1 + 0.15 * Math.sin(frame / 6);
  return (
    <g>
      <Sky />
      <defs>
        <clipPath id="de-clip">
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill="#fff" stroke={C.gray} strokeWidth={4} />
      <g clipPath="url(#de-clip)">
        {regions.map((r, i) => (
          <rect key={r.name} x={200} y={r.y0} width={640} height={r.y1 - r.y0} fill={r.color} opacity={since[i] > 0 ? 0.42 * fade(since[i], 0, 0.6) : 0} />
        ))}
      </g>
      <path d={outline} fill="none" stroke={C.deep} strokeWidth={5} strokeLinejoin="round" />
      <line x1={300} y1={bandY(north)} x2={740} y2={bandY(north)} stroke={C.deep} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      <line x1={300} y1={bandY(south)} x2={740} y2={bandY(south)} stroke={C.deep} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      {regions.map((r, i) =>
        since[i] > 0 ? (
          <g key={r.name} opacity={fade(since[i], 0.2, 0.5)}>
            <circle cx={r.city[0]} cy={r.city[1]} r={11 * pulse} fill={r.color} stroke="#fff" strokeWidth={4} />
            <Label x={i === 1 ? r.city[0] + 190 : r.city[0] + (i === 0 ? 170 : 175)} y={r.city[1] - (i === 2 ? 10 : 0)} w={220} text={r.name} fill={r.color} size={26} />
          </g>
        ) : null,
      )}
      <Txt x={880} y={610} size={18} fill={C.gray} anchor="end" font="j">
        vereinfachte Darstellung
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// "Mit wem sprichst du?" (1.5 intro): an aircraft calls into the air, several ground stations could answer.
// One step: the question.
// ---------------------------------------------------------------------------------------------------------
function Hut({ x, y, s = 1, color = C.deep }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-44} y={-6} width={88} height={56} rx={6} fill="#fff" stroke={color} strokeWidth={6} />
      <polygon points="-56,-6 0,-44 56,-6" fill={color} />
      <rect x={-10} y={18} width={20} height={32} fill={color} opacity={0.5} />
      <line x1={60} y1={-6} x2={60} y2={-70} stroke={color} strokeWidth={5} />
      <circle cx={60} cy={-74} r={6} fill={color} />
    </g>
  );
}

export const contacts: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const stations = [
    { x: 800, y: 140, label: "Turm", body: <Tower x={800} y={150} s={0.6} /> },
    { x: 880, y: 330, label: "Information", body: <Hut x={880} y={350} s={0.8} color={C.green} /> },
    { x: 760, y: 520, label: "Radio", body: <Hut x={760} y={540} s={0.8} color={C.amber} /> },
  ];
  const q = fade(since[0], 0, 0.5);
  return (
    <g>
      <Sky />
      <Cloud x={220} y={110} s={0.6} opacity={0.6} />
      <rect x={0} y={590} width={1040} height={50} fill="#cfe6d2" />
      <Plane x={210} y={330 + Math.sin(t * 2) * 8} rot={90} s={1.2} />
      {/* waves leaving the aircraft */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={arcPath(230, 330, 70 + ((frame / 2 + i * 35) % 105), 55, 125)} fill="none" stroke={C.sky} strokeWidth={6} strokeLinecap="round" opacity={0.7 - ((frame / 2 + i * 35) % 105) / 160} />
      ))}
      {stations.map((st, i) => {
        const o = fade(t, 0.6 + i * 0.5, 0.6);
        return (
          <g key={st.label} opacity={o}>
            {st.body}
            <Label x={st.x} y={st.y + (i === 0 ? 92 : i === 1 ? 78 : 78)} w={190} text={st.label} fill={i === 0 ? C.deep : i === 1 ? C.green : C.amber} size={22} />
          </g>
        );
      })}
      <g opacity={q}>
        <circle cx={480} cy={250} r={56 + Math.sin(t * 5) * 3} fill="#fff" stroke={C.amber} strokeWidth={6} />
        <Txt x={480} y={282} size={86} fill={C.amber} weight={800}>
          ?
        </Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Information is not the tower (1.5). Steps: information (weather yes, clearance never), tower (clearance)
// ---------------------------------------------------------------------------------------------------------
export const infoVsTower: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const pop = (i: number) => fade(since[i], 0, 0.5);
  return (
    <g>
      <Sky />
      <rect x={0} y={590} width={1040} height={50} fill="#cfe6d2" />
      <line x1={520} y1={60} x2={520} y2={580} stroke={C.line} strokeWidth={4} strokeDasharray="6 14" />
      <Plane x={520} y={470} rot={0} s={0.9} />
      {/* information */}
      <g>
        <Hut x={230} y={250} s={1.2} color={C.green} />
        <Label x={230} y={350} w={220} text="Information" fill={C.green} size={26} />
        {since[0] > 0 && (
          <g opacity={pop(0)}>
            <Bubble x={230} y={120} text="Flugplatzwetter" stroke={C.green} tail="down" size={26} />
            <g transform="translate(230 440)">
              <Bubble x={0} y={0} text="Landefreigabe?" stroke={C.red} tail="none" size={24} />
              <g transform="translate(0 66)" opacity={fade(since[0], 1.2, 0.5)}>
                <circle r={34} fill={C.red} />
                <line x1={-14} y1={-14} x2={14} y2={14} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
                <line x1={14} y1={-14} x2={-14} y2={14} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
              </g>
            </g>
            <g transform="translate(420 120)" opacity={fade(since[0], 0.4, 0.4)}>
              <circle r={26} fill={C.green} />
              <path d="M-12,2 l8,10 l16,-20" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}
      </g>
      {/* tower */}
      <g>
        <Tower x={810} y={210} s={1.2} />
        <Label x={810} y={350} w={220} text="Turm" fill={C.deep} size={26} />
        {since[1] > 0 && (
          <g opacity={pop(1)}>
            <Bubble x={810} y={90} text="Landung frei" stroke={C.deep} tail="down" size={26} />
            <g transform="translate(985 90)">
              <circle r={26} fill={C.green} />
              <path d="M-12,2 l8,10 l16,-20" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <Label x={810} y={430} w={300} text="erteilt Freigaben" fill={C.green} size={24} />
          </g>
        )}
      </g>
      {/* radio link pulses */}
      {[0, 1].map((k) => {
        const x = k === 0 ? 300 : 740;
        const on = since[k] > 0;
        return on ? <path key={k} d={arcPath(520, 470, 60 + ((frame / 2) % 60), k === 0 ? 290 : 70, k === 0 ? 340 : 120)} fill="none" stroke={k === 0 ? C.green : C.deep} strokeWidth={5} strokeLinecap="round" opacity={0.6} /> : <g key={k} data-x={x} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Flight preparation (1.5). Steps: preparation for everyone (checklist), weather briefing beyond the local area
// ---------------------------------------------------------------------------------------------------------
export const preflight: DiagramFn = ({ since, active }) => {
  const a = Math.max(active, 0);
  const t = since[a];
  const items = ["Flugweg planen", "Wetter prüfen", "Luftfahrzeug prüfen", "Beladung und Treibstoff"];
  return (
    <g>
      <Sky />
      {a === 0 && (
        <g opacity={fade(t, 0, 0.4)}>
          <rect x={250} y={60} width={540} height={520} rx={30} fill="#fff" stroke={C.line} strokeWidth={3} />
          <Label x={520} y={66} w={280} text="Flugvorbereitung" fill={C.deep} size={24} />
          {items.map((label, i) => {
            const on = t > 1.0 + i * 1.1;
            return (
              <g key={label}>
                <rect x={300} y={140 + i * 110} width={54} height={54} rx={12} fill={on ? C.green : "#eef3f8"} stroke={on ? C.green : C.gray} strokeWidth={4} />
                {on && <path d={`M312,${168 + i * 110} l12,14 l20,-26`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
                <Txt x={382} y={178 + i * 110} size={30} anchor="start" fill={on ? C.text : C.gray}>
                  {label}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {a === 1 && (
        <g opacity={fade(t, 0, 0.4)}>
          <rect x={0} y={560} width={1040} height={80} fill="#cfe6d2" />
          <circle cx={230} cy={420} r={130} fill="rgba(47,155,234,0.10)" stroke={C.deep} strokeWidth={5} strokeDasharray="14 10" />
          <Txt x={230} y={604} size={22} fill={C.dim}>
            Umgebung des Startplatzes
          </Txt>
          <Tower x={230} y={410} s={0.55} />
          {/* route that leaves the local area */}
          <path d="M230,420 C400,300 560,300 800,200" fill="none" stroke={C.deep} strokeWidth={7} strokeDasharray="4 16" strokeLinecap="round" />
          <Plane x={230 + prog(t, 0.5, 3.5) * 570} y={420 - prog(t, 0.5, 3.5) * 220} rot={62} s={0.8} />
          <g opacity={fade(t, 1.2, 0.6)}>
            <Cloud x={640} y={150} s={0.85} fill="#c9d6e4" />
            <path d="M610,200 l-16,40 h26 l-14,42" fill="none" stroke={C.amber} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            <Label x={640} y={330} w={340} text="Wetterberatung einholen" fill={C.amber} size={24} />
          </g>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The aviation VHF band (1.6). Steps: lower end 117.975, upper end 137.000, emergency frequency 121.500
// ---------------------------------------------------------------------------------------------------------
export const bandScale: DiagramFn = ({ since, frame }) => {
  const x0 = 110;
  const x1 = 930;
  const fx = (mhz: number) => x0 + ((mhz - 117.975) / (137.0 - 117.975)) * (x1 - x0);
  const y = 330;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <g>
      <Sky />
      <rect x={x0 - 30} y={y - 46} width={x1 - x0 + 60} height={92} rx={22} fill="#fff" stroke={C.line} strokeWidth={3} />
      <rect x={x0} y={y - 16} width={x1 - x0} height={32} rx={16} fill="#dfeaf5" />
      {Array.from({ length: 20 }, (_, i) => {
        const mhz = 118 + i;
        const long = mhz % 5 === 3 || mhz === 118 || mhz === 137;
        return <line key={i} x1={fx(mhz)} y1={y - 16} x2={fx(mhz)} y2={y - (long ? 34 : 24)} stroke={C.gray} strokeWidth={long ? 4 : 2} />;
      })}
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <line x1={x0} y1={y - 46} x2={x0} y2={y - 170} stroke={C.deep} strokeWidth={6} />
          <Label x={x0 + 90} y={y - 190} w={290} text="117,975 MHz" fill={C.deep} size={30} />
          <Txt x={x0 + 14} y={y - 132} size={22} fill={C.dim} font="j" anchor="start">
            unteres Ende
          </Txt>
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <line x1={x1} y1={y - 46} x2={x1} y2={y - 170} stroke={C.deep} strokeWidth={6} />
          <Label x={x1 - 90} y={y - 190} w={290} text="137,000 MHz" fill={C.deep} size={30} />
          <Txt x={x1 - 14} y={y - 132} size={22} fill={C.dim} font="j" anchor="end">
            oberes Ende
          </Txt>
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <circle cx={fx(121.5)} cy={y} r={30 + pulse * 12} fill="none" stroke={C.red} strokeWidth={6} opacity={0.6 - pulse * 0.3} />
          <circle cx={fx(121.5)} cy={y} r={16} fill={C.red} />
          <line x1={fx(121.5)} y1={y + 46} x2={fx(121.5)} y2={y + 150} stroke={C.red} strokeWidth={6} />
          <Label x={fx(121.5) + 150} y={y + 176} w={340} text="121,500 MHz: NOTFREQUENZ" fill={C.red} size={28} />
        </g>
      )}
      <Txt x={520} y={y + 260} size={24} fill={C.dim} font="j">
        Kanäle im Abstand von 25 kHz oder 8,33 kHz
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Push-to-talk (1.6). Step 0: press = send, release = listen (alternating). Step 1: the key is stuck, the frequency is blocked.
// ---------------------------------------------------------------------------------------------------------
export const ptt: DiagramFn = ({ since, active, frame }) => {
  const a = Math.max(active, 0);
  const t = since[a];
  const cycle = 4;
  const sending = a === 1 ? true : ((t + 0.4) % cycle) < cycle / 2;
  const stuck = a === 1;
  const cx = 300;
  const btnDown = sending ? 8 : 0;
  // out = waves leave the microphone (sending), in = waves arrive at it (listening)
  const wave = (dir: "out" | "in", color: string) =>
    [0, 1, 2].map((i) => {
      const ph = ((frame / 1.6 + i * 24) % 72) / 72;
      const k = dir === "out" ? ph : 1 - ph;
      return <path key={i} d={arcPath(cx + 20, 300, 100 + k * 190, 50, 130)} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" opacity={dir === "out" ? 0.85 - ph * 0.8 : 0.1 + ph * 0.75} />;
    });
  return (
    <g>
      <Sky />
      {/* the handheld microphone with its key */}
      <g transform={`translate(${cx} 300)`}>
        <rect x={-70} y={-170} width={140} height={340} rx={56} fill="#2b3a4b" />
        <rect x={-48} y={-150} width={96} height={80} rx={26} fill="#3b4c60" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-26} y1={-136 + i * 16} x2={26} y2={-136 + i * 16} stroke="#7a8da3" strokeWidth={4} strokeLinecap="round" />
        ))}
        <rect x={-46} y={-40} width={92} height={112} rx={28} fill="#1f2c3a" />
        <circle cx={0} cy={16 + btnDown} r={34} fill={sending ? C.red : "#c9d6e4"} stroke={stuck ? C.red : "#fff"} strokeWidth={6} />
        {sending && <circle cx={0} cy={16 + btnDown} r={46 + Math.sin(frame / 4) * 3} fill="none" stroke={C.red} strokeWidth={4} opacity={0.5} />}
      </g>
      {/* send: waves leave; receive: waves arrive */}
      {a === 0 && (sending ? wave("out", C.red) : wave("in", C.green))}
      {a === 0 && (
        <g>
          <Label x={cx} y={90} w={330} text={sending ? "gedrückt: SENDEN" : "losgelassen: HÖREN"} fill={sending ? C.red : C.green} size={28} />
          <Txt x={770} y={190} size={26} fill={C.dim} font="j">
            Wechselsprechen:
          </Txt>
          <Txt x={770} y={228} size={26} fill={C.dim} font="j">
            senden oder hören,
          </Txt>
          <Txt x={770} y={266} size={26} fill={C.dim} font="j">
            nie beides
          </Txt>
        </g>
      )}
      {a === 0 && <Plane x={800} y={440} rot={270} s={1.1} opacity={sending ? 0.35 : 1} />}
      {/* stuck key: everybody else is blocked */}
      {a === 1 && (
        <g opacity={fade(t, 0, 0.5)}>
          <Label x={cx} y={90} w={330} text="Taste klemmt!" fill={C.red} size={28} />
          {wave("out", C.red)}
          {[0, 1, 2].map((i) => {
            const x = 640 + i * 130;
            const y = 250 + (i % 2) * 130;
            return (
              <g key={i}>
                <Plane x={x} y={y} rot={270} s={0.65} fill={C.gray} />
                <g transform={`translate(${x + 44} ${y - 34})`}>
                  <circle r={22} fill="#fff" stroke={C.red} strokeWidth={5} />
                  <path d="M-8,-6 h6 l8,-7 v26 l-8,-7 h-6 z" fill={C.red} />
                  <line x1={-16} y1={14} x2={16} y2={-14} stroke={C.red} strokeWidth={5} strokeLinecap="round" />
                </g>
              </g>
            );
          })}
          <Label x={790} y={520} w={380} text="Frequenz blockiert" fill={C.red} size={28} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The holding point (1.2). One step: the aircraft rolls up and stops at the double line.
// ---------------------------------------------------------------------------------------------------------
export const holding: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const pts: [number, number][] = [[200, 560], [200, 400], [560, 400], [560, 262]];
  const k = prog(t, 0.5, 4.5);
  const p = along(pts, k);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <g>
      <Sky fill="#eef6ee" />
      <rect x={90} y={120} width={860} height={70} rx={8} fill={C.runway} />
      <line x1={140} y1={155} x2={900} y2={155} stroke="#fff" strokeWidth={5} strokeDasharray="32 24" />
      <Txt x={520} y={100} size={24} fill={C.dim}>
        Piste
      </Txt>
      <path d={pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ")} fill="none" stroke="#c5ccd4" strokeWidth={44} strokeLinejoin="round" strokeLinecap="round" />
      <path d={pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ")} fill="none" stroke="#f5c542" strokeWidth={3} strokeDasharray="14 12" strokeLinejoin="round" />
      {/* holding position markings */}
      <line x1={532} y1={228} x2={588} y2={228} stroke="#f5c542" strokeWidth={8} />
      <line x1={532} y1={244} x2={588} y2={244} stroke="#f5c542" strokeWidth={8} strokeDasharray="12 9" />
      <Tower x={860} y={330} s={0.85} />
      <Plane x={p.x} y={p.y} rot={p.heading} s={0.85} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <circle cx={560} cy={236} r={56 + pulse * 10} fill="none" stroke="#f5c542" strokeWidth={6} opacity={0.75 - pulse * 0.3} />
          <Label x={370} y={236} w={240} text="Rollhalt" fill="#c98a00" size={30} />
          <Bubble x={780} y={230} text="Halt, bis der Turm freigibt" stroke="#3b4a5a" tail="none" size={24} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The weather as a code (1.7 intro). Steps: sky, visibility, wind - each fills in its part of the METAR line.
// ---------------------------------------------------------------------------------------------------------
function Windsock({ x, y, swing, s = 1 }: { x: number; y: number; swing: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={0} width={10} height={130} fill={C.text} />
      <g transform={`rotate(${swing} 0 0)`}>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${i * 40},${-18 + i * 3} L${i * 40 + 40},${-14 + i * 5} L${i * 40 + 40},${14 - i * 5} L${i * 40},${18 - i * 3} Z`} fill={i % 2 ? "#fff" : "#ff7a3d"} stroke={C.text} strokeWidth={2} />
        ))}
      </g>
    </g>
  );
}

export const skyCode: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const code = [
    { text: "24008KT", color: C.deep, idx: 2 },
    { text: "9999", color: C.green, idx: 1 },
    { text: "SCT040", color: "#7c5cf0", idx: 0 },
  ];
  return (
    <g>
      <Sky fill="#dcecfb" />
      <rect x={0} y={520} width={1040} height={120} fill="#cfe6d2" />
      <polygon points="560,520 720,330 880,520" fill="#9db5a2" />
      <polygon points="720,520 860,400 1000,520" fill="#b3c8b6" />
      {/* the code line, typed piece by piece */}
      <rect x={90} y={44} width={860} height={90} rx={24} fill="#1c2b3a" />
      {code.map((c, i) => {
        const x = 130 + i * 290;
        const on = since[c.idx] > 0;
        return (
          <g key={c.text}>
            <Txt x={x} y={104} size={46} anchor="start" fill={on ? c.color === C.deep ? "#7fe3ff" : c.color === C.green ? "#6ee7b7" : "#c4b5fd" : "#4a5c70"} weight={800}>
              {on ? c.text : c.text.replace(/./g, "·")}
            </Txt>
          </g>
        );
      })}
      {/* sky */}
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.6)}>
          <Cloud x={230 + Math.sin(t) * 12} y={250} s={1.0} fill="#fff" />
          <Cloud x={480 - Math.sin(t * 0.8) * 10} y={210} s={0.7} fill="#f2f7fc" />
          <Label x={300} y={340} w={300} text="Himmel: Wolken" fill="#7c5cf0" size={24} />
        </g>
      )}
      {/* visibility */}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.6)}>
          <g transform="translate(120 460)">
            <ellipse rx={38} ry={22} fill="#fff" stroke={C.text} strokeWidth={5} />
            <circle r={11} fill={C.deep} />
          </g>
          <line x1={170} y1={460} x2={700} y2={460} stroke={C.green} strokeWidth={6} strokeDasharray="14 12" markerEnd="url(#arrow-green)" />
          <Label x={430} y={422} w={300} text="Sicht: wie weit du siehst" fill={C.green} size={24} />
        </g>
      )}
      {/* wind */}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.6)}>
          <Windsock x={800} y={400} swing={Math.sin(t * 3) * 6} s={0.9} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${640 + ((frame * 3 + i * 60) % 180)},${300 + i * 26} h50`} stroke={C.deep} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
          ))}
          <Label x={820} y={340} w={230} text="Wind" fill={C.deep} size={24} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// CAVOK (1.7). Steps: CAVOK sun, visibility 10 km or more, no clouds below 5000 ft
// ---------------------------------------------------------------------------------------------------------
export const cavok: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const gy = 540;
  const cloudBase = 250;
  return (
    <g>
      <Sky fill="#cfe8fb" />
      <rect x={0} y={gy} width={1040} height={100} fill="#cfe6d2" />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.6)}>
          <g transform={`translate(860 120) rotate(${t * 12})`}>
            <circle r={52} fill="#ffd54a" />
            {Array.from({ length: 12 }, (_, i) => {
              const [x0, y0] = polar(0, 0, 70, i * 30);
              const [x1, y1] = polar(0, 0, 96, i * 30);
              return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffd54a" strokeWidth={9} strokeLinecap="round" />;
            })}
          </g>
          <Txt x={520} y={150} size={110} fill={C.deep} weight={800}>
            CAVOK
          </Txt>
        </g>
      )}
      {/* visibility */}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.6)}>
          <polygon points="800,540 900,420 1000,540" fill="#9db5a2" />
          <PlaneSide x={140 + prog(since[1], 0.2, 3) * 60} y={430} s={0.7} />
          <Dimension x1={230} y1={492} x2={800} y2={492} text="Sicht: 10 km oder mehr" color={C.green} size={26} />
        </g>
      )}
      {/* ceiling */}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.6)}>
          <line x1={40} y1={cloudBase} x2={1000} y2={cloudBase} stroke={C.amber} strokeWidth={5} strokeDasharray="16 10" />
          <Label x={840} y={cloudBase + 30} w={250} text="5000 ft über Grund" fill={C.amber} size={22} />
          <Cloud x={150} y={cloudBase - 40} s={0.55} fill="#fff" opacity={0.9} />
          <Cloud x={470} y={cloudBase - 34} s={0.5} fill="#fff" opacity={0.9} />
          <g transform={`translate(520 ${cloudBase + 90})`}>
            <circle r={34} fill="#fff" stroke={C.green} strokeWidth={6} />
            <path d="M-13,2 l9,11 l18,-24" fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <Label x={520} y={cloudBase + 150} w={330} text="darunter keine Wolken" fill={C.green} size={22} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// A complete METAR, piece by piece (1.7). Steps: aerodrome and time, wind, visibility, clouds, temperature, QNH, trend
// ---------------------------------------------------------------------------------------------------------
const METAR_TOKENS = ["EDDM", "201250Z", "24008KT", "9999", "SCT040", "18/09", "Q1015", "NOSIG"];
const METAR_MEANING = [
  "Flugplatz München und Uhrzeit",
  "Wind aus 240 Grad, 8 Knoten",
  "Sicht 10 km oder mehr",
  "3 bis 4 Achtel Wolken in 4000 ft",
  "Temperatur 18, Taupunkt 9 Grad",
  "QNH 1015 hPa",
  "keine wesentliche Änderung",
];
const METAR_COLORS = ["#6b8296", C.deep, C.green, "#7c5cf0", C.amber, C.red, C.gray];

export const metar: DiagramFn = ({ since, active, frame }) => {
  // token -> step: EDDM+201250Z share step 0
  const stepOf = [0, 0, 1, 2, 3, 4, 5, 6];
  const a = active;
  const tw = [200, 250, 250, 170, 220, 190, 190, 210];
  const rows = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ];
  const widthOf = (row: number[]) => row.reduce((n, i) => n + tw[i], 0) + (row.length - 1) * 16;
  const t = a >= 0 ? since[a] : 0;
  return (
    <g>
      <Sky />
      {rows.map((row, r) => {
        let x = (1040 - widthOf(row)) / 2;
        return (
          <g key={r}>
            {row.map((i) => {
              const step = stepOf[i];
              const lit = a >= 0 && step <= a;
              const cur = a === step;
              const color = METAR_COLORS[step];
              const bx = x;
              x += tw[i] + 16;
              return (
                <g key={i}>
                  <rect x={bx} y={70 + r * 130} width={tw[i]} height={96} rx={22} fill={cur ? color : lit ? "#fff" : "#eef3f8"} stroke={lit ? color : C.line} strokeWidth={cur ? 0 : 4} />
                  <Txt x={bx + tw[i] / 2} y={70 + r * 130 + 62} size={40} weight={800} fill={cur ? "#fff" : lit ? color : "#a9b7c6"}>
                    {METAR_TOKENS[i]}
                  </Txt>
                </g>
              );
            })}
          </g>
        );
      })}
      {/* meaning of the current piece */}
      {a >= 0 && (
        <g opacity={fade(t, 0.15, 0.4)} transform={`translate(0 ${(1 - fade(t, 0.15, 0.4)) * 20})`}>
          <rect x={90} y={340} width={860} height={230} rx={34} fill="#fff" stroke={METAR_COLORS[a]} strokeWidth={5} />
          <g transform="translate(190 455)">
            {a === 0 && (
              <g>
                <Tower x={-30} y={-6} s={0.9} />
                <g transform="translate(66 0)">
                  <circle r={40} fill="none" stroke={C.deep} strokeWidth={7} />
                  <line x1={0} y1={0} x2={0} y2={-26} stroke={C.deep} strokeWidth={7} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={20} y2={8} stroke={C.deep} strokeWidth={7} strokeLinecap="round" />
                </g>
              </g>
            )}
            {a === 1 && (
              <g>
                <g transform={`rotate(${240 - 180} 0 0)`}>
                  <line x1={0} y1={-60} x2={0} y2={60} stroke={C.deep} strokeWidth={9} strokeLinecap="round" markerEnd="url(#arrow-deep)" />
                </g>
                <Txt x={0} y={100} size={22} fill={C.dim} font="j">
                  aus 240°
                </Txt>
              </g>
            )}
            {a === 2 && (
              <g>
                <ellipse rx={44} ry={26} fill="#fff" stroke={C.green} strokeWidth={7} />
                <circle r={12} fill={C.green} />
                <line x1={56} y1={0} x2={150} y2={0} stroke={C.green} strokeWidth={7} strokeDasharray="12 10" />
              </g>
            )}
            {a === 3 && (
              <g>
                <Cloud x={20} y={-4} s={0.8} fill="#c4b5fd" />
                <line x1={-90} y1={48} x2={110} y2={48} stroke="#7c5cf0" strokeWidth={5} strokeDasharray="12 8" />
              </g>
            )}
            {a === 4 && (
              <g>
                <rect x={-14} y={-64} width={28} height={100} rx={14} fill="#fff" stroke={C.amber} strokeWidth={7} />
                <circle cx={0} cy={48} r={26} fill={C.amber} />
                <rect x={-6} y={-24 + Math.sin(frame / 12) * 4} width={12} height={64} rx={6} fill={C.amber} />
              </g>
            )}
            {a === 5 && (
              <g>
                <circle r={64} fill="#fff" stroke={C.red} strokeWidth={8} />
                <line x1={0} y1={0} x2={polar(0, 0, 46, 30 + Math.sin(frame / 15) * 8)[0]} y2={polar(0, 0, 46, 30 + Math.sin(frame / 15) * 8)[1]} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
                <circle r={8} fill={C.text} />
              </g>
            )}
            {a === 6 && (
              <g>
                <line x1={-60} y1={-14} x2={60} y2={-14} stroke={C.gray} strokeWidth={9} strokeLinecap="round" />
                <line x1={-60} y1={14} x2={60} y2={14} stroke={C.gray} strokeWidth={9} strokeLinecap="round" />
              </g>
            )}
          </g>
          <Txt x={380} y={470} size={40} anchor="start" fill={METAR_COLORS[a]} weight={800}>
            {a === 0 ? "EDDM · 201250Z" : METAR_TOKENS[stepOf.indexOf(a)]}
          </Txt>
          <Txt x={380} y={520} size={30} anchor="start" fill={C.text} font="j">
            {METAR_MEANING[a]}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Welcome (0.1): an aircraft rolls, lifts off and climbs into the sun. One step: welcome.
// ---------------------------------------------------------------------------------------------------------
export const takeoff: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const k = Math.min(1, t / 9);
  const roll = k < 0.4 ? (k / 0.4) ** 2 : 1;
  const x = k < 0.4 ? 110 + roll * 380 : 490 + (k - 0.4) * 500;
  const y = k < 0.4 ? 494 : 494 - ((k - 0.4) / 0.6) ** 1.6 * 320;
  const tilt = k < 0.4 ? 0 : -8 - (k - 0.4) * 18;
  return (
    <g>
      <Sky fill="#dcecfb" />
      <g transform="translate(860 120)">
        <circle r={54} fill="#ffd54a" />
        {Array.from({ length: 12 }, (_, i) => {
          const [x0, y0] = polar(0, 0, 72, i * 30 + t * 8);
          const [x1, y1] = polar(0, 0, 98, i * 30 + t * 8);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#ffd54a" strokeWidth={9} strokeLinecap="round" />;
        })}
      </g>
      <Cloud x={220 - (t * 6) % 60} y={130} s={0.7} opacity={0.75} />
      <Cloud x={560 - (t * 4) % 40} y={230} s={0.5} opacity={0.6} />
      <rect x={0} y={530} width={1040} height={110} fill="#cfe6d2" />
      <rect x={60} y={520} width={620} height={16} rx={5} fill={C.runway} />
      <line x1={80} y1={528} x2={660} y2={528} stroke="#fff" strokeWidth={3} strokeDasharray="22 16" />
      <Tower x={780} y={470} s={0.6} />
      {/* trail of the climb */}
      {k > 0.4 && <path d={`M490,494 L${x},${y}`} stroke={C.sky} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.6} />}
      <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
        <PlaneSide x={0} y={0} s={0.85} />
      </g>
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.6)}>
          <Label x={520} y={90} w={420} text="Willkommen an Bord!" fill={C.deep} size={34} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Barometer becomes altimeter (1.3). Steps: pressure is measured, height is displayed.
// ---------------------------------------------------------------------------------------------------------
function Dial({ x, y, r, label, unit, angle, color }: { x: number; y: number; r: number; label: string; unit: string; angle: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#fff" stroke={color} strokeWidth={10} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = -120 + i * 24;
        const [x0, y0] = polar(0, 0, r - 24, a);
        const [x1, y1] = polar(0, 0, r - 8, a);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.gray} strokeWidth={i % 5 === 0 ? 5 : 3} />;
      })}
      <line x1={0} y1={0} x2={polar(0, 0, r - 36, angle)[0]} y2={polar(0, 0, r - 36, angle)[1]} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <circle r={11} fill={C.text} />
      <Txt x={0} y={r * 0.5} size={30} fill={C.text} weight={800}>
        {label}
      </Txt>
      <Txt x={0} y={r * 0.5 + 34} size={22} fill={C.dim} font="j">
        {unit}
      </Txt>
    </g>
  );
}

export const baro: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const wob = Math.sin(t * 2) * 6;
  return (
    <g>
      <Sky />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <Dial x={250} y={300} r={150} label="Luftdruck" unit="hPa" angle={-20 + wob} color={C.deep} />
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={0.35 + 0.35 * Math.sin(t * 3 + i)}>
              <path d={`M${170 + i * 80},70 v40`} stroke={C.sky} strokeWidth={6} strokeLinecap="round" markerEnd="url(#arrow-deep)" />
            </g>
          ))}
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <path d="M430,300 H590" stroke={C.deep} strokeWidth={9} strokeLinecap="round" markerEnd="url(#arrow-deep)" />
          <Dial x={790} y={300} r={150} label="Höhe" unit="ft" angle={40 + prog(since[1], 0.3, 2.5) * 100} color={C.green} />
        </g>
      )}
      <Txt x={520} y={560} size={26} fill={C.dim} font="j">
        Der Höhenmesser ist im Grunde ein Barometer.
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Reporting a flight level (1.3): altimeter set to 1013.2 shows 7500 ft, so the pilot says "FL 75".
// ---------------------------------------------------------------------------------------------------------
export const flExample: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  return (
    <g>
      <Sky />
      <Dial x={270} y={300} r={170} label="7500 ft" unit="Höhenmesser" angle={60 + Math.sin(t * 2) * 1.5} color={C.deep} />
      <g transform="translate(270 500)">
        <rect x={-110} y={-22} width={220} height={44} rx={22} fill={C.deep} />
        <Txt x={0} y={9} size={26} fill="#fff">
          1013,2 hPa
        </Txt>
      </g>
      <g opacity={fade(t, 1.0, 0.5)}>
        <Tower x={800} y={330} s={1.1} />
        <Bubble x={780} y={150} text="Wie hoch fliegen Sie?" stroke="#3b4a5a" tail="down" size={26} />
      </g>
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <Bubble x={560} y={480} text="FL 75" size={44} tail="up" tailDx={-110} stroke={C.green} />
          <Label x={560} y={560} w={420} text="Flugfläche sieben fünf" fill={C.green} size={26} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// The radio link (1.6 intro): height and terrain decide the connection. One step: radio link.
// ---------------------------------------------------------------------------------------------------------
export const radiolink: DiagramFn = ({ since, frame }) => {
  const t = frame / 30;
  const py = 200 + Math.sin(t * 1.6) * 14;
  const bars = 1 + Math.floor((0.5 + 0.5 * Math.sin(t * 1.2)) * 3.99);
  return (
    <g>
      <Sky />
      <rect x={0} y={540} width={1040} height={100} fill="#cfe6d2" />
      <polygon points="330,540 470,400 620,540" fill="#9db5a2" />
      <Tower x={860} y={470} s={0.85} />
      <PlaneSide x={200} y={py} s={0.95} />
      {[0, 1, 2, 3].map((i) => {
        const ph = ((frame / 1.5 + i * 22) % 88) / 88;
        return <path key={i} d={arcPath(220, py, 60 + ph * 520, 60, 120)} fill="none" stroke={C.sky} strokeWidth={6} strokeLinecap="round" opacity={0.7 * (1 - ph)} />;
      })}
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)} transform="translate(520 90)">
          <rect x={-190} y={-42} width={380} height={84} rx={42} fill="#fff" stroke={C.deep} strokeWidth={5} />
          <Txt x={-70} y={11} size={28} fill={C.deep} anchor="middle">
            Verbindung
          </Txt>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70 + i * 26} y={18 - (i + 1) * 9} width={16} height={(i + 1) * 9 + 6} rx={3} fill={i < bars ? C.green : "#d3dde8"} />
          ))}
        </g>
      )}
    </g>
  );
};
