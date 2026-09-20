import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, jakarta, poppins } from "./theme";

type Tile2 = { top: string; bottom: string };
export type Visual =
  | { kind: "headline"; headline: string; highlight?: string; tiles: string[]; wave?: boolean }
  | { kind: "grid"; headline: string; highlight?: string; items: Tile2[]; columns?: number }
  | { kind: "transform"; headline: string; highlight?: string; plate?: string; tiles: Tile2[] }
  | { kind: "layers"; headline: string; highlight?: string; layers: { label: string; sub: string }[] }
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

const topFontSize = (text: string) => (text.length <= 2 ? 96 : text.length <= 5 ? 72 : text.length <= 8 ? 54 : text.length <= 12 ? 44 : 36);
const bottomFontSize = (text: string) => (text.length <= 9 ? 36 : text.length <= 14 ? 30 : 26);

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
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -200 + drift(90, 40),
          top: -320 + drift(70, 30),
          borderRadius: "50%",
          background: colors.sky,
          opacity: 0.16,
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          right: -220 + drift(80, 40),
          bottom: -300 + drift(60, 30),
          borderRadius: "50%",
          background: colors.sky2,
          opacity: 0.18,
          filter: "blur(120px)",
        }}
      />
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
  const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>{children}</AbsoluteFill>;
}

// Shows the sentence currently being spoken at the bottom of the screen.
function Subtitles({ sentences }: { sentences?: Sentence[] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!sentences?.length) return null;
  const t = frame / fps;
  const current = sentences.find((s) => t >= s.start - 0.1 && t <= s.end + 0.3);
  if (!current) return null;
  const fade = interpolate(t, [current.start - 0.1, current.start + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: fade }}>
      <div
        style={{
          maxWidth: 1560,
          padding: "16px 34px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(30,58,95,0.1)",
          boxShadow: "0 18px 40px -22px rgba(30,58,95,0.35)",
          fontFamily: jakarta,
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.35,
          color: colors.text,
          textAlign: "center",
        }}
      >
        {current.text}
      </div>
    </div>
  );
}

const caption: CSSProperties = {
  fontFamily: poppins,
  fontWeight: 700,
  fontSize: 64,
  color: colors.text,
  letterSpacing: "-0.02em",
  textAlign: "center",
};

