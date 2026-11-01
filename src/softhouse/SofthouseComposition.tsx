import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { optionalAsset } from "../assets";
import { palette, fonts } from "../theme";
import { VO, VO_STARTS } from "./vo-durations";
import { CtaProps, CtaScene, EndScene, FeatureScene, FeatureProps, HeroScene, HookScene, ModulesScene, PainScene, RevealScene } from "./scenes";

const em = (t: string) => (
  <span style={{ fontFamily: fonts.playfair, fontStyle: "italic", fontWeight: 700, letterSpacing: "-0.01em", color: palette.primary }}>{t}</span>
);

const FEATURES: FeatureProps[] = [
  {
    index: "01",
    kickerText: "PUNTO DE VENTA",
    title: (
      <>
        Vende rápido
        <br />y {em("sin errores")}
      </>
    ),
    subtitle: "Escanea, cobra e imprime en segundos",
    img: "images/softhouse/ui-2.jpg",
    from: { fx: 0.3, fy: 0.3, s: 1.3 },
    to: { fx: 0.84, fy: 0.22, s: 1.65 },
    chips: ["Lector de código de barras", "Mayoreo y granel automáticos", "Efectivo, tarjeta, transferencia y crédito"],
  },
  {
    index: "02",
    kickerText: "COBRO Y TICKET",
    title: (
      <>
        Cobro y ticket
        <br />
        {em("profesional")}
      </>
    ),
    subtitle: "Calcula el cambio y desglosa el IVA",
    img: "images/softhouse/ui-3.jpg",
    from: { fx: 0.5, fy: 0.5, s: 1.35 },
    to: { fx: 0.86, fy: 0.5, s: 1.5 },
    chips: ["Pago combinado y cambio al instante", "IVA 16%, 8%, 0% y exento", "Impresora térmica de 58 u 80 mm"],
  },
  {
    index: "03",
    kickerText: "INVENTARIO",
    title: (
      <>
        Control total
        <br />
        de tu {em("inventario")}
      </>
    ),
    subtitle: "Sabe qué tienes, qué falta y qué caduca",
    img: "images/softhouse/ui-4.jpg",
    from: { fx: 0.62, fy: 0.12, s: 1.55 },
    to: { fx: 0.5, fy: 0.62, s: 1.25 },
    chips: ["Alertas de stock mínimo", "Lotes y fechas de caducidad", "Entradas, salidas y kárdex"],
  },
];

// Storyboard (30fps). Every scene is sized around its voice-over line (VO starts LEAD frames in and
// must end TAIL frames before the cut, clear of the outgoing transition). Bases keep the visual rhythm:
// fast hook, feature beats, CTA with air, logo <= 2s.
const T = 10; // transition overlap
const LEAD = 4;
const TAIL = T + 8;
const FPS = 30;
const fr = (sec: number) => Math.ceil(sec * FPS);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

type VoKey = keyof typeof VO;
export type Variant = "ml" | "wa";
/** full = complete explainer (~46s); short = ad / stories cut (~15s). */
export type Cut = "full" | "short";
export type SofthouseProps = CtaProps & { variant: Variant; cut: Cut };

/** Frame (inside the scene) where each spoken sentence starts; falls back to the scene's defaults. */
const beats = (key: VoKey, expected: number) => {
  const b = VO_STARTS[key].map((sec) => LEAD + Math.round(sec * FPS));
  return b.length === expected ? b : undefined;
};

type SceneDef = {
  id: string;
  vo?: VoKey;
  base: number; // minimum length in frames
  air?: number; // frames after the line (default TAIL)
  enter?: "slideUp" | "slideLeft" | "wipeLeft" | "wipeRight" | "fade"; // transition into this scene
  node: React.ReactNode;
};

