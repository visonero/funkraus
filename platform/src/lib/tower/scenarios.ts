// Practice scenarios for the AI tower. Phraseology follows the course lessons 3.1 / 3.2 (NfL 2024-1-3266).
// Every scenario is a template with several variants (aircraft, callsign, aerodrome, runway, wind, QNH, positions ...).
// A random variant is chosen when a practice starts, so learners do not get used to one set of details.
// All aerodromes and callsigns are fictional. Everything below is server-side; the client only gets PublicScenario.
// A flight instructor should review these before the feature goes live.

export type Language = "de" | "en";

export type Step = {
  situation: string; // shown to the learner: what is happening, what to do next
  expect: string; // criteria the tower checks the transmission against
  towerLine: string; // ideal tower answer once the step is done ("" = no transmission needed)
};

// What the learner sees about "their" flight (the tower knows it too).
export type FlightInfo = {
  aerodrome: string;
  callsign: string; // spoken, ICAO alphabet
  registration: string; // written, e.g. D-EHOL
  type: string; // as spoken on the radio
  typeDisplay: string; // as written, e.g. Cessna 172
};

export type Scenario = {
  id: string;
  variant: number;
  title: string;
  level: "BZF II" | "BZF I";
  language: Language;
  blurb: string;
  info: FlightInfo;
  brief: string; // context for the tower
  names: string[]; // proper names in this variant (speech recognition often mishears them)
  steps: Step[];
};

export type PublicScenario = Pick<Scenario, "id" | "title" | "level" | "language" | "blurb"> & { stepCount: number; variantCount: number };

type Vars = Record<string, string>;

type Template = {
  id: string;
  title: string;
  level: Scenario["level"];
  language: Language;
  blurb: string;
  brief: string;
  steps: Step[];
  variants: Vars[];
};

const fill = (text: string, vars: Vars) => text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

// ---------- Building blocks for the variants ----------

const DE_FLEET: Vars[] = [
  { CS: "Delta Echo Hotel Oscar Lima", REG: "D-EHOL", TYPE: "Cessna eins sieben zwo", TYPED: "Cessna 172" },
  { CS: "Delta Golf Kilo Tango Alpha", REG: "D-GKTA", TYPE: "Piper Warrior", TYPED: "Piper PA-28 Warrior" },
  { CS: "Delta Echo Mike Sierra Kilo", REG: "D-EMSK", TYPE: "Diamond DA vierzig", TYPED: "Diamond DA40" },
  { CS: "Delta Echo Lima Romeo Yankee", REG: "D-ELRY", TYPE: "Robin DR vierhundert", TYPED: "Robin DR400" },
  { CS: "Delta Echo Whiskey Papa Victor", REG: "D-EWPV", TYPE: "Cessna eins fünf zwo", TYPED: "Cessna 152" },
];

const DE_FIELDS: Vars[] = [
  { AD: "Waldheim", RWY: "zwo vier", RWYN: "24", WIND: "zwo vier null Grad, acht Knoten", QNH: "eins null eins fünf" },
  { AD: "Hohenberg", RWY: "zwo sechs", RWYN: "26", WIND: "zwo fünf null Grad, zehn Knoten", QNH: "eins null zwo null" },
  { AD: "Lindenau", RWY: "eins acht", RWYN: "18", WIND: "eins sechs null Grad, sieben Knoten", QNH: "eins null null eins" },
  { AD: "Bergfeld", RWY: "drei sechs", RWYN: "36", WIND: "drei fünf null Grad, sechs Knoten", QNH: "eins null eins acht" },
  { AD: "Seeburg", RWY: "zwo eins", RWYN: "21", WIND: "zwo null null Grad, neun Knoten", QNH: "eins null zwo drei" },
];

const EN_FLEET: Vars[] = [
  { CS: "Delta Echo Hotel Oscar Lima", REG: "D-EHOL", TYPE: "Cessna one seven two", TYPED: "Cessna 172" },
  { CS: "Delta Golf Kilo Tango Alpha", REG: "D-GKTA", TYPE: "Piper Warrior", TYPED: "Piper PA-28 Warrior" },
  { CS: "Delta Echo Mike Sierra Kilo", REG: "D-EMSK", TYPE: "Diamond DA forty", TYPED: "Diamond DA40" },
  { CS: "Delta Echo Lima Romeo Yankee", REG: "D-ELRY", TYPE: "Robin DR four hundred", TYPED: "Robin DR400" },
  { CS: "Delta Echo Whiskey Papa Victor", REG: "D-EWPV", TYPE: "Cessna one fife two", TYPED: "Cessna 152" },
];

