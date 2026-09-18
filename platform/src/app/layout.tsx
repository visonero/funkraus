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

export const metadata: Metadata = {
  title: "funkraus — BZF I & II Online-Kurs",
  description:
    "Der komplette Online-Kurs für dein Sprechfunkzeugnis BZF I & II. Fester Preis, sofortiger Zugang, kein Verkaufsgespräch.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${poppins.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
