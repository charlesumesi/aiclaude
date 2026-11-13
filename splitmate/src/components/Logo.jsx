// Splitmate logo: a smiling banknote mascot followed by the wordmark.
function BanknoteMascot({ size = 40 }) {
  return (
    <svg
      width={size * (40 / 48)}
      height={size}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {/* Arms */}
      <g stroke="#2f3a2a" strokeWidth="1.6" strokeLinecap="round">
        <path d="M9 27 L4 31.5" />
        <path d="M31 27 L36 31.5" />
      </g>
      <circle cx="3.6" cy="32" r="1.6" fill="#2f3a2a" />
      <circle cx="36.4" cy="32" r="1.6" fill="#2f3a2a" />

      {/* Legs */}
      <g stroke="#2f3a2a" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 41 V45" />
        <path d="M24 41 V45" />
      </g>
      <ellipse cx="15.6" cy="45.6" rx="2" ry="1.3" fill="#2f3a2a" />
      <ellipse cx="24.4" cy="45.6" rx="2" ry="1.3" fill="#2f3a2a" />

      {/* Banknote body, slightly tilted */}
      <g transform="rotate(-4 20 22)">
        <rect x="8" y="2.5" width="24" height="39" rx="4" fill="#79a659" stroke="#3f6b26" strokeWidth="1.5" />
        <rect x="11" y="5.5" width="18" height="33" rx="2.5" fill="#aacf7e" />
        <rect x="17.5" y="7.5" width="5" height="4" rx="1" fill="#e9b269" />
        <rect x="17.5" y="32.5" width="5" height="4" rx="1" fill="#e9b269" />

        {/* Face */}
        <circle cx="20" cy="22" r="7" fill="#659445" stroke="#4e7829" strokeWidth="1" />
        <circle cx="17.3" cy="21" r="1.1" fill="#2a2116" />
        <circle cx="22.7" cy="21" r="1.1" fill="#2a2116" />
        <path d="M18.6 23.6 Q20 24.9 21.4 23.6" stroke="#2a2116" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="15.9" cy="23.6" rx="1.3" ry="0.8" fill="#f0a083" opacity="0.85" />
        <ellipse cx="24.1" cy="23.6" rx="1.3" ry="0.8" fill="#f0a083" opacity="0.85" />
      </g>
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BanknoteMascot />
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-logo-red">Split</span>
        <span className="text-ink">mate</span>
      </span>
    </span>
  )
}
