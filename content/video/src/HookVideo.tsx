// Scene kinds for hook-video.json (every item is revealed by its own [[n]] cue marker in the narration text;
// scripts/sync-check.mjs blocks the render if a marker is missing):
//   headline  overview words as tiles                    transform  tiles with a short title and a sub line
//   grid      many small tiles (alphabet, digits)         layers     stacked bands, top to bottom
//   dialog    radio conversation as speech bubbles        glyphs     drawn pictograms (signals, chart symbols, cloud cover)
//   diagram   animated drawing + numbered steps (diagrams*.tsx: circuit, airfield, VOR, QDM/QDR, ...)
//   photo     real photograph + steps; credit line is mandatory (public domain / CC BY only, see assets/photos/credits.json)
//   outro     closing pills
// Use diagram / glyphs / dialog / photo whenever the narration explains something spatial, procedural or visual.
// All text is fitted into its box (fit.ts); preview a scene without audio: scripts/preview-visual.mjs.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DIAGRAMS, type DiagramName } from "./diagrams";
import { fitText, measure } from "./fit";
import { GLYPHS, type GlyphName } from "./glyphs";
import { Defs, Plane, toneColor, type Tone } from "./svgkit";
import { colors, jakarta, poppins } from "./theme";

type Tile2 = { top: string; bottom: string; tone?: Tone };
export type Step = { label: string; sub?: string; tone?: Tone };
export type DialogLine = { who: "pilot" | "tower"; text: string; note?: string; tone?: Tone };
export type GlyphItem = { glyph: GlyphName; top: string; bottom: string; tone?: Tone; flash?: boolean };
export type Visual =
  | { kind: "headline"; headline: string; highlight?: string; tiles: string[]; wave?: boolean }
  | { kind: "grid"; headline: string; highlight?: string; items: Tile2[]; columns?: number }
  | { kind: "transform"; headline: string; highlight?: string; plate?: string; tiles: Tile2[] }
  | { kind: "layers"; headline: string; highlight?: string; layers: { label: string; sub: string }[] }
  | { kind: "dialog"; headline: string; highlight?: string; lines: DialogLine[] }
  | { kind: "glyphs"; headline: string; highlight?: string; items: GlyphItem[] }
  | { kind: "diagram"; diagram: DiagramName; headline: string; highlight?: string; steps: Step[]; params?: Record<string, number | string | boolean>; credit?: string }
  | { kind: "photo"; image: string; headline: string; highlight?: string; steps: Step[]; credit: string; focus?: string; pad?: number }
  | { kind: "outro"; pills: string[] };

type Sentence = { text: string; start: number; end: number };
type Scene = { id: string; start: number; end: number; visual: Visual; cues?: (number | null)[]; sentences?: Sentence[]; subtitles?: boolean };

export type HookVideoProps = {
  audio: string;
  totalSeconds: number;
  scenes: Scene[];
  lessonLabel: string;
  lessonTitle: string;
  subtitles?: boolean;
};

const topMax = (text: string) => (text.length <= 2 ? 96 : text.length <= 5 ? 72 : text.length <= 8 ? 60 : 52);

function useReveal(startFrame: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
}

// Frame at which item `index` of a scene should appear: exactly when the voice reaches its cue word.
// Items without their own cue follow the last known cue at a steady rhythm; without any cues we spread them out.
function useCueFrame(cues: Scene["cues"], index: number, fallbackFrame: number) {
  const { fps } = useVideoConfig();
  if (!cues) return fallbackFrame;
  for (let j = index; j >= 0; j--) {
    const cue = cues[j];
    if (cue !== undefined && cue !== null) return Math.max(0, Math.round((cue - 0.12 + (index - j) * 0.45) * fps));
  }
  return fallbackFrame;
}