const EN_FIELDS: Vars[] = [
  { AD: "Waldheim", RWY: "two four", RWYN: "24", WIND: "two four zero degrees, eight knots", QNH: "one zero one fife" },
  { AD: "Hohenberg", RWY: "two six", RWYN: "26", WIND: "two fife zero degrees, one zero knots", QNH: "one zero two zero" },
  { AD: "Lindenau", RWY: "one eight", RWYN: "18", WIND: "one six zero degrees, seven knots", QNH: "one zero zero one" },
  { AD: "Bergfeld", RWY: "tree six", RWYN: "36", WIND: "tree fife zero degrees, six knots", QNH: "one zero one eight" },
  { AD: "Seeburg", RWY: "two one", RWYN: "21", WIND: "two zero zero degrees, niner knots", QNH: "one zero two tree" },
];

// Combine fleet, aerodrome and scenario-specific details. `shift` rotates the pairing so the same aircraft
// does not always meet the same aerodrome across scenarios.
const combine = (fleet: Vars[], fields: Vars[], extras: Vars[], shift: number): Vars[] =>
  extras.map((extra, i) => ({ ...fleet[(i + shift) % fleet.length], ...fields[i % fields.length], ...extra }));

// ---------- The scenarios ----------

const TEMPLATES: Template[] = [
  {
    id: "rollen-start-de",
    title: "Rollen und Start",
    level: "BZF II",
    language: "de",
    blurb: "Vom Abstellplatz zum Rollhalt und weiter bis zur Startfreigabe, auf Deutsch. Etwa 5 Funksprüche.",
    brief:
      "Flugplatz {AD} (fiktiv), Frequenzen Rollkontrolle und Turm. Pilot in {TYPE}, Rufzeichen {CS}, steht {SPOT}. Piste {RWY}, Wind {WIND}, QNH {QNH}. Kein weiterer Verkehr.",
    steps: [
      {
        situation: "Du fliegst die {TYPED} ({REG}) und stehst {SPOT} in {AD}. Du willst zum Start rollen. Rufe die Rollkontrolle und bitte um Rollen.",
        expect: "Ruft {AD} Rollkontrolle, nennt Rufzeichen, Luftfahrzeugtyp, Standort ({SPOTN}) und ERBITTE ROLLEN.",
        towerLine: "{CS}, {AD} Rollkontrolle, rollen Sie zum Rollhalt Piste {RWY}, QNH {QNH}.",
      },
      {
        situation: "Die Rollkontrolle hat dir eine Rollanweisung gegeben. Wiederhole sie.",
        expect: "Wiederholt Rollhalt Piste {RWY} und QNH {QNH} und nennt sein Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist am Rollhalt der Piste {RWYN}, die Startvorbereitungen sind beendet. Rufe jetzt den Turm.",
        expect: "Ruft {AD} Turm, nennt Rufzeichen, Standort (Rollhalt Piste {RWY}) und meldet ABFLUGBEREIT.",
        towerLine: "{CS}, {AD} Turm, Wind {WIND}, Piste {RWY}, Start frei, melden Sie abgehoben.",
      },
      {
        situation: "Du hast die Startfreigabe bekommen. Bestätige sie.",
        expect: "Wiederholt Piste {RWY}, Start frei, mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist gestartet, es ist {TIME}. Melde dich beim Turm.",
        expect: "Meldet ABGEHOBEN mit der Zeit (Minuten, zum Beispiel {MIN}) und Rufzeichen.",
        towerLine: "{CS}, verstanden, Frequenzwechsel genehmigt.",
      },
    ],
    variants: combine(
      DE_FLEET,
      DE_FIELDS,
      [
        { SPOT: "am Vorfeld", SPOTN: "Vorfeld", TIME: "zwölf Uhr fünfundvierzig", MIN: "vier fünf" },
        { SPOT: "auf Abstellplatz Bravo", SPOTN: "Abstellplatz Bravo", TIME: "neun Uhr zwanzig", MIN: "zwo null" },
        { SPOT: "an Parkposition drei", SPOTN: "Parkposition drei", TIME: "vierzehn Uhr zehn", MIN: "eins null" },
        { SPOT: "vor der Halle Nord", SPOTN: "Halle Nord", TIME: "sechzehn Uhr fünfzehn", MIN: "eins fünf" },
        { SPOT: "am Tankplatz", SPOTN: "Tankplatz", TIME: "elf Uhr fünfzig", MIN: "fünf null" },
      ],
      0,
    ),
  },
  {
    id: "anflug-landung-de",
    title: "Anflug und Landung",
    level: "BZF II",
    language: "de",
    blurb: "Einflug in die Platzrunde bis zur Landefreigabe, auf Deutsch. Etwa 6 Funksprüche.",
    brief:
      "Flugplatz {AD} (fiktiv), Turm. Pilot in {TYPE}, Rufzeichen {CS}, kommt aus {FROM}. Piste {RWY}, Wind {WIND}, QNH {QNH}. Kein weiterer Verkehr, Pilot ist Nummer eins. Rollkontrolle hat die Frequenz {FREQ}.",
    steps: [
      {
        situation: "Du fliegst die {TYPED} ({REG}) und näherst dich {AD} aus {FROM}, {DIST} entfernt in {ALT}. Du willst landen. Rufe den Turm.",
        expect: "Ruft {AD} Turm, nennt Rufzeichen, Luftfahrzeugtyp, Position ({DIST} {DIRW}), Höhe ({ALT}) und ZUR LANDUNG.",
        towerLine: "{CS}, {AD} Turm, fliegen Sie in den Gegenanflug Piste {RWY}, Wind {WIND}, QNH {QNH}.",
      },
      {
        situation: "Der Turm hat dich eingewiesen. Bestätige Piste und QNH.",
        expect: "Wiederholt Gegenanflug Piste {RWY} und QNH {QNH} mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist jetzt im Gegenanflug der Piste {RWYN}. Melde dich.",
        expect: "Meldet Gegenanflug Piste {RWY} mit Rufzeichen.",
        towerLine: "{CS}, Nummer eins, melden Sie Endanflug.",
      },
      {
        situation: "Der Turm will von dir den Endanflug hören. Du bist jetzt im Endanflug der Piste {RWYN}. Melde ihn.",
        expect: "Meldet Endanflug Piste {RWY} mit Rufzeichen.",
        towerLine: "{CS}, Piste {RWY}, Landung frei, Wind {WIND}.",
      },
      {
        situation: "Du hast die Landefreigabe bekommen. Bestätige sie.",
        expect: "Wiederholt Piste {RWY}, Landung frei, mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist gelandet und mit dem ganzen Flugzeug hinter dem Rollhalt. Melde es dem Turm.",
        expect: "Meldet PISTE VERLASSEN mit Rufzeichen.",
        towerLine: "{CS}, rufen Sie Rollkontrolle, {FREQ}.",
      },
    ],
    variants: combine(
      DE_FLEET,
      DE_FIELDS,
      [
        { FROM: "Westen", DIRW: "westlich", DIST: "zehn Kilometer", ALT: "zweitausend Fuß", FREQ: "eins eins eins Komma sieben" },
        { FROM: "Süden", DIRW: "südlich", DIST: "acht Kilometer", ALT: "dreitausend Fuß", FREQ: "eins eins zwo Komma vier" },
        { FROM: "Norden", DIRW: "nördlich", DIST: "fünfzehn Kilometer", ALT: "eintausendfünfhundert Fuß", FREQ: "eins eins eins Komma zwo" },
        { FROM: "Osten", DIRW: "östlich", DIST: "zwölf Kilometer", ALT: "zweitausendfünfhundert Fuß", FREQ: "eins eins drei Komma acht" },
        { FROM: "Südwesten", DIRW: "südwestlich", DIST: "sieben Kilometer", ALT: "eintausend Fuß", FREQ: "eins eins zwo Komma zwei" },
      ],
      2,
    ),
  },
  {
    id: "departure-en",
    title: "Departure (English)",
    level: "BZF I",
    language: "en",
    blurb: "Taxi and take-off in English R/T, with ICAO number pronunciation. About 5 transmissions.",
    brief:
      "Aerodrome {AD} (fictional), Ground and Tower. Pilot in {TYPE}, callsign {CS}, at {SPOT}. Runway {RWY}, wind {WIND}, QNH {QNH}. No other traffic.",
    steps: [
      {
        situation: "You are flying the {TYPED} ({REG}) and are parked {SPOT} at {AD}. You want to taxi for departure. Call {AD} Ground and request taxi.",
        expect: "Calls {AD} Ground, states callsign, aircraft type, position ({SPOTN}) and requests taxi.",
        towerLine: "{CS}, {AD} Ground, taxi to holding point runway {RWY}, QNH {QNH}.",
      },
      {
        situation: "Ground has given you a taxi instruction. Read it back.",
        expect: "Reads back taxi to holding point runway {RWY} and QNH {QNH} with callsign.",
        towerLine: "",
      },
      {
        situation: "You are at the holding point of runway {RWYN} and ready. Call {AD} Tower.",
        expect: "Calls {AD} Tower, states callsign, position (holding point runway {RWY}) and reports ready for departure.",
        towerLine: "{CS}, wind {WIND}, runway {RWY}, cleared for take-off.",
      },
      {
        situation: "You are cleared for take-off. Read the clearance back.",
        expect: "Reads back runway {RWY}, cleared for take-off, with callsign.",
        towerLine: "",
      },
      {
        situation: "You are airborne at {TIME}. Report to the tower.",
        expect: "Reports airborne with the time (minutes, for example {MIN}) and callsign.",
        towerLine: "{CS}, roger, frequency change approved.",
      },
    ],
    variants: combine(
      EN_FLEET,
      EN_FIELDS,
      [
        { SPOT: "on the apron", SPOTN: "apron", TIME: "12:45", MIN: "four fife" },
        { SPOT: "at stand Bravo", SPOTN: "stand Bravo", TIME: "09:20", MIN: "two zero" },
        { SPOT: "at parking position tree", SPOTN: "parking position tree", TIME: "14:10", MIN: "one zero" },
        { SPOT: "in front of hangar North", SPOTN: "hangar North", TIME: "16:15", MIN: "one fife" },
        { SPOT: "at the fuel stand", SPOTN: "fuel stand", TIME: "11:50", MIN: "fife zero" },
      ],
      4,
    ),
  },
];

