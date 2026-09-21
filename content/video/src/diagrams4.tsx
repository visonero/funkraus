import type { DiagramFn } from "./diagrams1";
import { Bubble, C, Label, Plane, Station, Txt, arcPath, clamp01, fade, lerp, polar, prog } from "./svgkit";

const Ground = () => <rect x={0} y={0} width={1040} height={640} fill="#f4f8fd" />;

const arcLabel = (cx: number, cy: number, r: number, a0: number, a1: number, text: string, color: string, size = 26, push = 34) => {
  const [x, y] = polar(cx, cy, r + push, (a0 + a1) / 2);
  return (
    <Txt x={x} y={y + size * 0.35} size={size} fill={color}>
      {text}
    </Txt>
  );
};

// ---------------------------------------------------------------------------------------------------------
// ADF: relative bearing. Steps: aircraft longitudinal axis, direction to the NDB, heading + relative = QDM
// ---------------------------------------------------------------------------------------------------------
export const adf: DiagramFn = ({ since }) => {
  const px = 260;
  const py = 230;
  const heading = 155;
  const sx = px;
  const sy = 540;
  const [ax, ay] = polar(px, py, 250, heading);
  return (
    <g>
      <Ground />
      {/* north reference */}
      <line x1={px} y1={py} x2={px} y2={py - 170} stroke={C.red} strokeWidth={4} strokeDasharray="10 10" opacity={since[2] > 0 ? 0.9 : 0.35} />
      <Txt x={px} y={py - 184} size={26} fill={C.red}>
        N
      </Txt>
      <Station x={sx} y={sy} s={1.1} />
      <Txt x={sx + 60} y={sy + 8} size={24} fill={C.text} anchor="start">
        NDB
      </Txt>
      {/* longitudinal axis */}
      {since[0] > 0 && <line x1={px} y1={py} x2={px + (ax - px) * prog(since[0], 0, 1)} y2={py + (ay - py) * prog(since[0], 0, 1)} stroke={C.deep} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />}
      {since[0] > 0 && <Label x={ax + 120} y={ay - 10} text="Flugzeuglängsachse" fill={C.deep} opacity={fade(since[0], 0.8)} size={22} />}
      {/* direction to the NDB */}
      {since[1] > 0 && <line x1={px} y1={py} x2={sx} y2={py + (sy - py - 40) * prog(since[1], 0, 1)} stroke={C.amber} strokeWidth={7} strokeLinecap="round" markerEnd={since[1] > 1.1 ? "url(#arrow-amber)" : undefined} />}
      {since[1] > 0 && <Label x={px - 40} y={sy - 110} w={230} text="Richtung zum NDB" fill={C.amber} opacity={fade(since[1], 0.8)} size={22} />}
      {since[1] > 0 && <path d={arcPath(px, py, 130, heading, 180)} fill="none" stroke={C.amber} strokeWidth={9} strokeLinecap="round" opacity={fade(since[1], 0.8)} />}
      {since[1] > 0 && <g opacity={fade(since[1], 1)}>{arcLabel(px, py, 130, heading, 180, "025°", C.amber, 24, 30)}</g>}
      {/* heading and the sum */}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <path d={arcPath(px, py, 90, 0, heading)} fill="none" stroke={C.deep} strokeWidth={9} strokeLinecap="round" />
          <Txt x={px - 110} y={py + 40} size={26} fill={C.deep}>
            155°
          </Txt>
          <path d={arcPath(px, py, 185, 0, 180)} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" />
          <Label x={px + 210} y={py + 60} text="QDM 180°" fill={C.green} size={26} />
        </g>
      )}
      <Plane x={px} y={py} rot={heading} s={0.9} />
      {/* explanation panel */}
      <g>
        <rect x={640} y={140} width={340} height={340} rx={28} fill="#fff" stroke={C.line} strokeWidth={3} />
        <Txt x={810} y={195} size={24} fill={C.dim}>
          Bezugspeilung
        </Txt>
        <Txt x={810} y={245} size={40} fill={since[1] > 0 ? C.amber : "#c4d0dc"}>
          025°
        </Txt>
        <Txt x={810} y={308} size={24} fill={C.dim}>
          + Steuerkurs
        </Txt>
        <Txt x={810} y={356} size={40} fill={since[2] > 0 ? C.deep : "#c4d0dc"}>
          155°
        </Txt>
        <line x1={690} y1={382} x2={930} y2={382} stroke={C.text} strokeWidth={4} />
        <Txt x={810} y={445} size={44} fill={since[2] > 0 ? C.green : "#c4d0dc"}>
          = QDM 180°
        </Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// QDM and QDR. Steps: QDM (course to the station), QDR (bearing from the station), difference of 180 degrees