function Background() {
  const frame = useCurrentFrame();
  const drift = (speed: number, amp: number) => Math.sin(frame / speed) * amp;
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <div style={{ position: "absolute", width: 900, height: 900, left: -200 + drift(90, 40), top: -320 + drift(70, 30), borderRadius: "50%", background: colors.sky, opacity: 0.16, filter: "blur(120px)" }} />
      <div style={{ position: "absolute", width: 800, height: 800, right: -220 + drift(80, 40), bottom: -300 + drift(60, 30), borderRadius: "50%", background: colors.sky2, opacity: 0.18, filter: "blur(120px)" }} />
    </AbsoluteFill>
  );
}

function Logo() {
  return (
    <div style={{ position: "absolute", left: 72, top: 56, display: "flex", alignItems: "center", gap: 16 }}>
      <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
        <circle cx="10" cy="30" r="3.4" fill="#2f9bea" />
        <path d="M16 24 A11 11 0 0 1 27 13" stroke="#2f9bea" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M13.5 27.2 A15.5 15.5 0 0 1 29.2 11.5" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path d="M11 29.8 A19.8 19.8 0 0 1 31.8 9" stroke="#2f9bea" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: poppins, fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em", color: colors.text }}>funkraus</span>
    </div>
  );
}

function SceneShell({ duration, children }: { duration: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>{children}</AbsoluteFill>;
}

// Text that is measured first and drawn on explicit lines, so it can never leave its box.
function Fit({ text, family, weight, w, h, max, min, lines = 2, color, lh = 1.15, align = "center", style }: { text: string; family: string; weight: number; w: number; h: number; max: number; min: number; lines?: number; color: string; lh?: number; align?: CSSProperties["textAlign"]; style?: CSSProperties }) {
  const f = fitText({ text, family, weight, maxWidth: w, maxHeight: h, maxSize: max, minSize: min, maxLines: lines, lineHeight: lh });
  return (
    <div style={{ fontFamily: family, fontWeight: weight, fontSize: f.size, lineHeight: lh, color, textAlign: align, whiteSpace: "nowrap", ...style }}>
      {f.lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}

// Shows the sentence currently being spoken at the bottom of the screen.
function Subtitles({ sentences }: { sentences?: Sentence[] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!sentences?.length) return null;
  const t = frame / fps;
  const current = sentences.find((s) => t >= s.start - 0.1 && t <= s.end + 0.3);
  if (!current) return null;
  const opacity = interpolate(t, [current.start - 0.1, current.start + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = fitText({ text: current.text, family: jakarta, weight: 600, maxWidth: 1500, maxHeight: 150, maxSize: 36, minSize: 30, maxLines: 3, lineHeight: 1.35 });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ padding: "16px 34px", borderRadius: 24, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(30,58,95,0.1)", boxShadow: "0 18px 40px -22px rgba(30,58,95,0.35)", fontFamily: jakarta, fontWeight: 600, fontSize: f.size, lineHeight: 1.35, color: colors.text, textAlign: "center", whiteSpace: "nowrap" }}>
        {f.lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function Credit({ text }: { text?: string }) {
  if (!text) return null;
  return <div style={{ position: "absolute", right: 48, bottom: 20, fontFamily: jakarta, fontWeight: 500, fontSize: 20, color: colors.textDim, maxWidth: 1200, textAlign: "right" }}>{text}</div>;
}

const caption: CSSProperties = { fontFamily: poppins, fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", textAlign: "center" };

function Tile({ children, size, style }: { children: ReactNode; size: [number, number]; style?: CSSProperties }) {
  return (
    <div style={{ width: size[0], height: size[1], borderRadius: 32, background: colors.card, border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 30px 70px -30px rgba(30,58,95,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...style }}>
      {children}
    </div>
  );
}

function Wave() {
  const frame = useCurrentFrame();
  const points = Array.from({ length: 96 }, (_, i) => {
    const noise = Math.sin(i * 12.9898 + Math.floor(frame / 2) * 4.1414) * 43758.5453;
    const jitter = (noise - Math.floor(noise) - 0.5) * 2;
    return `${(i / 95) * 1600},${60 + jitter * 42 * Math.sin((i / 95) * Math.PI)}`;
  });
  return (
    <svg width="1600" height="120" style={{ position: "absolute", bottom: 210 }}>
      <polyline points={points.join(" ")} fill="none" stroke={colors.sky} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

function Headline({ headline, highlight, style, size = 64 }: { headline: string; highlight?: string; style?: CSSProperties; size?: number }) {
  const reveal = useReveal(2);
  const text = highlight ? `${headline} ${highlight}` : headline;
  const f = fitText({ text, family: poppins, weight: 700, maxWidth: 1700, maxHeight: size * 1.3, maxSize: size, minSize: 34, maxLines: 1, lineHeight: 1.2, letterSpacing: "-0.02em" });
  return (
    <div style={{ ...caption, fontSize: f.size, lineHeight: 1.2, whiteSpace: "nowrap", opacity: reveal, transform: `translateY(${(1 - reveal) * 24}px)`, ...style }}>
      {headline}
      {highlight && <> <span style={{ color: colors.skyDeep }}>{highlight}</span></>}
    </div>
  );
}

type SceneProps<K extends Visual["kind"]> = { duration: number; visual: Extract<Visual, { kind: K }>; cues?: Scene["cues"] };

function HeadlineScene({ duration, visual, cues }: SceneProps<"headline">) {
  const frame = useCurrentFrame();
  const count = visual.tiles.length;
  const maxW = count ? Math.min(560, Math.floor((1720 - (count - 1) * 44) / count)) : 0;
  const layout = visual.tiles.map((text) => {
    const big = text.length <= 2;
    const f = fitText({ text, family: poppins, weight: 800, maxWidth: maxW - 64, maxHeight: big ? 190 : 210, maxSize: big ? 170 : 110, minSize: 40, maxLines: 2, lineHeight: 1.05 });
    const widest = Math.max(...f.lines.map((l) => measure(l, poppins, 800, f.size)));
    return { f, width: Math.min(maxW, Math.max(250, Math.ceil(widest) + 90)) };
  });
  const tileH = Math.max(250, ...layout.map((l) => l.f.height + 90));
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: count ? 70 : 0 }} />
      <div style={{ display: "flex", gap: 44 }}>
        {visual.tiles.map((text, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * 0.16))));
          const wobble = Math.sin(frame / 5 + i * 1.7) * 2.4 * s;
          return (
            <Tile key={`${text}-${i}`} size={[layout[i].width, tileH]} style={{ transform: `scale(${0.6 + s * 0.4}) rotate(${wobble}deg)`, opacity: s }}>
              <div style={{ fontFamily: poppins, fontWeight: 800, fontSize: layout[i].f.size, color: colors.skyDeep, lineHeight: 1.05, textAlign: "center", whiteSpace: "nowrap" }}>
                {layout[i].f.lines.map((l, k) => (
                  <div key={k}>{l}</div>
                ))}
              </div>
            </Tile>
          );
        })}
      </div>
      {visual.wave && <Wave />}
    </SceneShell>
  );
}

function GridScene({ duration, visual, cues }: SceneProps<"grid">) {
  const columns = visual.columns ?? 9;
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 40 }} size={58} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 184px)`, gap: 16 }}>
        {visual.items.map((item, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * 0.08 + i * ((duration * 0.7) / visual.items.length))));
          return (
            <Tile key={`${item.top}-${i}`} size={[184, 124]} style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${0.85 + s * 0.15})`, borderRadius: 24 }}>
              <Fit text={item.top} family={poppins} weight={800} w={158} h={56} max={50} min={26} lines={1} lh={1} color={colors.skyDeep} />
              <Fit text={item.bottom} family={jakarta} weight={600} w={164} h={30} max={24} min={15} lines={1} lh={1.1} color={colors.text} style={{ marginTop: 6 }} />
            </Tile>
          );
        })}
      </div>
    </SceneShell>
  );
}

