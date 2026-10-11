# Fiat launch film

A 45-second launch video for Fiat, coded as an animated composition and rendered frame by frame.
It is plain HTML/CSS/JS (`index.html` + `scene.js`), captured by headless Chromium through Playwright
and stitched with ffmpeg. Nothing here touches the app. The film reads the saints straight from
`src/lib/saint-roster.ts` and uses the app's own images and screenshots from `public/` and `docs/screenshots/`.

| Output | |
|---|---|
| `out/fiat-intro-16x9.mp4` | 1920×1080, 60 fps, H.264 + AAC |
| `out/fiat-intro-9x16.mp4` | 1080×1920 vertical cut for Reels and TikTok, same beats |
| `out/thumbnail.png` | The final frame, 1920×1080 |

## Re-rendering

Needs Node 22+ and ffmpeg on the PATH. The page loads Caudex, Nunito Sans and Noto Sans SC (for 中文) from Google Fonts, so
rendering needs a network connection. It refuses to render if any of them fails to load.

```sh
cd video
npm install
npx playwright install chromium   # only if Chromium 1208 isn't already cached
node render.mjs                   # both cuts (about 2.5 min each on a laptop)
node render.mjs 9x16              # one cut
node still.mjs 16x9 0 1.5 25      # PNG stills at given seconds → out/stills/
```

How it works:

- `prep.mjs` pulls the 28 saints (name, feast, image) from the roster and draws the check-in QR code into `assets/`.
- `audio.mjs` synthesises the score into `out/score.wav`. It is original, built sample by sample, with no recordings.
- `render.mjs` runs several pages in parallel, captures every frame as a JPEG into `.frames/`, then encodes.

Determinism: `window.seek(frame)` paints a frame from its number alone. It uses closed-form springs
and seeded randomness, with no CSS animations and no clocks. Any page can render any frame in any order
and get identical pixels.

To change timing, edit `timeline.mjs`. The picture and the score both read from it, so they stay in sync.
`SHOTLIST.md` is the frame-timed storyboard.

## Beat map

For laying music under the film later. All times are seconds from the first frame (frame = t × 60).
**Hit** means a strong accent; **soft** means a light one.

| Time | Frame | Beat | In the synth score |
|---|---|---|---|
| 0.00 | 0 | Card already falling toward camera, rays turning | Low drone (C) + riser begins |
| 0.60 | 36 | Card lands; charge begins (tremble, rays flare) | Riser builds, tremolo accelerates |
| **1.40** | **84** | **FLASH + FLIP: St Monica revealed** | **Hit:** bell C5 + low boom |
| 2.20 | 132 | "You prayed. So did she." slams in | Hit: short thud |
| 3.00 | 180 | Spin 1 starts ("You invited a friend.") | Soft tick |
| 3.60 | 216 | St Andrew lands | Bell D5 |
| 4.50 | 270 | Spin 2 starts ("You served migrants.") | Soft tick |
| 5.02 | 301 | St Lorenzo Ruiz lands | Bell E5 |
| 5.75 | 345 | Spin 3 starts ("You cared for the sick.") | Soft tick |
| 6.19 | 371 | St Damien of Molokai lands | Bell G5 |
| 6.80 | 408 | Spin 4 starts ("You asked a question.") | Soft tick |
| 7.16 | 430 | St Anselm lands | Bell A5 |
| **8.00** | **480** | **Pull-back: 28-card grid on cream** | **Hit:** arpeggio C-E-G-C-E + boom |
| **9.00** | **540** | **Hard cut to grey: the problem** | Music drops out |
| 9.0–18.6 | 540–1116 | Low pulse every 0.8 s (75 bpm) | Sub pulse on each 0.8 s |
| 9.15 | 549 | "The Church in Singapore needs help." | (pulse) |
| 11.00 | 660 | "People want to give it." | (pulse) |
| 12.60 | 756 | "But the asks are buried." | (pulse) |
| 13.0–14.4 | 780–866 | Feed scraps stack in, one every 0.24 s | (room for small clicks) |
| 14.70 | 882 | Scraps blur and slide off | |
| 15.40 | 924 | "And if you can't come every Sunday…" | |
| 17.20 | 1032 | "…it feels like there's nothing for you." | |
| **19.00** | **1140** | **A candle lights** | Soft high bell |
| 19.35 | 1161 | Warmth floods to cream | Warm pad swells in (C major) |
| 20.40 | 1224 | "Fiat — let it be done." drawn in gold ink | Bell C5 |
| 21.80 | 1308 | "Mary's yes changed everything…" | |
| 24.00 | 1440 | Home screen swings in | |
| 24.70 | 1482 | Callout: Real needs from Catholic organisations | Soft ping |
| 26.40 | 1584 | Cause screen (ACMI) swings in front | |
| 27.00 | 1620 | Callout: Matched to your gifts | Soft ping |
| 28.40 | 1704 | Callout: Can't come? Pray instead | Soft ping |
| 29.80 | 1788 | Callout: Check in with a QR code | Soft ping |
| 31.20 | 1872 | Callout: English · 中文 · Bahasa Melayu · Tamil | Soft ping |
| **33.00** | **1980** | **Cut to the dark stage: drifting saint cards** | Pad shifts to A minor |
| 33.40 | 2004 | "Not points. Not badges." | Bell E5 |
| 35.00 | 2100 | "Companions." | Bell G5 |
| 36.40 | 2184 | "Discover the faith through the saints…" | Bell A5, pad to F |
| 38.40 | 2304 | St Pier Giorgio Frassati's card comes forward | |
| 38.90 | 2334 | "Verso l'alto — to the heights!" | Bell C5, pad to C |
| 41.00 | 2460 | Cards rush into one point of light | Riser |
| **41.80** | **2508** | **Bloom → Fiat wordmark** | **Hit:** C major bell chord + boom |
| 42.30 | 2538 | "What will your yes be?" | Final pad |
| 42.80 | 2568 | fiat.anselmlong.com · Built for the FIAT Catholic Hackathon 2026 | |
| 43.50–45.00 | 2610–2699 | Clean static hold (also the thumbnail) | Pad decays to silence |

## Sources

- Saint names, feasts and images: `src/lib/saint-roster.ts` and `public/saints/`. Image credits are in the roster.
- The closing quote is St Pier Giorgio Frassati's own, from the roster: "Verso l'alto — to the heights!",
  written on a photograph of his last climb, June 1925.
- The product claims match the app:
  - The cause page says "Can't come? You can still pray."
  - QR check-in is at `causes/[id]/check-in`.
  - The language picker offers English, 中文, Bahasa Melayu and Tamil.