// ---------------------------------------------------------------------------------------------------------
export const qdmQdr: DiagramFn = ({ since }) => {
  const sx = 330;
  const sy = 440;
  const ax = sx + 400 * Math.sin((60 * Math.PI) / 180);
  const ay = sy - 400 * Math.cos((60 * Math.PI) / 180);
  const north = (x: number, y: number, op = 1) => <line x1={x} y1={y} x2={x} y2={y - 150} stroke={C.red} strokeWidth={4} strokeDasharray="10 10" opacity={op} />;
  const nx = 0.5;
  const ny = 0.866; // perpendicular to the station-aircraft line, pointing down-right
  const off = 34;
  return (
    <g>
      <Ground />
      {north(sx, sy, 0.6)}
      {north(ax, ay, 0.6)}
      <Txt x={sx} y={sy - 165} size={24} fill={C.red}>
        N
      </Txt>
      <Txt x={ax} y={ay - 165} size={24} fill={C.red}>
        N
      </Txt>
      <Station x={sx} y={sy} s={1.1} />
      <Plane x={ax} y={ay} rot={240} s={0.9} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <line x1={ax - 60 - off * nx} y1={ay + 34 - off * ny} x2={sx + 60 - off * nx} y2={sy - 34 - off * ny} stroke={C.green} strokeWidth={8} strokeLinecap="round" markerEnd="url(#arrow-green)" />
          <path d={arcPath(ax, ay, 70, 0, 240)} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" />
          <Txt x={ax - 110} y={ay - 26} size={28} fill={C.green}>
            240°
          </Txt>
          <Label x={(ax + sx) / 2 - 20} y={(ay + sy) / 2 - 100} text="QDM" fill={C.green} size={28} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <line x1={sx + 60 + off * nx} y1={sy - 34 + off * ny} x2={ax - 60 + off * nx} y2={ay + 34 + off * ny} stroke={C.deep} strokeWidth={8} strokeLinecap="round" markerEnd="url(#arrow-deep)" />
          <path d={arcPath(sx, sy, 100, 0, 60)} fill="none" stroke={C.deep} strokeWidth={7} strokeLinecap="round" />
          <Txt x={sx + 100} y={sy - 116} size={28} fill={C.deep}>
            060°
          </Txt>
          <Label x={(ax + sx) / 2 + 100} y={(ay + sy) / 2 + 70} text="QDR" fill={C.deep} size={28} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <Label x={640} y={560} w={420} text="Unterschied: 180°" fill={C.amber} size={30} />
          <Txt x={640} y={610} size={22} fill={C.dim}>
            240° − 060° = 180°
          </Txt>
        </g>
      )}
      <Txt x={sx} y={sy + 80} size={22} fill={C.dim}>
        Station
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Direction finding by a ground station. Steps: the station bearings your call, only a VHF radio needed, QDM 225
// ---------------------------------------------------------------------------------------------------------
export const vdf: DiagramFn = ({ since, frame }) => {
  const px = 730;
  const py = 190;
  const sx = px + 520 * Math.sin((225 * Math.PI) / 180);
  const sy = py - 520 * Math.cos((225 * Math.PI) / 180);
  const wave = (frame % 50) / 50;
  return (
    <g>
      <Ground />
      <Station x={sx} y={sy} s={1.2} />
      <Txt x={sx - 50} y={sy + 8} size={22} fill={C.text} anchor="end">
        UKW-Peilstelle
      </Txt>
      <Plane x={px} y={py} rot={250} s={0.9} />
      {since[0] > 0 &&
        [0, 1, 2].map((k) => {
          const rr = ((wave + k / 3) % 1) * 120 + 30;
          return <path key={k} d={arcPath(px, py, rr, 200, 250)} fill="none" stroke={C.deep} strokeWidth={5} strokeLinecap="round" opacity={(1 - ((wave + k / 3) % 1)) * 0.9} transform={`rotate(-16 ${px} ${py})`} />;
        })}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <rect x={790} y={300} width={210} height={100} rx={20} fill="#2b3948" />
          <rect x={806} y={316} width={100} height={36} rx={8} fill="#0f1a24" />
          <Txt x={856} y={344} size={22} fill="#7cc4ff">
            118,0
          </Txt>
          <circle cx={950} cy={334} r={20} fill="#94a3b8" />
          <Label x={895} y={440} w={220} text="UKW-Sprechfunkgerät" fill={C.deep} size={20} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <line x1={px - 34} y1={py + 34} x2={sx + 50} y2={sy - 40} stroke={C.green} strokeWidth={8} strokeLinecap="round" markerEnd="url(#arrow-green)" />
          <Label x={440} y={330} text="QDM 225°" fill={C.green} size={30} />
          <Label x={740} y={540} w={360} text="Du bist nordöstlich der Station" fill={C.text} size={24} />
          <g transform="translate(130 130)">
            <circle r={70} fill="#fff" stroke={C.line} strokeWidth={3} />
            <line x1={0} y1={-60} x2={0} y2={60} stroke={C.dim} strokeWidth={2} />
            <line x1={-60} y1={0} x2={60} y2={0} stroke={C.dim} strokeWidth={2} />
            <Txt x={0} y={-74} size={20} fill={C.red}>
              N
            </Txt>
            <Txt x={84} y={8} size={20} fill={C.dim}>
              O
            </Txt>
            <circle cx={38} cy={-38} r={9} fill={C.green} />
          </g>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Radar scope. Steps: secondary radar identifies, the controller can tell you where you are
// ---------------------------------------------------------------------------------------------------------
export const radar: DiagramFn = ({ since, frame }) => {
  const cx = 360;
  const cy = 320;
  const r = 270;
  const sweep = (frame * 3) % 360;
  const blips: [number, number, string?][] = [
    [-55, 170, "DGIGA"],
    [80, 200],
    [200, 110],
  ];
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <circle cx={cx} cy={cy} r={r + 12} fill="#2b3948" />
      <circle cx={cx} cy={cy} r={r} fill="#0f2a22" />
      {[0.33, 0.66, 1].map((k) => (
        <circle key={k} cx={cx} cy={cy} r={r * k} fill="none" stroke="#2f7a5c" strokeWidth={2} />
      ))}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#2f7a5c" strokeWidth={2} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#2f7a5c" strokeWidth={2} />
      <path d={`M${cx},${cy} L${polar(cx, cy, r, sweep)[0]},${polar(cx, cy, r, sweep)[1]} A${r},${r} 0 0 0 ${polar(cx, cy, r, sweep - 40)[0]},${polar(cx, cy, r, sweep - 40)[1]} Z`} fill="#5fe3a1" opacity={0.28} />
      <line x1={cx} y1={cy} x2={polar(cx, cy, r, sweep)[0]} y2={polar(cx, cy, r, sweep)[1]} stroke="#8dffc4" strokeWidth={3} />
      {blips.map(([a, d, name], i) => {
        const [x, y] = polar(cx, cy, d, a);
        const identified = name && since[0] > 0;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={identified ? 11 : 9} fill={identified ? "#f5c542" : "#8dffc4"} />
            {identified && (
              <g opacity={fade(since[0], 0.5, 0.5)}>
                <line x1={x - 12} y1={y - 8} x2={x - 40} y2={y - 46} stroke="#f5c542" strokeWidth={2} />
                <rect x={x - 236} y={y - 104} width={196} height={58} rx={8} fill="#0b1712" stroke="#f5c542" strokeWidth={2} />
                <Txt x={x - 138} y={y - 78} size={20} fill="#f5c542">
                  DGIGA
                </Txt>
                <Txt x={x - 138} y={y - 54} size={16} fill="#cde8da" font="j">
                  Transponder 7000
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      {since[0] > 0 && <Label x={800} y={190} w={330} text="Sekundärradar" fill={C.deep} opacity={fade(since[0], 0.2)} />}
      {since[0] > 0 && <Txt x={800} y={245} size={22} fill={C.text} opacity={fade(since[0], 0.8)}>identifiziert Luftfahrzeuge</Txt>}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <Bubble x={800} y={370} text="RADARKONTROLLE" stroke="#3b4a5a" tail="none" size={24} />
          <Bubble x={800} y={450} text="nennt dir deinen Standort" stroke={C.green} tail="none" size={24} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// NDB. Steps: long / medium wave, Morse identification, operating range 15 to 100 NM
// ---------------------------------------------------------------------------------------------------------
const MORSE: Record<string, string> = { N: "-.", D: "-..", B: "-..." };
export const ndb: DiagramFn = ({ since, frame }) => {
  const cx = 300;
  const cy = 330;
  const wave = (frame % 90) / 90;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={cx} cy={cy} r={50 + ((wave + k / 3) % 1) * 250} fill="none" stroke={C.sky} strokeWidth={4} opacity={(1 - ((wave + k / 3) % 1)) * 0.55} />
      ))}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <circle cx={cx} cy={cy} r={95} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray="10 10" />
          <circle cx={cx} cy={cy} r={270} fill="rgba(15,159,110,0.07)" stroke={C.green} strokeWidth={5} strokeDasharray="10 10" />
          <Label x={cx + 72} y={cy - 78} text="15 NM" fill={C.green} size={22} />
          <Label x={cx + 190} y={cy - 190} text="100 NM" fill={C.green} size={22} />
        </g>
      )}
      <Station x={cx} y={cy} s={1.3} />
      <Txt x={cx} y={cy + 80} size={24} fill={C.text}>
        NDB
      </Txt>
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <path d={`M640,150 ${Array.from({ length: 60 }, (_, i) => `L${640 + i * 6},${150 + Math.sin(i / 3 + frame / 8) * 28}`).join(" ")}`} fill="none" stroke={C.deep} strokeWidth={6} strokeLinecap="round" />
          <Label x={810} y={230} text="Lang- und Mittelwelle" fill={C.deep} size={26} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          {["N", "D", "B"].map((letter, li) => (
            <g key={letter} transform={`translate(${650 + li * 130} 380)`}>
              {[...MORSE[letter]].map((sym, k) => (
                <rect key={k} x={k * 30 + (sym === "-" ? 0 : 4)} y={0} width={sym === "-" ? 22 : 10} height={10} rx={5} fill={C.text} />
              ))}
              <Txt x={40} y={52} size={26} fill={C.dim}>
                {letter}
              </Txt>
            </g>
          ))}
          <Label x={810} y={480} text="2 oder 3 Buchstaben" fill={C.text} size={24} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// Satellite navigation. Steps: GPS, GNSS as umbrella term, the receiver on board
// ---------------------------------------------------------------------------------------------------------
export const gnss: DiagramFn = ({ since, frame }) => {
  const sats: [number, number, boolean][] = [
    [200, 120, true],
    [420, 90, true],
    [640, 110, true],
    [860, 140, true],
    [130, 250, false],
    [930, 270, false],
  ];
  const px = 520;
  const py = 420;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#0f1a2c" />
      <ellipse cx={520} cy={760} rx={620} ry={170} fill="#1f6fb0" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={(i * 197) % 1040} cy={(i * 89) % 380} r={1.6} fill="#fff" opacity={0.5} />
      ))}
      {sats.map(([x, y, gps], i) => {
        const bob = Math.sin(frame / 30 + i) * 6;
        const on = gps ? since[0] > 0 : since[1] > 0;
        return (
          <g key={i} opacity={on ? 1 : 0.28}>
            {(gps ? since[0] > 0 : false) && <line x1={x} y1={y + bob} x2={px} y2={py - 30} stroke="#7cc4ff" strokeWidth={2.5} strokeDasharray="6 8" opacity={0.8} />}
            <g transform={`translate(${x} ${y + bob})`}>
              <rect x={-14} y={-10} width={28} height={20} rx={4} fill="#dbe7f3" />
              <rect x={-52} y={-8} width={34} height={16} fill="#5aa9e6" />
              <rect x={18} y={-8} width={34} height={16} fill="#5aa9e6" />
            </g>
          </g>
        );
      })}
      {since[0] > 0 && <Label x={420} y={50} text="GPS" fill={C.sky} size={28} opacity={fade(since[0], 0.2)} />}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.6)}>
          <path d="M110,318 Q520,30 950,318" fill="none" stroke="#f5c542" strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" />
          <Label x={520} y={196} w={400} text="GNSS = Oberbegriff" fill="#f5c542" color={C.text} size={28} />
        </g>
      )}
      <Plane x={px} y={py} s={0.8} fill="#fff" />
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <rect x={670} y={380} width={250} height={110} rx={18} fill="#1b2733" stroke="#7cc4ff" strokeWidth={3} />
          <Txt x={795} y={420} size={22} fill="#7cc4ff">
            GPS-Empfänger
          </Txt>
          <Txt x={795} y={462} size={24} fill="#fff">
            wertet Signale aus
          </Txt>
          <line x1={px + 40} y1={py} x2={670} y2={435} stroke="#7cc4ff" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// GPS display. Steps: position, track, ground speed, distance
