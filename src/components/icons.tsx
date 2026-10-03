// Inline line icons. 24-unit grid, drawn at 20px, stroke 1.75, round caps and joins.
import type { ReactNode } from "react";

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

/* Navigation */
export const IconPan = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="13" r="6" />
    <path d="M16 13h6" />
    <path d="M7.5 11.5a3 3 0 0 1 2.5-1.5" />
  </Svg>
);
export const IconNotebook = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M12 8h4M12 12h4" />
  </Svg>
);
export const IconFlame = (p: P) => (
  <Svg {...p}>
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.8.3 1.6 1 2.6 2.1 3C11 8.5 11.3 5.6 12 3Z" />
  </Svg>
);
export const IconCheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.7 2.7L16 9.8" />
  </Svg>
);

/* General */
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);
export const IconSparkle = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" />
    <path d="M18.5 16v4M16.5 18h4" />
  </Svg>
);
export const IconEye = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);
export const IconLifebuoy = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" />
  </Svg>
);
export const IconChecklist = (p: P) => (
  <Svg {...p}>
    <path d="m4 6.5 1.5 1.5L8 5.5M4 12.5 5.5 14 8 11.5M4 18.5 5.5 20 8 17.5" />
    <path d="M11 7h9M11 13h9M11 19h9" />
  </Svg>
);
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const IconArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconCamera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4Z" />
    <circle cx="12" cy="13" r="3.3" />
  </Svg>
);

/* Verdicts */
export const IconTune = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);
export const IconAlert = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5 21.5 20h-19Z" />
    <path d="M12 10v4.5M12 17.2v.1" />
  </Svg>
);
export const IconQuestion = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 16.8v.1" />
  </Svg>
);

/* Theme */
export const IconSun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Svg>
);
export const IconMoon = (p: P) => (
  <Svg {...p}>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" />
  </Svg>
);
export const IconAuto = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none" />
  </Svg>
);

/* Equipment */
export const IconPressureCooker = (p: P) => (
  <Svg {...p}>
    <path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" />
    <path d="M4 11h16M8 11a4 4 0 0 1 8 0M12 5V3.5M19 11l2.5-1.5" />
  </Svg>
);
export const IconOven = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="2" />
    <path d="M3.5 8.5h17M7 6.3v.1M10 6.3v.1" />
    <rect x="7" y="11.5" width="10" height="5.5" rx="1" />
  </Svg>
);
export const IconMicrowave = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <rect x="5.5" y="8" width="9" height="8" rx="1" />
    <path d="M18 9v.1M18 12v.1M18 15v.1" />
  </Svg>
);
export const IconAirFryer = (p: P) => (
  <Svg {...p}>
    <path d="M7 3.5h10a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V5.5a2 2 0 0 1 2-2Z" />
    <path d="M5 12h14M10 15.5h4M12 7v.1" />
  </Svg>
);
export const IconRiceCooker = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 11h15v5.5A3.5 3.5 0 0 1 16 20H8a3.5 3.5 0 0 1-3.5-3.5Z" />
    <path d="M4.5 11a7.5 4.5 0 0 1 15 0M12 6.5V5M9 15.5h6" />
  </Svg>
);
export const IconBlender = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 3.5h11l-2 11h-7Z" />
    <path d="M7.5 21h9l-1-4.5h-7ZM10 8.5h4.5" />
  </Svg>
);
export const IconGriddle = (p: P) => (
  <Svg {...p}>
    <ellipse cx="10" cy="14" rx="7.5" ry="3.5" />
    <path d="M17.5 14H22M7 8.5c0-1 1-1.5 1-2.5M11 8.5c0-1 1-1.5 1-2.5" />
  </Svg>
);

/* Dishes */
export const IconBowl = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
    <path d="M9 7.5c0-1.2 1-1.5 1-2.7M13 7.5c0-1.2 1-1.5 1-2.7" />
  </Svg>
);
export const IconFlatbread = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 9.5v.1M14.5 8.5v.1M15 14v.1M9.5 15v.1M12 12v.1" />
  </Svg>
);
export const IconAppam = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
  </Svg>
);
export const IconCup = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 8h13l-1.4 10.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8Z" />
    <path d="M5 8c0-1.7 3.1-3 7-3s7 1.3 7 3" />
  </Svg>
);

/* After the cook */
export const IconTrendUp = (p: P) => (
  <Svg {...p}>
    <path d="m4 16 5-5 3.5 3.5L20 7M14.5 7H20v5.5" />
  </Svg>
);
export const IconEquals = (p: P) => (
  <Svg {...p}>
    <path d="M5 9.5h14M5 14.5h14" />
  </Svg>
);
export const IconTrendDown = (p: P) => (
  <Svg {...p}>
    <path d="m4 8 5 5 3.5-3.5L20 17M14.5 17H20v-5.5" />
  </Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
);
export const IconMaybe = (p: P) => (
  <Svg {...p}>
    <path d="M4 12c2.7-3.3 5.3-3.3 8 0s5.3 3.3 8 0" />
  </Svg>
);

/* Logo mark: a small pot with a dot of steam. Not a line icon. */
export const LogoMark = () => (
  <svg className="logo-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="6" r="3" fill="var(--accent)" />
    <path d="M5 14h22v7a7 7 0 0 1-7 7h-8a7 7 0 0 1-7-7Z" fill="var(--accent)" />
    <path d="M2.5 15.5H5M27 15.5h2.5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 19.5h14" stroke="var(--bg)" strokeWidth="1.75" strokeLinecap="round" opacity=".6" />
  </svg>
);

/* Screen 1 hero: pot with steam, terracotta and cream. */
export const PotHero = () => (
  <svg className="hero-art" width="88" height="72" viewBox="0 0 88 72" aria-hidden="true" focusable="false">
    <path d="M30 22c-3-4 3-7 0-12M44 20c-3-4 3-7 0-12M58 22c-3-4 3-7 0-12" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
    <ellipse cx="44" cy="31" rx="27" ry="5" fill="var(--accent)" />
    <rect x="39" y="22.5" width="10" height="5" rx="2.5" fill="var(--accent)" />
    <path d="M18 34h52v18a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14Z" fill="var(--accent)" />
    <path d="M10 38h8M70 38h8" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
    <path d="M26 44h36" stroke="var(--hero-cream)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="33" cy="54" r="2.5" fill="var(--hero-cream)" />
    <circle cx="44" cy="54" r="2.5" fill="var(--hero-cream)" />
    <circle cx="55" cy="54" r="2.5" fill="var(--hero-cream)" />
  </svg>
);

/* Thank-you confirmation */
export const BigCheck = () => (
  <svg className="big-check" width="88" height="88" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
    <circle cx="44" cy="44" r="40" fill="var(--accent)" />
    <path d="m27 45 11 11 23-24" fill="none" stroke="var(--accent-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
