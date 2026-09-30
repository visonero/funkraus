# UTM-Links für alle Kanäle

Ziel: In Google Analytics siehst du danach nicht nur "wie viele Besucher", sondern **welcher Kanal, welches Video, welcher Forumsbeitrag** tatsächlich zu Besuchen (und im Idealfall Registrierungen) führt.

## Die Namenskonvention (für alles, was noch kommt)

Jeder Link bekommt drei Parameter, immer klein geschrieben, Wörter mit `_` getrennt:

- **utm_source** — die konkrete Plattform/Seite: `youtube`, `linkedin`, `tiktok`, `instagram`, oder der Name des jeweiligen Forums (`pilotenforum`, `gutefrage`, …)
- **utm_medium** — die Kanal-Art: `video`, `shorts`, `social`, `forum`, `email`
- **utm_campaign** — das konkrete Stück Content, z. B. `video01_sales`, `mission_artikel`, `bio_link`

Formel zum Selbstbauen:
```
https://www.funkraus.de/ZIELSEITE?utm_source=QUELLE&utm_medium=ART&utm_campaign=INHALT
```

**Zwei Dinge, die wichtig sind, bevor du loslegst:**

1. **Nie interne Links auf funkraus.de selbst mit UTM taggen** (z. B. einen Blogartikel-Link zu einem anderen Blogartikel). UTM-Parameter sind für Traffic von **außerhalb** gedacht — auf internen Links verfälschen sie die Analyse (jeder interne Klick sähe dann aus wie ein neuer externer Besuch).
2. **TikTok und Instagram erlauben nur einen einzigen Link im Profil** (kein Link pro Video/Post, außer mit einem zusätzlichen Tool wie Linktree). Du kannst also nicht direkt sehen, welches TikTok-Video geklickt hat — nur, dass es von TikTok kam. Praktikabler Workaround: den Bio-Link-Parameter (`utm_campaign`) alle 1–2 Wochen aktualisieren, passend zum gerade gepushten Video — dann siehst du wenigstens grob, welche Content-Welle gezogen hat.
3. Die neuen statischen Seiten (Startseite, /kurs, /preis, /ki-tower) sind davon unberührt — ein `?utm_...` in der URL ändert nichts an der Seite selbst, die Startseite bleibt genau so schnell/statisch wie eben erst eingerichtet.

---

## YouTube

| Was | Link |
|---|---|
| Video 1 (Sales-Video), Beschreibung | `https://www.funkraus.de/?utm_source=youtube&utm_medium=video&utm_campaign=video01_sales` |
| Video 2 (Fragenkatalog, Woche 2) | `https://www.funkraus.de/?utm_source=youtube&utm_medium=video&utm_campaign=video02_fragenkatalog` |
| Video 3 (KI-Tower-Demo, Woche 3) — zeigt direkt auf die KI-Tower-Seite | `https://www.funkraus.de/ki-tower?utm_source=youtube&utm_medium=video&utm_campaign=video03_ki_tower_demo` |
| Video 4 (Mayday/Pan-Pan, Woche 4) — zeigt direkt auf den passenden Blogartikel | `https://www.funkraus.de/blog/mayday-pan-pan-erklaert?utm_source=youtube&utm_medium=video&utm_campaign=video04_mayday` |
| Short 1 ("7 Anfänger-Fehler") | `https://www.funkraus.de/?utm_source=youtube&utm_medium=shorts&utm_campaign=short01_anfaenger_fehler` |
| Short 2 ("5 Wörter im Funk") | `https://www.funkraus.de/?utm_source=youtube&utm_medium=shorts&utm_campaign=short02_funk_woerter` |
| Kanal-Link im "Info"-Tab (allgemein, nicht videospezifisch) | `https://www.funkraus.de/?utm_source=youtube&utm_medium=social&utm_campaign=channel_link` |