function TransformScene({ duration, visual, cues }: SceneProps<"transform">) {
  const plate = useReveal(2);
  const count = visual.tiles.length;
  const width = Math.min(Math.floor((1720 - (count - 1) * 28) / count), 560);
  const inner = width - 56;
  const layout = visual.tiles.map((t) => ({
    top: fitText({ text: t.top, family: poppins, weight: 800, maxWidth: inner, maxHeight: 150, maxSize: topMax(t.top), minSize: 26, maxLines: 2, lineHeight: 1.05 }),
    bottom: fitText({ text: t.bottom, family: jakarta, weight: 600, maxWidth: inner, maxHeight: 132, maxSize: 34, minSize: 20, maxLines: 3, lineHeight: 1.2 }),
  }));
  const tileH = Math.min(440, Math.max(240, ...layout.map((l) => l.top.height + l.bottom.height + 14 + 76)));
  const plateFit = visual.plate ? fitText({ text: visual.plate, family: poppins, weight: 800, maxWidth: 1500, maxHeight: 130, maxSize: 110, minSize: 60, maxLines: 1, lineHeight: 1.1, letterSpacing: "0.06em" }) : null;
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 30 }} size={56} />
      {visual.plate && plateFit && (
        <div style={{ fontFamily: poppins, fontWeight: 800, fontSize: plateFit.size, letterSpacing: "0.06em", color: colors.text, padding: "10px 60px", borderRadius: 24, background: "#fff", border: `5px solid ${colors.text}`, opacity: plate, marginBottom: 56, whiteSpace: "nowrap" }}>
          {visual.plate}
        </div>
      )}
      <div style={{ display: "flex", gap: 28 }}>
        {visual.tiles.map((tile, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.22 + i * (0.6 / count)))));
          const l = layout[i];
          return (
            <Tile key={`${tile.top}-${i}`} size={[width, tileH]} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, textAlign: "center", borderTop: tile.tone ? `10px solid ${toneColor(tile.tone)}` : undefined }}>
              <div style={{ fontFamily: poppins, fontWeight: 800, fontSize: l.top.size, color: toneColor(tile.tone, colors.skyDeep), lineHeight: 1.05, whiteSpace: "nowrap" }}>
                {l.top.lines.map((line, k) => (
                  <div key={k}>{line}</div>
                ))}
              </div>
              <div style={{ fontFamily: jakarta, fontWeight: 600, fontSize: l.bottom.size, color: colors.text, marginTop: 14, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                {l.bottom.lines.map((line, k) => (
                  <div key={k}>{line}</div>
                ))}
              </div>
            </Tile>
          );
        })}
      </div>
    </SceneShell>
  );
}

