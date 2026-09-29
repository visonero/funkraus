import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import CookieConsent from "@/components/CookieConsent";

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://www.funkraus.de";
const TITLE = "BZF Online-Kurs mit KI-Funktraining | BZF I & II | funkraus";
const DESCRIPTION =
  "BZF I & II online lernen: kompletter Kurs, alle 261 Prüfungsfragen der Bundesnetzagentur und KI-Tower zum Sprechfunk üben. Die ersten 2 Module kostenlos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "BZF Online Kurs",
    "BZF Kurs",
    "BZF I und BZF II",
    "Sprechfunkzeugnis online lernen",
    "BZF Fragenkatalog",
    "BZF Prüfung Vorbereitung",
    "BZF Prüfungssimulation",
    "KI Sprechfunk Training",
    "Sprechfunk üben mit KI",
    "BZF Kurs PPL LAPL",
    "Flugfunk Sprechfunkzeugnis",
    "Bundesnetzagentur Fragenkatalog Flugfunk",
    "BZF Englisch",
  ],

  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "funkraus",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Hints Google's Sitelinks algorithm toward the site's primary sections. No guarantee it's used,
// but it's the standard signal for "these are the main parts of this site" beyond the nav itself.
const siteNavigationLd = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: ["Kursinhalt", "KI-Tower", "Preis", "Blog", "Partner werden"],
  url: [
    `${SITE_URL}/kurs`,
    `${SITE_URL}/ki-tower`,
    `${SITE_URL}/preis`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/partner`,
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${poppins.variable} ${plusJakartaSans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationLd) }} />
        {children}
        <CookieConsent />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
