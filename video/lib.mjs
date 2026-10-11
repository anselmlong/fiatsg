// Shared by still.mjs and render.mjs: a tiny static server over the repo (so the film can use the
// app's own saint images and screenshots in place) and a page opened on the composition.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".css": "text/css" };

export async function serve() {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

export const SIZES = { "16x9": [1920, 1080], "9x16": [1080, 1920] };

export async function openBrowser() {
  return chromium.launch({ args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"] });
}

export async function openPage(browser, base, format) {
  const [width, height] = SIZES[format];
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));
  page.on("console", (m) => m.type() === "error" && errors.push(new Error(m.text())));
  await page.goto(`${base}/video/index.html?format=${format}`);
  await page.waitForFunction(() => window.ready === true || false, null, { timeout: 60000 }).catch(() => {});
  if (errors.length) throw errors[0];
  if (!(await page.evaluate(() => window.ready))) throw new Error("Composition never became ready");
  // Warm up: show every section once so its layers and images are rasterised before real captures.
  for (let t = 0; t < 45; t += 1.5) await shoot(page, Math.round(t * 60), { type: "jpeg", quality: 10 });
  return page;
}

// Paint frame f, then wait two animation frames so the compositor has committed and rasterised it
// before the capture. Without this a cold page can hand back tiles that are still blank.
const paint = (f) => {
  window.seek(f);
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
};

export async function shoot(page, f, opts) {
  await page.evaluate(paint, f);
  // A busy frame can stall the compositor under parallel load; give it time, then try once more.
  try {
    return await page.screenshot({ timeout: 120000, ...opts });
  } catch (e) {
    console.warn(`\nframe ${f}: ${e.message.split("\n")[0]}, retrying`);
    await page.evaluate(paint, f);
    return page.screenshot({ timeout: 120000, ...opts });
  }
}
