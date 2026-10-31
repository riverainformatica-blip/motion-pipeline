import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { optionalAsset } from "../assets";
import { palette, fonts } from "../theme";
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

// Storyboard (30fps). Varied rhythm: fast hook, 6s feature beats, CTA with air, logo <= 2s.
const T = 10; // transition overlap
const D = { hook: 75, pain: 105, reveal: 105, feature: 180, modules: 150, hero: 120, cta: 135, end: 60 } as const;
const SCENES = [D.hook, D.pain, D.reveal, D.feature, D.feature, D.feature, D.modules, D.hero, D.cta, D.end];
export const SOFTHOUSE_DURATION = SCENES.reduce((a, b) => a + b, 0) - (SCENES.length - 1) * T; // 1200f = 40s

// Scene start frames on the timeline (for SFX sync).
const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((a, b) => a + b, 0) - i * T);

const t = linearTiming({ durationInFrames: T });

// No voice-over in this piece, so music leads the mix (with VO the pipeline uses 0.18-0.24).
const MUSIC_VOL = 0.8;

export const SofthouseComposition: React.FC<CtaProps> = ({ label, whatsapp }) => {
  const { durationInFrames } = useVideoConfig();
  const music = optionalAsset("audio/music.mp3");
  const impact = optionalAsset("sfx/impact.mp3");
  const whoosh = optionalAsset("sfx/whoosh.mp3");
  const pop = optionalAsset("sfx/pop.mp3");

  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D.hook}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.pain}>
          <PainScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.reveal}>
          <RevealScene />
        </TransitionSeries.Sequence>
        {FEATURES.map((f, i) => (
          <React.Fragment key={f.index}>
            <TransitionSeries.Transition presentation={i === 0 ? fade() : slide({ direction: "from-right" })} timing={t} />
            <TransitionSeries.Sequence durationInFrames={D.feature}>
              <FeatureScene {...f} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.modules}>
          <ModulesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.hero}>
          <HeroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.cta}>
          <CtaScene label={label} whatsapp={whatsapp} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence durationInFrames={D.end}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Music: frame 0 -> end, NO fade-in, fade-out only in last 60f. */}
      {music ? (
        <Audio
          src={music}
          volume={(f) => interpolate(f, [durationInFrames - 60, durationInFrames], [MUSIC_VOL, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}

      {/* SFX: peaks ~10 dB over the music bed, accents only. */}
      {impact ? (
        <Sequence from={0} durationInFrames={60}>
          <Audio src={impact} volume={0.3} />
        </Sequence>
      ) : null}
      {impact ? (
        <Sequence from={STARTS[2]} durationInFrames={60}>
          <Audio src={impact} volume={0.22} />
        </Sequence>
      ) : null}
      {whoosh
        ? STARTS.slice(1).map((s, i) =>
            i === 1 ? null : (
              <Sequence key={s} from={s - 4} durationInFrames={30}>
                <Audio src={whoosh} volume={0.25} />
              </Sequence>
            ),
          )
        : null}
      {pop ? (
        <Sequence from={STARTS[8] + 20} durationInFrames={30}>
          <Audio src={pop} volume={0.3} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
