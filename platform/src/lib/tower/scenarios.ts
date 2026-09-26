// Practice scenarios for the AI tower. Phraseology follows the course lessons 3.1 / 3.2 (NfL 2024-1-3266).
// Aerodrome "Waldheim" is fictional. Everything below is server-side; the client only gets PublicScenario.
// A flight instructor should review these before the feature goes live.

export type Language = "de" | "en";

export type Step = {
  situation: string; // shown to the learner: what is happening, what to do next
  expect: string; // criteria the tower checks the transmission against
  towerLine: string; // ideal tower answer once the step is done ("" = no transmission needed)
};

export type Scenario = {
  id: string;
  title: string;
  level: "BZF II" | "BZF I";
  language: Language;
  blurb: string;
  callsign: string; // spoken form
  brief: string; // context for the tower
  steps: Step[];
};

export type PublicScenario = Pick<Scenario, "id" | "title" | "level" | "language" | "blurb" | "callsign"> & { stepCount: number; firstSituation: string };

export const SCENARIOS: Scenario[] = [
  {
    id: "rollen-start-de",
    title: "Rollen und Start",
    level: "BZF II",
    language: "de",
    blurb: "Vom Vorfeld zum Rollhalt und weiter bis zur Startfreigabe, auf Deutsch. Etwa 5 Funksprüche.",
    callsign: "Delta Echo Hotel Oscar Lima",
    brief:
      "Flugplatz Waldheim (fiktiv), Frequenzen Rollkontrolle und Turm. Pilot in Cessna eins sieben zwo, Rufzeichen Delta Echo Hotel Oscar Lima, steht am Vorfeld. Piste zwo vier, Wind zwo vier null Grad acht Knoten, QNH eins null eins fünf. Kein weiterer Verkehr.",
    steps: [
      {
        situation: "Du stehst mit deiner Cessna am Vorfeld und willst zum Start rollen. Rufe die Rollkontrolle und bitte um Rollen.",
        expect: "Ruft Waldheim Rollkontrolle, nennt Rufzeichen, Luftfahrzeugtyp, Standort (Vorfeld) und ERBITTE ROLLEN.",
        towerLine: "Delta Echo Hotel Oscar Lima, Waldheim Rollkontrolle, rollen Sie zum Rollhalt Piste zwo vier, QNH eins null eins fünf.",
      },
      {
        situation: "Die Rollkontrolle hat dir eine Rollanweisung gegeben. Wiederhole sie.",
        expect: "Wiederholt Rollhalt Piste zwo vier und QNH eins null eins fünf und nennt sein Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist am Rollhalt der Piste 24, die Startvorbereitungen sind beendet. Rufe jetzt den Turm.",
        expect: "Ruft Waldheim Turm, nennt Rufzeichen, Standort (Rollhalt Piste zwo vier) und meldet ABFLUGBEREIT.",
        towerLine:
          "Delta Echo Hotel Oscar Lima, Waldheim Turm, Wind zwo vier null Grad, acht Knoten, Piste zwo vier, Start frei, melden Sie abgehoben.",
      },
      {
        situation: "Du hast die Startfreigabe bekommen. Bestätige sie.",
        expect: "Wiederholt Piste zwo vier, Start frei, mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist gestartet, es ist zwölf Uhr fünfundvierzig. Melde dich beim Turm.",
        expect: "Meldet ABGEHOBEN mit der Zeit (Minuten, zum Beispiel vier fünf) und Rufzeichen.",
        towerLine: "Delta Echo Hotel Oscar Lima, verstanden, Frequenzwechsel genehmigt.",
      },
    ],
  },
  {
    id: "anflug-landung-de",
    title: "Anflug und Landung",
    level: "BZF II",
    language: "de",
    blurb: "Einflug in die Platzrunde bis zur Landefreigabe, auf Deutsch. Etwa 6 Funksprüche.",
    callsign: "Delta Echo Hotel Oscar Lima",
    brief:
      "Flugplatz Waldheim (fiktiv), Turm. Pilot in Cessna eins sieben zwo, Rufzeichen Delta Echo Hotel Oscar Lima, kommt von Westen. Piste zwo vier, Wind zwo vier null Grad sechs Knoten, QNH eins null eins fünf. Kein weiterer Verkehr, Pilot ist Nummer eins. Rollkontrolle hat die Frequenz eins eins eins Komma sieben.",
    steps: [
      {
        situation: "Du näherst dich Waldheim aus Westen, zehn Kilometer entfernt in zweitausend Fuß, und willst landen. Rufe den Turm.",
        expect: "Ruft Waldheim Turm, nennt Rufzeichen, Luftfahrzeugtyp, Position (zehn Kilometer westlich), Höhe (zweitausend Fuß) und ZUR LANDUNG.",
        towerLine:
          "Delta Echo Hotel Oscar Lima, Waldheim Turm, fliegen Sie in den Gegenanflug Piste zwo vier, Wind zwo vier null Grad, sechs Knoten, QNH eins null eins fünf.",
      },
      {
        situation: "Der Turm hat dich eingewiesen. Bestätige Piste und QNH.",
        expect: "Wiederholt Gegenanflug Piste zwo vier und QNH eins null eins fünf mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist jetzt im Gegenanflug der Piste 24. Melde dich.",
        expect: "Meldet Gegenanflug Piste zwo vier mit Rufzeichen.",
        towerLine: "Delta Echo Hotel Oscar Lima, Nummer eins, melden Sie Endanflug.",
      },
      {
        situation: "Der Turm will von dir den Endanflug hören. Du bist jetzt im Endanflug der Piste 24. Melde ihn.",
        expect: "Meldet Endanflug Piste zwo vier mit Rufzeichen.",
        towerLine: "Delta Echo Hotel Oscar Lima, Piste zwo vier, Landung frei, Wind zwo vier null Grad, sechs Knoten.",
      },
      {
        situation: "Du hast die Landefreigabe bekommen. Bestätige sie.",
        expect: "Wiederholt Piste zwo vier, Landung frei, mit Rufzeichen.",
        towerLine: "",
      },
      {
        situation: "Du bist gelandet und mit dem ganzen Flugzeug hinter dem Rollhalt. Melde es dem Turm.",
        expect: "Meldet PISTE VERLASSEN mit Rufzeichen.",
        towerLine: "Delta Echo Hotel Oscar Lima, rufen Sie Rollkontrolle, eins eins eins Komma sieben.",
      },
    ],
  },
  {
    id: "departure-en",
    title: "Departure (English)",
    level: "BZF I",
    language: "en",
    blurb: "Taxi and take-off in English R/T, with ICAO number pronunciation. About 5 transmissions.",
    callsign: "Delta Echo Hotel Oscar Lima",
    brief:
      "Aerodrome Waldheim (fictional), Ground and Tower. Pilot in Cessna one seven two, callsign Delta Echo Hotel Oscar Lima, on the apron. Runway two four, wind two four zero degrees eight knots, QNH one zero one five. No other traffic.",
    steps: [
      {
        situation: "You are on the apron with your Cessna and want to taxi for departure. Call Waldheim Ground and request taxi.",
        expect: "Calls Waldheim Ground, states callsign, aircraft type, position (apron) and requests taxi.",
        towerLine: "Delta Echo Hotel Oscar Lima, Waldheim Ground, taxi to holding point runway two four, QNH one zero one five.",
      },
      {
        situation: "Ground has given you a taxi instruction. Read it back.",
        expect: "Reads back taxi to holding point runway two four and QNH one zero one five with callsign.",
        towerLine: "",
      },
      {
        situation: "You are at the holding point of runway 24 and ready. Call Waldheim Tower.",
        expect: "Calls Waldheim Tower, states callsign, position (holding point runway two four) and reports ready for departure.",
        towerLine: "Delta Echo Hotel Oscar Lima, wind two four zero degrees, eight knots, runway two four, cleared for take-off.",
      },
      {
        situation: "You are cleared for take-off. Read the clearance back.",
        expect: "Reads back runway two four, cleared for take-off, with callsign.",
        towerLine: "",
      },
      {
        situation: "You are airborne at four five past the hour. Report to the tower.",
        expect: "Reports airborne with the time (minutes, for example four five) and callsign.",
        towerLine: "Delta Echo Hotel Oscar Lima, roger, frequency change approved.",
      },
    ],
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id) ?? null;

export const toPublic = (s: Scenario): PublicScenario => ({
  id: s.id,
  title: s.title,
  level: s.level,
  language: s.language,
  blurb: s.blurb,
  callsign: s.callsign,
  stepCount: s.steps.length,
  firstSituation: s.steps[0].situation,
});
