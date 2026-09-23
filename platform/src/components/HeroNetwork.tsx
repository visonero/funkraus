// Decorative backdrop for the white hero: three signal "nodes" connected by lines, each pulsing like a
// radio transmitter (rotating radar sweep + expanding ping rings) with a pulse of light travelling along
// each connecting line to suggest signals passing between them. Pure SVG/CSS, no client JS, so it degrades
// gracefully (static lines, no motion) if animations are disabled.
//
// Kept deliberately faint (low opacity throughout) and spread across the full height of the viewBox via
// preserveAspectRatio="slice" so it reaches from the top of the hero to the bottom of the device collage
// without ever visually competing with the text or CTAs stacked on top of it.

function Node({ x, y, r = 46 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke="var(--sky-deep)" strokeWidth={1} opacity={0.1} strokeDasharray="3 7" />
      <circle r={r * 0.6} fill="none" stroke="var(--sky-deep)" strokeWidth={1} opacity={0.09} />
      <g className="radar-wedge" style={{ animationDuration: "5s" }}>
        <path d={`M0,0 L0,${-r} A${r},${r} 0 0 1 ${r * Math.sin(0.85)},${-r * Math.cos(0.85)} Z`} fill="var(--sky)" opacity={0.14} />
      </g>
      <circle r={5} fill="var(--sky-deep)" opacity={0.28} />
      <circle className="ping-ring" r={14} />
      <circle className="ping-ring" r={14} style={{ animationDelay: "1.3s" }} />
      <circle className="ping-ring" r={14} style={{ animationDelay: "2.6s" }} />
    </g>
  );
}

function Edge({ d, delay = 0, speed = 4.2 }: { d: string; delay?: number; speed?: number }) {
  return (
    <g>
      <path d={d} className="hero-net-line" style={{ animationDelay: `${delay}s`, opacity: 0.12 }} />
      <path d={d} className="hero-net-flow" style={{ animationDuration: `${speed * 0.7}s`, animationDelay: `${delay}s`, opacity: 0.16 }} />
      <circle r={3} className="hero-net-pulse" fill="var(--sky)" opacity={0.5}>
        <animateMotion dur={`${speed}s`} repeatCount="indefinite" path={d} rotate="auto" begin={`${delay}s`} />
      </circle>
    </g>
  );
}

export default function HeroNetwork() {
  const A = { x: 260, y: 170 };
  const B: { x: number; y: number } = { x: 1180, y: 640 };
  const C = { x: 480, y: 1120 };

  return (
    <svg
      className="hero-network"
      viewBox="0 0 1440 1300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <Edge d={`M${A.x},${A.y} C${(A.x + B.x) / 2},${A.y} ${(A.x + B.x) / 2},${B.y} ${B.x},${B.y}`} delay={0.1} speed={4.4} />
      <Edge d={`M${B.x},${B.y} C${(B.x + C.x) / 2},${B.y} ${(B.x + C.x) / 2},${C.y} ${C.x},${C.y}`} delay={0.8} speed={4.8} />
      <Edge d={`M${C.x},${C.y} C${(C.x + A.x) / 2},${C.y} ${(C.x + A.x) / 2},${A.y} ${A.x},${A.y}`} delay={1.5} speed={5.2} />

      <Node x={A.x} y={A.y} r={44} />
      <Node x={B.x} y={B.y} r={56} />
      <Node x={C.x} y={C.y} r={48} />
    </svg>
  );
}
