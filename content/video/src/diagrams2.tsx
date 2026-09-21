import type { DiagramFn } from "./diagrams1";
import { C, Cloud, Dimension, Draw, Glider, Label, Plane, PlaneSide, Txt, along, fade, lerp, polar, polyPath, prog } from "./svgkit";
import { Compass } from "./svgkit";

// ---------------------------------------------------------------------------------------------------------
// Semicircular cruising levels. Steps: which course counts, course 135 -> FL 55/75/95, course 270 -> FL 65/85/105
// ---------------------------------------------------------------------------------------------------------
export const hemi: DiagramFn = ({ since }) => {
  const cx = 290;
  const cy = 330;
  const r = 215;
  const east = [35, 55, 75, 95, 115];
  const west = [45, 65, 85, 105, 125];
  const yOf = (fl: number) => 545 - (fl - 35) * 4.9;
  const a0 = 60;
  const angle = since[2] > 0 ? lerp(135, 270, prog(since[2], 0, 1.4)) : since[1] > 0 ? lerp(a0, 135, prog(since[1], 0, 1.2)) : a0;
  const eastOn = since[1] > 0 && since[2] < 0;
  const westOn = since[2] > 0;
  const [tx, ty] = polar(cx, cy, r - 30, angle);
  const bar = (fl: number, x: number, on: boolean, delay: number, hot: boolean, since1: number) => {
    const y = yOf(fl);
    const a = hot ? fade(since1, delay, 0.5) : 0.22;
    return (
      <g key={fl} opacity={hot ? Math.max(a, 0.25) : 0.22}>
        <rect x={x - 82} y={y - 20} width={164} height={40} rx={20} fill={hot && a > 0.3 ? C.green : "#cfd9e4"} />
        <Txt x={x} y={y + 8} size={24} fill={hot && a > 0.3 ? "#fff" : C.dim}>
          FL {fl}
        </Txt>
      </g>
    );
  };
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#f4f8fd" />
      {/* halves of the compass */}
      <path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} Z`} fill={C.sky} opacity={eastOn ? 0.22 : 0.06} />
      <path d={`M${cx},${cy} L${cx},${cy + r} A${r},${r} 0 0 1 ${cx},${cy - r} Z`} fill={C.amber} opacity={westOn ? 0.22 : 0.06} />
      <Compass cx={cx} cy={cy} r={r} />
      <Txt x={cx} y={cy + r + 44} size={22} fill={C.dim}>
        missweisender Kurs über Grund
      </Txt>
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={C.deep} strokeWidth={9} strokeLinecap="round" markerEnd="url(#arrow-deep)" />
      <Plane x={cx} y={cy} s={0.55} rot={angle} fill={C.deep} />
      <Label x={cx} y={cy + 100} w={110} text={`${Math.round(angle)}°`} fill={C.deep} size={26} />
      {/* ladders */}
      <Txt x={700} y={58} size={24} fill={C.sky}>
        Kurs
      </Txt>
      <Txt x={700} y={88} size={26} fill={C.sky}>
        000°–179°
      </Txt>
      <Txt x={890} y={58} size={24} fill={C.amber}>
        Kurs
      </Txt>
      <Txt x={890} y={88} size={26} fill={C.amber}>
        180°–359°
      </Txt>
      <line x1={600} y1={100} x2={600} y2={580} stroke={C.line} strokeWidth={3} />
      {east.map((fl) => bar(fl, 700, eastOn, [95, 75, 55].indexOf(fl) * 0.35, [55, 75, 95].includes(fl) && since[1] > 0, since[1]))}
      {west.map((fl) => bar(fl, 890, westOn, [105, 85, 65].indexOf(fl) * 0.35, [65, 85, 105].includes(fl) && since[2] > 0, since[2]))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Visibility and cloud clearance, side view. Steps: 5 km flight visibility, 1500 m horizontal, 300 m vertical
// ---------------------------------------------------------------------------------------------------------
export const cloud: DiagramFn = ({ since }) => {
  const px = 250;
  const py = 430;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={0} y={560} width={1040} height={80} fill="#cfe6d2" />
      <Cloud x={470} y={215} s={1.1} />
      <Cloud x={820} y={440} s={1.1} />
      <PlaneSide x={px} y={py} s={1.25} />
      {/* eye line / visibility */}
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.4)}>
          <line x1={px + 100} y1={py} x2={px + 100 + 700 * prog(since[0], 0, 1.4)} y2={py} stroke={C.deep} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" />
          <Dimension x1={px + 100} y1={520} x2={1000} y2={520} text="Flugsicht mindestens 5 km" color={C.deep} />
        </g>
      )}
      {since[1] > 0 && <Dimension x1={px + 100} y1={py + 4} x2={715} y2={py + 4} text="waagerecht 1500 m" color={C.green} opacity={fade(since[1], 0, 0.5)} />}
      {since[2] > 0 && <Dimension x1={470} y1={276} x2={470} y2={py - 52} text="senkrecht 300 m (1000 ft)" color={C.amber} opacity={fade(since[2], 0, 0.5)} offset={190} />}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Altimeter setting. Steps: up to 5000 ft -> QNH, above -> standard 1013.2
// ---------------------------------------------------------------------------------------------------------
export const altimeter: DiagramFn = ({ since }) => {
  const line = 320;
  const low = since[1] < 0;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eef5fc" />
      <rect x={0} y={line} width={640} height={240} fill={C.green} opacity={0.14} />
      <rect x={0} y={0} width={640} height={line} fill={C.sky} opacity={since[1] > 0 ? 0.16 : 0.05} />
      <path d="M0,560 L120,470 L200,520 L300,440 L380,520 L470,490 L560,560 Z" fill="#b8d1bb" />
      <rect x={0} y={560} width={640} height={80} fill="#a8cfd8" />
      <Txt x={24} y={608} size={22} fill={C.dim} anchor="start">
        Meeresniveau (NN)
      </Txt>
      <line x1={0} y1={line} x2={640} y2={line} stroke={C.text} strokeWidth={4} strokeDasharray="14 10" />
      <Label x={520} y={line} w={210} text="5000 ft AMSL" fill={C.text} size={22} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0.1)}>
          <PlaneSide x={300} y={430} s={1} />
          <Label x={300} y={365} text="QNH" fill={C.green} size={30} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0.1)}>
          <PlaneSide x={300} y={190} s={1} />
          <Label x={300} y={110} text="Standard 1013,2 hPa" fill={C.deep} size={28} />
        </g>
      )}
      {/* altimeter setting window */}
      <rect x={720} y={240} width={260} height={150} rx={26} fill="#1b2733" />
      <Txt x={850} y={282} size={20} fill="#9fb2c4" font="j">
        Druckeinstellung
      </Txt>
      <rect x={750} y={300} width={200} height={60} rx={12} fill="#0b131b" />
      <Txt x={850} y={345} size={38} fill={low ? "#5fe3a1" : "#7cc4ff"}>
        {low ? "QNH" : "1013,2"}
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Right of way, top view. Steps switch the scenario: head-on, from the right, motor glider from the left, towing
// ---------------------------------------------------------------------------------------------------------
export const giveway: DiagramFn = ({ since, active }) => {
  const s = Math.max(active, 0);
  const t = since[s];
  const move = (path: [number, number][], delay: number, dur: number) => along(path, prog(t, delay, dur));
  let scene = null;
  let title = "";
  if (s === 0) {
    title = "Im Gegenflug: beide nach rechts";
    const a: [number, number][] = [[80, 320], [340, 320], [470, 405], [720, 405], [980, 405]];
    const b: [number, number][] = [[980, 320], [720, 320], [590, 235], [340, 235], [80, 235]];
    const pa = move(a, 0.4, 5);
    const pb = move(b, 0.4, 5);
    scene = (
      <g>
        <path d={polyPath(a)} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray="10 12" opacity={0.7} />
        <path d={polyPath(b)} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray="10 12" opacity={0.7} />
        <Plane x={pa.x} y={pa.y} rot={pa.heading} s={0.85} />
        <Plane x={pb.x} y={pb.y} rot={pb.heading} s={0.85} fill={C.gray} />
        <Txt x={520} y={470} size={24} fill={C.green} opacity={fade(t, 2)}>
          rechts ausweichen
        </Txt>
      </g>
    );
  } else if (s === 1) {
    title = "Kommt einer von rechts: du weichst aus";
    const other = move([[980, 250], [560, 250]], 0.2, 3);
    const own = move([[520, 590], [520, 400]], 0.2, 3);
    scene = (
      <g>
        <path d="M980,250 L120,250" stroke={C.gray} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <path d="M520,590 L520,120" stroke={C.deep} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <Draw d="M520,400 C520,330 640,330 700,270" p={prog(t, 3.2, 1.6)} stroke={C.green} width={8} arrow="green" />
        <Plane x={other.x} y={other.y} rot={other.heading} s={0.85} fill={C.gray} />
        <Plane x={own.x} y={own.y} rot={own.heading} s={0.85} />
        <Label x={850} y={190} text="kommt von rechts" fill={C.gray} />
        <Label x={340} y={470} text="du weichst aus" fill={C.green} opacity={fade(t, 3.4)} />
      </g>
    );
  } else if (s === 2) {
    title = "Motorsegler von links: er weicht aus";
    const glider = move([[80, 250], [300, 250]], 0.2, 3);
    const own = move([[520, 590], [520, 400]], 0.2, 3);
    scene = (
      <g>
        <path d="M80,250 L920,250" stroke={C.amber} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <path d="M520,590 L520,120" stroke={C.deep} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <Draw d="M300,250 C420,250 460,330 440,470" p={prog(t, 3.2, 1.6)} stroke={C.green} width={8} arrow="green" />
        <Glider x={glider.x} y={glider.y} rot={glider.heading} s={0.9} fill={C.amber} />
        <Plane x={own.x} y={own.y} rot={own.heading} s={0.85} />
        <Label x={200} y={180} text="Motorsegler, Motor läuft" fill={C.amber} />
        <Label x={730} y={420} text="du hast Vorflugrecht" fill={C.deep} opacity={fade(t, 0.4)} />
        <Label x={300} y={500} text="er weicht aus" fill={C.green} opacity={fade(t, 3.4)} />
      </g>
    );
  } else {
    title = "Schleppende haben Vorflugrecht";
    const tow = move([[980, 250], [640, 250]], 0.2, 3);
    const own = move([[520, 590], [520, 420]], 0.2, 3);
    scene = (
      <g>
        <path d="M980,250 L120,250" stroke={C.gray} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <line x1={tow.x + 50} y1={tow.y} x2={tow.x + 200} y2={tow.y} stroke={C.text} strokeWidth={3} strokeDasharray="6 6" />
        <Plane x={tow.x} y={tow.y} rot={270} s={0.85} fill={C.gray} />
        <Glider x={tow.x + 250} y={tow.y} rot={270} s={0.7} fill={C.gray} />
        <Draw d="M520,420 C520,350 640,350 780,280" p={prog(t, 3.2, 1.6)} stroke={C.green} width={8} arrow="green" />
        <Plane x={own.x} y={own.y} rot={own.heading} s={0.85} />
        <Label x={720} y={170} text="schleppt Gegenstände" fill={C.gray} />
        <Label x={330} y={470} text="du weichst aus" fill={C.green} opacity={fade(t, 3.4)} />
      </g>
    );
  }
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <Label x={520} y={56} text={title} fill="#fff" color={C.text} size={28} />
      <rect x={0} y={0} width={1040} height={640} fill="none" />
      {scene}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Minimum heights. Steps: over cities, elsewhere
// ---------------------------------------------------------------------------------------------------------
export const minheight: DiagramFn = ({ since, active }) => {
  const s = Math.max(active, 0);
  const city = s === 0;
  const t = since[s];
  const pxf = 520;
  if (city) {
    const buildings: [number, number, number][] = [[80, 90, 100], [180, 70, 150], [270, 90, 110], [720, 80, 130], [810, 70, 90], [890, 90, 140]];
    return (
      <g>
        <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
        <rect x={0} y={560} width={1040} height={80} fill="#c9d3dc" />
        {buildings.map(([x, w, h], i) => (
          <rect key={i} x={x} y={560 - h} width={w} height={h} fill="#8fa2b4" />
        ))}
        <rect x={470} y={560 - 220} width={100} height={220} fill="#5d7388" />
        <Txt x={520} y={560 - 232} size={22} fill={C.dim}>
          höchstes Hindernis
        </Txt>
        <PlaneSide x={pxf} y={190} s={1.1} opacity={fade(t, 0)} />
        <Dimension x1={620} y1={202} x2={620} y2={338} text="300 m (1000 ft)" color={C.green} opacity={fade(t, 0.6)} offset={-4} />
        <line x1={pxf - 300} y1={100} x2={pxf + 300} y2={100} stroke={C.deep} strokeWidth={4} markerStart="url(#arrow-deep)" markerEnd="url(#arrow-deep)" opacity={fade(t, 1.4)} />
        <Label x={pxf} y={100} text="Umkreis 600 m" fill={C.deep} opacity={fade(t, 1.4)} />
      </g>
    );
  }
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={0} y={560} width={1040} height={80} fill="#cfe6d2" />
      <rect x={780} y={480} width={16} height={80} fill="#7a8a99" />
      <Txt x={788} y={468} size={22} fill={C.dim}>
        Hindernis
      </Txt>
      <PlaneSide x={pxf - 60} y={300} s={1.1} opacity={fade(t, 0)} />
      <Dimension x1={pxf - 60} y1={340} x2={pxf - 60} y2={556} text="150 m (500 ft)" color={C.green} opacity={fade(t, 0.6)} offset={130} />
      <Dimension x1={pxf + 20} y1={300} x2={780} y2={300} text="150 m" color={C.deep} opacity={fade(t, 1.4)} />
      <Label x={520} y={110} text="über Boden, Wasser und Hindernissen" fill="#fff" color={C.text} size={26} opacity={fade(t, 0.3)} />
    </g>
  );
};

