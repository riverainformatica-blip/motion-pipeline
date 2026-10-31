import React from "react";
import { Composition } from "remotion";
import { ExampleComposition } from "./example/ExampleComposition";
import { LogoLockup, LogoMark } from "./softhouse/brand";
import { SOFTHOUSE_DURATION, SofthouseComposition } from "./softhouse/SofthouseComposition";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Example" component={ExampleComposition} durationInFrames={300} fps={30} width={1080} height={1920} />
    {/* Mercado Libre: no contact data allowed. */}
    <Composition
      id="SofthousePOS-ML"
      component={SofthouseComposition}
      defaultProps={{ label: "CÓMPRALO HOY", whatsapp: "" }}
      durationInFrames={SOFTHOUSE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    {/* Own channels: WhatsApp contact on the CTA. */}
    <Composition
      id="SofthousePOS-WA"
      component={SofthouseComposition}
      defaultProps={{ label: "SOLICITA TU DEMO", whatsapp: "7861910023" }}
      durationInFrames={SOFTHOUSE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    {/* Logo exports: npx remotion still <Id> public/logos/<file>.png --image-format=png */}
    <Composition id="SofthouseLogoMark" component={() => <LogoMark size={512} />} durationInFrames={1} fps={30} width={512} height={512} />
    <Composition
      id="SofthouseLogoFull"
      component={() => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <LogoLockup size={150} tone="onLight" />
        </div>
      )}
      durationInFrames={1}
      fps={30}
      width={1600}
      height={420}
    />
  </>
);
