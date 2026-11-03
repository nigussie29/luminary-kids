/* Luminary Kids — mini-games. LK.games.mount(host, play, ctx) runs the game named in play.game
   with the rounds stored in the lesson file, and calls ctx.done({ rounds, firstTry }) at the end.
   Timers are optional (ctx.timer, off by default) and never end a game: when time runs out the
   round is simply shown and the game moves on. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const GAMES = (LK.games = {});
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = () => document.documentElement.classList.contains('reduce');
  const sfx = (k, n) => LK.sfx && LK.sfx[k] && LK.sfx[k](n);

  const TITLES = {
    coffee: ['የቡና ሥነ ሥርዓት', 'Coffee ceremony'], market: ['ወደ ገበያ', 'Market run'], balloon: ['ፊኛ ፍንዳታ', 'Balloon pop'],
    race: ['ወደ አያቴ ቤት', "Race to Grandma's"], memory: ['ትውስታ', 'Memory match']
  };

  GAMES.mount = function (host, play, ctx) {
    const T = LK.act.T.bind(null, ctx);
    const title = TITLES[play.game] || ['ጨዋታ', 'Game'];
    host.innerHTML = '';
    const shell = h(`<section class="game game-${play.game}">
      <div class="g-head"><span class="eyebrow">🎲 ${T('ጨዋታ', 'Game')}</span><h2 tabindex="-1">${T(title[0], title[1])}</h2>
        <button type="button" class="spk" aria-label="Listen">🔊</button></div>
      <p class="g-intro">${T(play.intro.am, play.intro.en)}</p>
      <div class="g-bar" hidden><i></i></div>
      <div class="g-body"></div><div class="g-msg" role="status"></div><div class="g-foot"></div></section>`);
    host.appendChild(shell);
    const body = shell.querySelector('.g-body'), msg = shell.querySelector('.g-msg'), foot = shell.querySelector('.g-foot'), bar = shell.querySelector('.g-bar');
    shell.querySelector('.spk').addEventListener('click', () => ctx.say(play.intro));
    setTimeout(() => ctx.say(play.intro), 250);
    const stats = { rounds: 0, firstTry: 0 };
    let timerId = null;
    const api = {
      T, body, foot, ctx, play,
      msg(line, cls) { msg.className = 'g-msg ' + (cls || ''); msg.innerHTML = line ? T(line.am, line.en) : ''; },
      say: (l) => ctx.say(l),
      sayNum: (n) => ctx.say({ am: String(n), en: String(n), audio_url: `audio/am/num.${n}.mp3` }),
      roundDone(first) { stats.rounds++; if (first) stats.firstTry++; stopTimer(); },
      praise() { const p = ctx.common.praise[Math.floor(Math.random() * ctx.common.praise.length)]; api.msg(p, 'ok'); ctx.say(p); sfx('correct'); LK.act.burst(body); },
      oops(line) { sfx('retry'); api.msg(line || ctx.common.tryAgain, 'hint'); ctx.say(line || ctx.common.tryAgain); },
      startTimer(sec, onOut) {
        stopTimer(); if (!ctx.timer) return;
        bar.hidden = false; const i = bar.querySelector('i'); const t0 = Date.now();
        timerId = setInterval(() => { const f = 1 - (Date.now() - t0) / (sec * 1000); i.style.width = Math.max(0, f * 100) + '%'; if (f <= 0) { stopTimer(); onOut(); } }, 100);
      },
      end() { stopTimer(); ctx.done(stats); }
    };
    function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
    const run = RUN[play.game];
    const inst = run(api);
    shell._solve = () => inst && inst.solve && inst.solve();
    return { el: shell };
  };

  const nextBtn = (api, label, fn) => {
    api.foot.innerHTML = '';
    const b = h(`<button type="button" class="btn adey">${api.T(label[0], label[1])} →</button>`);
    b.addEventListener('click', () => { api.foot.innerHTML = ''; fn(); });
    api.foot.appendChild(b); b.focus();
  };

  const RUN = {};

  // ---- Coffee ceremony: pour exactly N cups (on trays: the same number on every tray) ----
  RUN.coffee = (api) => {
    const rounds = api.play.rounds; let r = 0, tries = 0;
    function round() {
      const R = rounds[r]; tries = 0; api.msg(null);
      const trays = R.trays || [R.n + 2];
      const each = R.trays ? R.n / R.trays.length : null;
      api.body.innerHTML = `<div class="target-n"><span class="big" dir="ltr">${R.n}</span> ${api.T(`${LK.numWords.am[R.n] || ''} ስኒ ቡና`, `${R.n} cups of coffee`)}</div>
        <div class="jebena" aria-hidden="true">🫖</div>
        <div class="trays">${trays.map((k, ti) => `<div class="g-tray" data-t="${ti}">${Array.from({ length: R.trays ? k + 1 : k }, (_, i) => `<button type="button" class="g-cup" aria-label="cup" data-t="${ti}">${LK.act.objSVG('cup', i, 50)}</button>`).join('')}</div>`).join('')}</div>`;
      api.sayNum(R.n);
      let filled = 0;
      api.body.querySelectorAll('.g-cup').forEach((c) => c.addEventListener('click', () => {
        if (c.classList.contains('full')) { c.classList.remove('full'); filled--; sfx('tap'); return; }
        c.classList.add('full', 'pour'); filled++; sfx('count', Math.min(10, filled)); setTimeout(() => c.classList.remove('pour'), 500);
      }));
      nextBtn(api, ['እናቅርብ ✓', 'Serve ✓'], check);
      api.startTimer(30, () => { api.roundDone(false); demo().then(advance); });
      function check() {
        const per = [...api.body.querySelectorAll('.g-tray')].map((t) => t.querySelectorAll('.g-cup.full').length);
        const ok = filled === R.n && (!each || per.every((k) => k === each));
        if (ok) { api.roundDone(tries === 0); api.praise(); setTimeout(advance, 1300); return; }
        tries++;
        api.oops(filled > R.n ? { am: 'በጣም ብዙ ስኒዎች ሞልተናል። አንዱን እንመልስ።', en: 'Too many cups are full. Empty one.' }
          : filled < R.n ? { am: 'ገና ጥቂት ስኒዎች ይቀራሉ።', en: 'A few more cups to fill.' }
            : { am: 'እያንዳንዱ ትሪ እኩል ስኒዎች ይኑሩት።', en: 'Every tray needs the same number of cups.' });
        nextBtn(api, ['እናቅርብ ✓', 'Serve ✓'], check);
      }
      async function demo() {
        api.body.querySelectorAll('.g-cup.full').forEach((c) => c.classList.remove('full'));
        const trayEls = [...api.body.querySelectorAll('.g-tray')];
        for (const t of trayEls) { const cups = [...t.querySelectorAll('.g-cup')].slice(0, each || R.n); for (const c of cups) { c.classList.add('full'); await wait(reduce() ? 0 : 150); } }
        filled = api.body.querySelectorAll('.g-cup.full').length;
      }
      round.demo = demo;
    }
    function advance() { r++; if (r < rounds.length) round(); else api.end(); }
    round();
    return { solve: () => { if (!api.foot.querySelector('button')) return; round.demo().then(() => { const b = api.foot.querySelector('button'); if (b) b.click(); }); } };
  };

  // ---- Market run: spend exactly the budget ----
  RUN.market = (api) => {
    const PICS = { bread: '🍞', banana: '🍌', egg: '🥚', pen: '🖊️', book: '📒', bag: '🎒', shoes: '👟' };
    const rounds = api.play.rounds; let r = 0, tries = 0;
    function round() {
      const R = rounds[r]; tries = 0; api.msg(null);
      api.body.innerHTML = `<div class="budget">${api.T('ያለን ብር፦', 'We have:')} <b dir="ltr">${R.budget}</b> <span lang="am">ብር</span></div>
        <div class="goods">${R.goods.map((g, i) => `<button type="button" class="good" data-i="${i}" aria-pressed="false"><span class="pic" aria-hidden="true">${PICS[g.pic] || '🛍️'}</span>${api.T(g.am, g.en)}<span class="price" dir="ltr">${g.price} ብር</span></button>`).join('')}</div>
        <div class="cart">${api.T('ቅርጫት፦', 'Basket:')} <b dir="ltr" class="sum">0</b> / <span dir="ltr">${R.budget}</span></div>`;
      api.sayNum(R.budget);
      let sum = 0;
      api.body.querySelectorAll('.good').forEach((b) => b.addEventListener('click', () => {
        const g = R.goods[b.dataset.i], on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on)); sum += on ? g.price : -g.price; sfx('tap');
        api.body.querySelector('.sum').textContent = sum;
      }));
      nextBtn(api, ['እንግዛ ✓', 'Buy ✓'], check);
      api.startTimer(40, () => { api.roundDone(false); solveRound(); setTimeout(advance, 1500); });
      function check() {
        if (sum === R.budget) { api.roundDone(tries === 0); api.praise(); setTimeout(advance, 1300); return; }
        tries++;
        api.oops(sum > R.budget ? { am: 'ብራችን አይበቃም። አንድ ዕቃ እንመልስ።', en: "That's more than our birr. Put one thing back." }
          : { am: 'ገና ብር ቀርቶናል። ሌላ ዕቃ እንጨምር።', en: 'We still have birr left. Add something.' });
        nextBtn(api, ['እንግዛ ✓', 'Buy ✓'], check);
      }
      function solveRound() {
        // find a set of goods that adds up to the budget
        const n = R.goods.length;
        for (let mask = 1; mask < 1 << n; mask++) {
          let s = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) s += R.goods[i].price;
          if (s === R.budget) { api.body.querySelectorAll('.good').forEach((b, i) => { const on = !!(mask & (1 << i)); b.setAttribute('aria-pressed', String(on)); }); sum = s; api.body.querySelector('.sum').textContent = sum; return; }
        }
      }
      round.solve = () => { solveRound(); check(); };
    }
    function advance() { r++; if (r < rounds.length) round(); else api.end(); }
    round();
    return { solve: () => api.foot.querySelector('button') && round.solve() };
  };

  // ---- Balloon pop: pop two balloons that add up to the target ----
  RUN.balloon = (api) => {
    const rounds = api.play.rounds; let r = 0, tries = 0;
    const COLORS = ['#b8456e', '#1f7a8c', '#f2b705', '#2f8f5b', '#7a5bb5', '#e8642b'];
    function round() {
      const R = rounds[r]; tries = 0; api.msg(null); api.foot.innerHTML = '';
      api.body.innerHTML = `<div class="target-n">${api.T('ግብ፦', 'Target:')} <span class="big" dir="ltr">${R.target}</span></div>
        <div class="sky">${R.balloons.map((v, i) => `<button type="button" class="balloon" data-v="${v}" style="--c:${COLORS[i % COLORS.length]};--d:${(i % 3) * 0.5}s;--x:${(i % 3) * 33 + 6}%;--b:${i < 3 ? 22 : 196}px" aria-label="${v}"><span dir="ltr">${v}</span></button>`).join('')}</div>`;
      api.sayNum(R.target);
      let picked = [];
      api.body.querySelectorAll('.balloon').forEach((b) => b.addEventListener('click', () => {
        if (b.classList.contains('popped')) return;
        if (picked.includes(b)) { b.classList.remove('picked'); picked = picked.filter((x) => x !== b); return; }
        b.classList.add('picked'); picked.push(b); sfx('tap'); api.sayNum(Number(b.dataset.v));
        if (picked.length === 2) {
          const s = picked.reduce((a, x) => a + Number(x.dataset.v), 0);
          if (s === R.target) { picked.forEach((x) => x.classList.add('popped')); api.roundDone(tries === 0); api.praise(); picked = []; setTimeout(advance, 1300); }
          else { tries++; const pair = picked; picked = []; setTimeout(() => pair.forEach((x) => x.classList.remove('picked')), 500);
            api.oops({ am: `${pair[0].dataset.v} ሲደመር ${pair[1].dataset.v} ${s} ነው። ሌላ እንሞክር።`, en: `${pair[0].dataset.v} + ${pair[1].dataset.v} is ${s}. Try another pair.` }); }
        }
      }));
      api.startTimer(30, () => { api.roundDone(false); hint(true); setTimeout(advance, 1600); });
      function pair() { for (let i = 0; i < R.balloons.length; i++) for (let j = i + 1; j < R.balloons.length; j++) if (R.balloons[i] + R.balloons[j] === R.target) return [i, j]; return null; }
      function hint(pop) { const [i, j] = pair(); const bs = api.body.querySelectorAll('.balloon'); [bs[i], bs[j]].forEach((b) => b.classList.add(pop ? 'popped' : 'pulse')); }
      round.solve = () => { const [i, j] = pair(); const bs = api.body.querySelectorAll('.balloon'); if (bs[i].classList.contains('popped')) return; bs.forEach((b) => b.classList.remove('picked')); picked = []; bs[i].click(); bs[j].click(); };
    }
    function advance() { r++; if (r < rounds.length) round(); else api.end(); }
    round();
    return { solve: () => round.solve() };
  };

  // ---- Race to Grandma's house: each right answer moves the runner along the road ----
  RUN.race = (api) => {
    const qs = api.play.questions; let q = 0, tries = 0;
    const stops = qs.length;
    api.body.innerHTML = `<div class="road"><svg viewBox="0 0 340 90" class="road-svg" aria-hidden="true"><path d="M20 70 C90 10 150 90 210 40 S300 20 320 40" fill="none" stroke="#d9b27c" stroke-width="18" stroke-linecap="round"/><path d="M20 70 C90 10 150 90 210 40 S300 20 320 40" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 8"/></svg>
      <span class="house" aria-hidden="true">🏡</span><span class="runner" aria-hidden="true">🏃🏾‍♀️</span></div><div class="race-q"></div>`;
    const road = api.body.querySelector('.road-svg path'), runner = api.body.querySelector('.runner'), holder = api.body.querySelector('.race-q');
    function moveRunner(k) {
      const L = road.getTotalLength(), p = road.getPointAtLength(L * k / stops), box = api.body.querySelector('.road').getBoundingClientRect(), svg = road.ownerSVGElement.getBoundingClientRect();
      runner.style.left = ((p.x / 340) * svg.width + svg.left - box.left) + 'px'; runner.style.top = ((p.y / 90) * svg.height + svg.top - box.top) + 'px';
    }
    requestAnimationFrame(() => moveRunner(0));
    function ask() {
      tries = 0; api.msg(null);
      const ex = qs[q];
      holder.innerHTML = `<p class="rq">${api.T(ex.prompt_am, ex.prompt_en)}</p><div class="opts">${ex.options.map((o) => `<button type="button" class="opt" data-v="${esc(o.v)}"><b dir="ltr">${esc(o.v)}</b></button>`).join('')}</div>`;
      api.say({ am: ex.prompt_am, en: ex.prompt_en, audio_url: ex.audio_url });
      holder.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        if (String(b.dataset.v) === String(ex.answer)) {
          b.classList.add('right'); api.roundDone(tries === 0); sfx('correct'); q++; moveRunner(q);
          if (q === stops) { api.praise(); setTimeout(() => api.end(), 1600); } else setTimeout(ask, 900);
        } else { tries++; b.classList.add('nope'); b.disabled = true; api.oops(ex.hints && ex.hints[0]); }
      }));
      api.startTimer(20, () => { api.roundDone(false); q++; moveRunner(q); if (q === stops) api.end(); else ask(); });
    }
    ask();
    return { solve: () => { const b = qs[q] && holder.querySelector(`.opt[data-v="${CSS.escape(String(qs[q].answer))}"]:not(.right)`); if (b) b.click(); } };
  };

  // ---- Memory match: number ↔ Amharic word (+ Ge'ez numeral or picture) ----
  RUN.memory = (api) => {
    const pairs = api.play.pairs;
    const cards = [];
    pairs.forEach((p, i) => {
      cards.push({ pair: i, html: `<b dir="ltr" class="mem-n">${esc(p.n)}</b>` });
      cards.push({ pair: i, html: `<span lang="am" class="mem-w">${esc(p.am)}</span>${p.geez ? `<span class="mem-g">${esc(p.geez)}</span>` : p.visual ? LK.act.visual(p.visual, { small: true }) : ''}` });
    });
    // fixed shuffle so every child sees the same, solvable board
    const order = cards.map((c, i) => ({ c, k: (i * 7 + 3) % cards.length })).sort((a, b) => a.k - b.k).map((x) => x.c);
    api.body.innerHTML = `<div class="mem-grid">${order.map((c, i) => `<button type="button" class="mem" data-i="${i}" data-pair="${c.pair}" aria-label="card ${i + 1}"><span class="back" aria-hidden="true">✦</span><span class="front">${c.html}</span></button>`).join('')}</div>`;
    let open = [], busy = false, tries = 0, matched = 0;
    api.body.querySelectorAll('.mem').forEach((b) => b.addEventListener('click', () => {
      if (busy || b.classList.contains('up')) return;
      b.classList.add('up'); sfx('tap'); open.push(b);
      if (open.length < 2) return;
      const [a, c] = open; open = [];
      if (a.dataset.pair === c.dataset.pair) {
        a.classList.add('matched'); c.classList.add('matched'); matched++; api.roundDone(tries === 0); tries = 0; sfx('correct');
        const p = pairs[a.dataset.pair]; if (typeof p.n === 'number') api.sayNum(p.n);
        if (matched === pairs.length) { api.praise(); setTimeout(() => api.end(), 1500); }
      } else { tries++; busy = true; setTimeout(() => { a.classList.remove('up'); c.classList.remove('up'); busy = false; }, 900); }
    }));
    return { solve: async () => { for (let p = 0; p < pairs.length; p++) { const two = api.body.querySelectorAll(`.mem[data-pair="${p}"]`); two[0].click(); two[1].click(); await wait(50); } } };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
