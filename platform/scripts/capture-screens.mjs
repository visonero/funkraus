#!/usr/bin/env node
// Captures the platform screenshots used on the landing page (desktop, tablet, mobile) as WebP files.
// Needs the dev server in demo mode: DEMO_DASHBOARD=1 DEMO_ACCESS=free|paid npm run dev
//
//   node scripts/capture-screens.mjs --access free|paid [--base http://localhost:3000] [--only name,name]

import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

const arg = (flag, fallback) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : fallback);
const base = arg("--base", "http://localhost:3000");
const access = arg("--access", "free");
const only = arg("--only", "")?.split(",").filter(Boolean);
const outDir = path.resolve("public/screens");
mkdirSync(outDir, { recursive: true });

const DEVICES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false },
  tablet: { width: 834, height: 1112, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--hide-scrollbars"] });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function lessonHref(title) {
  const { data } = await db.from("course_lessons").select("id").eq("title", title).maybeSingle();
  return data ? `/dashboard/course/${data.id}` : null;
}

async function settle(page, ms = 1600) {
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await new Promise((r) => setTimeout(r, ms));
}

async function seekVideo(page, seconds) {
  await page.evaluate(async (t) => {
    const v = document.querySelector("video");
    if (!v) return;
    v.muted = true;
    await new Promise((resolve) => {
      if (v.readyState >= 1) resolve(null);
      else v.addEventListener("loadedmetadata", () => resolve(null), { once: true });
      v.load();
    });
    await new Promise((resolve) => {
      v.addEventListener("seeked", () => resolve(null), { once: true });
      v.currentTime = t;
    });
    v.pause();
  }, seconds);
  await new Promise((r) => setTimeout(r, 700));
}

// Each shot: name, device, page path or lesson title, optional steps.
const SHOTS = [
  { name: "dashboard", devices: ["desktop", "tablet", "mobile"], path: "/dashboard", height: { desktop: 900, tablet: 1112, mobile: 844 } },
  { name: "kurs", devices: ["desktop", "tablet", "mobile"], path: "/dashboard/course", height: { desktop: 900, tablet: 1112, mobile: 844 } },
  {
    name: "lektion-video",
    devices: ["desktop", "tablet", "mobile"],
    lesson: { title: "Platzrunde und Landung", access: "paid" },
    video: 46.5,
    height: { desktop: 900, tablet: 1112, mobile: 844 },
  },
  {
    name: "quiz",
    devices: ["desktop", "tablet", "mobile"],
    lesson: { title: "Platzrunde und Landung", access: "paid" },
    quiz: true,
    height: { desktop: 900, tablet: 1112, mobile: 844 },
  },
  {
    name: "gesperrt",
    devices: ["desktop", "mobile"],
    lesson: { title: "Kontrollierter Flugplatz: Rollen und Start", access: "free" },
    height: { desktop: 900, tablet: 1112, mobile: 844 },
  },
];

for (const shot of SHOTS) {
  if (only.length && !only.includes(shot.name)) continue;
  if (shot.lesson && shot.lesson.access !== access) continue;
  for (const device of shot.devices) {
    const page = await browser.newPage();
    const spec = DEVICES[device];
    await page.setViewport({ ...spec, height: shot.height?.[device] ?? spec.height });
    let url = `${base}${shot.path ?? ""}`;
    if (shot.lesson) {
      const href = await lessonHref(shot.lesson.title);
      if (!href) throw new Error(`Lesson "${shot.lesson.title}" not found`);
      url = `${base}${href}`;
    }
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    if (shot.video) await seekVideo(page, shot.video);
    if (shot.quiz) {
      // answer the first question, then try options in the second until it is right (a realistic mix of both)
      const pause = (ms) => new Promise((r) => setTimeout(r, ms));
      await (await page.$$(".quiz-option"))[1]?.click();
      await pause(900);
      for (let i = 0; i < 4; i++) {
        const options = await page.$$(".quiz-option");
        await options[4 + i]?.click();
        await pause(900);
        const right = await page.evaluate(() => [...document.querySelectorAll(".dash-card")].filter((c) => c.textContent?.includes("Frage 2 von")).some((c) => c.textContent?.includes("Richtig!")));
        if (right) break;
        await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.textContent === "Nochmal versuchen")[1]?.click());
        await pause(400);
      }
      await page.evaluate(() => document.querySelector(".quiz-option")?.closest(".dash-card")?.scrollIntoView({ block: "start" }));
      await page.evaluate(() => window.scrollBy(0, -120));
    }
    await settle(page);
    const file = path.join(outDir, `${shot.name}-${device}.webp`);
    await page.screenshot({ path: file, type: "webp", quality: 86 });
    console.log(`-> ${path.relative(process.cwd(), file)}`);
    await page.close();
  }
}
await browser.close();
