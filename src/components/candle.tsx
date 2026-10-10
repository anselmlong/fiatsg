// A votive candle. `lit` shows the flame; `ignite` plays the lighting once.
export function Candle({ lit, ignite = false, className = "h-20 w-12" }: { lit: boolean; ignite?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 48 80" className={className} aria-hidden>
      <defs>
        <radialGradient id="candle-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f6d58a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f6d58a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="candle-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c1912e" />
          <stop offset="55%" stopColor="#f2b84b" />
          <stop offset="100%" stopColor="#fff4d6" />
        </linearGradient>
      </defs>
      {lit && (
        <g className={ignite ? "candle-ignite" : undefined} style={{ transformOrigin: "24px 30px" }}>
          <circle cx="24" cy="22" r="20" fill="url(#candle-glow)" className="candle-glow" />
          <path
            d="M24 8c4 7 7 11 7 16a7 7 0 0 1-14 0c0-5 3-9 7-16z"
            fill="url(#candle-flame)"
            className="candle-flame"
            style={{ transformOrigin: "24px 31px" }}
          />
        </g>
      )}
      <line x1="24" y1="30" x2="24" y2="35" stroke="#34195c" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="12" y="35" width="24" height="36" rx="3" fill="#fffdf9" stroke="#e6dccd" strokeWidth="1.5" />
      <rect x="8" y="68" width="32" height="8" rx="2" fill="#4e2984" />
    </svg>
  );
}
