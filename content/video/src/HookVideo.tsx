import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, jakarta, poppins } from "./theme";

type Scene = { id: string; start: number; end: number };
type Letter = { letter: string; word: string; pronunciation: string };

export type HookVideoProps = {
  audio: string;
  totalSeconds: number;
  scenes: Scene[];
  letters: Letter[];
  lessonLabel: string;
  lessonTitle: string;
};

const CALLSIGN = ["D", "E", "J", "F", "C"];

function useReveal(startFrame: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
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
  return <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>;
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
    <svg width="1600" height="120" style={{ position: "absolute", bottom: 90 }}>
      <polyline points={points.join(" ")} fill="none" stroke={colors.sky} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

function ProblemScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const letters = ["B", "D", "P", "T"];
  const headline = useReveal(2);
  return (
    <SceneShell duration={duration}>
      <div style={{ ...caption, opacity: headline, transform: `translateY(${(1 - headline) * 24}px)`, marginBottom: 70 }}>
        Am Funk klingen diese Buchstaben <span style={{ color: colors.skyDeep }}>fast gleich</span>
      </div>
      <div style={{ display: "flex", gap: 44 }}>
        {letters.map((l, i) => {
          const s = useReveal(Math.round(duration * (0.12 + i * 0.16)));
          const wobble = Math.sin(frame / 5 + i * 1.7) * 2.4 * s;
          return (
            <Tile key={l} size={[250, 250]} style={{ transform: `scale(${0.6 + s * 0.4}) rotate(${wobble}deg)`, opacity: s }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 170, color: colors.skyDeep, lineHeight: 1 }}>{l}</span>
            </Tile>
          );
        })}
      </div>
      <Wave />
    </SceneShell>
  );
}

function AlphabetScene({ duration, letters }: { duration: number; letters: Letter[] }) {
  const headline = useReveal(2);
  const columns = 9;
  return (
    <SceneShell duration={duration}>
      <div style={{ ...caption, opacity: headline, marginBottom: 46, fontSize: 58 }}>
        Für jeden Buchstaben gibt es ein <span style={{ color: colors.skyDeep }}>festes Wort</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 184px)`, gap: 18 }}>
        {letters.map((l, i) => {
          const s = useReveal(Math.round(duration * 0.08 + i * ((duration * 0.7) / letters.length)));
          return (
            <Tile key={l.letter} size={[184, 132]} style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${0.85 + s * 0.15})`, borderRadius: 24 }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 52, color: colors.skyDeep, lineHeight: 1 }}>{l.letter}</span>
              <span style={{ fontFamily: jakarta, fontWeight: 600, fontSize: 24, color: colors.text, marginTop: 8 }}>{l.word}</span>
            </Tile>
          );
        })}
      </div>
    </SceneShell>
  );
}

function CallsignScene({ duration, letters }: { duration: number; letters: Letter[] }) {
  const headline = useReveal(2);
  const words = CALLSIGN.map((c) => letters.find((l) => l.letter === c)!.word);
  return (
    <SceneShell duration={duration}>
      <div style={{ ...caption, opacity: headline, marginBottom: 30, fontSize: 56 }}>Dein Rufzeichen</div>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: "0.08em",
          color: colors.text,
          padding: "10px 60px",
          borderRadius: 24,
          background: "#fff",
          border: `5px solid ${colors.text}`,
          opacity: headline,
          marginBottom: 70,
        }}
      >
        D-EJFC
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {CALLSIGN.map((c, i) => {
          const s = useReveal(Math.round(duration * (0.22 + i * 0.13)));
          return (
            <Tile key={c} size={[280, 240]} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)` }}>
              <span style={{ fontFamily: poppins, fontWeight: 800, fontSize: 96, color: colors.skyDeep, lineHeight: 1 }}>{c}</span>
              <span style={{ fontFamily: jakarta, fontWeight: 600, fontSize: 36, color: colors.text, marginTop: 14, opacity: s }}>{words[i]}</span>
            </Tile>
          );
        })}
      </div>
    </SceneShell>
  );
}

function OutroScene({ duration, label, title }: { duration: number; label: string; title: string }) {
  const a = useReveal(4);
  const pills = ["Hören", "Nachsprechen", "Üben"];
  return (
    <SceneShell duration={duration}>
      <div style={{ fontFamily: poppins, fontWeight: 700, fontSize: 34, color: colors.skyDeep, letterSpacing: "0.1em", textTransform: "uppercase", opacity: a }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: 116,
          marginTop: 18,
          letterSpacing: "-0.03em",
          background: `linear-gradient(100deg, ${colors.sky}, ${colors.sky2})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          opacity: a,
          transform: `translateY(${(1 - a) * 30}px)`,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 64 }}>
        {pills.map((p, i) => {
          const s = useReveal(Math.round(duration * (0.3 + i * 0.16)));
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

export const HookVideo = ({ audio, totalSeconds, scenes, letters, lessonLabel, lessonTitle }: HookVideoProps) => {
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
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            {scene.id === "problem" && <ProblemScene duration={duration} />}
            {scene.id === "alphabet" && <AlphabetScene duration={duration} letters={letters} />}
            {scene.id === "callsign" && <CallsignScene duration={duration} letters={letters} />}
            {scene.id === "outro" && <OutroScene duration={duration} label={lessonLabel} title={lessonTitle} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
