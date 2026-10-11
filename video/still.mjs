// Renders single frames to PNG for checking, bundling once. Usage: node still.mjs [16x9|9x16] <seconds...>
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { FPS } from "./timeline.mjs";

const args = process.argv.slice(2);
const format = args[0] === "9x16" || args[0] === "16x9" ? args.shift() : "16x9";
const times = args.length ? args.map(Number) : [0, 0.5, 1.5, 2.5, 4, 6.5, 9.5, 13.5, 17.5, 21, 24, 27, 30, 33, 36.5, 41, 44, 51];
const serveUrl = await bundle({ entryPoint: new URL("./src/index.js", import.meta.url).pathname, publicDir: new URL("./public", import.meta.url).pathname });
const composition = await selectComposition({ serveUrl, id: `Fiat${format}` });
mkdirSync(new URL("./out/stills", import.meta.url), { recursive: true });
for (const s of times) {
  const output = new URL(`./out/stills/${format}-${s.toFixed(2)}s.png`, import.meta.url).pathname;
  await renderStill({ serveUrl, composition, frame: Math.min(composition.durationInFrames - 1, Math.round(s * FPS)), output });
  console.log(output);
}
