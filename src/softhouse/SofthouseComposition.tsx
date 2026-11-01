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
const BODY: [VoKey, number][] = [
  ["hook", 75],
  ["pain", 105],
  ["reveal", 105],
  ["sell", 180],
  ["pay", 180],
  ["stock", 180],
  ["modules", 150],
  ["hero", 120],
];
const END = 60;

export type Variant = "ml" | "wa";
export type SofthouseProps = CtaProps & { variant: Variant };

const timeline = (variant: Variant) => {
  const ctaKey: VoKey = variant === "ml" ? "ctaMl" : "ctaWa";
  const keys = [...BODY.map(([k]) => k), ctaKey];
  const scenes = [
    ...BODY.map(([k, base]) => Math.max(base, LEAD + fr(VO[k]) + TAIL)),
    Math.max(135, LEAD + fr(VO[ctaKey]) + 40),
    END,
  ];
  const starts = scenes.map((_, i) => sum(scenes.slice(0, i)) - i * T);
  return { keys, scenes, starts, duration: sum(scenes) - (scenes.length - 1) * T };
};

export const softhouseDuration = (variant: Variant) => timeline(variant).duration;

/** Frame (inside the scene) where each spoken sentence starts; falls back to the scene's defaults. */
const beats = (key: VoKey, expected: number) => {
  const b = VO_STARTS[key].map((sec) => LEAD + Math.round(sec * FPS));
  return b.length === expected ? b : undefined;
};

const t = linearTiming({ durationInFrames: T });

// Mix with voice-over: music 10-14 dB under the voice, SFX transients 12+ dB under the voice peak.
const MUSIC_VOL = 0.24;

export const SofthouseComposition: React.FC<SofthouseProps> = ({ label, whatsapp, variant }) => {
  const { durationInFrames } = useVideoConfig();
  const { keys, scenes, starts } = timeline(variant);
  const [hook, pain, reveal, sell, pay, stock, modules, hero, cta, end] = scenes;
  const music = optionalAsset("audio/music.mp3");
  const impact = optionalAsset("sfx/impact.mp3");
  const whoosh = optionalAsset("sfx/whoosh.mp3");
  const pop = optionalAsset("sfx/pop.mp3");
  const featureDur = [sell, pay, stock];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={hook}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={pain}>
          <PainScene beats={beats("pain", 4)} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={reveal}>
          <RevealScene />
        </TransitionSeries.Sequence>
        {FEATURES.map((f, i) => (
          <React.Fragment key={f.index}>
            <TransitionSeries.Transition presentation={i === 0 ? fade() : slide({ direction: "from-right" })} timing={t} />
            <TransitionSeries.Sequence durationInFrames={featureDur[i]}>
              <FeatureScene {...f} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={modules}>
          <ModulesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={hero}>
          <HeroScene beats={beats("hero", 3)} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={cta}>
          <CtaScene label={label} whatsapp={whatsapp} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence durationInFrames={end}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Voice-over: one clip per scene. */}
      {keys.map((k, i) => (
        <Sequence key={k} from={starts[i] + LEAD} durationInFrames={fr(VO[k]) + 2}>
          <Audio src={staticFile(`audio/softhouse/vo-${k}.mp3`)} volume={1} />
        </Sequence>
      ))}

      {/* Music: frame 0 -> end, NO fade-in, fade-out only in last 60f. */}
      {music ? (
        <Audio
          src={music}
          volume={(f) => interpolate(f, [durationInFrames - 60, durationInFrames], [MUSIC_VOL, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}

      {/* SFX: transients kept 12+ dB under the voice peak (0.10-0.18). */}
      {impact ? (
        <Sequence from={0} durationInFrames={60}>
          <Audio src={impact} volume={0.18} />
        </Sequence>
      ) : null}
      {impact ? (
        <Sequence from={starts[2]} durationInFrames={60}>
          <Audio src={impact} volume={0.14} />
        </Sequence>
      ) : null}
      {whoosh
        ? starts.slice(1).map((s, i) =>
            i === 1 ? null : (
              <Sequence key={s} from={s - 4} durationInFrames={30}>
                <Audio src={whoosh} volume={0.11} />
              </Sequence>
            ),
          )
        : null}
      {pop ? (
        <Sequence from={starts[8] + 20} durationInFrames={30}>
          <Audio src={pop} volume={0.14} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
