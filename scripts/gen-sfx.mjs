// ElevenLabs Sound Effects — reusable library in public/sfx/. Skips files that already exist.
// Usage: npm run sfx            (whole library)
//        npm run sfx -- impact  (only listed names; add --force to regenerate)
import { existsSync, writeFileSync } from "node:fs";
import { elevenlabs, ensureDir, pub } from "./_lib.mjs";

const LIBRARY = {
  impact: { text: "Deep cinematic bass impact hit with short sub boom, punchy trailer slam", duration_seconds: 1.5 },
  whoosh: { text: "Fast clean airy whoosh transition, short swish", duration_seconds: 0.8 },
  riser: { text: "Short tension riser building up, synthetic sweep", duration_seconds: 2.0 },
  pop: { text: "Soft UI pop click, satisfying bubbly button press", duration_seconds: 0.5 },
  tick: { text: "Crisp subtle digital tick for a number counter", duration_seconds: 0.5 },
  glitch: { text: "Short digital glitch stutter, data corruption blip", duration_seconds: 0.7 },
  swipe: { text: "Paper-like quick swipe slide transition", duration_seconds: 0.6 },
  chime: { text: "Bright positive notification chime, modern and clean", duration_seconds: 1.2 },
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--"));
const todo = names.length ? names : Object.keys(LIBRARY);

for (const name of todo) {
  const spec = LIBRARY[name];
  if (!spec) {
    console.warn(`⚠ "${name}" no esta en LIBRARY, omitido`);
    continue;
  }
  const out = pub(`sfx/${name}.mp3`);
  if (existsSync(out) && !force) {
    console.log(`· ${name} ya existe`);
    continue;
  }
  console.log(`→ ${name}…`);
  const audio = await elevenlabs("/v1/sound-generation?output_format=mp3_44100_128", { ...spec, prompt_influence: 0.5 });
  ensureDir(out);
  writeFileSync(out, audio);
  console.log(`✔ ${out}`);
}
