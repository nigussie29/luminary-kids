/* Luminary Kids — friendly sound effects, synthesised with Web Audio (no audio files, nothing to license).
   Soft marimba-like tones; every sound is short and quiet. Only plays after the child has tapped. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const S = (LK.sfx = { on: true });
  let ctx = null;
  const ac = () => {
    if (!ctx) { const C = G.AudioContext || G.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  // One soft mallet note: sine + a quieter overtone, fast attack, gentle decay.
  function note(freq, at = 0, dur = 0.35, vol = 0.18) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + at;
    [[1, vol], [4, vol * 0.12]].forEach(([mult, v]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5;
  const play = (fn) => { if (S.on) { try { fn(); } catch (e) { /* audio unavailable */ } } };
  S.correct = () => play(() => { note(C5, 0); note(E5, 0.09); note(G5, 0.18, 0.5); });
  S.retry = () => play(() => { note(E5, 0, 0.25, 0.12); note(D5, 0.13, 0.35, 0.12); });
  S.reveal = () => play(() => { note(G5, 0, 0.3, 0.12); note(E5, 0.12, 0.4, 0.12); });
  // Counting pop rises with the count, so counting to 10 climbs a scale.
  const SCALE = [C5, D5, E5, G5, A5, C6, D5 * 2, E5 * 2, G5 * 2, A5 * 2]; // 10-step pentatonic climb
  S.count = (n) => play(() => note(SCALE[Math.min(n, 10) - 1], 0, 0.22, 0.13));
  S.tap = () => play(() => note(A5, 0, 0.12, 0.08));
  S.badge = () => play(() => { [C5, E5, G5, C6, E5 * 2].forEach((f, i) => note(f, i * 0.08, 0.6, 0.14)); });
  S.unlock = ac; // call inside the first tap so phones allow sound
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
