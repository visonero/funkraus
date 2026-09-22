// Decorative backdrop for the white hero: a fine, semi-translucent blue network of towers, VOR beacons,
// runways and aircraft, with pulses running along the lines, rotating radar sweeps and expanding radio-wave
// rings. Pure SVG/CSS, no client JS, so it degrades gracefully (static lines, no motion) if animations are
// disabled.
//
// Layout rule: solid icons (tower/VOR/plane/runway/radar) stay in the left column, right column or bottom
// band — outside the centered text block — so they never sit behind the headline. Only hairline links and a
// couple of small ping rings are allowed to cross the middle, since at this stroke width/opacity they read
// as background texture rather than shapes competing with the text. `preserveAspectRatio="meet"` (not
// "slice") shows the whole canvas on any screen instead of cropping to a center strip, so the same density
// is visible on mobile as on desktop.

function Tower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="var(--sky-deep)" opacity={0.36}>
      <rect x={-5} y={-46} width={10} height={62} rx={2} />
      <path d="M-22,-46 L22,-46 L14,-70 L-14,-70 Z" />
      <rect x={-30} y={16} width={60} height={7} rx={3} />
    </g>
  );
}

function Vor({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.36}>
      <circle r={20} fill="none" stroke="var(--sky-deep)" strokeWidth={2.2} />
      <polygon points="0,-10 9,8 -9,8" fill="var(--sky-deep)" />
    </g>
  );
}

function Plane({ x, y, rotate, s = 1 }: { x: number; y: number; rotate: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`} fill="var(--sky)" opacity={0.38}>
      <path d="M0,-30 C4,-30 5,-22 5,-15 L5,-4 L34,4 L34,10 L5,6 L5,18 L15,24 L15,29 L0,26 L-15,29 L-15,24 L-5,18 L-5,6 L-34,10 L-34,4 L-5,-4 L-5,-15 C-5,-22 -4,-30 0,-30 Z" />
    </g>
  );
}

function Runway({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.3}>
      <rect x={0} y={-13} width={w} height={26} rx={4} fill="var(--sky-deep)" opacity={0.45} />
      <line x1={14} y1={0} x2={w - 14} y2={0} stroke="#fff" strokeWidth={3} strokeDasharray="18 15" />
    </g>
  );
}

// Expanding rings: a radio "ping". Several, staggered, read as continuous signal activity.
function PingRings({ x, y, delay = 0, r = 20 }: { x: number; y: number; delay?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="ping-ring" r={r} style={{ animationDelay: `${delay}s` }} />
      <circle className="ping-ring" r={r} style={{ animationDelay: `${delay + 1.1}s` }} />
      <circle className="ping-ring" r={r} style={{ animationDelay: `${delay + 2.2}s` }} />
    </g>
  );
}

// A rotating radar sweep, built entirely in SVG so it stays aligned with the network under any scaling.
function Radar({ x, y, r, dur = 4, reverse = false }: { x: number; y: number; r: number; dur?: number; reverse?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke="var(--sky-deep)" strokeWidth={1} opacity={0.16} strokeDasharray="3 7" />
      <circle r={r * 0.62} fill="none" stroke="var(--sky-deep)" strokeWidth={1} opacity={0.14} />
      <circle r={r * 0.28} fill="none" stroke="var(--sky-deep)" strokeWidth={1} opacity={0.14} />
      <g className="radar-wedge" style={{ animationDuration: `${dur}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        <path d={`M0,0 L0,${-r} A${r},${r} 0 0 1 ${r * Math.sin(0.85)},${-r * Math.cos(0.85)} Z`} fill="var(--sky)" opacity={0.22} />
      </g>
    </g>
  );
}

