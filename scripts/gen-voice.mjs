// ElevenLabs TTS — LOCKED settings: eleven_v3, stability 0.42, similarity 0.78, style 0.6, speaker boost.
// Edit SCRIPT with the brief's guion, then: npm run voice  ->  npm run tighten
import { writeFileSync } from "node:fs";
import { elevenlabs, ensureDir, probeDuration, pub, requireEnv } from "./_lib.mjs";

const SCRIPT = `
El setenta y tres por ciento lo hace mal.
Pero quienes lo hacen bien, crecen cuatro coma dos veces en solo doce meses.
Empieza hoy. Link en la bio.
`.trim();

const OUT = pub("audio/voice-raw.mp3");

const voiceId = requireEnv("ELEVENLABS_VOICE_ID");
console.log("→ Generando voz (eleven_v3)…");
const audio = await elevenlabs(`/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
  text: SCRIPT,
  model_id: "eleven_v3",
  voice_settings: { stability: 0.42, similarity_boost: 0.78, style: 0.6, use_speaker_boost: true },
});
ensureDir(OUT);
writeFileSync(OUT, audio);
console.log(`✔ ${OUT} (${probeDuration(OUT).toFixed(2)}s). Siguiente: npm run tighten`);
