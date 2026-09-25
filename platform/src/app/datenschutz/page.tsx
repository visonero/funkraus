import type { Metadata } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — funkraus",
  description: "Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/datenschutz" },
};

const CONTENT = `
## 1. Verantwortlicher

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

- Hussam Alkhodour
- Auf der Scholle 8
- 40668 Meerbusch
- E-Mail: h.alkhodour@web.de
- Telefon: +49 163 8182323

Ein betrieblicher Datenschutzbeauftragter ist nicht bestellt, da die gesetzlichen Voraussetzungen hierfür (§ 38 BDSG) nicht vorliegen.

## 2. Allgemeines zur Datenverarbeitung

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Als Rechtsgrundlagen kommen insbesondere in Betracht:

- Art. 6 Abs. 1 lit. a DSGVO — Einwilligung
- Art. 6 Abs. 1 lit. b DSGVO — Erfüllung eines Vertrags bzw. vorvertragliche Maßnahmen
- Art. 6 Abs. 1 lit. c DSGVO — Erfüllung einer rechtlichen Verpflichtung
- Art. 6 Abs. 1 lit. f DSGVO — Wahrung berechtigter Interessen

## 3. Bereitstellung der Website, Server-Logfiles

Beim Aufruf unserer Website erhebt unser Hosting-Anbieter automatisch technische Daten, die Ihr Browser übermittelt, u. a.:

- IP-Adresse
- Datum und Uhrzeit der Anfrage
- aufgerufene Seite bzw. Datei
- Referrer-URL
- verwendeter Browser und verwendetes Betriebssystem

Diese Daten dienen der Gewährleistung eines störungsfreien Betriebs sowie der Systemsicherheit (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an der technischen Bereitstellung und Absicherung unserer Website) und werden automatisiert gelöscht, sobald sie für diesen Zweck nicht mehr erforderlich sind.

**Schriftarten:** Die auf dieser Website verwendeten Schriftarten (Google Fonts) werden zur Build-Zeit lokal eingebunden und ausschließlich von unserem eigenen Server ausgeliefert. Es findet keine Verbindung zu Servern von Google statt; hierbei werden keine Daten an Google übermittelt.

## 4. Cookies

Wir setzen technisch notwendige Cookies ein, die für den Betrieb der Website und insbesondere für die Anmeldung und den sicheren Zugriff auf Ihr Nutzerkonto erforderlich sind (Session-/Authentifizierungs-Cookies unseres technischen Dienstleisters Supabase, z. B. mit einem Namen nach dem Muster „sb-\\<projekt\\>-auth-token"). Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG i. V. m. Art. 6 Abs. 1 lit. b DSGVO, da diese Cookies zur Erbringung des von Ihnen ausdrücklich gewünschten Dienstes (Login, Kursnutzung) unbedingt erforderlich sind. Eine Einwilligung ist für diese technisch notwendigen Cookies nicht erforderlich.

Analyse-Cookies (Google Analytics, siehe Ziffer 5) setzen wir **ausschließlich mit Ihrer ausdrücklichen Einwilligung** ein. Marketing- oder Werbe-Cookies setzen wir nicht ein. Ihre Cookie-Auswahl speichern wir in Ihrem Browser (Local Storage), damit wir Sie nicht bei jedem Besuch erneut fragen müssen. Sie können Ihre Entscheidung jederzeit über den Link „Cookie-Einstellungen“ im Fußbereich der Website ändern.

## 5. Reichweitenmessung mit Google Analytics

Mit Ihrer Einwilligung nutzen wir **Google Analytics 4**, einen Webanalysedienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland („Google“). Ohne Ihre Einwilligung wird Google Analytics nicht geladen und es werden keine Daten an Google übertragen.

Google Analytics verwendet Cookies (z. B. „\\_ga“ und „\\_ga\\_\\<Kennung\\>“), die eine Analyse der Nutzung der Website ermöglichen. Dabei werden insbesondere folgende Daten verarbeitet: aufgerufene Seiten, Verweildauer, Herkunft des Besuchs (Referrer), Gerätetyp, Browser, Betriebssystem, Spracheinstellung sowie der ungefähre Standort (Land/Region). In Google Analytics 4 werden IP-Adressen nicht protokolliert oder gespeichert. Die Funktionen für Google-Signale und personalisierte Werbung sind deaktiviert; wir verwenden die Daten ausschließlich zur statistischen Auswertung und Verbesserung unseres Angebots. Im Kursbereich und in Ihrem Nutzerkonto verknüpfen wir die Analysedaten nicht mit Ihren Kontodaten.

Die Ereignisdaten werden nach zwei Monaten automatisch gelöscht. Mit Google besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Soweit Daten an Google LLC in die USA übermittelt werden, erfolgt dies auf Grundlage des EU-US Data Privacy Framework (Angemessenheitsbeschluss der EU-Kommission vom 10.07.2023), an dem Google LLC teilnimmt, sowie ergänzend auf Grundlage von EU-Standardvertragsklauseln.

Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO i. V. m. § 25 Abs. 1 TDDDG). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie im Fußbereich der Website auf „Cookie-Einstellungen“ klicken und „Ablehnen“ wählen. Weitere Informationen: [https://policies.google.com/privacy](https://policies.google.com/privacy)

## 6. Registrierung und Nutzerkonto

Zur Nutzung des Kurses ist die Erstellung eines kostenlosen Nutzerkontos erforderlich. Dabei erheben wir Ihre E-Mail-Adresse, Ihren vollständigen Namen und ein von Ihnen gewähltes Passwort (dieses wird ausschließlich verschlüsselt/gehasht gespeichert, uns liegt es im Klartext nicht vor). Die Verarbeitung erfolgt zur Erfüllung bzw. Anbahnung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).

Während der Kursnutzung speichern wir zudem Ihren Lernfortschritt (z. B. abgeschlossene Kapitel, beantwortete Übungsfragen, Ergebnisse von Prüfungssimulationen), um Ihnen den Kurs sowie Ihren persönlichen Fortschritt bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO).

## 7. Zahlungsabwicklung über Stripe

Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister **Stripe** (Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland; unter Umständen unter Einbindung der Muttergesellschaft Stripe, Inc., 354 Oyster Point Blvd, South San Francisco, USA, als Auftragsverarbeiter).

Dabei werden die für die Zahlungsabwicklung erforderlichen Daten (u. a. Ihre E-Mail-Adresse und Zahlungsinformationen) an Stripe übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Soweit im Rahmen der Zahlungsabwicklung Daten an Stripe, Inc. mit Sitz in den USA übermittelt werden, erfolgt dies auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).

Wir selbst erhalten und speichern keine vollständigen Zahlungs-/Kartendaten; diese verbleiben ausschließlich bei Stripe. Weitere Informationen: [https://stripe.com/de/privacy](https://stripe.com/de/privacy)

## 8. Hosting und Datenbank (Supabase)

Wir nutzen für den Betrieb unserer Datenbank, die Nutzerauthentifizierung und die Speicherung von Kursmaterialien (u. a. Videos, Audiodateien, PDFs) den Dienst **Supabase**. Unser Supabase-Projekt ist in der Region EU (Frankfurt) gehostet; personenbezogene Daten werden nach unserer Kenntnis dementsprechend innerhalb der Europäischen Union verarbeitet und gespeichert. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Weitere Informationen: [https://supabase.com/privacy](https://supabase.com/privacy)

## 9. Newsletter

Bei der Registrierung können Sie freiwillig und durch aktives Anklicken einer nicht vorausgewählten Checkbox einwilligen, künftig E-Mails mit Informationen rund um funkraus und den Kurs zu erhalten (Art. 6 Abs. 1 lit. a DSGVO). Diese Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an die in Ziffer 1 genannte Adresse. Ein automatisierter Newsletter-Versand ist zum jetzigen Zeitpunkt technisch noch nicht eingerichtet; eine erteilte Einwilligung wird für eine zukünftige Nutzung vorgehalten und nicht anderweitig verwendet.

## 10. Kontaktaufnahme

Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die uns dabei mitgeteilten Daten zur Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).

Wenn Sie im Kurs über die Funktion „Frage stellen“ eine Rückfrage zu einer Prüfungsfrage senden, speichern wir Ihre Nachricht, die betreffende Frage, Ihre gewählte Antwort, Ihre E-Mail-Adresse sowie den Verlauf unserer Antworten in Ihrem Nutzerkonto, um Ihre Frage zu beantworten und die Unterhaltung für Sie nachvollziehbar darzustellen (Art. 6 Abs. 1 lit. b DSGVO). Für die Benachrichtigung per E-Mail nutzen wir einen Dienstleister für den E-Mail-Versand (Resend), der hierfür Ihre E-Mail-Adresse und den Nachrichteninhalt verarbeitet; mit dem Anbieter (Plus Five Five, Inc., USA) besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Die Übermittlung in die USA erfolgt auf Grundlage der darin enthaltenen EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Fragen, die Sie mit „Merken“ speichern, werden ausschließlich in Ihrem Nutzerkonto abgelegt.

## 11. Speicherdauer

Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen (z. B. handels- und steuerrechtliche Aufbewahrungsfristen von bis zu zehn Jahren für zahlungsbezogene Unterlagen). Sie können die Löschung Ihres Nutzerkontos jederzeit bei uns beantragen; dies berührt nicht die Aufbewahrung von Daten, zu deren Aufbewahrung wir gesetzlich verpflichtet sind.

## 12. Ihre Rechte

Ihnen stehen nach der DSGVO folgende Rechte zu:

- **Auskunft** über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)
- **Berichtigung** unrichtiger Daten (Art. 16 DSGVO)
- **Löschung** Ihrer Daten (Art. 17 DSGVO)
- **Einschränkung der Verarbeitung** (Art. 18 DSGVO)
- **Datenübertragbarkeit** (Art. 20 DSGVO)
- **Widerspruch** gegen die Verarbeitung (Art. 21 DSGVO)
- **Widerruf** erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)
- **Beschwerde** bei einer Datenschutzaufsichtsbehörde (Art. 77 DSGVO)

Zuständige Aufsichtsbehörde ist die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.

## 13. Datensicherheit

Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen zufällige oder vorsätzliche Manipulation, Verlust, Zerstörung oder unberechtigten Zugriff zu schützen, u. a. eine verschlüsselte Datenübertragung (TLS/SSL) zwischen Ihrem Browser und unseren Servern.

## 14. Änderung dieser Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder bei Änderungen unseres Angebots und der Datenverarbeitung anzupassen. Es gilt jeweils die zum Zeitpunkt Ihres Besuchs aktuelle, auf dieser Seite veröffentlichte Fassung.

---

*Stand: September 2026*
`;

export default async function DatenschutzPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav email={user?.email ?? null} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Rechtliches</span>
        <h1 style={{ marginTop: 10, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Datenschutzerklärung</h1>
        <div className="prose" style={{ marginTop: 28 }}>
          <Markdown remarkPlugins={[remarkGfm]}>{CONTENT}</Markdown>
        </div>
      </div>
      <Footer />
    </div>
  );
}