// A base connection line (fades in once) plus, for the "active" ones, a second dashed overlay that
// keeps flowing to read as live communication, and a small pulse travelling the same path.
function Link({ d, active = false, delay = 0, speed = 3.4 }: { d: string; active?: boolean; delay?: number; speed?: number }) {
  return (
    <g>
      <path d={d} className="hero-net-line" style={{ animationDelay: `${delay}s` }} />
      {active && (
        <>
          <path d={d} className="hero-net-flow" style={{ animationDuration: `${speed * 0.7}s`, animationDelay: `${delay}s` }} />
          <circle r={3} className="hero-net-pulse" fill="var(--sky)">
            <animateMotion dur={`${speed}s`} repeatCount="indefinite" path={d} rotate="auto" begin={`${delay}s`} />
          </circle>
        </>
      )}
    </g>
  );
}

export default function HeroNetwork() {
  return (
    <svg
      className="hero-network"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {/* mesh: left column <-> right column <-> bottom band, weaving through the middle as thin links only */}
      <Link d="M120,600 C190,540 220,470 210,400" delay={0.05} active speed={3.6} />
      <Link d="M210,400 C230,320 220,240 170,170" delay={0.15} />
      <Link d="M210,400 C360,430 520,440 680,410" delay={0.25} active speed={4} />
      <Link d="M680,410 C840,380 980,390 1120,430" delay={0.35} />
      <Link d="M1120,430 C1180,390 1220,320 1220,240" delay={0.45} active speed={3.4} />
      <Link d="M1220,240 C1260,190 1280,170 1290,150" delay={0.55} />
      <Link d="M120,600 C260,650 420,660 560,630" delay={0.4} active speed={4.2} />
      <Link d="M560,630 C720,600 880,610 1020,650" delay={0.5} />
      <Link d="M1020,650 C1140,680 1230,660 1300,580" delay={0.6} active speed={3.8} />
      <Link d="M120,600 C160,680 220,740 300,780" delay={0.7} />
      <Link d="M300,780 C480,810 640,810 720,790" delay={0.8} active speed={3.5} />
      <Link d="M720,790 C860,810 1000,810 1180,780" delay={0.9} />
      <Link d="M1180,780 C1260,760 1300,700 1300,620" delay={1} active speed={4.1} />
      <Link d="M1300,620 C1300,600 1300,590 1300,580" delay={1.05} />
      <Link d="M210,400 C220,500 260,600 300,650" delay={1.1} />
      <Link d="M1220,240 C1160,290 1140,350 1120,430" delay={1.15} active speed={3.2} />
      <Link d="M170,170 C260,120 340,110 420,140" delay={1.2} />
      <Link d="M1290,150 C1200,110 1120,110 1050,140" delay={1.25} active speed={4.4} />
      <Link d="M420,140 C540,180 640,240 680,320" delay={1.3} />
      <Link d="M1050,140 C940,190 850,250 810,320" delay={1.35} />

      <Runway x={280} y={790} w={880} />
      <Tower x={120} y={600} s={0.85} />
      <Tower x={1300} y={580} s={0.85} />
      <Vor x={210} y={400} s={0.85} />
      <Vor x={1220} y={240} s={0.8} />
      <Vor x={950} y={715} s={0.65} />
      <Plane x={170} y={170} rotate={-55} s={0.6} />
      <Plane x={1290} y={150} rotate={125} s={0.6} />
      <Plane x={680} y={800} rotate={5} s={0.55} />

      <Radar x={210} y={400} r={44} dur={5} />
      <Radar x={1220} y={240} r={38} dur={4.4} reverse />
      <Radar x={120} y={600} r={30} dur={6} reverse />
      <Radar x={1300} y={580} r={32} dur={5.4} />

      <PingRings x={120} y={554} delay={0} r={22} />
      <PingRings x={1300} y={534} delay={0.8} r={22} />
      <PingRings x={210} y={356} delay={1.6} r={18} />
      <PingRings x={1220} y={196} delay={0.4} r={18} />
      <PingRings x={950} y={715} delay={1.2} r={14} />
    </svg>
  );
}
