import React from "react";
import { Composition } from "remotion";
import { ExampleComposition } from "./example/ExampleComposition";
import { LogoLockup, LogoMark } from "./softhouse/brand";
import { SofthouseComposition, SofthouseProps, softhouseDuration } from "./softhouse/SofthouseComposition";

// Softhouse POS variants. ML = Mercado Libre (no contact data allowed); WA = own channels with WhatsApp.
const ML = { label: "CÓMPRALO HOY", whatsapp: "", variant: "ml" } as const;
const WA = { label: "SOLICITA TU DEMO", whatsapp: "7861910023", variant: "wa" } as const;

const SOFTHOUSE: { id: string; width: number; height: number; props: SofthouseProps }[] = [
  { id: "SofthousePOS-ML", width: 1080, height: 1920, props: { ...ML, cut: "full" } },
  { id: "SofthousePOS-WA", width: 1080, height: 1920, props: { ...WA, cut: "full" } },
  { id: "SofthousePOS-ML-1x1", width: 1080, height: 1080, props: { ...ML, cut: "full" } },
  { id: "SofthousePOS-WA-1x1", width: 1080, height: 1080, props: { ...WA, cut: "full" } },
  { id: "SofthousePOS-ML-15s", width: 1080, height: 1920, props: { ...ML, cut: "short" } },
  { id: "SofthousePOS-WA-15s", width: 1080, height: 1920, props: { ...WA, cut: "short" } },
];

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Example" component={ExampleComposition} durationInFrames={300} fps={30} width={1080} height={1920} />
    {SOFTHOUSE.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={SofthouseComposition}
        defaultProps={c.props}
        durationInFrames={softhouseDuration(c.props)}
        fps={30}
        width={c.width}
        height={c.height}
      />
    ))}
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
