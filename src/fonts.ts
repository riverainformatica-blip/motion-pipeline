// Loads brand fonts from public/fonts (self-hosted, OFL) so renders never depend on Google Fonts
// being reachable from the headless browser. Blocks rendering until every face is ready.
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

const FACES: [family: string, file: string, weight: string, style: string][] = [
  ["Inter", "inter-latin-400-normal.woff2", "400", "normal"],
  ["Inter", "inter-latin-600-normal.woff2", "600", "normal"],
  ["Inter", "inter-latin-800-normal.woff2", "800", "normal"],
  ["Inter", "inter-latin-900-normal.woff2", "900", "normal"],
  ["Playfair Display", "playfair-display-latin-400-italic.woff2", "400", "italic"],
  ["Playfair Display", "playfair-display-latin-700-italic.woff2", "700", "italic"],
  ["Playfair Display", "playfair-display-latin-900-italic.woff2", "900", "italic"],
  ["Poppins", "poppins-latin-400-normal.woff2", "400", "normal"],
  ["Poppins", "poppins-latin-600-normal.woff2", "600", "normal"],
  ["Poppins", "poppins-latin-800-normal.woff2", "800", "normal"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FACES.map(([family, file, weight, style]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight, style });
    return face.load().then(() => document.fonts.add(face));
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err));