function LayersScene({ duration, visual, cues }: SceneProps<"layers">) {
  const count = visual.layers.length;
  const fills = ["rgba(28,127,208,0.92)", "rgba(47,155,234,0.8)", "rgba(34,211,238,0.6)", "rgba(160,226,242,0.75)"];
  const textColors = ["#fff", "#fff", colors.text, colors.text];
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 44 }} size={58} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 1400 }}>
        {visual.layers.map((layer, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * (0.6 / count)))));
          const color = textColors[Math.min(i, textColors.length - 1)];
          return (
            <div key={layer.label} style={{ height: 140, borderRadius: 28, background: fills[Math.min(i, fills.length - 1)], display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px", opacity: s, transform: `translateY(${(1 - s) * 40}px)`, boxShadow: "0 26px 60px -30px rgba(30,58,95,0.4)" }}>
              <Fit text={layer.label} family={poppins} weight={800} w={600} h={70} max={54} min={28} lines={1} lh={1.1} color={color} align="left" />
              <Fit text={layer.sub} family={jakarta} weight={600} w={620} h={80} max={30} min={18} lines={2} lh={1.2} color={color} align="right" />
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

function AvatarIcon({ who }: { who: "pilot" | "tower" }) {
  return (
    <svg width={76} height={76} viewBox="0 0 76 76">
      <circle cx={38} cy={38} r={36} fill={who === "pilot" ? colors.skyDeep : "#3b4a5a"} />
      {who === "pilot" ? (
        <g transform="translate(38 40) scale(0.55)">
          <Plane x={0} y={0} fill="#fff" />
        </g>
      ) : (
        <g fill="#fff">
          <rect x={33} y={34} width={10} height={24} />
          <path d="M24 34 L52 34 L48 22 L28 22 Z" />
          <rect x={30} y={14} width={16} height={8} rx={2} />
        </g>
      )}
    </svg>
  );
}

function DialogScene({ duration, visual, cues }: SceneProps<"dialog">) {
  const count = visual.lines.length;
  const rowH = Math.min(150, Math.floor((640 - (count - 1) * 22) / count));
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 34 }} size={56} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 1640 }}>
        {visual.lines.map((line, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * (0.6 / count)))));
          const pilot = line.who === "pilot";
          const accent = toneColor(line.tone, pilot ? colors.skyDeep : "#3b4a5a");
          const noteW = line.note ? 330 : 0;
          return (
            <div key={i} style={{ display: "flex", flexDirection: pilot ? "row-reverse" : "row", alignItems: "center", gap: 20, opacity: Math.min(1, s * 1.4), transform: `translateX(${(1 - s) * (pilot ? 60 : -60)}px)` }}>
              <AvatarIcon who={line.who} />
              <div style={{ height: rowH, minWidth: 420, maxWidth: 1240, padding: "0 40px", borderRadius: 30, background: pilot ? "rgba(224,242,254,0.95)" : "rgba(255,255,255,0.95)", border: `3px solid ${accent}`, boxShadow: "0 24px 50px -30px rgba(30,58,95,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
                <Fit text={line.text} family={poppins} weight={700} w={1160 - noteW} h={rowH - 24} max={46} min={24} lines={2} lh={1.15} color={line.tone ? accent : colors.text} align={pilot ? "right" : "left"} />
                {line.note && <Fit text={line.note} family={jakarta} weight={600} w={noteW - 30} h={rowH - 30} max={26} min={17} lines={3} lh={1.2} color={colors.textDim} align="left" />}
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

function GlyphScene({ duration, visual, cues }: SceneProps<"glyphs">) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = visual.items.length;
  const width = Math.min(340, Math.floor((1740 - (count - 1) * 24) / count));
  const inner = width - 36;
  const layout = visual.items.map((item) => ({
    top: fitText({ text: item.top, family: poppins, weight: 800, maxWidth: inner, maxHeight: 96, maxSize: 44, minSize: 24, maxLines: 2, lineHeight: 1.1 }),
    bottom: fitText({ text: item.bottom, family: jakarta, weight: 600, maxWidth: inner, maxHeight: 108, maxSize: 30, minSize: 19, maxLines: 3, lineHeight: 1.2 }),
  }));
  const glyphSize = Math.min(230, width - 60);
  const cardH = Math.min(520, glyphSize + 26 + 14 + Math.max(...layout.map((l) => l.top.height)) + 10 + Math.max(...layout.map((l) => l.bottom.height)) + 44);
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 34 }} size={56} />
      <div style={{ display: "flex", gap: 24 }}>
        {visual.items.map((item, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * (0.6 / count)))));
          const l = layout[i];
          return (
            <Tile key={i} size={[width, cardH]} style={{ justifyContent: "flex-start", padding: "26px 18px 0", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, borderTop: item.tone ? `10px solid ${toneColor(item.tone)}` : undefined }}>
              <svg width={glyphSize} height={glyphSize} viewBox="0 0 220 220">
                {GLYPHS[item.glyph]({ frame, fps, flash: item.flash })}
              </svg>
              <div style={{ fontFamily: poppins, fontWeight: 800, fontSize: l.top.size, color: toneColor(item.tone, colors.skyDeep), lineHeight: 1.1, textAlign: "center", marginTop: 14, whiteSpace: "nowrap" }}>
                {l.top.lines.map((line, k) => (
                  <div key={k}>{line}</div>
                ))}
              </div>
              <div style={{ fontFamily: jakarta, fontWeight: 600, fontSize: l.bottom.size, color: colors.text, lineHeight: 1.2, textAlign: "center", marginTop: 10, whiteSpace: "nowrap" }}>
                {l.bottom.lines.map((line, k) => (
                  <div key={k}>{line}</div>
                ))}
              </div>
            </Tile>
          );
        })}
      </div>
    </SceneShell>
  );
}

