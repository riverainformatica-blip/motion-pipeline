import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Slide, halo } from "../Slide";
import { ease, fonts, grad, palette, springs, text } from "../theme";
import { LogoBadge, LogoLockup, LogoMark, Wordmark } from "./brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Standard entry: opacity 0->1 + translateY 20->0 + scale 0.85->1, staggered by `delay`. */
const useEnter = (delay = 0): React.CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: springs.smooth });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { ...clamp, easing: ease.out });
  return {
    opacity,
    transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
  };
};

const Enter: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const e = useEnter(delay);
  return <div style={{ ...style, ...e }}>{children}</div>;
};

// Gradient-clipped text: halo goes in a drop-shadow filter (textShadow bleeds through the transparent fill).
const gradText = (g: string, strokeW = 2): React.CSSProperties => ({
  ...text.gradient(g, strokeW),
  textShadow: "none",
  filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.5))",
});

const darkBg = `radial-gradient(ellipse 90% 60% at 50% 45%, #1f2a3d 0%, ${palette.navy} 70%)`;
const lightBg = `linear-gradient(180deg, ${palette.white} 0%, ${palette.paper} 100%)`;
const tealBg = `linear-gradient(160deg, ${palette.primary} 0%, #0a5a54 100%)`;

const headlineDark: React.CSSProperties = {
  fontFamily: fonts.inter,
  fontWeight: 900,
  fontSize: 118,
  lineHeight: 1,
  letterSpacing: "-0.045em",
  color: palette.white,
  textShadow: halo,
  margin: 0,
};

const headlineLight: React.CSSProperties = {
  ...headlineDark,
  fontSize: 104,
  color: palette.navy,
  textShadow: "none",
};

const serifEm = (color: string): React.CSSProperties => ({
  fontFamily: fonts.playfair,
  fontStyle: "italic",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color,
});

const kicker = (color: string): React.CSSProperties => ({
  fontFamily: fonts.inter,
  fontWeight: 800,
  fontSize: 30,
  letterSpacing: "0.28em",
  color,
});

const badgeDark = <LogoBadge tone="onDark" />;
const badgeLight = <LogoBadge tone="onLight" />;

// ─── 1. HOOK — slam on frame 1 (scale 2.4 -> 1) + white flash ───
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame, fps, config: springs.slam });
  const scale = interpolate(slam, [0, 1], [2.4, 1]);
  const flash = interpolate(frame, [0, 6], [0.85, 0], clamp);

  return (
    <Slide background={darkBg} scrimStrength={0} watermark="?" watermarkCorner="br" logo={badgeDark}>
      <div style={{ transform: `scale(${scale})` }}>
        <h1 style={{ ...headlineDark, fontSize: 104 }}>¿Sigues cobrando</h1>
        <h1 style={{ ...headlineDark, fontSize: 104 }}>con libreta y</h1>
        <h1 style={{ ...headlineDark, fontSize: 132, marginTop: 10 }}>
          <span style={gradText(grad.accent)}>calculadora?</span>
        </h1>
      </div>
      <AbsoluteFill style={{ backgroundColor: palette.white, opacity: flash, pointerEvents: "none" }} />
    </Slide>
  );
};

// ─── 2. PAIN — three problems, then the turn ───
const XMark: React.FC = () => (
  <svg width="54" height="54" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={palette.red} />
    <path d="M8 8 L16 16 M16 8 L8 16" stroke={palette.white} strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const PainScene: React.FC = () => {
  const items = ["Errores en el cambio", "Inventario a ojo", "Productos que caducan"];
  return (
    <Slide background={darkBg} scrimStrength={0} watermark="3" watermarkCorner="bl" logo={badgeDark}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "flex-start" }}>
        {items.map((t, i) => (
          <Enter key={t} delay={4 + i * 9} style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <XMark />
            <span style={{ fontFamily: fonts.inter, fontWeight: 800, fontSize: 64, letterSpacing: "-0.02em", color: palette.white, textShadow: halo }}>
              {t}
            </span>
          </Enter>
        ))}
      </div>
      <Enter delay={46} style={{ marginTop: 90 }}>
        <span style={{ ...serifEm(palette.signature), fontSize: 92, textShadow: halo }}>Hay una forma mejor.</span>
      </Enter>
    </Slide>
  );
};

