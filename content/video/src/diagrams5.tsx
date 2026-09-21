import type { DiagramFn } from "./diagrams1";
import { C, Cloud, Dimension, Label, PlaneSide, Station, Txt, fade } from "./svgkit";

// ---------------------------------------------------------------------------------------------------------
// Altimeter settings. Steps: QNH (height above sea level), QFE (height above the aerodrome), 1013.2 (flight level)
// ---------------------------------------------------------------------------------------------------------
export const altimeter3: DiagramFn = ({ since }) => {
  const seaY = 570;
  const fieldY = 440;
  const planeY = 190;
  const px = 470;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={0} y={seaY} width={1040} height={70} fill="#a8cfd8" />
      <path d="M0,570 L0,440 L250,430 L420,440 L760,440 L900,500 L1040,570 Z" fill="#b8d1bb" />
      <rect x={470} y={fieldY - 4} width={280} height={10} rx={3} fill="#3b4a5a" />
      <Txt x={610} y={fieldY + 40} size={22} fill={C.dim}>
        Flugplatz
      </Txt>
      <Txt x={28} y={seaY + 42} size={22} fill={C.dim} anchor="start">
        Meeresniveau (NN)
      </Txt>
      <line x1={0} y1={seaY} x2={1040} y2={seaY} stroke={C.gray} strokeWidth={3} strokeDasharray="10 10" />
      <PlaneSide x={px} y={planeY} s={1.1} />
      {since[0] > 0 && (
        <g opacity={fade(since[0], 0, 0.5)}>
          <Dimension x1={210} y1={planeY + 20} x2={210} y2={seaY - 4} text="QNH: Höhe über NN" color={C.green} offset={150} />
        </g>
      )}
      {since[1] > 0 && (
        <g opacity={fade(since[1], 0, 0.5)}>
          <Dimension x1={840} y1={planeY + 20} x2={840} y2={fieldY - 8} text="QFE: Höhe über dem Platz" color={C.amber} offset={-150} />
        </g>
      )}
      {since[2] > 0 && (
        <g opacity={fade(since[2], 0, 0.5)}>
          <line x1={90} y1={planeY - 60} x2={950} y2={planeY - 60} stroke={C.deep} strokeWidth={4} strokeDasharray="14 10" />
          <Label x={520} y={planeY - 100} text="1013,2 hPa: Flugfläche" fill={C.deep} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------
// VHF line of sight. Steps: high = good link, valley = radio shadow, FL 65 over flat land = about 95 NM
// ---------------------------------------------------------------------------------------------------------
export const los: DiagramFn = ({ since, active }) => {
  const s = Math.max(active, 0);
  const t = since[s];
  const sx = 130;
  const sy = 470;
  const flat = s === 2;
  return (
    <g>
      <rect x={0} y={0} width={1040} height={640} fill="#eaf4fd" />
      <rect x={0} y={540} width={1040} height={100} fill="#cfe6d2" />
      <Station x={sx} y={sy} s={1} />
      <rect x={sx - 4} y={sy + 26} width={8} height={44} fill={C.text} />
      {!flat && <polygon points="380,540 560,250 740,540" fill="#9db5a2" />}
      {s === 0 && (
        <g>
          <PlaneSide x={860} y={150} s={1} opacity={fade(t, 0)} />
          <line x1={sx + 26} y1={sy - 20} x2={800} y2={150} stroke={C.green} strokeWidth={6} strokeDasharray="14 10" opacity={fade(t, 0.5)} />
          <Label x={560} y={110} text="freie Sicht: gute Verbindung" fill={C.green} opacity={fade(t, 0.8)} />
        </g>
      )}
      {s === 1 && (
        <g>
          <PlaneSide x={880} y={500} s={1} opacity={fade(t, 0)} />
          <line x1={sx + 26} y1={sy - 20} x2={470} y2={330} stroke={C.red} strokeWidth={6} strokeDasharray="14 10" opacity={fade(t, 0.5)} />
          <g opacity={fade(t, 1.2)}>
            <line x1={470} y1={310} x2={510} y2={350} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
            <line x1={510} y1={310} x2={470} y2={350} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
          </g>
          <Label x={820} y={370} text="Funkschatten" fill={C.red} opacity={fade(t, 1.2)} />
        </g>
      )}
      {s === 2 && (
        <g>
          <PlaneSide x={870} y={180} s={1} opacity={fade(t, 0)} />
          <Label x={870} y={110} text="FL 65" fill={C.deep} opacity={fade(t, 0.3)} />
          <line x1={sx + 26} y1={sy - 20} x2={800} y2={185} stroke={C.green} strokeWidth={6} strokeDasharray="14 10" opacity={fade(t, 0.5)} />
          <Dimension x1={sx} y1={590} x2={870} y2={590} text="ca. 95 NM" color={C.green} opacity={fade(t, 1)} />
        </g>
      )}
      <Cloud x={300} y={130} s={0.8} opacity={0.6} />
    </g>
  );
};

