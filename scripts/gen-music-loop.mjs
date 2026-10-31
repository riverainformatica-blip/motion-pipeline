// Free-plan fallback for music: the Music API needs a paid ElevenLabs plan, but the Sound Effects
// API can make a seamless loop (up to 30s). We loop it to cover the video, then hard-trim the
// first 2s like gen-music.mjs. No fade-in; fade-out happens in Remotion (last 60f).
import { unlinkSync, writeFileSync } from "node:fs";
import { elevenlabs, ensureDir, probeDuration, pub, runFfmpeg } from "./_lib.mjs";

const VIDEO_SECONDS = 40; // duracion final ANTES del speedup 1.1x
const PROMPT =
  "Upbeat modern corporate tech background music loop, 120 bpm, crisp claps and tight kick, warm plucked synth melody, " +
  "confident bass, bright and optimistic, instrumental, no vocals, seamless loop";

const LOOP = pub("audio/music-loop.mp3");
const OUT = pub("audio/music.mp3");

console.log("→ Generando loop musical (30s)…");
const audio = await elevenlabs("/v1/sound-generation?output_format=mp3_44100_128", {
  text: PROMPT,
  duration_seconds: 30,
  prompt_influence: 0.6,
  loop: true,
  model_id: "eleven_text_to_sound_v2",
});
ensureDir(LOOP);
writeFileSync(LOOP, audio);

const total = VIDEO_SECONDS + 10;
runFfmpeg(["-y", "-hide_banner", "-stream_loop", "-1", "-i", LOOP, "-ss", "2.0", "-t", String(total), "-c:a", "libmp3lame", "-b:a", "192k", OUT]);
unlinkSync(LOOP);
console.log(`✔ ${OUT} (${probeDuration(OUT).toFixed(2)}s)`);
