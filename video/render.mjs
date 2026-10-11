// Renders both cuts and the thumbnail with Remotion. Usage: node render.mjs [16x9] [9x16]
// For a live, scrubbable preview instead: npx remotion studio src/index.js
import { execFileSync } from "node:child_process";
import { FRAMES } from "./timeline.mjs";

const formats = process.argv.slice(2).length ? process.argv.slice(2) : ["16x9", "9x16"];
const run = (...args) => execFileSync("npx", ["remotion", ...args], { stdio: "inherit", cwd: new URL(".", import.meta.url).pathname });

execFileSync("node", ["prep.mjs"], { stdio: "inherit" });
execFileSync("node", ["audio.mjs"], { stdio: "inherit" });
for (const f of formats) {
  run("render", "src/index.js", `Fiat${f}`, `out/fiat-intro-${f}.mp4`, "--codec=h264", "--crf=18", "--concurrency=8", "--audio-codec=aac");
  // The thumbnail is the clean final frame, captured straight to PNG.
  if (f === "16x9") run("still", "src/index.js", "Fiat16x9", "out/thumbnail.png", `--frame=${FRAMES - 1}`);
}
