import React from "react";
import { Composition } from "remotion";
import { ExampleComposition } from "./example/ExampleComposition";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Example" component={ExampleComposition} durationInFrames={300} fps={30} width={1080} height={1920} />
  </>
);
