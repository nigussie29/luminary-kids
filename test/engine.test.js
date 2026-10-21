// Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/i18n.js');
require('../src/engine.js');
require('../src/art.js');
const LK = globalThis.LK;

const N = 3000; // items per skill per level
const count = (svg, re) => (svg.match(re) || []).length;

function visualFacts(item) {
  const v = item.visual;
  const s = LK.art.visual(v, 'test', false);
  return {
    s,
    objs: count(s, /data-obj="/g),
    filled: count(s, /data-filled="1"/g),
    cells: count(s, /data-cell="/g),
    crossed: count(s, /data-crossed="1"/g),
    partA: (s.match(/<g data-part="a">([\s\S]*?)<\/g><text/) || [, ''])[1]
  };
}

test('every generated item has a correct, well-formed answer and a matching picture', () => {
  for (const sk of LK.SKILLS) {
    for (let level = 1; level <= 3; level++) {
      const rng = LK.rng(1000 + level);
      for (let k = 0; k < N; k++) {
        const it = LK.generate(sk.id, level, rng);
        const v = it.visual;
        // options
        if (it.options) {
          assert.equal(new Set(it.options).size, it.options.length, `${it.id} duplicate options`);
          assert.ok(it.options.includes(it.answer), `${it.id} answer missing from options`);
          if (typeof it.answer === 'number') it.options.forEach((o) => assert.ok(o >= 0 && o <= 20, `${it.id} option ${o} out of range`));
          if (typeof it.answer === 'number' && it.type !== 'teen' && it.type !== 'compareNum') it.options.forEach((o) => assert.ok(Math.abs(o - it.answer) <= 3, `${it.id} distractor ${o} too far from ${it.answer}`));
        }
        const f = visualFacts(it);
        switch (it.type) {
          case 'count':
            assert.equal(f.objs, v.n); assert.equal(it.answer, v.n);
            assert.ok(level === 1 ? v.n <= 5 : v.n >= 6 && v.n <= 10);
            if (v.layout === 'scatter') {
              const cells = v.positions.map((p) => p.row * 5 + p.col);
              assert.equal(new Set(cells).size, cells.length, 'scatter cells overlap');
            }
            break;
          case 'teen':
            assert.equal(f.objs, it.answer); assert.equal(f.filled, it.answer); assert.equal(f.cells, 20);
            assert.ok(it.answer >= 11 && it.answer <= 19);
            break;
          case 'teenSplit':
            assert.equal(f.filled, it.vars.n); assert.equal(it.answer, it.vars.n - 10);
            break;
          case 'compare': {
            assert.notEqual(v.left, v.right);
            assert.equal(count(f.s, /data-side="left"/g), 1);
            const leftSvg = f.s.split('data-side="right"')[0];
            assert.equal(count(leftSvg, /data-obj="/g), v.left);
            assert.equal(f.objs, v.left + v.right);
            const more = v.left > v.right ? 'left' : 'right', fewer = more === 'left' ? 'right' : 'left';
            assert.equal(it.answer, it.prompt === 'compareFewer' ? fewer : more);
            break;
          }
          case 'compareNum':
            assert.equal(it.answer, Math.max(it.vars.a, it.vars.b));
            assert.equal(count(f.s, /data-mark="/g), 2);
            break;
          case 'add':
            assert.equal(f.objs, it.vars.a + it.vars.b); assert.equal(count(f.partA, /data-obj="/g), it.vars.a);
            assert.equal(it.answer, it.vars.a + it.vars.b); assert.ok(it.answer <= (level === 1 ? 5 : 10));
            break;
          case 'addLine':
          case 'subLine': {
            assert.equal(it.answer, it.vars.a + (it.type === 'addLine' ? 1 : -1) * it.vars.b);
            assert.ok(it.answer >= v.min && it.answer <= v.max, 'answer must be on the line');
            const hinted = LK.art.visual(v, 't', true);
            assert.equal(count(hinted, /data-hop="/g), it.vars.b);
            assert.equal(count(f.s, /data-n="/g), v.max - v.min + 1);
            break;
          }
          case 'sub':
            assert.equal(f.objs, it.vars.a); assert.equal(f.crossed, it.vars.b);
            assert.equal(it.answer, it.vars.a - it.vars.b); assert.ok(it.answer >= 1);
            break;
          case 'missingTen':
            assert.equal(f.filled, it.vars.a); assert.equal(it.answer + it.vars.a, 10);
            break;
          case 'addTwenty':
            assert.equal(f.filled, it.vars.a + it.vars.b); assert.ok(it.answer > 10 && it.answer <= 18);
            assert.equal(it.answer, it.vars.a + it.vars.b);
            break;
          default: assert.fail('unknown type ' + it.type);
        }
        assert.ok(LK.check(it, it.answer));
      }
    }
  }
});

test('prompts render with no leftover placeholders in both languages', () => {
  const rng = LK.rng(7);
  for (const sk of LK.SKILLS) for (let l = 1; l <= 3; l++) {
    const it = LK.generate(sk.id, l, rng);
    for (const lang of ['am', 'en']) {
      const t = it.thing ? LK.things[it.thing][lang] : ['', ''];
      const vars = Object.assign({ thing: t[0], things: t[1] }, it.vars);
      const p = LK.fill(LK.prompts[it.prompt][lang], vars);
      const h = LK.fill(LK.hints[it.hint][lang], vars);
      assert.ok(!/\{\w+\}/.test(p + h), `${lang} ${it.prompt}: ${p} / ${h}`);
    }
  }
});

test('scoring: first try no hint = 1, after hint or retry = 0.5, unsolved = 0', () => {
  assert.equal(LK.scoreAttempt({ correct: true, tries: 1, hints: 0 }), 1);
  assert.equal(LK.scoreAttempt({ correct: true, tries: 1, hints: 1 }), 0.5);
  assert.equal(LK.scoreAttempt({ correct: true, tries: 2, hints: 0 }), 0.5);
  assert.equal(LK.scoreAttempt({ correct: false, tries: 2, hints: 2 }), 0);
});

test('difficulty rises after 4 of 5 first-try answers, falls after 2 misses, mastery schedules review', () => {
  const L = LK.newLearner(); const rng = LK.rng(3); const t0 = Date.UTC(2026, 9, 21);
  const ok = { correct: true, tries: 1, hints: 0 }, bad = { correct: false, tries: 2, hints: 1 };
  for (let i = 0; i < 4; i++) LK.record(L, LK.generate('count10', L.skills.count10.level, rng), ok, t0);
  assert.equal(L.skills.count10.level, 2);
  for (let i = 0; i < 2; i++) LK.record(L, LK.generate('count10', 2, rng), bad, t0);
  assert.equal(L.skills.count10.level, 1);
  assert.ok(L.skills.count10.needsExample);
  // climb to mastery
  let guard = 0;
  while (L.skills.count10.status !== 'mastered' && guard++ < 50) LK.record(L, LK.generate('count10', L.skills.count10.level, rng), ok, t0);
  assert.equal(L.skills.count10.status, 'mastered');
  assert.ok(L.skills.count10.badge);
  assert.equal(L.skills.count10.reviewDue, t0 + 864e5);
  // review pass pushes to 3 days, fail drops back to learning
  const day1 = t0 + 864e5;
  assert.deepEqual(LK.recommend(Object.assign(L, { diagnosticDone: true }), day1), { kind: 'review', skill: 'count10' });
  LK.record(L, LK.generate('count10', 3, rng), ok, day1, 'review');
  assert.equal(L.skills.count10.reviewDue, day1 + 3 * 864e5);
  LK.record(L, LK.generate('count10', 3, rng), bad, day1 + 3 * 864e5, 'review');
  assert.equal(L.skills.count10.status, 'learning');
});

test('recommendations follow the prerequisite map', () => {
  const L = LK.newLearner();
  assert.equal(LK.recommend(L).kind, 'diagnostic');
  L.diagnosticDone = true;
  assert.deepEqual(LK.recommend(L), { kind: 'lesson', skill: 'count10' });
  L.skills.count10.status = 'mastered';
  assert.deepEqual(LK.recommend(L, 0), { kind: 'lesson', skill: 'teens' });
  L.skills.teens.status = 'mastered'; L.skills.compare.status = 'mastered';
  assert.deepEqual(LK.recommend(L, 0), { kind: 'lesson', skill: 'add10' });
  // sub10 needs add10; make10 needs teens + add10
  assert.equal(LK.prereqsMet(L, 'sub10'), false);
  assert.equal(LK.prereqsMet(L, 'make10'), false);
});

test('diagnostic places each skill by first-try result', () => {
  const L = LK.newLearner(); const items = LK.diagnosticItems(LK.rng(9));
  assert.equal(items.length, 6);
  LK.applyDiagnostic(L, items.map((item, i) => ({ item, result: i % 2 ? { correct: true, tries: 1, hints: 0 } : { correct: false, tries: 2, hints: 1 } })));
  assert.equal(L.skills.count10.level, 1);
  assert.equal(L.skills.teens.level, 3);
  assert.ok(L.diagnosticDone);
});

test('build game and character art render', () => {
  const rng = LK.rng(5);
  for (let i = 0; i < 500; i++) { const b = LK.buildItem(rng); assert.ok(b.answer >= 3 && b.answer <= 10); }
  const bf = LK.art.buildframe({}, 'x');
  assert.equal(count(bf, /data-filled="0"/g), 10);
  for (const p of ['welcome', 'think', 'explain', 'encourage', 'celebrate']) assert.match(LK.art.wali(p), /^<svg[\s\S]*<\/svg>$/);
  for (const s of LK.art.sceneIds) assert.match(LK.art.scene(s, s), /aria-label/);
  for (const k of LK.art.kidIds) assert.match(LK.art.kid(k), /clip-path/);
});
