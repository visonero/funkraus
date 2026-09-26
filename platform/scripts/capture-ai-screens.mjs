#!/usr/bin/env node
// Captures the screenshots for the AI tower, the one-question-at-a-time lesson view and the new lesson layout.
// Needs the dev server in demo mode with prepared tower answers (ANTHROPIC_API_KEY empty) and a voice key:
//   ANTHROPIC_API_KEY= npm run dev     (DEMO_DASHBOARD=1 in .env.local)
//   node --env-file=.env.local scripts/capture-ai-screens.mjs [--base http://localhost:3000] [--only tower,frage,...]

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

const arg = (flag, fallback) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : fallback);
const base = arg("--base", "http://localhost:3000");
const only = arg("--only", "")?.split(",").filter(Boolean);
const outDir = path.resolve("public/screens");
mkdirSync(outDir, { recursive: true });
const want = (n) => !only.length || only.includes(n);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const DEVICES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  tablet: { width: 834, height: 1112, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--hide-scrollbars", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});
await browser.defaultBrowserContext().overridePermissions(base, ["microphone"]);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const meta = {};

async function newPage(device, tall = false) {
  const page = await browser.newPage();
  await page.setViewport(tall && device === "desktop" ? { ...DEVICES.desktop, height: 1150 } : DEVICES[device]);
  // No cookie banner in the pictures.
  await page.evaluateOnNewDocument(() => localStorage.setItem("funkraus-analytics-consent", "denied"));
  return page;
}
async function settle(page, ms = 1200) {
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await pause(ms);
}
async function shot(page, name, device, clip) {
  const file = path.join(outDir, `${name}-${device}.webp`);
  await page.screenshot({ path: file, type: "webp", quality: 88, ...(clip ? { clip } : {}) });
  console.log(`-> ${path.relative(process.cwd(), file)}`);
}
async function lessonUrl(title) {
  const { data } = await db.from("course_lessons").select("id").eq("title", title).maybeSingle();
  if (!data) throw new Error(`Lesson "${title}" not found`);
  return `${base}/dashboard/course/${data.id}`;
}

// ---------- AI tower ----------
async function towerRun(device) {
  const page = await newPage(device, true);
  await page.goto(`${base}/dashboard/tower`, { waitUntil: "networkidle0", timeout: 60000 });
  // scenario 1 (German) = "Rollen und Start"
  await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.textContent.trim().startsWith("Übung starten"))[0].click());
  await page.waitForSelector('input[aria-label="Funkspruch tippen"]');
  const info = await page.evaluate(() => {
    const field = (label) => [...[...document.querySelectorAll("p")].find((x) => x.textContent === label).parentElement.children].map((c) => c.textContent);
    const sit = document.querySelector("main").innerText.match(/SCHRITT 1 VON 5\n[^\n]*\n\n([^\n]*)/)?.[1] ?? "";
    return { cs: field("Rufzeichen")[2], type: field("Flugzeug")[2].replace("gesprochen: ", ""), ad: field("Flugplatz")[1], spot: sit.match(/stehst (.*?) in /)?.[1] ?? "am Vorfeld" };
  });
  const say = async (text) => {
    await page.evaluate((t) => {
      const i = document.querySelector('input[aria-label="Funkspruch tippen"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, t);
      i.dispatchEvent(new Event("input", { bubbles: true }));
    }, text);
    await pause(250);
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Senden").click());
    await pause(9000); // tower answer + its voice
  };
  await say(`${info.ad} Rollkontrolle, ${info.cs}, ${info.type}, ${info.spot}, erbitte Rollen`);
  const reply = await page.evaluate(() => {
    const b = [...document.querySelectorAll("div")].filter((d) => d.style && d.style.maxWidth === "88%");
    return b[b.length - 1]?.innerText ?? "";
  });
  const m = reply.match(/Piste (.*?), QNH (.*?)\./);
  await say(`Rollen zum Rollhalt Piste ${m?.[1]}, QNH ${m?.[2]}, ${info.cs}`);
  return { page, info };
}

if (want("tower")) {
  for (const device of ["desktop", "mobile"]) {
    const { page } = await towerRun(device);
    await settle(page, 600);
    if (device === "mobile") await page.evaluate(() => document.querySelector(".dash-card")?.scrollIntoView({ block: "start" }));
    else await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 500);
    await shot(page, "tower", device, device === "desktop" ? { x: 0, y: 30, width: 1440, height: 1010 } : undefined);
    await page.close();
  }
}

