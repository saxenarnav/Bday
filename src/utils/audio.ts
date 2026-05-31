// Synthesizer using Web Audio API to play celebratory audio chimes locally

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Fast pitch sweep downwards makes a perfect pop/bubble sound
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

export function playChimeSound() {
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.61);
    osc2.stop(ctx.currentTime + 0.61);
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// Sparkle sound effect for clicking
export function playSparkleSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a quick succession of high-pitched notes
    const notes = [880, 1046.5, 1318.5, 1568]; // A5, C6, E6, G6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.16);
    });
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}

// Joyful classic Birthday jingle
export function playJoyfulChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Happy birthday melody notes & relative timings
    const melody = [
      { f: 261.63, d: 0.25 }, // C4
      { f: 261.63, d: 0.12 }, // C
      { f: 293.66, d: 0.5 },  // D
      { f: 261.63, d: 0.5 },  // C
      { f: 349.23, d: 0.5 },  // F
      { f: 329.63, d: 1.0 },  // E
      
      { f: 261.63, d: 0.25 }, // C4
      { f: 261.63, d: 0.12 }, // C
      { f: 293.66, d: 0.5 },  // D
      { f: 261.63, d: 0.5 },  // C
      { f: 392.00, d: 0.5 },  // G
      { f: 349.23, d: 1.0 },  // F
    ];

    let currentOffset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + currentOffset);

      gain.gain.setValueAtTime(0, now + currentOffset);
      gain.gain.linearRampToValueAtTime(0.08, now + currentOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + note.d - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + note.d);

      currentOffset += note.d + 0.05;
    });
  } catch (e) {
    console.warn('Audio failed to play', e);
  }
}
