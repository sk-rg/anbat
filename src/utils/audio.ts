/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API realistic physical stamp thud sound
export const playStampSound = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Heavy bass thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.14);

    oscGain.gain.setValueAtTime(0.85, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    // Filtered paper impact slap
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start();
    whiteNoise.start();
    osc.stop(ctx.currentTime + 0.18);
    whiteNoise.stop(ctx.currentTime + 0.07);
  } catch {
    // Graceful silent fallback if Web Audio is blocked
  }
};

// Celebration chord when a landmark visit or bonus is awarded
export const playSuccessChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.45);
    });
  } catch {
    // Graceful fallback
  }
};
