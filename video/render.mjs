// Renders the film frame by frame in parallel headless pages, then stitches the frames and the score
// with ffmpeg. Usage: node render.mjs [16x9] [9x16] [--from=24 --to=33]
// Both cuts by default. --from/--to (seconds) re-render only that span over the frames already on disk.
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { cpus } from "node:os";
import { FPS, FRAMES } from "./timeline.mjs";
import { serve, openBrowser, openPage, shoot } from "./lib.mjs";
import "./prep.mjs";

const here = (p) => new URL(p, import.meta.url).pathname;
const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const formats = args.filter((a) => !a.startsWith("--")).length ? args.filter((a) => !a.startsWith("--")) : ["16x9", "9x16"];
const FROM = opt("from") ? Math.floor(Number(opt("from")) * FPS) : 0;
const TO = opt("to") ? Math.min(FRAMES, Math.ceil(Number(opt("to")) * FPS)) : FRAMES;
const partial = FROM > 0 || TO < FRAMES;
const WORKERS = Math.max(2, Math.min(8, cpus().length - 2));

execFileSync("node", [here("audio.mjs")], { stdio: "inherit" });
await mkdir(here("out"), { recursive: true });
const { server, base } = await serve();
const browser = await openBrowser();

for (const format of formats) {
  const dir = here(`.frames/${format}`);
  if (!partial) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const count = TO - FROM;
  const started = Date.now();
  let done = 0;
  // Contiguous chunks, one per page. Every frame is a pure function of its number, so order doesn't matter.
  const chunk = Math.ceil(count / WORKERS);
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await openPage(browser, base, format, [FROM, TO]);
    for (let f = FROM + w * chunk; f < Math.min(TO, FROM + (w + 1) * chunk); f++) {
      await shoot(page, f, { path: `${dir}/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 95 });
      if (++done % 150 === 0) process.stdout.write(`\r${format}: ${done}/${count} frames, ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    await page.close();
  }));
  console.log(`\r${format}: ${count} frames in ${((Date.now() - started) / 1000).toFixed(0)}s`);

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
