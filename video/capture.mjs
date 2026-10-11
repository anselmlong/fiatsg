// Captures the real product screens for the flow demo from the live site, as the demo accounts in the
// root README. Read-only: after logging in, every non-GET request to the site is aborted, so filling the
// request form for the shot can never submit it. Writes public/screens/<shot>-<desktop|mobile>.png.
// Usage: node capture.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const SITE = "https://fiat.anselmlong.com";
const OUT = new URL("./public/screens/", import.meta.url).pathname;
const CAUSE = 5; // ACMI: Computer literacy accompanying trainer
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

await mkdir(OUT, { recursive: true });
// Where things are on each screen, as % of the viewport, for tap ripples and highlight rings.
const targets = {};
const browser = await chromium.launch();

async function session(device, email, password) {
  const ctx = await browser.newContext({ ...DEVICES[device], reducedMotion: "reduce", locale: "en-SG" });
  const page = await ctx.newPage();
  await page.goto(`${SITE}/login`);
  await page.fill("input[name=email]", email);
  await page.fill("input[name=password]", password);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click("button[type=submit]")]);
  // From here on, look but never touch.
  await ctx.route(`${SITE}/**`, (route) => (route.request().method() === "GET" ? route.continue() : route.abort()));
  return page;
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForFunction(() => !document.querySelector(".animate-pulse"), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function shot(page, name, device, marks = {}) {
  await settle(page);
  await page.screenshot({ path: `${OUT}${name}-${device}.png` });
  const vp = page.viewportSize();
  const found = {};
  for (const [key, locator] of Object.entries(marks)) {
    const b = await locator.first().boundingBox().catch(() => null);
    if (b) found[key] = { x: ((b.x + b.width / 2) / vp.width) * 100, y: ((b.y + b.height / 2) / vp.height) * 100, w: (b.width / vp.width) * 100, h: (b.height / vp.height) * 100 };
  }
  targets[`${name}-${device}`] = found;
  console.log(`${name}-${device}`, Object.keys(found).join(" "));
}

// Scroll so an element sits a little below the top of the viewport.
async function scrollTo(page, locator, offset = 0.12) {
  await locator.first().evaluate((el, off) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * off), offset);
  await page.waitForTimeout(300);
}

for (const device of Object.keys(DEVICES)) {
  // 1. An organisation asks for volunteers.
  const org = await session(device, "acmi@fiat.sg", "fiat-org-2026");
  await org.goto(`${SITE}/org/requests/new`);
  await settle(org);
  await org.fill("input[name=title]", "Computer literacy accompanying trainer");
  await org.fill("input[name=summary]", "Help migrant learners with basic computer skills and Microsoft Office on Sundays.");
  await org.fill("textarea[name=story]", "Accompanying trainers give one-to-one help in ACMI's Computer Literacy classes, so every learner can keep up.");
  await scrollTo(org, org.locator("h1"), 0.12);
  await shot(org, "org-new", device);
  await org.getByRole("button", { name: /next/i }).first().click();
  for (const gift of [/IT & tech/i, /Teaching/i]) await org.getByText(gift).first().click();
  await scrollTo(org, org.getByText(/IT & tech/i), 0.3);
  await shot(org, "org-gifts", device, { gift: org.getByText(/IT & tech/i) });

  // The organisation's own view: who offered to help, and the check-in code for the venue.
  await org.goto(`${SITE}/org/requests/${CAUSE}`);
  await settle(org);
  const html = await org.content();
  const token = html.match(/check-in\?k=([\w-]+)/)?.[1] ?? "";
  await scrollTo(org, org.getByText("Check-in code"), 0.22);
  await shot(org, "org-qr", device, { qr: org.getByText("Check-in code").locator("xpath=..").locator("svg"), accepted: org.getByText("Accepted") });
  await org.context().close();

  // 2. A volunteer finds causes that need the gifts they have, says yes, and checks in.
  const vol = await session(device, "maria@fiat.sg", "fiat-2026");
  await vol.goto(`${SITE}/causes`);
  await scrollTo(vol, vol.getByText("For you"), 0.16);
  await shot(vol, "vol-foryou", device, { gifts: vol.getByText(/Needs your gifts/), lang: vol.getByRole("combobox").or(vol.getByText("English", { exact: true })) });
  await vol.goto(`${SITE}/causes/${CAUSE}`);
  await settle(vol);
  await shot(vol, "vol-cause", device);
  await scrollTo(vol, vol.getByText("Can't come? You can still pray."), 0.25);
  await shot(vol, "vol-pray", device, { pray: vol.getByRole("button", { name: /pray for this/i }) });
  await vol.goto(`${SITE}/causes/${CAUSE}/check-in${token ? `?k=${token}` : ""}`);
  await shot(vol, "vol-checkin", device, { here: vol.getByRole("button", { name: /I'm here/i }) });
  await vol.context().close();

  // Saying yes, as anyone sees it before signing up.
  const anon = await browser.newContext({ ...DEVICES[device], reducedMotion: "reduce", locale: "en-SG" });
  await anon.route(`${SITE}/**`, (route) => (route.request().method() === "GET" ? route.continue() : route.abort()));
  const page = await anon.newPage();
  await page.goto(`${SITE}/causes/${CAUSE}`);
  await settle(page);
  const yes = page.getByRole("button", { name: /I'd like to help/i }).or(page.getByRole("link", { name: /I'd like to help/i }));
  await scrollTo(page, yes, device === "mobile" ? 0.55 : 0.6);
  await shot(page, "cause-yes", device, { yes });
  await anon.close();
}
await writeFile(`${OUT}targets.json`, JSON.stringify(targets, null, 2));
await browser.close();
