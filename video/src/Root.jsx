import { Composition, cancelRender, continueRender, delayRender } from "remotion";
import { loadFont as loadCaudex } from "@remotion/google-fonts/Caudex";
import { loadFont as loadNunito } from "@remotion/google-fonts/NunitoSans";
import { FPS, FRAMES } from "../timeline.mjs";
import { Film } from "./Film.jsx";

// Fonts come from Google Fonts only; Remotion holds every frame until they have loaded.
loadCaudex("normal", { weights: ["400", "700"], subsets: ["latin"] });
loadCaudex("italic", { weights: ["400"], subsets: ["latin"] });
loadNunito("normal", { weights: ["400", "700", "800"], subsets: ["latin"] });
// Noto Sans SC just for 中文: a two-glyph subset instead of the whole Chinese font.
const zh = delayRender("Noto Sans SC");
fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@800&text=${encodeURIComponent("中文")}`)
  .then((r) => r.text())
  .then((css) => new FontFace("Noto Sans SC", `url(${css.match(/url\((.+?)\)/)[1]})`, { weight: "800" }).load())
  .then((face) => { document.fonts.add(face); continueRender(zh); })
  .catch((e) => cancelRender(e));

export const Root = () => (
  <>
    <Composition id="Fiat16x9" component={Film} durationInFrames={FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ vertical: false }} />
    <Composition id="Fiat9x16" component={Film} durationInFrames={FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ vertical: true }} />
  </>
);
