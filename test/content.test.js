// node --test test/content.test.js — checks every lesson file against the lesson-design rules
// and proves every answer is right (equations balance, coins can pay the price, balloons can make the target…).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs'), path = require('path');

const DIR = path.join(__dirname, '..', 'content');
const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const lessons = index.lessons.map((l) => JSON.parse(fs.readFileSync(path.join(DIR, 'lessons', `${l.id}.json`), 'utf8')));
const DRAG = new Set(['drag_drop_count', 'drag_equation', 'drag_sort', 'drag_numberline', 'drag_placevalue', 'drag_match_word', 'drag_make_change', 'drag_fraction']);
const VIDEO = !process.env.SKIP_VIDEO; // SKIP_VIDEO=1 checks content before the videos are rendered
const OTHER = new Set(['tap_choose', 'tap_count', 'numpad', 'clock', 'trace', 'listen_choose', 'true_false', 'speak']);

// evaluate "a op b op c" left to right (child-level arithmetic: + − × ÷)
function evalSide(tokens) {
  let v = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], n = Number(tokens[i + 1]);
    v = op === '+' ? v + n : op === '−' ? v - n : op === '×' ? v * n : op === '÷' ? v / n : NaN;
  }
  return v;
}
function subsetSums(values) {
  let sums = new Set([0]);
  for (const v of values) sums = new Set([...sums, ...[...sums].map((s) => s + v)]);
  return sums;
}

