import type { DiagramFn } from "./diagrams1";
import { airfield, circuit, clock, route } from "./diagrams1";
import { altimeter, cloud, giveway, hemi, minheight } from "./diagrams2";
import { vorApproach, vorInstrument, vorIntro, vorRadial, vorToFrom } from "./diagrams3";
import { altimeter3, funkausfall, los } from "./diagrams5";
import { airspace, bandScale, baro, cavok, flExample, radiolink, takeoff, contacts, metar, skyCode, firMap, holding, infoVsTower, preflight, ptt, hours, journey, ladder, lessonflow, places, unitsFlight, zones } from "./diagrams6";
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
  funkausfall,
  journey,
  lessonflow,
  ladder,
  places,
  hours,
  unitsFlight,
  airspace,
  zones,
  firMap,
  contacts,
  infoVsTower,
  preflight,
  bandScale,
  ptt,
  holding,
  skyCode,
  cavok,
  metar,
  takeoff,
  baro,
  flExample,
  radiolink,
} satisfies Record<string, DiagramFn>;

export type DiagramName = keyof typeof DIAGRAMS;
