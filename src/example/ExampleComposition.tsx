import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { optionalAsset } from "../assets";
import { palette } from "../theme";
import { CtaScene, DataScene, HookScene } from "./scenes";

// Storyboard (30fps) — 2 transitions x 10f overlap:
//   HOOK 80f (2.7s) + DATA 120f (4s) + CTA 120f (4s) - 20f = 300f (10s)
const T = 10;
const SCENES = { hook: 80, data: 120, cta: 120 } as const;
export const EXAMPLE_DURATION = SCENES.hook + SCENES.data + SCENES.cta - 2 * T;

// Cut points (scene starts on the timeline), used to sync SFX.
const CUT_DATA = SCENES.hook - T;
const CUT_CTA = CUT_DATA + SCENES.data - T;

export const ExampleComposition: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const music = optionalAsset("audio/music.mp3");
  const voice = optionalAsset("audio/voice.mp3");
  const impact = optionalAsset("sfx/impact.mp3");
  const whoosh = optionalAsset("sfx/whoosh.mp3");
  const pop = optionalAsset("sfx/pop.mp3");

  return (
    <AbsoluteFill style={{ backgroundColor: palette.navy }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={SCENES.data}>
          <DataScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={SCENES.cta}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Music: frame 0 -> end, NO fade-in, fade-out only in last 60f. */}
      {music ? (
        <Audio
          src={music}
          volume={(f) => interpolate(f, [durationInFrames - 60, durationInFrames], [0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      ) : null}
      {voice ? <Audio src={voice} volume={1} /> : null}

      {/* SFX: keep 12+ dB under voice peak (0.10-0.18). */}
      {impact ? (
        <Sequence from={0} durationInFrames={60}>
          <Audio src={impact} volume={0.18} />
        </Sequence>
      ) : null}
      {whoosh ? (
        <>
          <Sequence from={CUT_DATA - 4} durationInFrames={30}>
            <Audio src={whoosh} volume={0.12} />
          </Sequence>
          <Sequence from={CUT_CTA - 4} durationInFrames={30}>
            <Audio src={whoosh} volume={0.12} />
          </Sequence>
        </>
      ) : null}
      {pop ? (
        <Sequence from={CUT_CTA + 18} durationInFrames={30}>
          <Audio src={pop} volume={0.14} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
