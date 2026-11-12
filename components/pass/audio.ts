"use client";

// Ljudsignaler via Web Audio (pålitligt på Android) + valfri svensk röst om
// telefonen har en. Talsyntes är aldrig enda källan.

let ctx: AudioContext | null = null;

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function beep(freq = 880, ms = 140, volume = 0.18) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + ms / 1000 + 0.02);
}

export function tick() {
  beep(660, 110);
  navigator.vibrate?.(30);
}

export function chime() {
  beep(784, 160);
  setTimeout(() => beep(1046, 260), 170);
  navigator.vibrate?.([40, 60, 40]);
}

let svVoice: SpeechSynthesisVoice | null | undefined;

function findVoice(): SpeechSynthesisVoice | null {
  if (svVoice !== undefined) return svVoice;
  if (!("speechSynthesis" in window)) return (svVoice = null);
  const v = window.speechSynthesis.getVoices();
  if (!v.length) return null; // inte laddat än – försök igen senare
  svVoice = v.find((x) => x.lang?.toLowerCase().startsWith("sv")) ?? null;
  return svVoice;
}

export function hasSwedishVoice(): boolean {
  return !!findVoice();
}

export function speak(text: string) {
  const v = findVoice();
  if (!v) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v;
    u.lang = v.lang;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignorera */
  }
}