const scenesFor = ({ variant, cut, label, whatsapp }: SofthouseProps): SceneDef[] => {
  const ctaVo: VoKey = variant === "ml" ? "ctaMl" : "ctaWa";
  const hook: SceneDef = { id: "hook", vo: "hook", base: 75, node: <HookScene /> };
  const reveal: SceneDef = { id: "reveal", vo: "reveal", base: 105, enter: "wipeLeft", node: <RevealScene /> };
  const hero: SceneDef = { id: "hero", vo: "hero", base: cut === "short" ? 90 : 120, enter: "wipeRight", node: <HeroScene beats={beats("hero", 3)} /> };
  const cta: SceneDef = { id: "cta", vo: ctaVo, base: 135, air: 40, enter: "slideUp", node: <CtaScene label={label} whatsapp={whatsapp} /> };
  const end: SceneDef = { id: "end", base: 60, enter: "fade", node: <EndScene /> };

  if (cut === "short") return [hook, reveal, hero, cta, end];

  const featureVo: VoKey[] = ["sell", "pay", "stock"];
  return [
    hook,
    { id: "pain", vo: "pain", base: 105, enter: "slideUp", node: <PainScene beats={beats("pain", 4)} /> },
    reveal,
    ...FEATURES.map(
      (f, i): SceneDef => ({ id: `feature-${f.index}`, vo: featureVo[i], base: 180, enter: i === 0 ? "fade" : "slideLeft", node: <FeatureScene {...f} /> }),
    ),
    { id: "modules", vo: "modules", base: 150, enter: "slideUp", node: <ModulesScene /> },
    hero,
    cta,
    end,
  ];
};

const lengthOf = (d: SceneDef) => (d.vo ? Math.max(d.base, LEAD + fr(VO[d.vo]) + (d.air ?? TAIL)) : d.base);

const timeline = (props: SofthouseProps) => {
  const defs = scenesFor(props);
  const lengths = defs.map(lengthOf);
  const starts = lengths.map((_, i) => sum(lengths.slice(0, i)) - i * T);
  return { defs, lengths, starts, duration: sum(lengths) - (lengths.length - 1) * T };
};

export const softhouseDuration = (props: SofthouseProps) => timeline(props).duration;

const t = linearTiming({ durationInFrames: T });
// Each presentation has its own props type, so build the whole Transition element per case.
const transitionInto = (enter: NonNullable<SceneDef["enter"]>) => {
  switch (enter) {
    case "slideUp":
      return <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />;
    case "slideLeft":
      return <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />;
    case "wipeLeft":
      return <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />;
    case "wipeRight":
      return <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />;
    case "fade":
      return <TransitionSeries.Transition presentation={fade()} timing={t} />;
  }
};

// Mix with voice-over: music 10-14 dB under the voice, SFX transients 12+ dB under the voice peak.
const MUSIC_VOL = 0.24;

export const SofthouseComposition: React.FC<SofthouseProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  const { defs, lengths, starts } = timeline(props);
  const music = optionalAsset("audio/music.mp3");
  const impact = optionalAsset("sfx/impact.mp3");
  const whoosh = optionalAsset("sfx/whoosh.mp3");
  const pop = optionalAsset("sfx/pop.mp3");
  const revealAt = starts[defs.findIndex((d) => d.id === "reveal")];
  const ctaAt = starts[defs.findIndex((d) => d.id === "cta")];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy }}>
      <TransitionSeries>
        {defs.map((d, i) => (
          <React.Fragment key={d.id}>
            {i > 0 ? transitionInto(d.enter ?? "fade") : null}
            <TransitionSeries.Sequence durationInFrames={lengths[i]}>{d.node}</TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Voice-over: one clip per scene. */}
      {defs.map((d, i) =>
        d.vo ? (
          <Sequence key={d.id} from={starts[i] + LEAD} durationInFrames={fr(VO[d.vo]) + 2}>
            <Audio src={staticFile(`audio/softhouse/vo-${d.vo}.mp3`)} volume={1} />
          </Sequence>
        ) : null,
      )}

      {/* Music: frame 0 -> end, NO fade-in, fade-out only in last 60f. */}
      {music ? (
        <Audio
          src={music}
          volume={(f) => interpolate(f, [durationInFrames - 60, durationInFrames], [MUSIC_VOL, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}

      {/* SFX: transients kept 12+ dB under the voice peak (0.10-0.18). */}
      {impact ? (
        <>
          <Sequence from={0} durationInFrames={60}>
            <Audio src={impact} volume={0.18} />
          </Sequence>
          <Sequence from={revealAt} durationInFrames={60}>
            <Audio src={impact} volume={0.14} />
          </Sequence>
        </>
      ) : null}
      {whoosh
        ? starts.slice(1).map((s) =>
            s === revealAt ? null : (
              <Sequence key={s} from={s - 4} durationInFrames={30}>
                <Audio src={whoosh} volume={0.11} />
              </Sequence>
            ),
          )
        : null}
      {pop ? (
        <Sequence from={ctaAt + 20} durationInFrames={30}>
          <Audio src={pop} volume={0.14} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
