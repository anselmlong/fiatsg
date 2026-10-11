# Fiat launch film

A 52-second launch video for Fiat, built in [Remotion](https://www.remotion.dev) (React).

It opens on a holy card turning over, then shows the real flow on screens captured from the live site:

1. An organisation asks for help.
2. Fiat matches the need to volunteers' gifts.
3. A volunteer says yes (or prays instead).
4. The organisation confirms them.
5. They check in with a QR code.
6. They meet a saint.

Nothing here touches the app. The film reads the saints straight from `src/lib/saint-roster.ts`.

| Output | |
|---|---|
| `out/fiat-intro-16x9.mp4` | 1920×1080, 60 fps, H.264 + AAC |
| `out/fiat-intro-9x16.mp4` | 1080×1920 vertical cut for Reels and TikTok, same beats; text kept clear of the right-hand action rail |
| `out/thumbnail.png` | The final frame, 1920×1080 |

## Working on it

Needs Node 22+. Fonts load from Google Fonts (Caudex, Nunito Sans, and Noto Sans SC for 中文), so
previewing and rendering need a network connection.

```sh
cd video
npm install
node prep.mjs && node audio.mjs           # saints from the roster → public/, score → public/score.wav
npx remotion studio src/index.js          # live preview: scrub the timeline, edit, see it update
node render.mjs                           # both cuts + thumbnail → out/ (a few minutes)
node still.mjs 9x16 21.5 33               # PNG stills at given seconds → out/stills/
node capture.mjs                          # re-capture the product screens from the live site
```

### Files

| File | What it is |
|---|---|
| `timeline.mjs` | Every beat. The picture and the score both read from it, so change timing here. |
| `src/Film.jsx` | All the scenes. |
| `src/HolyCard.jsx` | The holy card, a copy of the app's look. |
| `audio.mjs` | Synthesises the original score sample by sample. No recordings. |
| `capture.mjs` | Logs in to fiat.anselmlong.com as the README's demo accounts and screenshots the flow. It is read-only: after login every non-GET request is aborted, so filling the request form for the shot can never submit it. It also records where each button sits, for the tap ripples and highlight rings. |
| `SHOTLIST.md` | The frame-timed storyboard. |

## Beat map

All times are seconds from the first frame (frame = t × 60). **Bold** marks strong accents.

| Time | Beat | In the synth score |
|---|---|---|
| 0.00 | Card already falling toward camera, rays turning | Low drone + riser |
| 0.60 | Charge: tremble, rays flare, sparks gather | Riser builds |
| **1.40** | **Flash + flip: St Monica** | **Bell C5 + low boom** |
| 2.20 | "You prayed. So did she." slams in | Thud |
| 3.00 / 3.70 / 4.30 / 4.85 | Spins: "You invited a friend." / "You served migrants." / "You cared for the sick." / "You asked a question." | Tick on each spin |
| 3.48 / 4.10 / 4.64 / 5.14 | Lands on Andrew / Lorenzo Ruiz / Damien / Anselm | Bells D5 E5 G5 A5 |
| **5.60** | **Pull-back to all 28 cards: "28 saints to meet."** | **Arpeggio + boom** |
| **7.20** | **Hard cut to grey** | Music drops out |
| 7.2–11.4 | Low pulse every 0.6 s (100 bpm) | Sub pulse |
| 7.30 | "The Church needs helpers." | |
| 8.60 | "But the asks get buried." (scraps pile in 8.8, blur off 9.95) | |
| 10.50 | "Can't make Sunday? Nothing for you." | |
| **11.60** | **A candle lights; warmth floods** | Soft bell, warm pad in |
| 12.25 | "Fiat — let it be done." drawn in gold ink | Bell C5 |
| 13.20 | "An hour, a skill, a prayer or an invite." | |
| 15.20 | 1 · ACMI asks for help (new-request form → gifts) | Soft ping |
| 19.00 | 2 · Fiat finds the right gifts (+ English · 中文 · Bahasa Melayu · Tamil at 20.4) | Soft ping |
| 22.60 | 3 · Say yes in one tap (tap at 23.55) | Ping + tap tick |
| 25.60 | 4 · Can't come? Pray instead (tap at 26.55) | Ping + tap tick |
| 28.40 | 5 · ACMI confirms you | Soft ping |
| 31.20 | 6 · Check in on the day (tap at 32.15) | Ping + tap tick |
| 34.20 | 7 · Meet a saint: the card falls in | Riser |
| **35.00** | **Flash + flip: St Josephine Bakhita** | **Bell + boom** |
| **40.20** | **Cut to the dark stage: drifting saint cards** | Pad to A minor |
| 40.50 | "Not points. Companions." | Bell E5 |
| 42.30 | St Pier Giorgio Frassati's card comes forward | |
| 42.80 | "Verso l'alto — to the heights!" | Bell C5, pad to C |
| 46.20 | Cards rush into one point of light | Riser |
| **47.00** | **Bloom → Fiat wordmark** | **C major bell chord + boom** |
| 47.40 | "What will your yes be?" | Final pad |
| 47.90 | fiat.anselmlong.com · Built for the FIAT Catholic Hackathon 2026 | |
| 48.6–52.0 | Clean static hold (also the thumbnail) | Pad decays to silence |

## Sources

- Saint names, feasts and images come from the roster (`src/lib/saint-roster.ts`, `public/saints/`). Image credits are in the roster.
- Bakhita is the saint the app awards for a regular migrants cause such as this one (`causePool("migrants", 2)`).
- The closing quote is St Pier Giorgio Frassati's own, from the roster. He wrote it on a photograph of his last climb, June 1925.
- The product screens are the live site, captured with `capture.mjs`.
