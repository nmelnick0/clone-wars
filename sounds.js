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
    } catch (error) {}
  }

  window.SOUNDS = { flap: flap, score: score, crash: crash };
})();