// ─── 3. REVEAL — logo builds ───
export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const markIn = spring({ frame: frame - 2, fps, config: springs.slam });
  const wordIn = spring({ frame: frame - 14, fps, config: springs.smooth });
  const tag = useEnter(34);

  return (
    <Slide background={lightBg} tone="light" scrimStrength={0} showLogo={false}>
      <div style={{ transform: `scale(${interpolate(markIn, [0, 1], [0, 1])}) rotate(${interpolate(markIn, [0, 1], [-14, 0])}deg)` }}>
        <LogoMark size={300} style={{ filter: "drop-shadow(0 24px 40px rgba(14,118,110,0.35))" }} />
      </div>
      <div
        style={{
          marginTop: 64,
          opacity: interpolate(wordIn, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(wordIn, [0, 1], [40, 0])}px)`,
        }}
      >
        <Wordmark size={128} tone="onLight" tagline={false} />
      </div>
      <div style={{ ...tag, ...kicker(palette.muted), fontSize: 36, marginTop: 34 }}>PUNTO DE VENTA MULTIGIRO</div>
    </Slide>
  );
};

// ─── 4-6. FEATURE — headline + animated screenshot + 3 benefit chips ───
type Focus = { fx: number; fy: number; s: number };

const FRAME_W = 960;
const FRAME_H = 620;
const IMG_W = 1080;
const IMG_H = 676;

/** Screenshot inside a rounded card; pans/zooms from one focus point to another. */
const ScreenPan: React.FC<{ src: string; from: Focus; to: Focus; delay?: number }> = ({ src, from, to, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: springs.smooth });
  const t = interpolate(frame, [delay + 18, durationInFrames - 6], [0, 1], { ...clamp, easing: ease.inOut });
  const fx = interpolate(t, [0, 1], [from.fx, to.fx]);
  const fy = interpolate(t, [0, 1], [from.fy, to.fy]);
  const s = interpolate(t, [0, 1], [from.s, to.s]);

  const base = Math.max(FRAME_W / IMG_W, FRAME_H / IMG_H);
  const w = IMG_W * base * s;
  const h = IMG_H * base * s;
  const left = Math.min(0, Math.max(FRAME_W - w, FRAME_W / 2 - fx * w));
  const top = Math.min(0, Math.max(FRAME_H - h, FRAME_H / 2 - fy * h));

  return (
    <div
      style={{
        width: FRAME_W,
        height: FRAME_H,
        borderRadius: 30,
        overflow: "hidden",
        position: "relative",
        backgroundColor: palette.white,
        boxShadow: "0 40px 80px rgba(23,30,44,0.22), 0 0 0 1px rgba(23,30,44,0.08)",
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
      }}
    >
      <Img src={staticFile(src)} style={{ position: "absolute", width: w, height: h, left, top }} />
    </div>
  );
};

const Check: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill={palette.primary} />
    <path d="M7 12.5 L10.4 15.8 L17 9" stroke={palette.white} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Chip: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
  <Enter
    delay={delay}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 26,
      width: 900,
      padding: "22px 34px",
      backgroundColor: palette.white,
      borderRadius: 24,
      boxShadow: "0 10px 30px rgba(23,30,44,0.08), 0 0 0 1px rgba(23,30,44,0.07)",
      textAlign: "left",
    }}
  >
    <Check />
    <span style={{ fontFamily: fonts.inter, fontWeight: 800, fontSize: 42, letterSpacing: "-0.015em", color: palette.navy, lineHeight: 1.1 }}>
      {children}
    </span>
  </Enter>
);

export type FeatureProps = {
  index: string;
  kickerText: string;
  title: React.ReactNode;
  subtitle: string;
  img: string;
  from: Focus;
  to: Focus;
  chips: string[];
};

export const FeatureScene: React.FC<FeatureProps> = ({ index, kickerText, title, subtitle, img, from, to, chips }) => {
  const k = useEnter(2);
  const h = useEnter(6);
  const sub = useEnter(12);
  return (
    <Slide background={lightBg} tone="light" scrimStrength={0} watermark={index} watermarkCorner="bl" watermarkOpacity={0.05} logo={badgeLight}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, marginTop: 40 }}>
        <div style={{ ...k, ...kicker(palette.primary) }}>{kickerText}</div>
        <h1 style={{ ...h, ...headlineLight, marginTop: 22 }}>{title}</h1>
        <div style={{ ...sub, fontFamily: fonts.inter, fontWeight: 600, fontSize: 40, color: palette.primary, marginTop: 22 }}>{subtitle}</div>
        <div style={{ marginTop: 54 }}>
          <ScreenPan src={img} from={from} to={to} delay={10} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 50 }}>
          {chips.map((c, i) => (
            <Chip key={c} delay={30 + i * 12}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
    </Slide>
  );
};

// ─── 7. MODULES — everything in one place ───
const MODULES = [
  "Punto de venta",
  "Caja y cortes",
  "Apartados",
  "Clientes y créditos",
  "Productos",
  "Inventario",
  "Compras",
  "Proveedores",
  "Reportes",
  "Usuarios",
];

export const ModulesScene: React.FC = () => {
  const h = useEnter(2);
  return (
    <Slide background={darkBg} scrimStrength={0} watermark="10" watermarkCorner="bl" logo={badgeDark}>
      <h1 style={{ ...h, ...headlineDark, fontSize: 108 }}>
        Todo tu negocio
        <br />
        en un <span style={{ ...serifEm(palette.signature) }}>solo lugar</span>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 70, width: 920 }}>
        {MODULES.map((m, i) => (
          <Enter
            key={m}
            delay={14 + i * 4}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "26px 28px",
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.07)",
              boxShadow: "inset 0 0 0 1.5px rgba(127,224,207,0.28)",
              textAlign: "left",
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: palette.signature, flexShrink: 0 }} />
            <span style={{ fontFamily: fonts.inter, fontWeight: 800, fontSize: 38, color: palette.white, letterSpacing: "-0.01em" }}>{m}</span>
          </Enter>
        ))}
      </div>
    </Slide>
  );
};

// ─── 8. HERO — Escanea. Cobra. Imprime. ───
export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words: [string, boolean][] = [
    ["Escanea.", false],
    ["Cobra.", false],
    ["Imprime.", true],
  ];
  const img = useEnter(4);
  return (
    <Slide background={palette.white} tone="light" scrimStrength={0} logo={badgeLight}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -40 }}>
        {words.map(([w, em], i) => {
          const s = spring({ frame: frame - (4 + i * 12), fps, config: springs.slam });
          return (
            <div
              key={w}
              style={{
                ...headlineLight,
                fontSize: 128,
                lineHeight: 1.04,
                opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                transform: `scale(${interpolate(s, [0, 1], [1.8, 1])})`,
              }}
            >
              {em ? <span style={{ ...serifEm(palette.primary), fontSize: 140 }}>{w}</span> : w}
            </div>
          );
        })}
        <div style={{ ...img, width: 1080, height: 760, marginTop: 10, overflow: "hidden", position: "relative" }}>
          <Img src={staticFile("images/softhouse/hero-laptop.jpg")} style={{ position: "absolute", width: 1080, height: 1080, left: 0, top: -240 }} />
        </div>
      </div>
    </Slide>
  );
};

// ─── 9. CTA ───
// Marketplace versions (Mercado Libre) must not show contact data, links or "contact us" CTAs:
// pass whatsapp="" there. Own-channel versions show the number under the button.
export type CtaProps = { label: string; whatsapp: string };

const ChatIcon: React.FC = () => (
  <svg width="58" height="58" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.6 21.4l4.7-1.2A9.5 9.5 0 1 0 12 2.5Z"
      fill="none"
      stroke={palette.white}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9.2 7.6c-.3-.6-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4.1 6.3 5.6 3.1 1.2 3.7 1 4.4.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5l-2.3-1.1c-.3-.1-.6-.2-.8.2l-1.1 1.3c-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.8-1.8-1-.9-1.7-2-1.9-2.4-.2-.4 0-.6.2-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.5 0-.6L9.2 7.6Z"
      fill={palette.white}
      transform="translate(12 12) scale(0.62) translate(-12 -12.6)"
    />
  </svg>
);

/** "7861910023" -> "786 191 0023" */
const formatPhone = (n: string) => n.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");

export const CtaScene: React.FC<CtaProps> = ({ label, whatsapp }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const h = useEnter(4);
  const btn = spring({ frame: frame - 20, fps, config: springs.pop });
  const pulse = 1 + Math.sin(Math.max(0, frame - 44) / 7) * 0.025;
  const contact = useEnter(34);

  return (
    <Slide background={tealBg} scrimStrength={0} watermark="→" watermarkCorner="bl" watermarkOpacity={0.08} logo={badgeDark}>
      <h1 style={{ ...h, ...headlineDark, fontSize: 116 }}>
        Moderniza tu
        <br />
        negocio <span style={{ ...serifEm(palette.white) }}>hoy</span>
      </h1>
      <div
        style={{
          marginTop: 80,
          transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * pulse})`,
          opacity: interpolate(btn, [0, 1], [0, 1], clamp),
          backgroundColor: palette.white,
          color: palette.navy,
          fontFamily: fonts.inter,
          fontWeight: 900,
          fontSize: 56,
          letterSpacing: "-0.01em",
          padding: "36px 76px",
          borderRadius: 999,
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {label}
      </div>
      {whatsapp ? (
        <div style={{ ...contact, display: "flex", flexDirection: "column", alignItems: "center", marginTop: 60 }}>
          <div style={{ ...kicker(palette.tint), fontSize: 32 }}>WHATSAPP</div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16 }}>
            <ChatIcon />
            <span style={{ fontFamily: fonts.inter, fontWeight: 900, fontSize: 76, letterSpacing: "-0.01em", color: palette.white, textShadow: halo }}>
              {formatPhone(whatsapp)}
            </span>
          </div>
        </div>
      ) : null}
    </Slide>
  );
};

// ─── 10. END — logo (<= 2s) ───
export const EndScene: React.FC = () => {
  const e = useEnter(0);
  return (
    <Slide background={palette.white} tone="light" scrimStrength={0} showLogo={false}>
      <div style={e}>
        <LogoLockup size={92} tone="onLight" />
      </div>
    </Slide>
  );
};
