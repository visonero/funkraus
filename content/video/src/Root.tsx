import { Composition } from "remotion";
import alphabet from "../../data/alphabet.json";
import { HookVideo, type HookVideoProps } from "./HookVideo";

const defaultProps: HookVideoProps = {
  audio: "2.1-hook-video.mp3",
  totalSeconds: 31.2,
  scenes: [
    { id: "problem", start: 0, end: 5.8 },
    { id: "alphabet", start: 6.3, end: 16 },
    { id: "callsign", start: 16.5, end: 23.8 },
    { id: "outro", start: 24.3, end: 31.2 },
  ],
  letters: alphabet.letters,
  lessonLabel: "Lektion 2.1",
  lessonTitle: "Die Buchstabiertafel",
};

export const Root = () => (
  <Composition
    id="HookVideo"
    component={HookVideo}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={30 * 32}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil((props.totalSeconds + 0.8) * 30) })}
  />
);