function checkExercise(e, where) {
  const at = `${where} ${e.id} (${e.type})`;
  assert.ok(DRAG.has(e.type) || OTHER.has(e.type), `${at}: unknown type`);
  for (const k of ['prompt_am', 'prompt_en', 'audio_url']) assert.ok(e[k], `${at}: missing ${k}`);
  assert.ok(Array.isArray(e.hints), `${at}: hints`);
  e.hints.forEach((h) => assert.ok(h.am && h.en && h.audio_url, `${at}: hint text/audio`));
  const opts = (e.options || []).map((o) => o.v);
  switch (e.type) {
    case 'drag_equation': {
      const parts = e.equation.map((p) => (p === '__' ? e.answer : p));
      const sign = parts.findIndex((p) => ['=', '<', '>'].includes(p) && p !== undefined);
      assert.ok(sign > 0, `${at}: no = < or >`);
      const l = evalSide(parts.slice(0, sign)), r = evalSide(parts.slice(sign + 1)), op = parts[sign];
      assert.ok(op === '=' ? l === r : op === '<' ? l < r : l > r, `${at}: ${parts.join(' ')} is not true`);
      assert.ok(e.items.includes(e.answer), `${at}: answer tile missing`);
      assert.strictEqual(new Set(e.items).size, e.items.length, `${at}: duplicate tiles`);
      break;
    }
    case 'drag_drop_count': {
      const needs = Array.isArray(e.answer) ? e.answer : [e.answer];
      assert.deepStrictEqual(needs, e.targets.map((t) => t.need), `${at}: answer ≠ target needs`);
      if (e.items.mode === 'remove') {
        e.targets.forEach((t) => assert.ok(t.start > t.need, `${at}: nothing to remove`));
      } else {
        const toAdd = e.targets.reduce((s, t) => s + (t.need - t.start), 0);
        e.targets.forEach((t) => assert.ok(t.need > t.start, `${at}: nothing to add`));
        assert.ok(e.items.supply >= toAdd, `${at}: supply ${e.items.supply} < ${toAdd}`);
        assert.ok(toAdd <= 12, `${at}: ${toAdd} drags is too many for a child`);
      }
      break;
    }
    case 'drag_sort':
      e.items.forEach((it) => assert.ok(e.targets.some((t) => t.id === e.answer[it.id]), `${at}: ${it.id} has no bin`));
      assert.ok(new Set(Object.values(e.answer)).size === e.targets.length, `${at}: a bin is never used`);
      e.items.forEach((it) => assert.ok(it.label || it.visual, `${at}: card ${it.id} is blank`));
      break;
    case 'drag_numberline': {
      const { min, max, step } = e.line;
      e.items.forEach((v) => { const n = Number(v); assert.ok(n >= min && n <= max && (n - min) % step === 0, `${at}: ${v} not on the line`); });
      if (e.line.object) assert.deepStrictEqual(e.items, [String(e.line.object.length)], `${at}: the flag must go where the object ends`);
      if (e.item_labels) assert.strictEqual(e.item_labels.length, e.items.length, `${at}: one label per tile`);
      assert.ok((max - min) / step <= 20, `${at}: too many ticks`);
      break;
    }
    case 'drag_placevalue': {
      assert.ok(e.answer >= 1 && e.answer <= 999, `${at}: out of range`);
      const t = e.targets[0].tens, hu = e.targets[0].hundreds;
      const H = hu != null ? hu : Math.floor(e.answer / 100);
      if (t !== undefined && t !== null) { const o = e.answer - 100 * H - 10 * t; assert.ok(o >= 10 && o <= 19, `${at}: ${o} ones is not "break one ten"`); }
      if (hu !== undefined && hu !== null) { const r = e.answer - 100 * hu; assert.ok(r >= 100 && r <= 199, `${at}: ${r} is not "break one hundred"`); }
      if (e.answer >= 100) assert.ok(e.items.flats, `${at}: needs hundreds flats`);
      break;
    }
    case 'drag_match_word':
      assert.strictEqual(e.items.length, e.targets.length, `${at}: cards ≠ slots`);
      e.items.forEach((it) => assert.ok(e.targets.some((t) => t.id === e.answer[it.id]), `${at}: ${it.id} unmatched`));
      e.targets.forEach((t) => assert.ok(t.label || t.visual, `${at}: empty slot`));
      break;
    case 'drag_make_change':
      assert.ok(subsetSums(e.items).has(e.price), `${at}: wallet ${e.items} cannot pay ${e.price}`);
      assert.ok(e.items.reduce((a, b) => a + b, 0) > e.price, `${at}: wallet must hold more than the price`);
      break;
    case 'drag_fraction': {
      const P = e.parts || 4;
      const sizes = e.items.flatMap((p) => Array(p.count).fill(p.piece === 'half' ? P / 2 : 1));
      const need = e.answer - (e.targets[0].start || 0);
      assert.ok(need > 0 && e.answer <= P && subsetSums(sizes).has(need), `${at}: pieces cannot make ${e.answer}/${P}`);
      break;
    }
    case 'tap_choose': case 'listen_choose':
      assert.ok(opts.includes(e.answer), `${at}: answer not an option`);
      assert.strictEqual(new Set(opts).size, opts.length, `${at}: duplicate options`);
      if (e.type === 'listen_choose') assert.ok(e.say && e.say.audio_url, `${at}: nothing to hear`);
      break;
    case 'tap_count':
      assert.ok(opts.includes(e.answer) && e.items.n === e.answer, `${at}: count mismatch`);
      break;
    case 'numpad':
      assert.ok(Number.isInteger(e.answer) && e.answer >= 0, `${at}: answer`);
      if (e.visual && e.visual.kind === 'birr') assert.strictEqual(e.visual.notes.reduce((a, b) => a + b, 0), e.answer, `${at}: money total`);
      if (e.visual && e.visual.kind === 'group') assert.strictEqual(e.visual.n, e.answer, `${at}: picture count`);
      break;
    case 'true_false':
      assert.strictEqual(typeof e.answer, 'boolean', `${at}: answer`);
      break;
    case 'clock':
      assert.ok(e.answer.h >= 1 && e.answer.h <= 12 && Number.isInteger(e.answer.m) && e.answer.m >= 0 && e.answer.m < 60 && e.answer.m % (e.step || 5) === 0, `${at}: time`);
      break;
    case 'trace':
      assert.ok(e.text && e.text.length <= 4, `${at}: text`);
      break;
    case 'speak':
      assert.ok(e.optional, `${at}: speaking must be optional`);
      break;
    default:
  }
  // pictures must agree with the numbers in tens/ones questions
  const vis = e.visual;
  if (vis && vis.kind === 'tens_ones' && ['tap_choose', 'numpad'].includes(e.type) && typeof e.answer === 'number' && !/how many (ones|tens)/i.test(e.prompt_en)) {
    assert.strictEqual((vis.hundreds || 0) * 100 + vis.tens * 10 + vis.ones, e.answer, `${at}: place-value picture ≠ answer`);
  }
  if (vis && vis.kind === 'array' && ['tap_choose', 'numpad'].includes(e.type) && typeof e.answer === 'number') {
    assert.strictEqual(vis.rows * vis.cols, e.answer, `${at}: array picture ≠ answer`);
  }
}

function checkGame(p, where) {
  const at = `${where} game ${p.game}`;
  assert.ok(p.intro && p.intro.audio_url, `${at}: intro`);
  if (p.game === 'balloon') p.rounds.forEach((r) => {
    const ok = r.balloons.some((a, i) => r.balloons.some((b, j) => i < j && a + b === r.target));
    assert.ok(ok, `${at}: no pair makes ${r.target}`);
  });
  if (p.game === 'market') p.rounds.forEach((r) => assert.ok(subsetSums(r.goods.map((g) => g.price)).has(r.budget), `${at}: cannot spend exactly ${r.budget}`));
  if (p.game === 'coffee') p.rounds.forEach((r) => { assert.ok(r.n >= 2 && r.n <= (r.trays ? 15 : 12), `${at}: ${r.n} cups`); if (r.trays) assert.strictEqual(r.trays.reduce((a, b) => a + b, 0), r.n, `${at}: trays ≠ n`); });
  if (p.game === 'memory') assert.ok(p.pairs.length >= 3, `${at}: pairs`);
  if (p.game === 'race') p.questions.forEach((q) => checkExercise(q, at));
  return p.game === 'race' ? p.questions.length : p.game === 'memory' ? p.pairs.length : p.rounds.length;
}

