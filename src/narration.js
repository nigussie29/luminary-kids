/* Luminary Kids — narration.
   Every spoken line is a sequence of audio "keys". A key is a short recorded clip:
   a fixed sentence (lesson.count10.story), a piece of a sentence between numbers
   (prompt.add.1), a number word (num.7) or an object word (thing.mango.1).
   Recorded files live in /audio/am/<key>.<ext>; the server lists them in /audio/manifest.json.
   If any clip of a line is missing, the device voice is used instead. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const N = (LK.narr = {});
  N.clips = {}; // key -> url

  const PUNCT = /^[\s።፣፤፥፦?!.,]*$/;

  // Split an Amharic template into keys. vars: values; thing: thing id.
  N.tplKeys = function (base, tpl, vars = {}, thing = null) {
    const keys = [];
    const parts = String(tpl).split(/\{(\w+)\}/);
    parts.forEach((p, i) => {
      if (i % 2 === 0) {
        if (!PUNCT.test(p)) keys.push(`${base}.${i / 2}`);
      } else if (p === 'thing' || p === 'things') {
        keys.push(`thing.${thing}.${p === 'thing' ? 0 : 1}`);
      } else {
        const v = vars[p];
        keys.push(typeof v === 'number' ? `num.${v}` : `word.${v}`);
      }
    });
    return keys;
  };

  // Every recordable clip with its Amharic text (for the recording script).
  N.script = function () {
    const out = [];
    const add = (key, am, en, note = '') => out.push({ key, am, en, note });
    const ui = LK.ui;
    LK.numWords.am.forEach((w, n) => add(`num.${n}`, w, LK.numWords.en[n], 'number word'));
    Object.entries(LK.things).forEach(([id, t]) => { add(`thing.${id}.0`, t.am[0], t.en[0], 'one'); add(`thing.${id}.1`, t.am[1], t.en[1], 'many'); });
    add('word.left', ui.am.left, ui.en.left); add('word.right', ui.am.right, ui.en.right);
    ['diagnosticIntro', 'tryAgain', 'tapToCount', 'tapLine', 'lessonDone', 'badgeEarned', 'keepGoing', 'unitDone'].forEach((k) => add(`ui.${k}`, ui.am[k], ui.en[k]));
    ui.am.correct.forEach((t, i) => add(`ui.correct.${i}`, t, ui.en.correct[i], 'praise'));
    splitAdd('ui.reveal', ui.am.reveal, ui.en.reveal, '{ans} is a number word or left/right');
    LK.lessons.forEach((l) => { add(`lesson.${l.id}.title`, l.title.am, l.title.en); add(`lesson.${l.id}.story`, l.story.am, l.story.en); add(`lesson.${l.id}.example`, l.example.am, l.example.en); });
    Object.entries(LK.prompts).forEach(([k, v]) => splitAdd(`prompt.${k}`, v.am, v.en));
    Object.entries(LK.hints).forEach(([k, v]) => splitAdd(`hint.${k}`, v.am, v.en));
    return out;
    function splitAdd(base, am, en, note) {
      const parts = String(am).split(/\{(\w+)\}/);
      const pieces = parts.filter((_, i) => i % 2 === 0);
      if (pieces.length === 1) { add(`${base}.0`, am, en, note || ''); return; }
      pieces.forEach((p, i) => {
        if (PUNCT.test(p)) return;
        add(`${base}.${i}`, p.trim(), en, `part ${i + 1} of: ${am}`);
      });
    }
  };

  // ---------- playback ----------
  let queue = [], current = null, token = 0;
  N.stop = function () {
    token++; queue = [];
    if (current) { try { current.pause(); } catch (e) { /* ignore */ } current = null; }
    try { if (G.speechSynthesis) G.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  };
  N.hasAll = (keys) => keys && keys.length > 0 && keys.every((k) => N.clips[k]);
  N.playKeys = function (keys) {
    N.stop();
    const my = token;
    queue = keys.slice();
    const next = () => {
      if (my !== token || !queue.length) { current = null; return; }
      const a = new Audio(N.clips[queue.shift()]);
      current = a;
      a.onended = next; a.onerror = next;
      a.play().catch(next);
    };
    next();
  };

  // Load the list of recorded clips (fails quietly where there is no server).
  N.load = function () {
    if (typeof fetch === 'undefined' || (G.location && G.location.protocol === 'file:')) return Promise.resolve(0);
    return fetch('audio/manifest.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((m) => { (m.files || []).forEach((f) => { N.clips[f.key] = 'audio/am/' + f.file; }); return Object.keys(N.clips).length; })
      .catch(() => 0);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
