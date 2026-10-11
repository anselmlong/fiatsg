// Every beat in the film, in seconds. The page, the score and the README all read from here,
// so picture and sound can't drift apart.
export const FPS = 60;
export const DURATION = 45;
export const FRAMES = FPS * DURATION;

export const T = {
  // Cold open
  landed: 0.6,
  charge: 0.6,
  flip: 1.4,
  slam: 2.2,
  // The hook: each spin shorter than the last, each beat closer.
  spins: [
    { at: 3.0, dur: 0.75, id: "andrew", line: "You invited a friend." },
    { at: 4.5, dur: 0.65, id: "lorenzo-ruiz", line: "You served migrants." },
    { at: 5.75, dur: 0.55, id: "damien-of-molokai", line: "You cared for the sick." },
    { at: 6.8, dur: 0.45, id: "anselm", line: "You asked a question." },
  ],
  pullBack: 8.0,
  // The problem
  problem: 9.0,
  problemLines: [
    { at: 9.15, out: 10.85, text: "The Church in Singapore needs help." },
    { at: 11.0, out: 12.45, text: "People want to give it." },
    { at: 12.6, out: 15.3, text: "But the asks are buried." },
    { at: 15.4, out: 17.05, text: "And if you can't come every Sunday…" },
    { at: 17.2, out: 18.85, text: "…it feels like there's nothing for you." },
  ],
  scrapsIn: 13.0,
  scrapsOut: 14.7,
  pulse: { from: 9.0, to: 19.0, every: 0.8 },
  // The solution
  candle: 19.0,
  flood: 19.35,
  title: 20.4,
  sub: 21.8,
  devices: 24.0,
  causeIn: 26.4,
  callouts: [
    { at: 24.7, text: "Vetted by the Catholic Foundation" },
    { at: 27.0, text: "Matched to your gifts" },
    { at: 28.4, text: "Can't come? Pray instead" },
    { at: 29.8, text: "Check in with a QR code" },
    { at: 31.2, text: "English · Bahasa Melayu · Tamil" },
  ],
  // The faith along the way
  faith: 33.0,
  faithLines: [
    { at: 33.4, out: 34.8, text: "Not points. Not badges." },
    { at: 35.0, out: 36.2, text: "Companions." },
    { at: 36.4, out: 38.35, text: "Discover the faith through the saints who said yes before you." },
  ],
  anselmForward: 38.4,
  quote: 38.9,
  // Call to action
  rush: 41.0,
  bloom: 41.8,
  question: 42.3,
  url: 42.8,
  settle: 43.5,
};

// The moment each spin lands face forward (the spring's first crossing, ~0.8 of its duration).
export const landAt = (s) => s.at + s.dur * 0.8;
