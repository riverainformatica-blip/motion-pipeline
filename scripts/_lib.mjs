// Shared helpers for the generation scripts.
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const pub = (...p) => resolve(ROOT, "public", ...p);
export const ffmpeg = ffmpegPath;

export const requireEnv = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`✖ Falta ${name} en .env`);
    process.exit(1);
  }
  return v;
};

export const ensureDir = (file) => mkdirSync(dirname(file), { recursive: true });

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs ffmpeg-static; returns { code, stderr }. Throws on non-zero unless allowFail. */
export const runFfmpeg = (args, { allowFail = false } = {}) => {
  const r = spawnSync(ffmpeg, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) {
    console.error(r.stderr);
    throw new Error(`ffmpeg exited with ${r.status}`);
  }
  return { code: r.status, stderr: r.stderr ?? "" };
};

export const probeDuration = (file) => {
  const { stderr } = runFfmpeg(["-hide_banner", "-i", file], { allowFail: true });
  const m = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : NaN;
};

/** Reads hex values from the palette block in src/theme.ts (single source of truth). */
export const brandPalette = () => {
  const src = readFileSync(resolve(ROOT, "src/theme.ts"), "utf8");
  const block = src.match(/export const palette = \{([\s\S]*?)\}/)?.[1] ?? "";
  return [...block.matchAll(/(\w+):\s*"(#[0-9a-fA-F]{6})"/g)].map(([, k, v]) => `${k} ${v}`);
};

/** POST to ElevenLabs and return the audio as a Buffer. */
export const elevenlabs = async (path, body) => {
  const res = await fetch(`https://api.elevenlabs.io${path}`, {
    method: "POST",
    headers: {
      "xi-api-key": requireEnv("ELEVENLABS_API_KEY"),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
};
