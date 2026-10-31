import "../fonts";
import React from "react";
import { fonts, palette } from "../theme";

// Vector rebuild of the Softhouse POS logo: teal rounded square, white house, barcode inside.
// Rebuilt as SVG because the supplied logo has a white (non-transparent) background.

const BARS: [x: number, w: number][] = [
  [31, 4.2],
  [37.4, 2.2],
  [41.8, 3.4],
  [47.4, 5],
  [54.6, 2.2],
  [59, 3.8],
  [65, 2.2],
  [69, 2],
];

export const LogoMark: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <rect x="0" y="0" width="100" height="100" rx="23" fill={palette.primary} />
    <path
      d="M50 10.5 L88.6 43.6 Q90.6 46 87.6 46 L79.6 46 L79.6 84.4 Q79.6 86.8 77.2 86.8 L22.8 86.8 Q20.4 86.8 20.4 84.4 L20.4 46 L12.4 46 Q9.4 46 11.4 43.6 Z"
      fill={palette.white}
    />
    {BARS.map(([x, w]) => (
      <rect key={x} x={x} y={55.5} width={w} height={20} rx={0.6} fill={palette.primary} />
    ))}
  </svg>
);

type Tone = "onLight" | "onDark";

/** "Softhouse POS" wordmark + optional "PUNTO DE VENTA MULTIGIRO" tagline. */
export const Wordmark: React.FC<{ size: number; tone?: Tone; tagline?: boolean }> = ({
  size,
  tone = "onLight",
  tagline = true,
}) => {
  const main = tone === "onLight" ? palette.navy : palette.white;
  const pos = tone === "onLight" ? palette.primary : palette.signature;
  const tag = tone === "onLight" ? palette.muted : palette.tint;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ fontFamily: fonts.inter, fontSize: size, lineHeight: 1, letterSpacing: "-0.025em", whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 900, color: main }}>Softhouse</span>
        <span style={{ fontWeight: 600, color: pos }}> POS</span>
      </div>
      {tagline ? (
        <div
          style={{
            fontFamily: fonts.inter,
            fontWeight: 600,
            fontSize: size * 0.26,
            letterSpacing: "0.32em",
            color: tag,
            marginTop: size * 0.22,
            whiteSpace: "nowrap",
          }}
        >
          PUNTO DE VENTA MULTIGIRO
        </div>
      ) : null}
    </div>
  );
};

/** Horizontal lockup: mark + wordmark. */
export const LogoLockup: React.FC<{ size: number; tone?: Tone; tagline?: boolean }> = ({ size, tone, tagline = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
    <LogoMark size={size * (tagline ? 1.65 : 1.15)} />
    <Wordmark size={size} tone={tone} tagline={tagline} />
  </div>
);

/** Small persistent badge for the top of each slide. */
export const LogoBadge: React.FC<{ tone?: Tone }> = ({ tone = "onLight" }) => <LogoLockup size={34} tone={tone} tagline={false} />;
