// sound.js
// Tiny Web Audio API beeps for keystrokes, errors, and completion.
// No external audio files are used.

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function beep({ frequency = 440, duration = 0.05, type = 'sine', volume = 0.06 }) {
  try {
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (err) {
    // Audio isn't critical to the test — fail silently if it's unavailable.
    console.warn('Sound playback unavailable:', err);
  }
}

export function playKeySound() {
  beep({ frequency: 520, duration: 0.035, type: 'square', volume: 0.04 });
}

export function playErrorSound() {
  beep({ frequency: 160, duration: 0.09, type: 'sawtooth', volume: 0.06 });
}

export function playFinishSound() {
  beep({ frequency: 660, duration: 0.12, type: 'sine', volume: 0.08 });
  setTimeout(() => beep({ frequency: 880, duration: 0.16, type: 'sine', volume: 0.08 }), 120);
}
