import "./fonts";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { optionalAsset } from "./assets";
import { ease, fonts, grad, logo, palette } from "./theme";

export type TextZone = "top" | "bottom" | "left" | "right" | "center";
export type WatermarkCorner = "tl" | "tr" | "bl" | "br";

export type SlideProps = {
  /** Image in public/ (e.g. "images/bg-01.png"). Falls back to `background` if missing. */
  bgImage?: string;
  /** Any CSS background (gradient/color). Used when no bgImage. */
  background?: string;
  /** Where the copy lives: the scrim darkens that side to guarantee contrast. */
  textZone?: TextZone;
  /** Scrim strength 0-1. Raise on busy / mid-tone backgrounds. */
  scrimStrength?: number;
  /** Scrim color — dark by default (light text). Use a light color for dark-text slides. */
  scrimColor?: string;
  /** Giant corner watermark (number, word). Keep it in the dead zone opposite to textZone. */
  watermark?: string;
  watermarkCorner?: WatermarkCorner;
  watermarkOpacity?: number;
  showLogo?: boolean;
  /** Text shown if public/logos/logo-mark.png doesn't exist yet. */
  brandName?: string;
  children?: React.ReactNode;
};

const scrimGradient = (zone: TextZone, color: string, a: number): string => {
  const c = (alpha: number) => `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
  switch (zone) {
    case "top":
      return `linear-gradient(180deg, ${c(a)} 0%, ${c(a * 0.6)} 40%, ${c(0)} 75%)`;
    case "bottom":
      return `linear-gradient(0deg, ${c(a)} 0%, ${c(a * 0.6)} 40%, ${c(0)} 75%)`;
    case "left":
      return `linear-gradient(90deg, ${c(a)} 0%, ${c(a * 0.6)} 45%, ${c(0)} 80%)`;
    case "right":
      return `linear-gradient(270deg, ${c(a)} 0%, ${c(a * 0.6)} 45%, ${c(0)} 80%)`;
    case "center":
    default:
      return `radial-gradient(ellipse 75% 55% at 50% 50%, ${c(a)} 0%, ${c(a * 0.55)} 55%, ${c(0)} 100%)`;
  }
};

const zoneAlign: Record<TextZone, React.CSSProperties> = {
  top: { justifyContent: "flex-start", alignItems: "center", paddingTop: "13.5%" },
  bottom: { justifyContent: "flex-end", alignItems: "center", paddingBottom: "13.5%" },
  left: { justifyContent: "center", alignItems: "center", paddingRight: "30%" },
  right: { justifyContent: "center", alignItems: "center", paddingLeft: "30%" },
  center: { justifyContent: "center", alignItems: "center" },
};

const cornerPos: Record<WatermarkCorner, React.CSSProperties> = {
  tl: { top: -40, left: -30, textAlign: "left" },
  tr: { top: -40, right: -30, textAlign: "right" },
  bl: { bottom: -60, left: -30, textAlign: "left" },
  br: { bottom: -60, right: -30, textAlign: "right" },
};

/**
 * Editorial slide: background + continuous push-in + snap-in + directional scrim
 * + giant watermark + persistent logo. Content is centered inside the text zone.
 */
export const Slide: React.FC<SlideProps> = ({
  bgImage,
  background = grad.base,
  textZone = "center",
  scrimStrength = 0.7,
  scrimColor = palette.navy,
  watermark,
  watermarkCorner = "br",
  watermarkOpacity = 0.07,
  showLogo = true,
  brandName = "BRAND",
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  // Snap-in 1.06 -> 1 in 8f, then continuous push-in 1.0 -> 1.045 over the slide.
  const snap = interpolate(frame, [0, 8], [1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.out,
  });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.045], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const img = bgImage ? optionalAsset(bgImage) : null;
  const mark = optionalAsset(logo.mark);
  const unit = width / 1080;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${snap * push})` }}>
        {img ? (
          <Img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <AbsoluteFill style={{ background }} />
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ background: scrimGradient(textZone, scrimColor, scrimStrength) }} />

      {watermark ? (
        <div
          style={{
            position: "absolute",
            ...cornerPos[watermarkCorner],
            fontFamily: fonts.inter,
            fontWeight: 900,
            fontSize: 520 * unit,
            lineHeight: 0.85,
            letterSpacing: "-0.06em",
            color: palette.white,
            opacity: watermarkOpacity,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {watermark}
        </div>
      ) : null}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          paddingLeft: 80 * unit,
          paddingRight: 80 * unit,
          ...zoneAlign[textZone],
        }}
      >
        {children}
      </AbsoluteFill>

      {showLogo ? (
        <div style={{ position: "absolute", top: 70 * unit, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          {mark ? (
            <Img src={mark} style={{ height: 64 * unit, width: "auto" }} />
          ) : (
            <div
              style={{
                fontFamily: fonts.inter,
                fontWeight: 800,
                fontSize: 30 * unit,
                letterSpacing: "0.3em",
                color: palette.white,
                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
              }}
            >
              {brandName}
            </div>
          )}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Halo for text over detailed / mid-tone areas. */
export const halo = "0 2px 4px rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.45)";