test('index lists 27 lessons (6 + 6 + 15) in order with places on the map', () => {
  assert.strictEqual(lessons.length, 27);
  assert.strictEqual(new Set(index.lessons.map((l) => `${l.grade}-${l.n}`)).size, 27);
  const seq = (n) => Array.from({ length: n }, (_, i) => i + 1);
  for (const [g, n] of [[1, 6], [2, 6], [3, 15]]) assert.deepStrictEqual(index.lessons.filter((l) => l.grade === g).map((l) => l.n), seq(n), `grade ${g}`);
  for (const k of ['replay', 'praise', 'tryAgain', 'celebrate']) assert.ok(index.common[k], k);
  assert.strictEqual(index.common.replay.am, 'ደግመህ/ደግመሽ አዳምጥ');
});

for (const L of lessons) {
  test(`${L.id}: lesson design rules`, () => {
    // 1 hook video with 2 checkpoints and a re-teach clip
    assert.ok(L.video.src && L.video.captions.am && L.video.captions.en);
    assert.strictEqual(L.video.checkpoints.length, 2, 'two video checkpoints');
    L.video.checkpoints.forEach((c) => { if (VIDEO) assert.ok(c.t !== null, `checkpoint ${c.at} has no time (render the video)`); checkExercise(c.exercise, L.id + ' checkpoint'); });
    if (VIDEO) {
      assert.ok(L.video.checkpoints[0].t < L.video.checkpoints[1].t, 'checkpoints in order');
      assert.ok(L.video.duration > 20 && L.video.duration <= 60, `video length ${L.video.duration}s`);
      assert.ok(L.video.reteach.start !== null && L.video.reteach.end > L.video.reteach.start, 're-teach clip');
    }
    // guided 4–6 slots with three levels; challenge 5
    assert.ok(L.guided.length >= 4 && L.guided.length <= 6, 'guided slots');
    L.guided.forEach((s) => { assert.strictEqual(s.levels.length, 3, `slot ${s.slot} levels`); s.levels.forEach((e) => checkExercise(e, `${L.id} guided ${s.slot}`)); });
    assert.strictEqual(L.challenge.length, 5, 'five challenge questions');
    L.challenge.forEach((e) => checkExercise(e, `${L.id} challenge`));
    (L.extra || []).forEach((e) => checkExercise(e, `${L.id} extra`));
    const gameN = checkGame(L.play, L.id);
    // counts on every level path (a slot keeps its type across levels)
    for (let lvl = 0; lvl < 3; lvl++) {
      const path = [...L.guided.map((s) => s.levels[lvl]), ...L.challenge];
      const drags = path.filter((e) => DRAG.has(e.type)).length;
      const others = new Set([...path, ...L.video.checkpoints.map((c) => c.exercise)].filter((e) => OTHER.has(e.type)).map((e) => e.type));
      assert.ok(drags >= 6, `level ${lvl + 1}: ${drags} drag-and-drop exercises (need 6)`);
      assert.ok(others.size >= 4, `level ${lvl + 1}: ${others.size} other exercise types (need 4)`);
      const interactions = 2 + L.guided.length + gameN + 5;
      assert.ok(interactions >= 15 && interactions <= 25, `${interactions} interactions`);
    }
    L.guided.forEach((s) => assert.strictEqual(new Set(s.levels.map((e) => e.type)).size, 1, `slot ${s.slot} changes type between levels`));
  });
}

test('every audio file named in the lessons is in a recording script', () => {
  const ROOT = path.join(__dirname, '..');
  const scripts = ['narration-script.csv', 'narration-script-videos.csv', 'narration-script-exercises.csv']
    .map((f) => fs.readFileSync(path.join(ROOT, 'dist', f), 'utf8')).join('\n');
  const keys = new Set([...scripts.matchAll(/"([^"]+)\.m4a"/g)].map((m) => m[1]));
  const urls = new Set();
  const walk = (o) => { if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) { if (k === 'audio_url' && v) urls.add(v); else walk(v); } } };
  lessons.forEach(walk); walk(index);
  const missing = [...urls].map((u) => path.basename(u).replace(/\.mp3$/, '')).filter((k) => !keys.has(k));
  assert.deepStrictEqual(missing, []);
});
