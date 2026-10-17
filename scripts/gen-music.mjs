// ElevenLabs Music. Generates (VIDEO_SECONDS + 12)s, ALWAYS hard-trims the first 2s (volume ramp),
// leaving ~10s of tail. No fade-in. Fade-out is done in Remotion (last 60f).
import { unlinkSync, writeFileSync } from "node:fs";
import { elevenlabs, ensureDir, probeDuration, pub, runFfmpeg } from "./_lib.mjs";

const VIDEO_SECONDS = 10; // duracion final ANTES del speedup 1.1x
const PROMPT =
  "Modern editorial data-report underscore, punchy tight drums, deep sub bass hits, confident minimal synth motif, " +
  "driving 120 bpm, starts at full energy immediately, no intro build, no vocals, instrumental";

const RAW = pub("audio/music-raw.mp3");
const OUT = pub("audio/music.mp3");

console.log(`→ Generando musica (${VIDEO_SECONDS + 12}s)…`);
const audio = await elevenlabs("/v1/music", {
  prompt: PROMPT,
  music_length_ms: (VIDEO_SECONDS + 12) * 1000,
  model_id: "music_v1",
});
ensureDir(RAW);
writeFileSync(RAW, audio);

// Hard trim 2.0s — regardless of what silencedetect says.
runFfmpeg(["-y", "-hide_banner", "-ss", "2.0", "-i", RAW, "-c:a", "libmp3lame", "-b:a", "192k", OUT]);
unlinkSync(RAW);
console.log(`✔ ${OUT} (${probeDuration(OUT).toFixed(2)}s, primeros 2s recortados)`);