const PANEL_W = 1040;
const PANEL_H = 640;

// Panel on the left (drawn diagram or photo), numbered list of steps on the right. Step i lights up on its cue word.
function SplitScene({ duration, cues, headline, highlight, steps, credit, panel }: { duration: number; cues?: Scene["cues"]; headline: string; highlight?: string; steps: Step[]; credit?: string; panel: (state: { since: number[]; p: number[]; active: number; frame: number; fps: number }) => ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = steps.length;
  const starts = steps.map((_, i) => useCueFrame(cues, i, Math.round(duration * (0.15 + i * (0.6 / n)))));
  const since = starts.map((s) => (frame - s) / fps);
  const p = starts.map((s) => useReveal(s));
  const active = since.reduce((last, s, i) => (s >= 0 ? i : last), -1);
  const chipH = Math.min(150, Math.floor((PANEL_H - (n - 1) * 16) / n));
  const chipW = 1720 - PANEL_W - 36;
  return (
    <SceneShell duration={duration}>
      <Headline headline={headline} highlight={highlight} style={{ marginBottom: 26 }} size={52} />
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
        <div style={{ width: PANEL_W, height: PANEL_H, borderRadius: 36, background: "rgba(255,255,255,0.86)", border: "2px solid rgba(255,255,255,0.95)", boxShadow: "0 30px 70px -34px rgba(30,58,95,0.4)", overflow: "hidden", position: "relative" }}>
          {panel({ since, p, active, frame, fps })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: chipW }}>
          {steps.map((step, i) => {
            const isActive = i === active;
            const accent = toneColor(step.tone, colors.skyDeep);
            return (
              <div key={i} style={{ height: chipH, borderRadius: 28, background: isActive ? "#fff" : "rgba(255,255,255,0.7)", border: `3px solid ${isActive ? accent : "rgba(30,58,95,0.10)"}`, boxShadow: isActive ? "0 22px 50px -26px rgba(30,58,95,0.5)" : "none", display: "flex", alignItems: "center", gap: 22, padding: "0 26px", opacity: Math.min(1, p[i] * 1.5), transform: `translateX(${(1 - p[i]) * 50}px)` }}>
                <div style={{ flex: "0 0 52px", width: 52, height: 52, borderRadius: 26, background: accent, color: "#fff", fontFamily: poppins, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                  <Fit text={step.label} family={poppins} weight={800} w={chipW - 52 - 22 - 52 - 26} h={chipH * 0.5} max={36} min={22} lines={2} lh={1.08} color={accent} align="left" />
                  {step.sub && <Fit text={step.sub} family={jakarta} weight={600} w={chipW - 52 - 22 - 52 - 26} h={chipH * 0.42} max={26} min={17} lines={2} lh={1.2} color={colors.text} align="left" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Credit text={credit} />
    </SceneShell>
  );
}

function DiagramScene({ duration, visual, cues }: SceneProps<"diagram">) {
  const Diagram = DIAGRAMS[visual.diagram];
  return (
    <SplitScene
      duration={duration}
      cues={cues}
      headline={visual.headline}
      highlight={visual.highlight}
      steps={visual.steps}
      credit={visual.credit}
      panel={(state) => (
        <svg width={PANEL_W} height={PANEL_H} viewBox={`0 0 ${PANEL_W} ${PANEL_H}`}>
          <Defs />
          <Diagram since={state.since} p={state.p} active={state.active} frame={state.frame} fps={state.fps} params={visual.params ?? {}} />
        </svg>
      )}
    />
  );
}

// A real photograph (public domain or with attribution) instead of a drawing; the source is always credited.
function PhotoScene({ duration, visual, cues }: SceneProps<"photo">) {
  return (
    <SplitScene
      duration={duration}
      cues={cues}
      headline={visual.headline}
      highlight={visual.highlight}
      steps={visual.steps}
      credit={visual.credit}
      panel={(state) =>
        visual.pad ? (
          // Screenshot with breathing room: the whole image stays visible (contain) inside a padded frame.
          <div style={{ width: PANEL_W, height: PANEL_H, padding: visual.pad, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(`photos/${visual.image}`)} style={{ width: PANEL_W - visual.pad * 2, height: PANEL_H - visual.pad * 2, objectFit: "contain", borderRadius: 18, transform: `scale(${1 + Math.min(0.03, state.frame / (duration * 24))})` }} />
          </div>
        ) : (
          <Img src={staticFile(`photos/${visual.image}`)} style={{ width: PANEL_W, height: PANEL_H, objectFit: "cover", objectPosition: visual.focus ?? "50% 50%", transform: `scale(${1 + Math.min(0.06, state.frame / (duration * 12))})` }} />
        )
      }
    />
  );
}

function OutroScene({ duration, visual, cues, label, title }: SceneProps<"outro"> & { label: string; title: string }) {
  const a = useReveal(4);
  const pillFont = (() => {
    const total = (size: number) => visual.pills.reduce((sum, p) => sum + measure(p, poppins, 700, size) + 88 + 24, -24);
    let size = 40;
    while (size > 24 && total(size) > 1700) size -= 2;
    return size;
  })();
  return (
    <SceneShell duration={duration}>
      <div style={{ fontFamily: poppins, fontWeight: 700, fontSize: 34, color: colors.skyDeep, letterSpacing: "0.1em", textTransform: "uppercase", opacity: a }}>{label}</div>
      <div style={{ fontFamily: poppins, fontWeight: 800, fontSize: title.length > 26 ? 84 : 116, marginTop: 18, letterSpacing: "-0.03em", textAlign: "center", maxWidth: 1700, lineHeight: 1.25, paddingBottom: 10, background: `linear-gradient(100deg, ${colors.sky}, ${colors.sky2})`, WebkitBackgroundClip: "text", color: "transparent", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 60 }}>
        {visual.pills.map((pill, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.3 + i * 0.16))));
          return (
            <div key={pill} style={{ fontFamily: poppins, fontWeight: 700, fontSize: pillFont, color: "#fff", padding: "18px 44px", borderRadius: 999, background: `linear-gradient(100deg, ${colors.sky}, ${colors.skyDeep})`, opacity: s, transform: `translateY(${(1 - s) * 30}px)`, whiteSpace: "nowrap" }}>
              {pill}
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

export const HookVideo = ({ audio, totalSeconds, scenes, lessonLabel, lessonTitle, subtitles = true }: HookVideoProps) => {
  const { fps } = useVideoConfig();
  const endFrame = Math.ceil((totalSeconds + 0.8) * fps);

  return (
    <AbsoluteFill style={{ fontFamily: jakarta }}>
      <Background />
      <Logo />
      <Audio src={staticFile(audio)} />
      {scenes.map((scene, i) => {
        const from = i === 0 ? 0 : Math.round(scene.start * fps);
        const to = i === scenes.length - 1 ? endFrame : Math.round(scenes[i + 1].start * fps);
        const duration = to - from;
        const { visual, cues } = scene;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            {visual.kind === "headline" && <HeadlineScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "grid" && <GridScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "transform" && <TransformScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "layers" && <LayersScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "dialog" && <DialogScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "glyphs" && <GlyphScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "diagram" && <DiagramScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "photo" && <PhotoScene duration={duration} visual={visual} cues={cues} />}
            {visual.kind === "outro" && <OutroScene duration={duration} visual={visual} cues={cues} label={lessonLabel} title={lessonTitle} />}
            {subtitles && scene.subtitles !== false && <Subtitles sentences={scene.sentences} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