// ---------- Public API ----------

export function getScenario(id: string, variant: number): Scenario | null {
  const t = TEMPLATES.find((s) => s.id === id);
  if (!t) return null;
  const idx = ((variant % t.variants.length) + t.variants.length) % t.variants.length;
  const v = t.variants[idx];
  const f = (s: string) => fill(s, v);
  return {
    id: t.id,
    variant: idx,
    title: t.title,
    level: t.level,
    language: t.language,
    blurb: t.blurb,
    info: { aerodrome: v.AD, callsign: v.CS, registration: v.REG, type: v.TYPE, typeDisplay: v.TYPED },
    brief: f(t.brief),
    names: [v.AD, v.CS, v.TYPE, "Rollkontrolle", "Turm", "Ground", "Tower"],
    steps: t.steps.map((s) => ({ situation: f(s.situation), expect: f(s.expect), towerLine: f(s.towerLine) })),
  };
}

export const variantCount = (id: string) => TEMPLATES.find((s) => s.id === id)?.variants.length ?? 0;

// Random variant, avoiding the one the learner had last time when there is a choice.
export function pickVariant(id: string, avoid?: number | null): number {
  const n = variantCount(id);
  if (n <= 1) return 0;
  const options = Array.from({ length: n }, (_, i) => i).filter((i) => i !== avoid);
  return options[Math.floor(Math.random() * options.length)];
}

export const scenarioExists = (id: string) => TEMPLATES.some((s) => s.id === id);

export const publicScenarios = (): PublicScenario[] =>
  TEMPLATES.map((t) => ({ id: t.id, title: t.title, level: t.level, language: t.language, blurb: t.blurb, stepCount: t.steps.length, variantCount: t.variants.length }));
