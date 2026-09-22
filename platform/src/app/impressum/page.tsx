import type { Metadata } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Impressum — funkraus",
  description: "Anbieterkennzeichnung gemäß § 5 DDG.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/impressum" },
};

const CONTENT = `
## Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)

- Hussam Alkhodour
- Auf der Scholle 8
- 40668 Meerbusch
- Deutschland

**funkraus** ist ein Einzelunternehmen von Hussam Alkhodour.

## Kontakt

- Telefon: +49 163 8182323
- E-Mail: h.alkhodour@web.de

## Umsatzsteuer

Gemäß § 19 Abs. 1 UStG wird auf unseren Rechnungen keine Umsatzsteuer ausgewiesen und keine Umsatzsteuer berechnet (Kleinunternehmerregelung).

## Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV

Hussam Alkhodour (Anschrift wie oben)

## EU-Streitschlichtung

Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr/](https://ec.europa.eu/consumers/odr/). Unsere E-Mail-Adresse finden Sie oben unter Kontakt.

## Verbraucherstreitbeilegung

Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

## Haftung für Inhalte

Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.

Die Kursinhalte werden mit Sorgfalt auf Grundlage öffentlich zugänglicher amtlicher Quellen (u. a. Prüfungsfragenkatalog der Bundesnetzagentur, NfL der DFS, FlugfunkV) erstellt. Eine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir nicht übernehmen. **funkraus ist ein eigenständiges, privates Lernangebot und steht in keiner Verbindung zur Bundesnetzagentur, der Deutschen Flugsicherung (DFS) oder dem Luftfahrt-Bundesamt (LBA).**

## Haftung für Links

Unser Angebot enthält gegebenenfalls Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

## Urheberrecht

Die durch uns selbst erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

---

*Stand: September 2026*
`;

export default async function ImpressumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav email={user?.email ?? null} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Rechtliches</span>
        <h1 style={{ marginTop: 10, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Impressum</h1>
        <div className="prose" style={{ marginTop: 28 }}>
          <Markdown remarkPlugins={[remarkGfm]}>{CONTENT}</Markdown>
        </div>
      </div>
      <Footer />
    </div>
  );
}
