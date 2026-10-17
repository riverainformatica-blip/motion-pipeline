import { getStaticFiles, staticFile } from "remotion";

// Returns staticFile(path) only if it exists in public/, else null.
// Lets templates reference optional assets (logo, music, sfx) without 404-ing the render.
export const optionalAsset = (path: string): string | null => {
  const exists = getStaticFiles().some((f) => f.name === path);
  return exists ? staticFile(path) : null;
};
