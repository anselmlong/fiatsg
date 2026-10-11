// Renders single frames to PNG for checking. Usage: node still.mjs [16x9|9x16] <seconds...>
import { mkdir } from "node:fs/promises";
import { FPS } from "./timeline.mjs";
import { serve, openBrowser, openPage, shoot } from "./lib.mjs";
import "./prep.mjs";

const args = process.argv.slice(2);
const format = args[0] === "9x16" || args[0] === "16x9" ? args.shift() : "16x9";
const times = args.length ? args.map(Number) : [0, 0.5, 1.5, 2.5, 5, 8.5, 15, 25, 37, 44];
const { server, base } = await serve();
const browser = await openBrowser();
const page = await openPage(browser, base, format);
await mkdir(new URL("./out/stills", import.meta.url), { recursive: true });
for (const s of times) {
  const path = new URL(`./out/stills/${format}-${s.toFixed(2)}s.png`, import.meta.url).pathname;
  await shoot(page, Math.round(s * FPS), { path });
  console.log(path);
}
await browser.close();
server.close();
