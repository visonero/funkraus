import type { Metadata } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AGB — funkraus",
  description: "Allgemeine Geschäftsbedingungen für den funkraus Online-Kurs.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/agb" },
};

const CONTENT = `
## § 1 Geltungsbereich

(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge, die zwischen Hussam Alkhodour, Auf der Scholle 8, 40668 Meerbusch (nachfolgend „Anbieter", „wir" oder „uns"), und Verbrauchern über die Nutzung des Online-Kurses **funkraus** (nachfolgend „Kurs") geschlossen werden.

(2) Verbraucher im Sinne dieser AGB ist jede natürliche Person (§ 13 BGB), die den Kurs zu einem Zweck erwirbt, der überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden kann. Der Kurs richtet sich an Verbraucher mit Wohnsitz in Deutschland.

(3) Abweichende, entgegenstehende oder ergänzende Bedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, wir stimmen ihrer Geltung ausdrücklich in Textform zu.

## § 2 Vertragspartner

Der Vertrag kommt zustande mit Hussam Alkhodour. Die vollständigen Kontaktdaten finden Sie in unserem [Impressum](/impressum).

## § 3 Leistungsbeschreibung

(1) funkraus ist ein internetbasierter Online-Kurs zur Vorbereitung auf die Prüfung zum Erwerb des Beschränkt Gültigen Sprechfunkzeugnisses für den Flugfunkdienst (BZF I und/oder BZF II) bei der Bundesnetzagentur.

(2) Der Kurs umfasst insbesondere Lernvideos, Audioübungen, herunterladbare PDF-Materialien sowie Übungsfragen und Prüfungssimulationen auf Grundlage des öffentlich zugänglichen Prüfungsfragenkatalogs der Bundesnetzagentur.

(3) funkraus ist ein eigenständiges, privates Lernangebot und steht in keiner Verbindung zur Bundesnetzagentur, der Deutschen Flugsicherung (DFS) oder dem Luftfahrt-Bundesamt (LBA). Die Nutzung des Kurses ist keine Anmeldung zur amtlichen Prüfung und ersetzt diese nicht — die Anmeldung zur Prüfung erfolgt eigenständig durch den Kunden bei der zuständigen Außenstelle der Bundesnetzagentur.

(4) Wir erstellen die Kursinhalte mit Sorgfalt auf Grundlage öffentlich zugänglicher amtlicher Quellen (u. a. Prüfungsfragenkatalog der Bundesnetzagentur, Nachrichten für Luftfahrer der DFS, FlugfunkV). Eine Garantie für die fortlaufende Aktualität, Vollständigkeit oder Richtigkeit einzelner Inhalte sowie für das Bestehen der amtlichen Prüfung übernehmen wir nicht. Änderungen der zugrunde liegenden amtlichen Vorschriften nach Veröffentlichung eines Kursinhalts bleiben vorbehalten und können zu zeitweiligen Abweichungen führen.

## § 4 Vertragsschluss

(1) Die Darstellung des Kurses auf unserer Website stellt kein bindendes Angebot unsererseits dar, sondern eine unverbindliche Aufforderung an den Kunden, ein Angebot abzugeben.

(2) Zur Nutzung des Kurses ist zunächst die kostenlose Erstellung eines Nutzerkontos erforderlich. Durch Anklicken des Kontrollkästchens zur Zustimmung zu diesen AGB und zum Widerrufshinweis sowie durch anschließenden Klick auf den Button „Jetzt freischalten" gibt der Kunde ein verbindliches Angebot zum Abschluss eines Vertrags über den Vollzugang zum Kurs ab.

(3) Der Vertrag kommt zustande, sobald wir die Zahlung über unseren Zahlungsdienstleister Stripe bestätigen und dem Kunden den Vollzugang zum Kurs freischalten; dies erfolgt im Regelfall unmittelbar im Anschluss an die erfolgreiche Zahlung.

(4) Der Vertragstext wird von uns nicht gesondert archiviert und ist nach Vertragsschluss nicht über unsere Website abrufbar. Wir empfehlen dem Kunden, diese AGB vor Abschluss der Bestellung zu speichern oder auszudrucken.

## § 5 Preise und Zahlung

(1) Es gilt der zum Zeitpunkt der Bestellung auf der Website angegebene Preis (Stand dieser AGB: ${PRICE},00 EUR für den Vollzugang, einmalige Zahlung).

(2) Wir sind Kleinunternehmer im Sinne des § 19 Abs. 1 UStG. Auf unseren Preisen wird daher keine Umsatzsteuer ausgewiesen und keine Umsatzsteuer erhoben; die angegebenen Preise sind Endpreise.

(3) Die Zahlung erfolgt ausschließlich über unseren Zahlungsdienstleister Stripe im Wege der von Stripe angebotenen Zahlungsarten. Es gelten ergänzend die jeweils aktuellen Nutzungsbedingungen von Stripe.

(4) Der Kaufpreis ist mit Vertragsschluss sofort in voller Höhe fällig.

## § 6 Nutzungsrechte

(1) Mit vollständiger Zahlung erhält der Kunde ein einfaches, nicht übertragbares und nicht unterlizenzierbares Recht, die Kursinhalte für die Dauer der Zugriffsberechtigung gemäß § 7 ausschließlich zu eigenen, privaten Lernzwecken zu nutzen.

(2) Eine Vervielfältigung, Weitergabe, öffentliche Zugänglichmachung oder sonstige Verwertung der Kursinhalte gegenüber Dritten — auch auszugsweise — ist ohne unsere vorherige ausdrückliche Zustimmung untersagt. Das Anfertigen einer angemessenen Anzahl privater Sicherungskopien durch den Kunden für den eigenen Gebrauch bleibt hiervon unberührt.

(3) Der Zugang zum Kurs ist personengebunden und darf nicht an Dritte weitergegeben werden.

## § 7 Zugriffsdauer

(1) Der Vollzugang zum Kurs wird für die Dauer von **12 Monaten** ab Freischaltung gewährt.

(2) Eine Verlängerung des Zugriffs über diese Frist hinaus ist derzeit nicht automatisch vorgesehen. Sollte sich hieran etwas ändern, informieren wir bestehende Kunden rechtzeitig.

## § 8 Widerrufsrecht

### Widerrufsbelehrung

**Widerrufsrecht**

Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Hussam Alkhodour, Auf der Scholle 8, 40668 Meerbusch, E-Mail: h.alkhodour@web.de) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, was jedoch nicht vorgeschrieben ist.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

**Folgen des Widerrufs**

Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.

**Vorzeitiges Erlöschen des Widerrufsrechts bei digitalen Inhalten**

Ihr Widerrufsrecht erlischt vorzeitig, wenn wir mit der Ausführung des Vertrags — also mit der Freischaltung Ihres Zugriffs auf die Kursinhalte — begonnen haben, nachdem Sie

a) ausdrücklich zugestimmt haben, dass wir mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen, und

b) Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren.

Diese Zustimmung sowie die Bestätigung Ihrer Kenntnis holen wir vor Abschluss des Bestellvorgangs durch ein gesondertes, nicht vorausgewähltes Kontrollkästchen ein. Ohne diese Zustimmung wird der Bestellvorgang nicht abgeschlossen.

### Muster-Widerrufsformular

*(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es an uns zurück.)*

An:
Hussam Alkhodour, Auf der Scholle 8, 40668 Meerbusch, E-Mail: h.alkhodour@web.de

Hiermit widerrufe(n) ich/wir (\\*) den von mir/uns (\\*) abgeschlossenen Vertrag über den Kauf des folgenden Kurses: **funkraus — BZF I & II Online-Kurs**

- Bestellt am (\\*): _______________
- Name des/der Verbraucher(s): _______________
- Anschrift des/der Verbraucher(s): _______________
- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _______________
- Datum: _______________

(\\*) Unzutreffendes streichen.

## § 9 Gewährleistung

(1) Es gelten die gesetzlichen Gewährleistungsvorschriften für Verträge über digitale Produkte (§§ 327 ff. BGB). Bei Mängeln der Kursinhalte stehen dem Kunden die gesetzlichen Rechte auf Nacherfüllung, Vertragsbeendigung und Schadensersatz nach Maßgabe der gesetzlichen Bestimmungen zu.

(2) Sollten Kursinhalte fehlerhaft oder veraltet sein, bitten wir um eine Mitteilung an die in § 2 genannte E-Mail-Adresse, damit wir dies zeitnah prüfen und gegebenenfalls korrigieren können.

## § 10 Haftung

(1) Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach den Vorschriften des Produkthaftungsgesetzes. Für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit haften wir ebenfalls unbeschränkt.

(2) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf, ist unsere Haftung der Höhe nach auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.

(3) Im Übrigen ist die Haftung für leicht fahrlässige Pflichtverletzungen ausgeschlossen.

(4) funkraus dient ausschließlich der Vorbereitung auf die amtliche BZF-Prüfung. Wir übernehmen keine Haftung dafür, dass die Teilnahme am Kurs zum Bestehen der amtlichen Prüfung führt, und keine Gewähr für die Richtigkeit einzelner Inhalte über den in § 3 Abs. 4 beschriebenen Umfang hinaus. Der Kunde bleibt selbst dafür verantwortlich, sich vor der Prüfung über die jeweils aktuell gültigen amtlichen Vorschriften zu informieren.

## § 11 Datenschutz

Informationen zur Erhebung und Verarbeitung personenbezogener Daten finden Sie in unserer [Datenschutzerklärung](/datenschutz).

## § 12 Änderung dieser AGB

Diese AGB gelten in der zum Zeitpunkt des jeweiligen Vertragsschlusses veröffentlichten Fassung. Wir behalten uns vor, die AGB für zukünftige Vertragsschlüsse zu ändern; eine geänderte Fassung wird rechtzeitig vor Abschluss eines neuen Vertrags auf dieser Seite veröffentlicht. Bereits geschlossene Verträge bleiben von späteren Änderungen unberührt.

## § 13 Schlussbestimmungen

(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht zwingende Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, entgegenstehen.

(2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt.

(3) Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, abrufbar unter [https://ec.europa.eu/consumers/odr/](https://ec.europa.eu/consumers/odr/). Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

---

*Stand: September 2026*
`;

export default async function AgbPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav email={user?.email ?? null} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Rechtliches</span>
        <h1 style={{ marginTop: 10, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Allgemeine Geschäftsbedingungen</h1>
        <div className="prose" style={{ marginTop: 28 }}>
          <Markdown remarkPlugins={[remarkGfm]}>{CONTENT}</Markdown>
        </div>
      </div>
      <Footer />
    </div>
  );
}
