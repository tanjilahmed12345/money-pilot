"use client";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MoneyPilot logo"
    >
      <defs>
        <linearGradient id="mp-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="12" fill="url(#mp-bg)" />

      {/* Shield outline — protection / financial security */}
      <path
        d="M20 6 L31 11 L31 21 Q31 30 20 35 Q9 30 9 21 L9 11 Z"
        stroke="white"
        strokeWidth="1.5"
        fill="white"
        fillOpacity="0.1"
      />

      {/* Dollar sign — finance */}
      <path
        d="M20 13 L20 27"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M23.5 16.5 Q23.5 15 22 15 L18.5 15 Q16.5 15 16.5 17 Q16.5 19 18.5 19 L21.5 19 Q23.5 19 23.5 21 Q23.5 23 21.5 23 L17.5 23 Q16 23 16 21.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small bar chart at bottom — tracking / analytics */}
      <rect x="13" y="28" width="3" height="4" rx="0.8" fill="#4ade80" />
      <rect x="18.5" y="26" width="3" height="6" rx="0.8" fill="#4ade80" />
      <rect x="24" y="24.5" width="3" height="7.5" rx="0.8" fill="#4ade80" />
    </svg>
  );
}
