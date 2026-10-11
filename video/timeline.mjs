// Every beat in the film, in seconds. The composition, the score and the README all read from here,
// so picture and sound can't drift apart.
export const FPS = 60;
export const DURATION = 52;
export const FRAMES = FPS * DURATION;

export const T = {
  // Cold open: the flip lands inside the first 1.5 s.
  charge: 0.6,
  flip: 1.4,
  slam: 2.2,
  // The hook: each spin shorter than the last, each beat closer.
  spins: [
    { at: 3.0, dur: 0.6, id: "andrew", line: "You invited a friend." },
    { at: 3.7, dur: 0.5, id: "lorenzo-ruiz", line: "You served migrants." },
    { at: 4.3, dur: 0.42, id: "damien-of-molokai", line: "You cared for the sick." },
    { at: 4.85, dur: 0.36, id: "anselm", line: "You asked a question." },
  ],
  pullBack: 5.6,
  // The problem: three quick lines.
  problem: 7.2,
  problemLines: [
    { at: 7.3, out: 8.45, text: "The Church needs helpers." },
    { at: 8.6, out: 10.35, text: "But the asks get buried." },
    { at: 10.5, out: 11.5, text: "Can't make Sunday? Nothing for you." },
  ],
  scrapsIn: 8.8,
  scrapsOut: 9.95,
  pulse: { from: 7.2, to: 11.6, every: 0.6 },
  // The answer
  candle: 11.6,
  flood: 11.85,
  title: 12.25,
  sub: 13.2,
  // The flow, on real screens from the live site.
  flow: 15.2,
  steps: [
    { at: 15.2, n: 1, text: "ACMI asks for help.", screen: "org-new", then: { at: 17.0, screen: "org-gifts", mark: "gift" } },
    { at: 19.0, n: 2, text: "Fiat finds the right gifts.", screen: "vol-foryou", mark: "gifts", pill: { at: 20.4, text: "English · 中文 · Bahasa Melayu · Tamil", mark: "lang" } },
    { at: 22.6, n: 3, text: "Say yes in one tap.", screen: "cause-yes", tap: "yes" },
    { at: 25.6, n: 4, text: "Can't come? Pray instead.", screen: "vol-pray", tap: "pray" },
    { at: 28.4, n: 5, text: "ACMI confirms you.", screen: "org-qr", mark: "accepted" },
    { at: 31.2, n: 6, text: "Check in on the day.", screen: "vol-checkin", tap: "here" },
    { at: 34.2, n: 7, text: "Meet a saint.", saint: "bakhita" },
  ],
  saintFlip: 35.0,
  // The faith along the way
  faith: 40.2,
  faithLine: { at: 40.5, out: 42.2, text: "Not points. Companions." },
  saintForward: 42.3,
  quote: 42.8,
  // Call to action
  rush: 46.2,
  bloom: 47.0,
  question: 47.4,
  url: 47.9,
  settle: 48.6,
};

// The moment each spin lands face forward (the spring's first crossing, ~0.8 of its duration).
export const landAt = (s) => s.at + s.dur * 0.8;