function Tile({ children, size, style }: { children: ReactNode; size: [number, number]; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: size[0],
        height: size[1],
        borderRadius: 32,
        background: colors.card,
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 30px 70px -30px rgba(30,58,95,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
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

function Headline({ headline, highlight, style }: { headline: string; highlight?: string; style?: CSSProperties }) {
  const reveal = useReveal(2);
  return (
    <div style={{ ...caption, opacity: reveal, transform: `translateY(${(1 - reveal) * 24}px)`, ...style }}>
      {headline}
      {highlight && <> <span style={{ color: colors.skyDeep }}>{highlight}</span></>}
    </div>
  );
}

type SceneProps<K extends Visual["kind"]> = { duration: number; visual: Extract<Visual, { kind: K }>; cues?: Scene["cues"] };

function HeadlineScene({ duration, visual, cues }: SceneProps<"headline">) {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 70 }} />
      <div style={{ display: "flex", gap: 44 }}>
        {visual.tiles.map((text, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * 0.16))));
          const wobble = Math.sin(frame / 5 + i * 1.7) * 2.4 * s;
          const width = text.length <= 2 ? 250 : text.length <= 5 ? 360 : 520;
          return (
            <Tile key={`${text}-${i}`} size={[width, 250]} style={{ transform: `scale(${0.6 + s * 0.4}) rotate(${wobble}deg)`, opacity: s }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: text.length <= 2 ? 170 : 110, color: colors.skyDeep, lineHeight: 1 }}>{text}</span>
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
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 40, fontSize: 58 }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 184px)`, gap: 16 }}>
        {visual.items.map((item, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * 0.08 + i * ((duration * 0.7) / visual.items.length))));
          return (
            <Tile key={`${item.top}-${i}`} size={[184, 124]} style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${0.85 + s * 0.15})`, borderRadius: 24 }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 50, color: colors.skyDeep, lineHeight: 1 }}>{item.top}</span>
              <span style={{ fontFamily: jakarta, fontWeight: 600, fontSize: 24, color: colors.text, marginTop: 6 }}>{item.bottom}</span>
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
  const longestTop = Math.max(...visual.tiles.map((t) => t.top.length));
  const width = Math.min(Math.floor((1720 - (count - 1) * 28) / count), Math.max(280, longestTop * 30 + 60));
  return (
    <SceneShell duration={duration}>
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 30, fontSize: 56 }} />
      {visual.plate && (
        <div
          style={{
            fontFamily: poppins,
            fontWeight: 800,
            fontSize: 110,
            letterSpacing: "0.06em",
            color: colors.text,
            padding: "10px 60px",
            borderRadius: 24,
            background: "#fff",
            border: `5px solid ${colors.text}`,
            opacity: plate,
            marginBottom: 64,
          }}
        >
          {visual.plate}
        </div>
      )}
      <div style={{ display: "flex", gap: 28 }}>
        {visual.tiles.map((tile, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.22 + i * (0.6 / count)))));
          return (
            <Tile key={`${tile.top}-${i}`} size={[width, 240]} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, padding: "0 12px", textAlign: "center" }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: topFontSize(tile.top), color: colors.skyDeep, lineHeight: 1 }}>{tile.top}</span>
              <span style={{ fontFamily: jakarta, fontWeight: 600, fontSize: bottomFontSize(tile.bottom), color: colors.text, marginTop: 14 }}>{tile.bottom}</span>
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
      <Headline headline={visual.headline} highlight={visual.highlight} style={{ marginBottom: 44, fontSize: 58 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 1400 }}>
        {visual.layers.map((layer, i) => {
          // Layers are listed top to bottom, in the order the narrator describes them.
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.15 + i * (0.6 / count)))));
          return (
            <div
              key={layer.label}
              style={{
                height: 140,
                borderRadius: 28,
                background: fills[Math.min(i, fills.length - 1)],
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 56px",
                opacity: s,
                transform: `translateY(${(1 - s) * 40}px)`,
                boxShadow: "0 26px 60px -30px rgba(30,58,95,0.4)",
              }}
            >
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 54, color: textColors[Math.min(i, textColors.length - 1)] }}>{layer.label}</span>
              <span style={{ fontFamily: jakarta, fontWeight: 600, fontSize: 30, color: textColors[Math.min(i, textColors.length - 1)], opacity: 0.95 }}>{layer.sub}</span>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
}

function OutroScene({ duration, visual, cues, label, title }: SceneProps<"outro"> & { label: string; title: string }) {
  const a = useReveal(4);
  return (
    <SceneShell duration={duration}>
      <div style={{ fontFamily: poppins, fontWeight: 700, fontSize: 34, color: colors.skyDeep, letterSpacing: "0.1em", textTransform: "uppercase", opacity: a }}>{label}</div>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: title.length > 26 ? 84 : 116,
          marginTop: 18,
          letterSpacing: "-0.03em",
          textAlign: "center",
          maxWidth: 1700,
          lineHeight: 1.1,
          background: `linear-gradient(100deg, ${colors.sky}, ${colors.sky2})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 60 }}>
        {visual.pills.map((p, i) => {
          const s = useReveal(useCueFrame(cues, i, Math.round(duration * (0.3 + i * 0.16))));
          return (
            <div
              key={p}
              style={{
                fontFamily: poppins,
                fontWeight: 700,
                fontSize: 40,
                color: "#fff",
                padding: "18px 44px",
                borderRadius: 999,
                background: `linear-gradient(100deg, ${colors.sky}, ${colors.skyDeep})`,
                opacity: s,
                transform: `translateY(${(1 - s) * 30}px)`,
              }}
            >
              {p}
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
            {visual.kind === "outro" && <OutroScene duration={duration} visual={visual} cues={cues} label={lessonLabel} title={lessonTitle} />}
            {subtitles && scene.subtitles !== false && <Subtitles sentences={scene.sentences} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