if (want("tower-feedback")) {
  const page = await newPage("desktop", true);
  await page.goto(`${base}/dashboard/tower`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.textContent.trim().startsWith("Übung starten"))[0].click());
  await page.waitForSelector('input[aria-label="Funkspruch tippen"]');
  const info = await page.evaluate(() => {
    const field = (label) => [...[...document.querySelectorAll("p")].find((x) => x.textContent === label).parentElement.children].map((c) => c.textContent);
    const sit = document.querySelector("main").innerText.match(/SCHRITT 1 VON 5\n[^\n]*\n\n([^\n]*)/)?.[1] ?? "";
    return { cs: field("Rufzeichen")[2], type: field("Flugzeug")[2].replace("gesprochen: ", ""), ad: field("Flugplatz")[1], spot: sit.match(/stehst (.*?) in /)?.[1] ?? "am Vorfeld" };
  });
  const lastTower = () => page.evaluate(() => {
    const b = [...document.querySelectorAll("div")].filter((d) => d.style && d.style.maxWidth === "88%");
    return b[b.length - 1]?.innerText ?? "";
  });
  const bubbles = () => page.evaluate(() => [...document.querySelectorAll("div")].filter((d) => d.style && d.style.maxWidth === "88%").length);
  const say = async (text) => {
    const before = await bubbles();
    await page.evaluate((t) => {
      const i = document.querySelector('input[aria-label="Funkspruch tippen"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, t);
      i.dispatchEvent(new Event("input", { bubbles: true }));
    }, text);
    // "Senden" stays disabled while the previous tower answer is still being spoken
    await page.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Senden"); return b && !b.disabled; }, { timeout: 40000 });
    await pause(2400); // the tower accepts one transmission every two seconds
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Senden").click());
    await page.waitForFunction((n) => [...document.querySelectorAll("div")].filter((d) => d.style && d.style.maxWidth === "88%").length >= n + 2, { timeout: 30000 }, before);
    return lastTower();
  };
  const r1 = await say(`${info.ad} Rollkontrolle, ${info.cs}, ${info.type}, ${info.spot}, erbitte Rollen`);
  const m = r1.match(/Piste (.*?), QNH (.*?)\./);
  await say(`Verstanden, ${info.cs}`); // an incomplete read-back: the one real, instructive slip
  await say(`Rollen zum Rollhalt Piste ${m[1]}, QNH ${m[2]}, ${info.cs}`);
  const r3 = await say(`${info.ad} Turm, ${info.cs}, Rollhalt Piste ${m[1]}, abflugbereit`);
  await say(`Piste ${m[1]}, Start frei, ${info.cs}`);
  const mins = await page.evaluate(() => (document.querySelector("main").innerText.match(/es ist ([^.]*)\./)?.[1] ?? "").split(" ").pop());
  const digits = { fünfundvierzig: "vier fünf", zwanzig: "zwo null", zehn: "eins null", fünfzehn: "eins fünf", fünfzig: "fünf null" };
  await say(`Abgehoben ${digits[mins] ?? "vier fünf"}, ${info.cs}`);
  void r3;
  // "Feedback ansehen" stays disabled while the last tower answer is still being spoken
  await page.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("Feedback ansehen")); return b && !b.disabled; }, { timeout: 40000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Feedback ansehen")).click());
  await page.waitForFunction(() => document.body.innerText.includes("Das war gut") || document.body.innerText.includes("Das kannst du verbessern"), { timeout: 20000 });
  await pause(800);
  await settle(page, 600);
  await shot(page, "tower-feedback", "desktop", { x: 0, y: 0, width: 1440, height: 900 });
  await page.close();
}

// ---------- One question per screen ----------
if (want("frage")) {
  for (const device of ["desktop", "mobile"]) {
    const page = await newPage(device);
    await page.goto(await lessonUrl("Platzrunde und Landung"), { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="Schritt "]')].find((b) => /Frage 2 von/.test(b.getAttribute("aria-label")))?.click());
    await pause(900);
    for (let i = 0; i < 4; i++) {
      await page.evaluate((k) => document.querySelectorAll(".quiz-option")[k]?.click(), i);
      await pause(1100);
      const right = await page.evaluate(() => document.body.innerText.includes("Richtig!"));
      if (right) break;
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent === "Nochmal versuchen")?.click());
      await pause(400);
    }
    await page.evaluate(() => document.querySelector(".lesson-step")?.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -110));
    await settle(page, 800);
    if (device === "desktop") {
      const r = await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().includes("Merken"));
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      meta.merken = r;
    }
    await shot(page, "frage", device);
    await page.close();
  }
}

// ---------- Lesson (new layout): the video step ----------
if (want("lektion")) {
  for (const device of ["desktop", "tablet", "mobile"]) {
    const page = await newPage(device);
    await page.goto(await lessonUrl("Platzrunde und Landung"), { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(async () => {
      const v = document.querySelector("video");
      if (!v) return;
      v.muted = true;
      await new Promise((resolve) => (v.readyState >= 1 ? resolve(null) : (v.addEventListener("loadedmetadata", () => resolve(null), { once: true }), v.load())));
      await new Promise((resolve) => (v.addEventListener("seeked", () => resolve(null), { once: true }), (v.currentTime = 46.5)));
      v.pause();
    });
    await settle(page, 900);
    await shot(page, "lektion-video", device);
    await page.close();
  }
}

writeFileSync(path.join(outDir, "ai-meta.json"), JSON.stringify(meta, null, 2));
await browser.close();
