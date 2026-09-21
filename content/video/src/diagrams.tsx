import type { DiagramFn } from "./diagrams1";
import { airfield, circuit, clock, route } from "./diagrams1";
import { altimeter, cloud, giveway, hemi, minheight } from "./diagrams2";
import { vorApproach, vorInstrument, vorIntro, vorRadial, vorToFrom } from "./diagrams3";
import { altimeter3, los } from "./diagrams5";
import { adf, gnss, gpsDisplay, ndb, qdmQdr, radar, vdf } from "./diagrams4";

export type { DiagramProps, DiagramFn } from "./diagrams1";

export const DIAGRAMS = {
  airfield,
  circuit,
  clock,
  route,
  hemi,
  cloud,
  altimeter,
  giveway,
  minheight,
  vorIntro,
  vorRadial,
  vorInstrument,
  vorToFrom,
  vorApproach,
  adf,
  qdmQdr,
  vdf,
  radar,
  ndb,
  gnss,
  gpsDisplay,
  altimeter3,
  los,
} satisfies Record<string, DiagramFn>;

export type DiagramName = keyof typeof DIAGRAMS;
