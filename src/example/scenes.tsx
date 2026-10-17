import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Slide, halo } from "../Slide";
import { ease, fonts, grad, palette, springs, text } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Standard entry: opacity 0->1 + translateY 20->0 + scale 0.85->1, staggered by `delay`. */
const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: springs.smooth });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { ...clamp, easing: ease.out });
  return {
    opacity,
    transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
  } as React.CSSProperties;
};

const headline: React.CSSProperties = {
  fontFamily: fonts.inter,
  fontWeight: 900,
  fontSize: 132,
  lineHeight: 0.95,
  letterSpacing: "-0.04em",
  color: palette.white,
  textShadow: halo,
  margin: 0,
};

// Gradient-clipped text: textShadow bleeds through the transparent fill and muddies it,
// so the halo goes in a drop-shadow filter instead.
const gradText = (g: string, strokeW = 2): React.CSSProperties => ({
  ...text.gradient(g, strokeW),
  textShadow: "none",
  filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.5))",
});

const serifEm: React.CSSProperties = {
  fontFamily: fonts.playfair,
  fontStyle: "italic",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: palette.tint,
};

// ─── Scene 1: HOOK — slam on frame 1 (scale 2.4 -> 1) + white flash ───
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame, fps, config: springs.slam });
  const scale = interpolate(slam, [0, 1], [2.4, 1]);
  const flash = interpolate(frame, [0, 6], [0.85, 0], clamp);
  const sub = useEnter(14);

  return (
    <Slide background={grad.base} textZone="center" watermark="01" watermarkCorner="br">
      <div style={{ transform: `scale(${scale})` }}>
        <h1 style={headline}>
          EL <span style={gradText(grad.accent)}>73%</span>
        </h1>
        <h1 style={{ ...headline, fontSize: 96 }}>
          lo hace <span style={serifEm}>mal</span>
        </h1>
      </div>
      <p style={{ ...sub, fontFamily: fonts.poppins, fontWeight: 600, fontSize: 40, color: palette.tint, marginTop: 40, textShadow: halo }}>
        Dato de ejemplo · reemplazar con el brief
      </p>
      <AbsoluteFill style={{ backgroundColor: palette.white, opacity: flash, pointerEvents: "none" }} />
    </Slide>
  );
};

// ─── Scene 2: DATA — animated counter + bar ───
export const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const target = 4.2;
  const progress = interpolate(frame, [6, 50], [0, 1], { ...clamp, easing: ease.out });
  const value = (target * progress).toFixed(1);
  const label = useEnter(4);
  const num = useEnter(8);
  const bar = useEnter(16);
  const foot = useEnter(28);

  return (
    <Slide background={`linear-gradient(160deg, ${palette.navy} 0%, #091428 100%)`} textZone="center" watermark="02" watermarkCorner="bl">
      <div style={{ ...label, fontFamily: fonts.poppins, fontWeight: 600, fontSize: 38, letterSpacing: "0.2em", color: palette.tint, textShadow: halo }}>
        CRECIMIENTO ANUAL
      </div>
      <div style={{ ...num, ...headline, fontSize: 300, marginTop: 10 }}>
        <span style={gradText(grad.whiteAccent, 3)}>{value}x</span>
      </div>
      <div style={{ ...bar, width: 760, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.14)", marginTop: 30, overflow: "hidden" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: grad.accent, borderRadius: 11 }} />
      </div>
      <p style={{ ...foot, fontFamily: fonts.inter, fontWeight: 600, fontSize: 44, color: palette.white, marginTop: 50, textShadow: halo }}>
        en solo <span style={serifEm}>doce meses</span>
      </p>
    </Slide>
  );
};

// ─── Scene 3: CTA — highest contrast, room to breathe ───
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const h = useEnter(4);
  const btn = spring({ frame: frame - 18, fps, config: springs.pop });
  const pulse = 1 + Math.sin(Math.max(0, frame - 40) / 7) * 0.025;

  return (
    <Slide background={grad.base} textZone="center" watermark="→" watermarkCorner="bl" watermarkOpacity={0.06}>
      <h1 style={{ ...h, ...headline, fontSize: 116 }}>
        Empieza <span style={serifEm}>hoy</span>
      </h1>
      <div
        style={{
          marginTop: 70,
          transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`,
          opacity: interpolate(btn, [0, 1], [0, 1]),
          backgroundColor: palette.white,
          color: palette.navy,
          fontFamily: fonts.inter,
          fontWeight: 900,
          fontSize: 54,
          padding: "34px 70px",
          borderRadius: 999,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        LINK EN LA BIO
      </div>
    </Slide>
  );
};
