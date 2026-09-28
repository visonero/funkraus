# funkraus Partnerprogramm für Flugschulen und Vereine

Ziel: ein Angebot, das ein ehrenamtlicher Vorstand oder eine Flugschule ohne langes Nachdenken annimmt — echter Vorteil für die Mitglieder, null Kosten, null Aufwand.

## Das Angebot in einem Satz

*"Deine Mitglieder sparen 80 € auf funkraus, du wirst als offizieller Partner auf unserer Seite verlinkt, und das kostet dich nichts außer einer E-Mail an deine Mitglieder."*

## Was der Verein/die Flugschule bekommt

1. **80 € Rabatt-Code für alle Mitglieder** (Vollzugang für 199 € statt 279 €), exklusiv unter ihrem eigenen Code, z. B. `AEROCLUBMUENCHEN80`.
2. **"Offizieller Partner"-Status**: Logo und Link auf einer eigenen Partnerseite auf funkraus.de (Backlink, zählt auch für deren eigene Google-Sichtbarkeit).
3. **Kostenloser Vollzugang für bis zu 2 Fluglehrer/Ausbildungsleiter** des Vereins, solange die Partnerschaft aktiv ist — damit sie den Kurs selbst kennen, bevor sie ihn empfehlen, und ehrlich mitreden können.
4. **Fertige Materialien zum Weiterleiten**: E-Mail-Text, WhatsApp-Text, ein Absatz für die Vereinszeitung/Homepage — alles unten, nichts selbst formulieren.
5. **Meilenstein-Bonus**: Ab dem 5. zahlenden Mitglied über ihren Code schalten wir automatisch einen weiteren kostenlosen Fluglehrer-Zugang frei. Ab dem 15. Mitglied: ein zusätzlicher Monat kostenloses KI-Funktraining ohne Nutzungslimit für den ganzen Verein (technisch einfach umsetzbar, siehe unten).
6. **Für die ersten 15 Partner: "Gründungspartner"-Status.** Ihr Rabatt und ihre Konditionen bleiben dauerhaft bestehen, selbst wenn wir das Programm später ändern, und sie werden zuerst gefragt, wenn neue Funktionen kommen (z. B. Wünsche fürs KI-Funktraining).

## Was funkraus dafür bekommt

- Einen Link zurück von der Vereins-/Flugschulseite (Backlink für SEO — Vereine haben oft eine "Links"- oder "Ausbildung"-Seite).
- Vertrauenswürdige Empfehlung direkt an die Zielgruppe, ohne Werbekosten.
- Echte Nutzer für ehrliches Feedback und für die UGC-Videoserie (Fluglehrer, die den Kurs wirklich nutzen, sind die glaubwürdigsten Gesichter dafür).

## Die Rabatt-Option: zwei Varianten, du entscheidest

**Variante A — nur Rabatt und Sachleistung (kein Geld fließt).** Die 2 kostenlosen Fluglehrer-Zugänge sind die einzige "Gegenleistung" an den Verein. Einfachste Variante, keine steuerlichen Fragen, weil kein Geld an den Verein fließt.

**Variante B — zusätzlich eine Provision pro zahlendem Mitglied**, z. B. 20 € pro Kauf über den Vereins-Code an die Vereinskasse. Attraktiver für den Verein, aber: **Bei eingetragenen, gemeinnützigen Vereinen (e.V.) kann eine Provisionszahlung als wirtschaftlicher Geschäftsbetrieb gewertet werden** und die Gemeinnützigkeit berühren. Empfehlung: das als Vorschlag anbieten und den Verein bitten, kurz mit seinem Kassenwart/Steuerberater zu klären, ob und in welcher Form (z. B. als "Spende" statt "Provision") das für sie passt. Für eine klassische, kommerzielle Flugschule (kein e.V.) ist Variante B unkompliziert.

**Empfehlung:** Beiden Varianten anbieten und den Partner wählen lassen — das nimmt dir die Entscheidung nicht ab, aber es macht das Angebot flexibel genug, dass so gut wie niemand ablehnt.

## Rechnung: was kostet dich das wirklich?

| | Normal | Über Partner-Code (Variante A) | Über Partner-Code (Variante B, 20 €) |
|---|---|---|---|
| Student zahlt | 279 € | 199 € | 199 € |
| Du erhältst | 279 € | 199 € | 179 € |
| Zusatzkosten für dich | – | 2 Fluglehrer-Zugänge (Grenzkosten nahe 0, da reine Software) | wie links, plus 20 €/Kauf |

Da der Kurs digital ist, kostet ein zusätzlicher Nutzer dich praktisch nichts außer dem begrenzten KI-Funktraining-Budget (das ohnehin gedeckelt ist). Der Rabatt kostet dich also echte 80 € Marge pro Student, aber ersetzt Werbeausgaben, die du sonst hättest, um denselben Studenten zu erreichen — bei TikTok-Ads oder Google Ads oft teurer und ohne die Vertrauensbasis einer Empfehlung durch den eigenen Verein.

## Umsetzung: technisch in 10 Minuten, ohne Code-Änderung

Der Checkout unterstützt bereits Rabattcodes (`allow_promotion_codes` ist an). Für jeden Partner:

1. Stripe-Dashboard → **Produktkatalog → Gutscheincodes (Coupons)** → neuer Gutschein: 80 € Rabatt, einmalig pro Kunde, unbegrenzt gültig (oder mit Ablaufdatum fürs erste Partnerjahr).
2. Daraus einen **Aktionscode (Promotion Code)** erstellen mit dem Wunschtext, z. B. `AEROCLUBMUENCHEN80`. Das ist der Code, den der Verein an seine Mitglieder weitergibt.
3. Fertig. Beim Bezahlvorgang gibt der Nutzer den Code selbst ein, der Rabatt wird automatisch abgezogen.
4. **Nachverfolgen, wie viele Käufe über einen Code liefen**: Stripe-Dashboard → Zahlungen, nach dem Aktionscode filtern/exportieren (Spalte "Coupon" bzw. "Promotion code" in der CSV). Für eine Handvoll Partner reicht das völlig; bei vielen Partnern kann ich später eine kleine automatische Auswertung bauen.
5. Der Meilenstein-Bonus (5./15. Kauf) wird anfangs manuell ausgelöst — du siehst die Zahl im Stripe-Dashboard und schaltest den Bonus-Zugang von Hand frei. Erst wenn viele Partner mitmachen, lohnt sich eine Automatisierung.

**Offizieller Partner"-Seite auf funkraus.de**: noch nicht gebaut. Das ist eine kleine, neue Seite (`/partner`) mit Logo, Namen und Link jedes Partners. Baue ich, sobald du die ersten 2–3 echten Partner hast (Logo, Name, Wunsch-Linktext) — dauert dann etwa eine Stunde. Sag Bescheid, wenn es so weit ist.

## Zielgruppe: wen ansprechen

- **Luftsportvereine** (Segelflug, Motorflug) — meist e.V., ehrenamtlicher Vorstand, hohes Interesse an kostenlosen Vorteilen für Mitglieder ohne eigenen Aufwand.
- **Kommerzielle Flugschulen** (PPL/LAPL-Ausbildung) — Variante B (Provision) oft attraktiver, da kein Gemeinnützigkeits-Thema.
- **Modellflug- und Ultraleicht-Vereine** mit BZF-Bezug.
- Einstieg: lokale Vereine in deiner Region zuerst (persönlicher Kontakt möglich), dann bundesweit per E-Mail.

## Fertige Vorlagen zum Weiterleiten (für den Verein, null Aufwand)

### E-Mail an dich (Erstkontakt zum Verein/zur Flugschule)

> Betreff: Kostenloser Vorteil für eure BZF-Anwärter:innen
>
> Hallo [Name],
>
> ich bin Hussam, ich habe funkraus gebaut: einen Online-Kurs für BZF I und BZF II mit dem kompletten offiziellen Fragenkatalog der Bundesnetzagentur und einem neuen KI-Funktraining zum Sprechfunk-Üben.
>
> Ich möchte [Vereinsname] gern als offiziellen Partner gewinnen: Eure Mitglieder bekommen einen exklusiven Rabatt von 80 € (Vollzugang für 199 € statt 279 €) über einen eigenen Code, ihr bekommt kostenlosen Zugang für bis zu zwei Fluglehrer, und wir verlinken euch als offiziellen Partner auf unserer Seite. Das kostet euch nichts außer einer kurzen Nachricht an eure Mitglieder, den Text dafür liefere ich fertig mit.
>
> Habt ihr Interesse an einem kurzen Austausch dazu? Ich schicke euch gern alles Nötige direkt zu.
>
> Viele Grüße
> Hussam

### Text zum Weiterleiten an die Mitglieder (E-Mail/WhatsApp/Vereinszeitung)

> **BZF-Kurs mit Vereinsrabatt: 199 € statt 279 €**
>
> Für alle, die noch ihr BZF I oder BZF II brauchen: [Vereinsname] ist offizieller Partner von funkraus, einem Online-Kurs mit dem kompletten offiziellen Fragenkatalog der Bundesnetzagentur, Prüfungssimulation und einem neuen KI-Funktraining zum Sprechfunk-Üben.
>
> Mit unserem Code **[CODE]** bekommt ihr 80 € Rabatt auf den einmaligen Vollzugang (199 € statt 279 €, kein Abo, 12 Monate Zugriff). Die ersten 2 Module könnt ihr sowieso kostenlos testen, ganz ohne Zahlungsdaten: [Link].

## Warum das schwer abzulehnen ist

- **Null Kosten, null Risiko** für den Verein — das ist der wichtigste Punkt bei ehrenamtlichen Vorständen, die keine Zeit für Verhandlungen haben.
- **Null Aufwand** — alle Texte sind fertig, nur weiterleiten.
- **Echter Vorteil für die Mitglieder** (80 € sind spürbar, kein Alibi-Rabatt).
- **Beidseitiger Nutzen**, klar sichtbar (Backlink, Sichtbarkeit, Fluglehrer-Zugänge).
- **Kein Vertragsaufwand**: ein Code, eine E-Mail, fertig — kein unterschriebener Vertrag nötig, um zu starten (bei größeren Flugschulen mit Provisionsvereinbarung ist eine kurze schriftliche Bestätigung per E-Mail sinnvoll, reicht aber meist aus).
