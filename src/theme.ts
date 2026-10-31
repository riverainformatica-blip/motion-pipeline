import { Easing } from "remotion";

// Brand palette: Softhouse POS (sampled from the client's logo and UI screenshots).
// Keep semantic keys; only swap hex values.
export const palette = {
  navy: "#171e2c", // wordmark / UI sidebar — dark backgrounds, text on light
  primary: "#0e766e", // brand teal — buttons, accents on light backgrounds
  accent: "#14a090", // lighter teal for gradients
  tint: "#d7f0ec", // light text tint on dark backgrounds
  signature: "#7fe0cf", // mint — emphasis on dark backgrounds
  success: "#22c55e",
  white: "#ffffff",
  red: "#ef4444",
  paper: "#f2f6f5", // UI page background — light slides
  muted: "#5b6472", // secondary text on light backgrounds
} as const;

export const fonts = {
  inter: "Inter, system-ui, sans-serif",
  playfair: '"Playfair Display", Georgia, serif',
  poppins: "Poppins, system-ui, sans-serif",
} as const;

export const logo = { full: "logos/logo-full.png", mark: "logos/logo-mark.png" } as const;

export const safe = {
  vertical: { top: 260, bottom: 1660 },
  square: { top: 80, bottom: 1000 },
  horizontal: { top: 80, bottom: 1000 },
} as const;

export const ease = { out: Easing.bezier(0.16, 1, 0.3, 1), inOut: Easing.bezier(0.65, 0, 0.35, 1) };

export const springs = {
  smooth: { damping: 12, stiffness: 110, mass: 0.7 },
  slam: { damping: 9, stiffness: 190, mass: 0.5 },
  pop: { damping: 14, stiffness: 160, mass: 0.6 },
};

export const grad = {
  base: `linear-gradient(135deg, ${palette.navy} 0%, ${palette.primary} 100%)`,
  accent: `linear-gradient(135deg, ${palette.signature} 0%, ${palette.accent} 100%)`,
  whiteAccent: `linear-gradient(135deg, ${palette.white} 0%, ${palette.accent} 100%)`,
};

export const text = {
  gradient: (g: string, strokeW = 2) => ({
    background: g,
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    WebkitTextStroke: `${strokeW}px #ffffff`,
    paintOrder: "stroke fill" as const,
  }),
};
