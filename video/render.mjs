// Renders the film frame by frame in parallel headless pages, then stitches the frames and the score
// with ffmpeg. Usage: node render.mjs [16x9] [9x16]   (both by default)
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { cpus } from "node:os";
import { FPS, FRAMES } from "./timeline.mjs";
import { serve, openBrowser, openPage, shoot } from "./lib.mjs";
import "./prep.mjs";

const here = (p) => new URL(p, import.meta.url).pathname;
const formats = process.argv.slice(2).length ? process.argv.slice(2) : ["16x9", "9x16"];
const WORKERS = Math.max(2, Math.min(8, cpus().length - 2));

execFileSync("node", [here("audio.mjs")], { stdio: "inherit" });
await mkdir(here("out"), { recursive: true });
const { server, base } = await serve();
const browser = await openBrowser();

for (const format of formats) {
  const dir = here(`.frames/${format}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const started = Date.now();
  let done = 0;
  // Contiguous chunks, one per page. Every frame is a pure function of its number, so order doesn't matter.
  const chunk = Math.ceil(FRAMES / WORKERS);
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await openPage(browser, base, format);
    for (let f = w * chunk; f < Math.min(FRAMES, (w + 1) * chunk); f++) {
      await shoot(page, f, { path: `${dir}/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 95 });
      if (++done % 150 === 0) process.stdout.write(`\r${format}: ${done}/${FRAMES} frames, ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    await page.close();
  }));
  console.log(`\r${format}: ${FRAMES} frames in ${((Date.now() - started) / 1000).toFixed(0)}s`);

  const out = here(`out/fiat-intro-${format}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/f%05d.jpg`, "-i", here("out/score.wav"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-profile:v", "high",
    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" });
  console.log(out);

  if (format === "16x9") {
    // The thumbnail is the final frame, captured straight to PNG rather than pulled from the MP4.
    const page = await openPage(browser, base, format);
    await shoot(page, FRAMES - 1, { path: here("out/thumbnail.png") });
    await page.close();
  }
}
await browser.close();
server.close();
