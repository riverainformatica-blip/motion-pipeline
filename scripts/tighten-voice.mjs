// Removes voice silences with silencedetect + atrim/concat (NO silenceremove — not in Remotion's ffmpeg).
// Usage: npm run tighten [-- in.mp3 out.mp3]
import { existsSync } from "node:fs";
import { probeDuration, pub, runFfmpeg } from "./_lib.mjs";

const IN = process.argv[2] ?? pub("audio/voice-raw.mp3");
const OUT = process.argv[3] ?? pub("audio/voice.mp3");
const NOISE_DB = -38; // threshold for "silence"
const MIN_SILENCE = 0.28; // only cut pauses longer than this (s)
const KEEP_GAP = 0.12; // breathing room left on each side of a cut (s)

if (!existsSync(IN)) {
  console.error(`✖ No existe ${IN}. Corre primero: npm run voice`);
  process.exit(1);
}

const total = probeDuration(IN);
const { stderr } = runFfmpeg(["-hide_banner", "-i", IN, "-af", `silencedetect=noise=${NOISE_DB}dB:d=${MIN_SILENCE}`, "-f", "null", "-"]);
const starts = [...stderr.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => +m[1]);
const ends = [...stderr.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => +m[1]);

// Build "keep" segments between silences.
const keep = [];
let cursor = 0;
starts.forEach((s, i) => {
  const e = ends[i] ?? total;
  const segEnd = Math.min(total, s + KEEP_GAP);
  if (segEnd > cursor + 0.02) keep.push([cursor, segEnd]);
  cursor = Math.max(cursor, e - KEEP_GAP);
});
if (total - cursor > 0.02) keep.push([cursor, total]);

if (keep.length === 0) {
  console.error("✖ No se detecto voz. Revisa NOISE_DB.");
  process.exit(1);
}

const parts = keep.map(([a, b], i) => `[0:a]atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=PTS-STARTPTS[s${i}]`);
const filter = `${parts.join(";")};${keep.map((_, i) => `[s${i}]`).join("")}concat=n=${keep.length}:v=0:a=1[out]`;
runFfmpeg(["-y", "-hide_banner", "-i", IN, "-filter_complex", filter, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", OUT]);

const after = probeDuration(OUT);
console.log(`✔ ${OUT}: ${total.toFixed(2)}s → ${after.toFixed(2)}s (${keep.length} segmentos)`);
console.log(`  = ${Math.ceil(after * 30)} frames @30fps`);
