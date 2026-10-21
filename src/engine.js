/* Luminary Kids — learning engine (pure functions, no DOM).
   Item generation, scoring, difficulty, mastery, spaced review, recommendations.
   All rules are programmed and deterministic given a seed, so they can be tested. */
(function (G) {
  const LK = (G.LK = G.LK || {});

  // ---------- seeded random ----------
  LK.rng = function (seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)); // inclusive
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.shuffle = (arr) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    };
    return next;
  };

  // ---------- skill map ----------
  LK.SKILLS = [
    { id: 'count10', prereq: [], levels: 3 },
    { id: 'teens', prereq: ['count10'], levels: 3 },
    { id: 'compare', prereq: ['count10'], levels: 3 },
    { id: 'add10', prereq: ['count10'], levels: 3 },
    { id: 'sub10', prereq: ['add10'], levels: 3 },
    { id: 'make10', prereq: ['teens', 'add10'], levels: 3 }
  ];
  LK.skill = (id) => LK.SKILLS.find((s) => s.id === id);

  // Numeric answer options: the answer plus three near distractors, unique, within [0, 20].
  LK.numberOptions = function (answer, rng, lo = 0, hi = 20, tens = false) {
    const set = new Set([answer]);
    const near = [answer - 1, answer + 1, answer - 2, answer + 2, answer + 3, answer - 3];
    // ±10 distractors only where tens-and-ones confusion is the point (teen numbers).
    const cands = tens ? [answer - 10, answer + 10].filter((c) => c >= lo && c <= hi).slice(0, 1).concat(rng.shuffle(near)) : rng.shuffle(near);
    for (const c of cands) {
      if (set.size >= 4) break;
      if (c >= lo && c <= hi) set.add(c);
    }
    let k = 0;
    while (set.size < 4) { if (!set.has(k)) set.add(k); k++; }
    return rng.shuffle([...set]);
  };

  // Scatter positions on a coarse grid with no two in the same cell → never overlap.
  function scatter(n, rng) {
    const cells = rng.shuffle(Array.from({ length: 20 }, (_, i) => i)).slice(0, n);
    return cells.map((c) => ({ col: c % 5, row: Math.floor(c / 5), jx: rng.int(-6, 6), jy: rng.int(-6, 6) }));
  }

  // ---------- item generators: (level, rng) -> item ----------
  const GEN = {
    count10(level, rng) {
      const n = level === 1 ? rng.int(1, 5) : rng.int(6, 10);
      const thing = rng.pick(['flower', 'orange', 'chicken']);
      const layout = level === 3 ? 'scatter' : 'rows';
      return {
        type: 'count', input: 'choose', prompt: 'count', hint: 'count', thing,
        visual: { kind: 'group', thing, n, layout, positions: layout === 'scatter' ? scatter(n, rng) : null, tappable: true },
        answer: n, options: LK.numberOptions(n, rng, 0, 12)
      };
    },
    teens(level, rng) {
      if (level === 3) {
        const n = rng.int(11, 19);
        return {
          type: 'teenSplit', input: 'choose', prompt: 'teenSplit', hint: 'teenSplit', thing: 'orange', vars: { n },
          visual: { kind: 'tenframes', filled: n, thing: 'orange' }, answer: n - 10, options: LK.numberOptions(n - 10, rng, 0, 10)
        };
      }
      const n = level === 1 ? rng.int(11, 15) : rng.int(11, 19);
      return {
        type: 'teen', input: 'choose', prompt: 'teen', hint: 'teen', thing: 'orange',
        visual: { kind: 'tenframes', filled: n, thing: 'orange' }, answer: n, options: LK.numberOptions(n, rng, 0, 20, true)
      };
    },
    compare(level, rng) {
      if (level === 3) {
        let a = rng.int(2, 20), b = rng.int(2, 20);
        while (a === b) b = rng.int(2, 20);
        return {
          type: 'compareNum', input: 'choose', prompt: 'compareNum', hint: 'compareNum', vars: { a, b },
          visual: { kind: 'numberline', min: 0, max: 20, marks: [a, b] }, answer: Math.max(a, b), options: [a, b]
        };
      }
      const gap = level === 1 ? rng.int(3, 5) : rng.int(1, 2);
      const small = rng.int(1, 10 - gap), big = small + gap;
      const bigLeft = rng() < 0.5;
      const askFewer = level === 2 && rng() < 0.5;
      const left = bigLeft ? big : small, right = bigLeft ? small : big;
      const answer = askFewer ? (bigLeft ? 'right' : 'left') : (bigLeft ? 'left' : 'right');
      return {
        type: 'compare', input: 'pick', prompt: askFewer ? 'compareFewer' : 'compareMore', hint: 'compare', thing: 'cup',
        visual: { kind: 'compare', thing: 'cup', left, right }, answer, options: ['left', 'right']
      };
    },
    add10(level, rng) {
      const max = level === 1 ? 5 : 10;
      const a = rng.int(1, max - 1), b = rng.int(1, max - a);
      if (level === 3) {
        return {
          type: 'addLine', input: 'line', prompt: 'addLine', hint: 'add', vars: { a, b },
          visual: { kind: 'numberline', min: 0, max: 10, start: a, hops: b, dir: 1, showHops: false }, answer: a + b, options: null
        };
      }
      return {
        type: 'add', input: 'choose', prompt: 'add', hint: 'add', thing: 'child', vars: { a, b },
        visual: { kind: 'join', thing: 'child', a, b }, answer: a + b, options: LK.numberOptions(a + b, rng, 0, 12)
      };
    },
    sub10(level, rng) {
      const max = level === 1 ? 5 : 10;
      const a = rng.int(2, max), b = rng.int(1, a - 1);
      if (level === 3) {
        return {
          type: 'subLine', input: 'line', prompt: 'subLine', hint: 'subLine', vars: { a, b },
          visual: { kind: 'numberline', min: 0, max: 10, start: a, hops: b, dir: -1, showHops: false }, answer: a - b, options: null
        };
      }
      return {
        type: 'sub', input: 'choose', prompt: 'sub', hint: 'sub', thing: 'mango', vars: { a, b },
        visual: { kind: 'takeaway', thing: 'mango', a, b }, answer: a - b, options: LK.numberOptions(a - b, rng, 0, 10)
      };
    },
    make10(level, rng) {
      if (level === 1) {
        const a = rng.int(1, 9);
        return {
          type: 'missingTen', input: 'choose', prompt: 'missingTen', hint: 'missingTen', vars: { a },
          visual: { kind: 'tenframe', filled: a }, answer: 10 - a, options: LK.numberOptions(10 - a, rng, 0, 10)
        };
      }
      const a = level === 2 ? rng.pick([8, 9]) : rng.int(6, 9);
      const b = rng.int(11 - a, 9);
      return {
        type: 'addTwenty', input: 'choose', prompt: 'addTwenty', hint: 'addTwenty', vars: { a, b },
        visual: { kind: 'maketen', a, b }, answer: a + b, options: LK.numberOptions(a + b, rng, 0, 20)
      };
    }
  };

  // Game round: build a number on a ten frame by tapping cells (answer = number of filled cells).
  LK.buildItem = function (rng, max = 10) {
    const n = rng.int(3, max);
    return { type: 'build', input: 'build', prompt: 'build', hint: 'build', vars: { n }, visual: { kind: 'buildframe', cells: 10 }, answer: n, options: null };
  };

  let uid = 0;
  LK.generate = function (skillId, level, rng) {
    const g = GEN[skillId];
    if (!g) throw new Error('Unknown skill ' + skillId);
    const item = g(Math.min(3, Math.max(1, level)), rng);
    item.skill = skillId;
    item.level = level;
    item.id = skillId + '-' + level + '-' + (++uid);
    return item;
  };

  LK.check = function (item, response) {
    if (item.input === 'pick') return response === item.answer;
    return Number(response) === item.answer;
  };

  // ---------- learner model ----------
  const DAY = 864e5;
  LK.REVIEW_DAYS = [1, 3, 7, 14, 30];

  LK.newLearner = function () {
    const skills = {};
    for (const s of LK.SKILLS) skills[s.id] = { level: 1, status: 'new', history: [], reviewStep: 0, reviewDue: null, masteredAt: null, needsExample: false, badge: false };
    return { version: 1, created: Date.now(), diagnosticDone: false, stars: 0, sessions: [], skills };
  };

  // Score one finished item: 1 = right first try without a hint, 0.5 = right after a hint or a retry, 0 = not solved.
  LK.scoreAttempt = function ({ correct, tries, hints }) {
    if (!correct) return 0;
    return tries === 1 && hints === 0 ? 1 : 0.5;
  };

  // Record a finished item and apply difficulty, mastery and review rules. Returns events for the UI.
  LK.record = function (learner, item, result, now = Date.now(), mode = 'practice') {
    const sk = learner.skills[item.skill];
    const score = LK.scoreAttempt(result);
    const events = [];
    sk.history.push({ t: now, level: item.level, score, tries: result.tries, hints: result.hints, mode });
    if (result.correct) learner.stars += 1;

    if (mode === 'review') {
      if (score === 1) {
        sk.reviewStep = Math.min(sk.reviewStep + 1, LK.REVIEW_DAYS.length - 1);
        sk.reviewDue = now + LK.REVIEW_DAYS[sk.reviewStep] * DAY;
        events.push('review-pass');
      } else {
        sk.status = 'learning';
        sk.level = Math.max(1, sk.level - 1);
        sk.reviewStep = 0;
        sk.reviewDue = null;
        events.push('review-fail');
      }
      return { score, events };
    }

    if (sk.status === 'new') sk.status = 'learning';
    const atLevel = sk.history.filter((h) => h.level === sk.level && h.mode !== 'review').slice(-5);
    const firstTry = atLevel.filter((h) => h.score === 1).length;
    const lastTwo = atLevel.slice(-2);

    if (atLevel.length >= 4 && firstTry >= 4) {
      if (sk.level < 3) {
        sk.level += 1;
        events.push('level-up');
      } else if (sk.status !== 'mastered') {
        sk.status = 'mastered';
        sk.masteredAt = now;
        sk.reviewStep = 0;
        sk.reviewDue = now + LK.REVIEW_DAYS[0] * DAY;
        if (!sk.badge) { sk.badge = true; events.push('badge'); }
        events.push('mastered');
      }
    } else if (lastTwo.length === 2 && lastTwo.every((h) => h.score === 0)) {
      if (sk.level > 1) { sk.level -= 1; events.push('level-down'); }
      sk.needsExample = true;
      events.push('show-example');
    }
    return { score, events };
  };

  // Diagnostic: one item per skill at level 2. Right first try → start at level 3; otherwise level 1.
  LK.diagnosticItems = function (rng) {
    return LK.SKILLS.map((s) => LK.generate(s.id, 2, rng));
  };
  LK.applyDiagnostic = function (learner, results, now = Date.now()) {
    for (const { item, result } of results) {
      const sk = learner.skills[item.skill];
      const score = LK.scoreAttempt(result);
      sk.history.push({ t: now, level: item.level, score, tries: result.tries, hints: result.hints, mode: 'diagnostic' });
      sk.level = score === 1 ? 3 : score === 0.5 ? 2 : 1;
      sk.diagnosed = score;
    }
    learner.diagnosticDone = true;
  };

  LK.prereqsMet = function (learner, id) {
    return LK.skill(id).prereq.every((p) => {
      const s = learner.skills[p];
      return s.status === 'mastered' || s.level >= 2;
    });
  };

  // Next activity: diagnostic → due review → first unmastered skill whose prerequisites are met → weakest review.
  LK.recommend = function (learner, now = Date.now()) {
    if (!learner.diagnosticDone) return { kind: 'diagnostic' };
    const due = LK.SKILLS.filter((s) => {
      const sk = learner.skills[s.id];
      return sk.status === 'mastered' && sk.reviewDue && sk.reviewDue <= now;
    }).sort((x, y) => learner.skills[x.id].reviewDue - learner.skills[y.id].reviewDue);
    if (due.length) return { kind: 'review', skill: due[0].id };
    const open = LK.SKILLS.find((s) => learner.skills[s.id].status !== 'mastered' && LK.prereqsMet(learner, s.id));
    if (open) return { kind: 'lesson', skill: open.id };
    const any = LK.SKILLS.find((s) => learner.skills[s.id].status !== 'mastered');
    if (any) return { kind: 'lesson', skill: any.id };
    const weakest = LK.SKILLS.map((s) => ({ id: s.id, acc: LK.accuracy(learner.skills[s.id]) })).sort((x, y) => x.acc - y.acc)[0];
    return { kind: 'complete', skill: weakest.id };
  };

  LK.accuracy = function (sk, last = 10) {
    const h = sk.history.filter((x) => x.mode !== 'diagnostic').slice(-last);
    if (!h.length) return null;
    return h.reduce((a, x) => a + x.score, 0) / h.length;
  };

  // Parent report numbers per skill.
  LK.report = function (learner, now = Date.now()) {
    return LK.SKILLS.map((s) => {
      const sk = learner.skills[s.id];
      const h = sk.history.filter((x) => x.mode !== 'diagnostic');
      return {
        id: s.id, status: sk.status, level: sk.level, attempts: h.length,
        firstTry: h.filter((x) => x.score === 1).length,
        hints: h.reduce((a, x) => a + (x.hints || 0), 0),
        accuracy: LK.accuracy(sk),
        reviewDue: sk.reviewDue, dueNow: !!(sk.reviewDue && sk.reviewDue <= now)
      };
    });
  };

  // Practice set for a lesson: mostly the current level, one item from the level below for confidence.
  LK.practiceSet = function (learner, skillId, rng, size = 6) {
    const lvl = learner.skills[skillId].level;
    return Array.from({ length: size }, (_, i) => LK.generate(skillId, i === 0 && lvl > 1 ? lvl - 1 : lvl, rng));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
