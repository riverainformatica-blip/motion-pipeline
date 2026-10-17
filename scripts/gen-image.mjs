// Gemini image generation: nano-banana-pro-preview -> fallback gemini-2.5-flash-image.
// Retry with 2/4/6s backoff on 503. Prompt ALWAYS ends with brand palette + "no text, no logos".
// Edit the CONFIG block per image, then: npm run image
// Consistent characters: generate a master sheet first (OUT=images/personaje-master.png),
// then set REF_PATH="images/personaje-master.png" for every scene.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { brandPalette, ensureDir, pub, requireEnv, sleep } from "./_lib.mjs";

// ─── CONFIG ───
const PROMPT =
  "Low-key dark editorial background, abstract data visualization light trails, soft volumetric light from the lower right, " +
  "large clean negative space in the center reserved for typography, cinematic, high-end";
const OUT = "images/bg-01.png";
const ASPECT = "9:16"; // 9:16 vertical | 1:1 square | 16:9 horizontal
const REF_PATH = null; // e.g. "images/personaje-master.png"
// ──────────────

const MODELS = ["nano-banana-pro-preview", "gemini-2.5-flash-image"];
const BACKOFF = [2000, 4000, 6000];

const fullPrompt = `${PROMPT}. Brand color palette: ${brandPalette().join(", ")}. no text, no logos`;

const parts = [{ text: fullPrompt }];
if (REF_PATH) {
  const refFile = pub(REF_PATH);
  if (!existsSync(refFile)) throw new Error(`REF_PATH no existe: ${refFile}`);
  const mimeType = extname(refFile).toLowerCase() === ".jpg" || extname(refFile).toLowerCase() === ".jpeg" ? "image/jpeg" : "image/png";
  parts.unshift({ inlineData: { mimeType, data: readFileSync(refFile).toString("base64") } });
  parts.push({ text: "Keep the exact same character design, face, outfit and proportions as the reference image." });
}

const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });

const is503 = (e) => /503|UNAVAILABLE|overloaded/i.test(String(e?.status ?? "") + String(e?.message ?? e));

const tryModel = async (model) => {
  for (let attempt = 0; attempt <= BACKOFF.length; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ASPECT } },
      });
      const img = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!img) throw new Error(`Sin imagen en la respuesta de ${model}`);
      return Buffer.from(img.inlineData.data, "base64");
    } catch (e) {
      if (is503(e) && attempt < BACKOFF.length) {
        console.warn(`  503 en ${model}, reintento en ${BACKOFF[attempt] / 1000}s…`);
        await sleep(BACKOFF[attempt]);
        continue;
      }
      throw e;
    }
  }
};

let buf;
for (const model of MODELS) {
  try {
    console.log(`→ ${model}…`);
    buf = await tryModel(model);
    break;
  } catch (e) {
    console.warn(`✖ ${model}: ${e?.message ?? e}`);
  }
}
if (!buf) {
  console.error("✖ Todos los modelos fallaron.");
  process.exit(1);
}
const out = pub(OUT);
ensureDir(out);
writeFileSync(out, buf);
console.log(`✔ ${out}`);
