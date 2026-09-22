import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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

const SITE_URL = "https://funkraus.de";
const TITLE = "BZF Online-Kurs für PPL & LAPL – Sprechfunkzeugnis lernen | funkraus";
const DESCRIPTION =
  "Der komplette BZF I & II Online-Kurs für deinen PPL(A) oder LAPL(A): offizieller Fragenkatalog der Bundesnetzagentur, Video, Audio-Funkübungen und PDF-Merkblätter. Starte jetzt kostenlos mit Modul 0 und 1.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "BZF Kurs",
    "BZF Online Kurs",
    "Sprechfunkzeugnis",
    "BZF I und II",
    "Sprechfunkprüfung",
    "Flugfunkzeugnis",
    "BZF Fragenkatalog",
    "Sprechfunkzeugnis PPL",
    "BZF Kurs LAPL",
    "Sprechfunk online lernen",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${poppins.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
