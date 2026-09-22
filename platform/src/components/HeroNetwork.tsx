// Decorative backdrop for the white hero: a faded blue network connecting a tower, a runway, a VOR
// beacon and an aircraft, with pulses running along the lines and light radio-wave rings. Pure SVG/CSS,
// no client JS, so it degrades gracefully (static lines) if animations are disabled.

function Tower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="var(--sky-deep)" opacity={0.4}>
      <rect x={-5} y={-46} width={10} height={62} rx={2} />
      <path d="M-22,-46 L22,-46 L14,-70 L-14,-70 Z" />
      <rect x={-30} y={16} width={60} height={7} rx={3} />
    </g>
  );
}

function Vor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.4}>
      <circle r={20} fill="none" stroke="var(--sky-deep)" strokeWidth={2.5} />
      <polygon points="0,-10 9,8 -9,8" fill="var(--sky-deep)" />
    </g>
  );
}

function Plane({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="var(--sky)" opacity={0.42}>
      <path d="M0,-30 C4,-30 5,-22 5,-15 L5,-4 L34,4 L34,10 L5,6 L5,18 L15,24 L15,29 L0,26 L-15,29 L-15,24 L-5,18 L-5,6 L-34,10 L-34,4 L-5,-4 L-5,-15 C-5,-22 -4,-30 0,-30 Z" />
    </g>
  );
}

function Runway({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.35}>
      <rect x={0} y={-13} width={w} height={26} rx={4} fill="var(--sky-deep)" opacity={0.5} />
      <line x1={14} y1={0} x2={w - 14} y2={0} stroke="#fff" strokeWidth={3} strokeDasharray="20 16" />
    </g>
  );
}

function PingRings({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="ping-ring" r={22} style={{ animationDelay: `${delay}s` }} />
      <circle className="ping-ring" r={22} style={{ animationDelay: `${delay + 1.3}s` }} />
    </g>
  );
}

// A base connection line (fades in once) plus, for the "active" ones, a second dashed overlay that
// keeps flowing to read as live communication, and a small pulse travelling the same path.
function Link({ d, active = false, delay = 0 }: { d: string; active?: boolean; delay?: number }) {
  return (
    <g>
      <path d={d} className="hero-net-line" style={{ animationDelay: `${delay}s` }} />
      {active && (
        <>
          <path d={d} className="hero-net-flow" />
          <circle r={3.4} className="hero-net-pulse" fill="var(--sky)">
            <animateMotion dur="4.5s" repeatCount="indefinite" path={d} rotate="auto" begin={`${delay}s`} />
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
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <Link d="M120,610 C260,520 300,420 250,300" delay={0.1} active />
      <Link d="M250,300 C420,230 520,260 560,150" delay={0.3} />
      <Link d="M250,300 C420,340 520,380 640,420" delay={0.5} active />
      <Link d="M640,420 C760,460 900,470 1010,430" delay={0.7} />
      <Link d="M1010,430 C1110,390 1200,320 1230,240" delay={0.9} active />
      <Link d="M120,610 C260,700 420,760 620,780" delay={0.4} />
      <Link d="M620,780 C820,800 1000,790 1180,730" delay={0.6} />
      <Link d="M1180,730 C1250,690 1290,630 1290,580" delay={0.8} />
      <Link d="M250,300 C280,420 260,520 120,610" delay={1.1} />
      <Link d="M1230,240 C1270,340 1290,460 1290,580" delay={1.2} active />

      <Runway x={470} y={780} w={520} />
      <Tower x={120} y={610} />
      <Tower x={1290} y={580} />
      <Vor x={250} y={300} />
      <Vor x={1230} y={240} />
      <Plane x={1010} y={430} rotate={-35} />

      <PingRings x={120} y={562} delay={0} />
      <PingRings x={1290} y={532} delay={0.6} />
      <PingRings x={250} y={300} delay={1.2} />
    </svg>
  );
}
