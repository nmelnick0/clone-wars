(function () {
  let audio = null;
  function getAudio() {
    if (!audio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audio = new AudioCtx();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function flap() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const gain = context.createGain();
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(250, now);
      oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.11);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.13, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
    } catch (error) {}
  }

  function score() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const gain = context.createGain();
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(420, now);
      oscillator.frequency.exponentialRampToValueAtTime(840, now + 0.2);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.29);
    } catch (error) {}
  }

  function crash() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const gain = context.createGain();
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(130, now);
      oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.32);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.39);

      // Filtered noise gives the crash a short original water-splash texture.
      const length = Math.floor(context.sampleRate * 0.24);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        const fade = 1 - index / length;
        samples[index] = (Math.random() * 2 - 1) * fade;
      }
      const splash = context.createBufferSource();
      const splashFilter = context.createBiquadFilter();
      const splashGain = context.createGain();
      splash.buffer = buffer;
      splashFilter.type = 'lowpass';
      splashFilter.frequency.setValueAtTime(1250, now);
      splashFilter.frequency.exponentialRampToValueAtTime(420, now + 0.2);
      splashGain.gain.setValueAtTime(0.001, now);
      splashGain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
      splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      splash.connect(splashFilter);
      splashFilter.connect(splashGain);
      splashGain.connect(context.destination);
      splash.start(now);
      splash.stop(now + 0.24);
    } catch (error) {}
  }

  window.SOUNDS = { flap: flap, score: score, crash: crash };
})();