// ---------------------------------------------------------------------------------------------------------
export const gpsDisplay: DiagramFn = ({ since }) => {
  const fields: { key: string; value: string; unit: string; x: number; y: number }[] = [
    { key: "POSITION", value: "N 51° 20′  E 012° 15′", unit: "", x: 520, y: 180 },
    { key: "KURS", value: "135°", unit: "", x: 330, y: 320 },
    { key: "GESCHWINDIGKEIT", value: "95 kt", unit: "", x: 710, y: 320 },
    { key: "ENTFERNUNG", value: "24 NM", unit: "", x: 520, y: 455 },
  ];
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={120} y={70} width={800} height={500} rx={44} fill="#26343f" />
      <rect x={150} y={100} width={740} height={440} rx={22} fill="#0d1721" />
      {fields.map((f, i) => {
        const on = since[i] > 0;
        const a = clamp01(since[i] / 0.5);
        const w = f.key === "POSITION" ? 620 : 290;
        return (
          <g key={f.key} opacity={on ? 1 : 0.18}>
            <rect x={f.x - w / 2} y={f.y - 58} width={w} height={116} rx={18} fill="#13202c" stroke={on ? "#f5c542" : "#2a3b4b"} strokeWidth={on ? 4 : 2} />
            <Txt x={f.x} y={f.y - 22} size={20} fill="#8fb0c8" font="j">
              {f.key}
            </Txt>
            <Txt x={f.x} y={f.y + 32} size={f.key === "POSITION" ? 44 : 52} fill={on ? "#eaf7ff" : "#4f6274"} opacity={lerp(0.4, 1, a)}>
              {f.value}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