Für jedes weitere Video/Short einfach `videoXX_thema` bzw. `shortXX_thema` fortlaufend hochzählen.

## LinkedIn

| Was | Link |
|---|---|
| Unternehmensseite, "Website"-Button | `https://www.funkraus.de/?utm_source=linkedin&utm_medium=social&utm_campaign=company_page` |
| Erster Artikel ("Warum es funkraus gibt") | `https://www.funkraus.de/?utm_source=linkedin&utm_medium=social&utm_campaign=mission_artikel` |
| Dein persönliches Profil (Kontaktinfo/Featured) | `https://www.funkraus.de/?utm_source=linkedin&utm_medium=social&utm_campaign=personal_profile` |

## TikTok & Instagram

Beide zeigen bewusst direkt auf die Registrierung, weil die CTA-Folie am Ende jeder Slideshow schon "Jetzt kostenlos starten" sagt — ein Klick weniger als ein Umweg über die Startseite:

| Was | Link |
|---|---|
| TikTok Bio-Link | `https://www.funkraus.de/login?mode=signup&utm_source=tiktok&utm_medium=social&utm_campaign=bio_link` |
| Instagram Bio-Link | `https://www.funkraus.de/login?mode=signup&utm_source=instagram&utm_medium=social&utm_campaign=bio_link` |

## Foren (aus `community-outreach.md`)

Jedes Forum bekommt seine eigene `utm_source` — das war der ganze Sinn der Forenrecherche: am Ende siehst du schwarz auf weiß, welches Forum tatsächlich Besucher bringt.

| Forum | Link |
|---|---|
| Pilot und Flugzeug Forum | `https://www.funkraus.de/?utm_source=pilotundflugzeug&utm_medium=forum&utm_campaign=community_outreach` |
| Pilotenforum.org | `https://www.funkraus.de/?utm_source=pilotenforum&utm_medium=forum&utm_campaign=community_outreach` |
| ulForum.de | `https://www.funkraus.de/?utm_source=ulforum&utm_medium=forum&utm_campaign=community_outreach` |
| gutefrage.net | `https://www.funkraus.de/?utm_source=gutefrage&utm_medium=forum&utm_campaign=community_outreach` |
| piloten.club | `https://www.funkraus.de/?utm_source=pilotenclub&utm_medium=forum&utm_campaign=community_outreach` |
| aero.de | `https://www.funkraus.de/?utm_source=aerode&utm_medium=forum&utm_campaign=community_outreach` |

Tipp: Wo das Forum es erlaubt (BBCode/Markdown-Links), den Linktext einfach als `funkraus.de` anzeigen lassen, auch wenn die eigentliche URL lang ist — sieht dann nicht wie Spam aus. Auf gutefrage.net wird die Adresse ohnehin meist komplett angezeigt, das lässt sich nicht vermeiden.

## Partnerprogramm

| Was | Link |
|---|---|
| Erstkontakt-E-Mail an Vereine/Flugschulen — zeigt direkt auf die Partnerseite | `https://www.funkraus.de/partner?utm_source=partner-email&utm_medium=email&utm_campaign=partner_outreach` |
| Falls es zu einer Erwähnung im DAeC-Newsletter kommt | `https://www.funkraus.de/?utm_source=daec&utm_medium=newsletter&utm_campaign=daec_pitch` |

---

## Falls die Links zu lang/unhandlich werden

Für Orte, wo eine kurze, saubere URL besser wirkt (z. B. mündlich im Video genannt, oder auf einem Flyer), kann ich in eurem next.config.ts ein paar kurze Weiterleitungen einrichten, z. B. `funkraus.de/go/yt1` → der lange Link oben — mit einer **temporären** Weiterleitung (nicht permanent), damit sie sich bei Bedarf jederzeit ändern lässt, ohne dass Browser sie für immer zwischenspeichern. Sag Bescheid, falls das für dich sinnvoll ist, dann baue ich es ein.
