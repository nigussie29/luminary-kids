/* Luminary Kids — hands-on exercise components.
   LK.act.mount(host, exercise, ctx) draws one exercise from its JSON (content/README.md) and calls
   ctx.done({ correct, tries, shown }) when the child finishes. Every type gives instant feedback:
   a happy sound and animation when right; on a wrong move a gentle sound and a hint; after two wrong
   tries the answer is demonstrated. Drag-and-drop uses pointer events (finger, mouse or pen) with
   64px+ pieces, snap-to-place and a bounce-back; tapping a piece and then a place works too. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const A = LK.art || {};
  const ACT = (LK.act = {});
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = () => document.documentElement.classList.contains('reduce');

  // ---------------- pictures ----------------
  const EXTRA = {
    bean: () => '<ellipse cx="0" cy="0" rx="11" ry="15" fill="#5a3418" transform="rotate(25)"/><path d="M-3 -12 Q4 0 -3 12" stroke="#2e1a0c" stroke-width="2.5" fill="none" transform="rotate(25)"/>',
    egg: () => '<ellipse cx="0" cy="2" rx="13" ry="17" fill="#fbf3e4" stroke="#c9b48c" stroke-width="1.5"/><ellipse cx="-4" cy="-4" rx="4" ry="6" fill="#fff" opacity=".8"/>',
    book: () => '<rect x="-15" y="-12" width="30" height="24" rx="3" fill="#1f7a8c"/><rect x="-12" y="-9" width="24" height="18" rx="2" fill="#fbf7ef"/><path d="M0 -9 v18" stroke="#1f7a8c" stroke-width="2"/>',
    seedling: () => '<path d="M-14 16 Q0 8 14 16 Z" fill="#7a4a22"/><path d="M0 14 V-6" stroke="#2f6b3b" stroke-width="3" stroke-linecap="round"/><path d="M0 -2 Q-14 -6 -15 -17 Q-3 -15 0 -2 Z" fill="#2f8f5b"/><path d="M0 -6 Q12 -9 14 -19 Q3 -18 0 -6 Z" fill="#3fa86c"/>'
  };
  const thingBody = (thing, i = 0) => (EXTRA[thing] ? `<g class="obj">${EXTRA[thing](i)}</g>` : A.object ? A.object(thing, 0, 0, i) : '');
  const objSVG = (thing, i = 0, size = 56) => `<svg viewBox="-24 -24 48 48" width="${size}" height="${size}" aria-hidden="true">${thingBody(thing, i)}</svg>`;
  ACT.objSVG = objSVG;

  function rod(scale = 1) {
    let s = ''; for (let k = 0; k < 10; k++) s += `<rect x="0" y="${k * 10}" width="10" height="10" fill="#1f7a8c" stroke="#123f4a" stroke-width="1"/>`;
    return `<svg viewBox="-1 -1 12 102" width="${14 * scale}" height="${120 * scale}" aria-hidden="true">${s}</svg>`;
  }
  function flat(scale = 1) { // a hundred: ten rods side by side
    let s = ''; for (let i = 0; i < 10; i++) for (let k = 0; k < 10; k++) s += `<rect x="${i * 10}" y="${k * 10}" width="10" height="10" fill="#b8456e" stroke="#6e2241" stroke-width="1"/>`;
    return `<svg viewBox="-1 -1 102 102" width="${56 * scale}" height="${56 * scale}" aria-hidden="true">${s}</svg>`;
  }
  ACT.flat = flat;
  const cube = (scale = 1) => `<svg viewBox="-1 -1 12 12" width="${22 * scale}" height="${22 * scale}" aria-hidden="true"><rect width="10" height="10" fill="#f2b705" stroke="#8a6a00" stroke-width="1"/></svg>`;
  ACT.rod = rod; ACT.cube = cube;

  const NOTE = { 100: '#b8456e', 50: '#7a5bb5', 10: '#1f7a8c', 5: '#2f8f5b', 1: '#a07400' };
  function money(v, small) {
    if (v === 1) return `<svg viewBox="0 0 48 48" width="${small ? 30 : 56}" height="${small ? 30 : 56}" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#d8b25a" stroke="#8a6a20" stroke-width="3"/><text x="24" y="26" text-anchor="middle" font-size="18" font-weight="700" fill="#5a4300" font-family="Noto Sans, sans-serif">1</text><text x="24" y="38" text-anchor="middle" font-size="8" fill="#5a4300" font-family="Noto Sans Ethiopic, sans-serif">ብር</text></svg>`;
    const c = NOTE[v] || '#1f7a8c';
    return `<svg viewBox="0 0 96 48" width="${small ? 54 : 104}" height="${small ? 27 : 52}" aria-hidden="true"><rect x="2" y="2" width="92" height="44" rx="6" fill="${c}" fill-opacity=".16" stroke="${c}" stroke-width="3"/><rect x="8" y="8" width="80" height="32" rx="4" fill="none" stroke="${c}" stroke-width="1.2"/><text x="40" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="${c}" font-family="Noto Sans, sans-serif">${v}</text><text x="68" y="31" text-anchor="middle" font-size="12" fill="${c}" font-family="Noto Sans Ethiopic, sans-serif">ብር</text></svg>`;
  }
  ACT.money = money;

  // injera cut into `parts` (1, 2, 3, 4, 6 or 8). filled = parts coloured. equal=false draws an uneven cut.
  function injera(parts, filled, equal = true, size = 96) {
    const r = 44, c = 48, col = '#f2b705';
    let s = `<circle cx="${c}" cy="${c}" r="${r}" fill="#e9dcc0" stroke="#b59a6a" stroke-width="3"/>`;
    for (let k = 0; k < 24; k++) { const a = k * 2.4, d = 8 + ((k * 13) % 30); s += `<circle cx="${(c + d * Math.cos(a)).toFixed(1)}" cy="${(c + d * Math.sin(a)).toFixed(1)}" r="1.6" fill="#c9b68e"/>`; }
    const pt = (deg) => [c + r * Math.cos((deg - 90) * Math.PI / 180), c + r * Math.sin((deg - 90) * Math.PI / 180)];
    if (!equal) {
      // off-centre cut: a big part and a small part
      const x = parts === 2 ? c + 16 : c + 14;
      const dy = Math.sqrt(r * r - (x - c) * (x - c));
      if (filled) s += `<path d="M${x} ${c - dy} A${r} ${r} 0 0 1 ${x} ${c + dy} Z" fill="${col}" opacity=".9"/>`;
      s += `<path d="M${x} ${c - dy} V${c + dy}" stroke="#1d2540" stroke-width="3"/>`;
      if (parts === 4) s += `<path d="M${c - r} ${c + 8} H${c + r}" stroke="#1d2540" stroke-width="3"/>`;
      if (parts === 3) { const x2 = c - 30, dy2 = Math.sqrt(r * r - (x2 - c) * (x2 - c)); s += `<path d="M${x2} ${c - dy2} V${c + dy2}" stroke="#1d2540" stroke-width="3"/>`; }
    } else if (parts > 1) {
      const step = 360 / parts;
      for (let k = 0; k < filled; k++) {
        const [x1, y1] = pt(k * step), [x2, y2] = pt((k + 1) * step);
        s += `<path d="M${c} ${c} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${step > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${col}" opacity=".9"/>`;
      }
      for (let k = 0; k < parts; k++) { const [x, y] = pt(k * step); s += `<path d="M${c} ${c} L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#1d2540" stroke-width="3"/>`; }
    } else if (filled) s += `<circle cx="${c}" cy="${c}" r="${r}" fill="${col}" opacity=".9"/>`;
    return `<svg viewBox="0 0 96 96" width="${size}" height="${size}" aria-hidden="true">${s}</svg>`;
  }
  ACT.injera = injera;

  function visual(v, opts = {}) {
    if (!v) return '';
    const label = esc(opts.label || '');
    switch (v.kind) {
      case 'group': {
        let s = ''; const per = 5, sz = 50;
        for (let i = 0; i < v.n; i++) s += `<g transform="translate(${30 + (i % per) * sz} ${30 + Math.floor(i / per) * sz})">${thingBody(v.thing, i)}</g>`;
        const rows = Math.ceil(v.n / per);
        return `<svg class="vis" viewBox="0 0 ${per * sz + 10} ${rows * sz + 10}" role="img" aria-label="${v.n} ${label}">${s}</svg>`;
      }
      case 'takeaway': {
        let s = ''; const sz = 50;
        for (let i = 0; i < v.n; i++) {
          const x = 30 + (i % 5) * sz, y = 30 + Math.floor(i / 5) * sz, gone = i >= v.n - v.gone;
          s += `<g transform="translate(${x} ${y})" ${gone ? 'opacity=".45"' : ''}>${thingBody(v.thing, i)}${gone ? '<path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#b8456e" stroke-width="4" stroke-linecap="round"/>' : ''}</g>`;
        }
        return `<svg class="vis" viewBox="0 0 260 ${Math.ceil(v.n / 5) * sz + 10}" role="img" aria-label="${v.n - v.gone}">${s}</svg>`;
      }
      case 'compare': {
        const side = (n, x0) => { let s = ''; for (let i = 0; i < n; i++) s += `<g transform="translate(${x0 + (i % 3) * 40} ${32 + Math.floor(i / 3) * 44})">${thingBody(v.thing, i)}</g>`; return s; };
        const rows = Math.ceil(Math.max(v.left, v.right) / 3);
        return `<svg class="vis" viewBox="0 0 300 ${rows * 44 + 24}" role="img" aria-label="${v.left} and ${v.right}"><rect x="2" y="2" width="136" height="${rows * 44 + 20}" rx="14" fill="#c98f4a" opacity=".25"/><rect x="162" y="2" width="136" height="${rows * 44 + 20}" rx="14" fill="#c98f4a" opacity=".25"/>${side(v.left, 30)}${side(v.right, 190)}</svg>`;
      }
      case 'tens_ones': {
        let s = '';
        // hundreds flats in up to two rows, so a picture with several hundreds stays readable on a phone
        const hs = v.hundreds || 0, hr = hs > 2 ? 2 : 1, hc = Math.ceil(hs / hr), hx = 8 + hc * 124;
        for (let k = 0; k < hs; k++) s += `<g transform="translate(${8 + (k % hc) * 124} ${6 + Math.floor(k / hc) * 124})">${flatBody()}</g>`;
        for (let t = 0; t < v.tens; t++) s += `<g transform="translate(${hx + t * 18} 6)">${rodBody()}</g>`;
        const x0 = hx + v.tens * 18 + 14;
        for (let o = 0; o < v.ones; o++) s += `<rect x="${x0 + (o % 5) * 14}" y="${6 + Math.floor(o / 5) * 14}" width="12" height="12" fill="#f2b705" stroke="#8a6a00"/>`;
        return `<svg class="vis ${hs ? 'wide' : ''}" viewBox="0 0 ${x0 + 80} ${hr > 1 ? 254 : 130}" role="img" aria-label="${hs ? hs + ' hundreds ' : ''}${v.tens} tens ${v.ones} ones">${s}</svg>`;
      }
      case 'array': { // rows × cols of things, e.g. seedlings planted in rows
        const sz = opts.small ? 26 : v.cols > 6 ? 30 : 40; let s = '';
        for (let r = 0; r < v.rows; r++) for (let c = 0; c < v.cols; c++) s += `<g transform="translate(${sz / 2 + 4 + c * sz} ${sz / 2 + 4 + r * sz}) scale(${sz / 48})">${thingBody(v.thing || 'seedling', r * v.cols + c)}</g>`;
        return `<svg class="vis" viewBox="0 0 ${v.cols * sz + 8} ${v.rows * sz + 8}" style="max-width:${v.cols * sz + 8}px" role="img" aria-label="${v.rows} rows of ${v.cols}">${s}</svg>`;
      }
      case 'tenframe': {
        let s = '<rect x="4" y="4" width="250" height="100" rx="6" fill="#fff" stroke="#1d2540" stroke-width="3"/>';
        for (let i = 1; i < 5; i++) s += `<path d="M${4 + i * 50} 4 V104" stroke="#1d2540" stroke-width="2"/>`;
        s += '<path d="M4 54 H254" stroke="#1d2540" stroke-width="2"/>';
        for (let i = 0; i < v.n; i++) s += `<circle cx="${29 + (i % 5) * 50}" cy="${29 + Math.floor(i / 5) * 50}" r="17" fill="#b8456e"/>`;
        return `<svg class="vis" viewBox="0 0 258 108" role="img" aria-label="${v.n}">${s}</svg>`;
      }
      case 'birr': return `<div class="vis birr" role="img" aria-label="${v.notes.reduce((a, b) => a + b, 0)} birr">${v.notes.map((n) => money(n, opts.small)).join('')}</div>`;
      case 'injera': return `<div class="vis" role="img" aria-label="injera">${injera(v.parts, v.filled, v.equal !== false, opts.small ? 72 : 110)}</div>`;
      case 'groups': return `<div class="vis groups" role="img" aria-label="${v.groups.join(', ')}">${v.groups.map((n) => `<span class="grp">${Array.from({ length: n }, (_, i) => objSVG(v.thing || 'cup', i, opts.small ? 22 : 30)).join('')}</span>`).join('')}</div>`;
      case 'text': return `<div class="vis vis-text">${esc(v.text)}</div>`;
      default: return '';
    }
  }
  function flatBody() { let s = ''; for (let i = 0; i < 10; i++) for (let k = 0; k < 10; k++) s += `<rect x="${i * 11.5}" y="${k * 11.5}" width="11.5" height="11.5" fill="#b8456e" stroke="#6e2241"/>`; return s; }
  function rodBody() { let s = ''; for (let k = 0; k < 10; k++) s += `<rect x="0" y="${k * 11.5}" width="12" height="11.5" fill="#1f7a8c" stroke="#123f4a"/>`; return s; }
  ACT.visual = visual;

  // ---------------- drag engine ----------------
  // drag(el, { zones: () => [el…], drop(zoneEl|null, el, point) → true to keep, clone: make a copy to drag })
  let selected = null; // tap-to-select fallback
  function hitZone(zones, x, y, pad = 24) {
    let best = null, bestD = Infinity;
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (d < bestD) { bestD = d; best = z; }
      }
    }
    return best;
  }
  function bounceBack(ghost, from, done) {
    if (reduce()) { done(); return; }
    ghost.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)';
    ghost.style.transform = `translate(${from.x}px, ${from.y}px)`;
    setTimeout(done, 360);
  }
  function drag(el, o) {
    el.classList.add('drag');
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
    let st = null;
    el.addEventListener('pointerdown', (e) => {
      if (el.classList.contains('locked') || (o.enabled && !o.enabled())) return;
      e.preventDefault();
      LK.sfx && LK.sfx.unlock && LK.sfx.unlock();
      const r = el.getBoundingClientRect();
      const ghost = o.clone ? el.cloneNode(true) : el;
      const start = { x: r.left, y: r.top };
      if (o.clone) { document.body.appendChild(ghost); ghost.classList.add('ghost'); }
      else { el.classList.add('lifting'); }
      st = { ghost, start, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false, x0: e.clientX, y0: e.clientY, placeholder: null };
      if (!o.clone) { // lift the real element out of the flow, leaving a placeholder of the same size
        const ph = document.createElement('span'); ph.className = 'ph'; ph.style.width = r.width + 'px'; ph.style.height = r.height + 'px';
        el.parentNode.insertBefore(ph, el); st.placeholder = ph; document.body.appendChild(el); el.classList.add('ghost');
      }
      Object.assign(ghost.style, { position: 'fixed', left: '0px', top: '0px', width: r.width + 'px', height: r.height + 'px', transform: `translate(${r.left}px, ${r.top}px)`, transition: 'none', zIndex: 60 });
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (!st) return;
      if (Math.hypot(e.clientX - st.x0, e.clientY - st.y0) > 6) st.moved = true;
      st.ghost.style.transform = `translate(${e.clientX - st.dx}px, ${e.clientY - st.dy}px) scale(1.08)`;
      const z = hitZone(o.zones(), e.clientX, e.clientY);
      o.zones().forEach((zz) => zz.classList.toggle('over', zz === z));
    });
    const end = (e) => {
      if (!st) return;
      const s = st; st = null;
      o.zones().forEach((zz) => zz.classList.remove('over'));
      const dropRect = s.ghost.getBoundingClientRect();
      const restore = () => {
        const g = s.ghost;
        Object.assign(g.style, { position: '', left: '', top: '', width: '', height: '', transform: '', transition: '', zIndex: '' });
        g.classList.remove('ghost', 'lifting');
        if (o.clone) g.remove();
        else if (s.placeholder) { s.placeholder.parentNode.insertBefore(el, s.placeholder); s.placeholder.remove(); }
      };
      if (!s.moved) { restore(); if (o.tap) o.tap(el); select(el, o); return; }
      const z = hitZone(o.zones(), e.clientX, e.clientY);
      const pt = { x: e.clientX, y: e.clientY };
      if (o.clone) { // the copy flies home if the drop is refused
        const ok = z ? o.drop(z, el, pt) : false;
        if (ok) s.ghost.remove(); else bounceBack(s.ghost, s.start, () => s.ghost.remove());
        return;
      }
      restore(); // put the piece back in its place, then let drop() move it where it belongs
      if (z) o.drop(z, el, pt);
      if (el.isConnected) flip(el, dropRect); // glide from the finger to wherever it now lives (snap or bounce back)
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(el, o); } });
  }
  function flip(el, from) {
    if (reduce()) return;
    const r = el.getBoundingClientRect();
    const dx = from.left - r.left, dy = from.top - r.top;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    el.style.transition = 'none'; el.style.transform = `translate(${dx}px, ${dy}px)`;
    void el.offsetWidth;
    el.style.transition = 'transform .35s cubic-bezier(.3,1.45,.5,1)'; el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; }, 380);
  }
  function select(el, o) {
    if (selected && selected.el === el) { el.classList.remove('selected'); selected = null; return; }
    if (selected) selected.el.classList.remove('selected');
    selected = { el, o }; el.classList.add('selected');
  }
  function zone(z, getOwner) {
    z.classList.add('zone');
    z.addEventListener('click', (e) => {
      if (!selected || e.target.closest('.drag')) return;
      const { el, o } = selected;
      if (!o.zones().includes(z)) return;
      el.classList.remove('selected'); selected = null;
      const ok = o.drop(z, el, null);
      if (!ok) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); }
    });
  }
  ACT.drag = drag; ACT.zone = zone;

  // ---------------- shell + feedback ----------------
  const T = (ctx, am, en) => (ctx.lang === 'en' ? `<span>${esc(en)}</span>` : `<span class="am" lang="am">${esc(am)}${ctx.showEn && en ? `<span class="en-sub" lang="en">${esc(en)}</span>` : ''}</span>`);
  ACT.T = T;

  ACT.mount = function (host, ex, ctx) {
    const impl = TYPES[ex.type];
    host.innerHTML = '';
    selected = null;
    const shell = h(`<section class="ex ex-${ex.type}" aria-live="polite">
      <div class="ex-prompt"><button class="spk" type="button" aria-label="Listen">🔊</button><h2 tabindex="-1">${ex.type === 'true_false' ? T(ctx, 'ልክ ነው ወይስ አይደለም?', 'True or not?') : T(ctx, ex.prompt_am, ex.prompt_en)}</h2></div>
      <div class="ex-body"></div>
      <div class="ex-msg" role="status"></div>
      <div class="ex-foot">${ex.hints && ex.hints.length ? `<button class="btn ghost hintbtn" type="button">💡 ${T(ctx, 'ፍንጭ', 'Hint')}</button>` : ''}${ex.optional ? `<button class="btn ghost skipbtn" type="button">${T(ctx, 'እለፍ', 'Skip')}</button>` : ''}</div>
    </section>`);
    host.appendChild(shell);
    const body = shell.querySelector('.ex-body'), msg = shell.querySelector('.ex-msg');
    const state = { tries: 0, hint: 0, finished: false, shown: false };
    const say = (line) => ctx.say && ctx.say(line);
    const prompt = { am: ex.prompt_am, en: ex.prompt_en, audio_url: ex.audio_url };
    shell.querySelector('.spk').addEventListener('click', () => say(prompt));
    const showMsg = (line, cls) => { msg.className = 'ex-msg ' + (cls || ''); msg.innerHTML = line ? T(ctx, line.am, line.en) : ''; };
    const nextHint = () => {
      if (!ex.hints || !ex.hints.length) return;
      const hint = ex.hints[Math.min(state.hint, ex.hints.length - 1)]; state.hint++;
      showMsg(hint, 'hint'); say(hint);
    };
    const hb = shell.querySelector('.hintbtn'); if (hb) hb.addEventListener('click', nextHint);
    const finish = (correct) => {
      if (state.finished) return; state.finished = true;
      shell.classList.add(correct ? 'is-right' : 'is-shown');
      setTimeout(() => ctx.done({ correct: correct && state.tries === 0, tries: state.tries, shown: state.shown, id: ex.id, type: ex.type }), correct ? 1100 : 0);
    };
    const api = {
      ex, ctx, body, say, T: (am, en) => T(ctx, am, en), visual, objSVG,
      right() {
        if (state.finished) return;
        LK.sfx && LK.sfx.correct && LK.sfx.correct();
        const praise = ctx.common && ctx.common.praise ? ctx.common.praise[Math.floor(Math.random() * ctx.common.praise.length)] : null;
        if (praise) { showMsg(praise, 'ok'); say(praise); }
        burst(shell);
        finish(true);
      },
      wrong() {
        if (state.finished) return;
        state.tries++;
        LK.sfx && LK.sfx.retry && LK.sfx.retry();
        shell.classList.remove('wobble'); void shell.offsetWidth; shell.classList.add('wobble');
        if (state.tries >= 2 && inst.demo) { demonstrate(); return; }
        nextHint();
      },
      progress(n) { LK.sfx && LK.sfx.count && LK.sfx.count(Math.max(1, Math.min(10, n))); },
      sayNum(n) { say({ am: String(n), en: String(n), audio_url: `audio/am/num.${n}.mp3` }); }
    };
    async function demonstrate() {
      state.shown = true;
      const w = ctx.common && ctx.common.watch;
      if (w) { showMsg(w, 'hint'); say(w); }
      shell.classList.add('demo');
      await inst.demo();
      shell.classList.remove('demo');
      const nb = h(`<button class="btn adey nextbtn" type="button">${T(ctx, 'ቀጣይ', 'Next')} →</button>`);
      shell.querySelector('.ex-foot').appendChild(nb);
      nb.addEventListener('click', () => finish(false));
      nb.focus();
    }
    const inst = impl(api) || {};
    const sk = shell.querySelector('.skipbtn'); if (sk) sk.addEventListener('click', () => { state.finished = true; ctx.done({ correct: true, tries: 0, skipped: true, id: ex.id, type: ex.type }); });
    if (ctx.autoSay !== false) setTimeout(() => say(prompt), 250);
    // test hook: complete the exercise the right way without dragging
    shell._solve = () => (inst.solve ? inst.solve() : inst.demo && inst.demo().then(() => api.right()));
    return { el: shell, solve: shell._solve };
  };

  function burst(el) {
    if (reduce()) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i'); p.className = 'spark';
      p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + Math.min(r.height / 2, 260)) + 'px';
      p.style.setProperty('--dx', (Math.cos(i / 14 * 6.28) * (60 + Math.random() * 60)).toFixed(0) + 'px');
      p.style.setProperty('--dy', (Math.sin(i / 14 * 6.28) * (60 + Math.random() * 60)).toFixed(0) + 'px');
      p.style.background = ['#f2b705', '#1f7a8c', '#2f8f5b', '#b8456e'][i % 4];
      document.body.appendChild(p); setTimeout(() => p.remove(), 800);
    }
  }
  ACT.burst = burst;

  // move an element into a container with a little hop (used by demos and snaps)
  async function flyTo(el, container, before = null) {
    const a = el.getBoundingClientRect();
    container.insertBefore(el, before);
    const b = el.getBoundingClientRect();
    if (reduce()) return;
    el.style.transition = 'none'; el.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    void el.offsetWidth;
    el.style.transition = 'transform .45s cubic-bezier(.3,1.3,.5,1)'; el.style.transform = '';
    await wait(470); el.style.transition = '';
  }
  ACT.flyTo = flyTo;
  const pop = (el) => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

  // ---------------- exercise types ----------------
  const TYPES = (ACT.types = {});

  // Drag objects into a basket / tray / ten frame, or take some off the tree.
  TYPES.drag_drop_count = (api) => {
    const { ex, body } = api, thing = ex.items.thing, remove = ex.items.mode === 'remove';
    const targets = ex.targets.map((t) => Object.assign({}, t, { count: t.start }));
    body.innerHTML = `<div class="dd-wrap ${remove ? 'remove' : ''}"></div>`;
    const wrap = body.firstElementChild;
    // optional reference tray (compare lesson): "same as / more than the left tray"
    targets.filter((t) => t.match).forEach((t) => {
      wrap.appendChild(h(`<div class="dd-ref"><div class="dd-target tray static">${Array.from({ length: t.match }, (_, i) => `<span class="piece static">${objSVG(thing, i, 46)}</span>`).join('')}</div><span class="dd-count">${t.match}</span></div>`));
    });
    // three or more trays / plates sit two to a row, so every plate and the supply fit on a phone screen
    const group = targets.filter((t) => t.kind === 'tray').length >= 3 ? wrap.appendChild(h('<div class="dd-group"></div>')) : null;
    const zones = targets.map((t) => {
      const kind = t.kind || 'basket';
      const z = h(`<div class="dd-target ${kind}" data-id="${t.id}" aria-label="${esc(kind)}"><div class="dd-in"></div>${kind === 'basket' ? '<div class="basket-front" aria-hidden="true"></div>' : ''}${kind === 'bajaj' ? '<i class="wheel l" aria-hidden="true"></i><i class="wheel r" aria-hidden="true"></i>' : ''}<span class="dd-count" aria-live="polite">${t.count}</span></div>`);
      const inner = z.querySelector('.dd-in');
      if (kind === 'tenframe') for (let i = 0; i < 10; i++) inner.appendChild(h(`<span class="cell" data-i="${i}"></span>`));
      for (let i = 0; i < t.start; i++) {
        const p = h(`<span class="piece ${remove ? '' : 'static'}">${objSVG(thing, i, kind === 'tenframe' ? 40 : 46)}</span>`);
        place(z, inner, p, kind);
        if (remove) dragPiece(p);
      }
      (group || wrap).appendChild(z); ACT.zone(z); z._t = t; return z;
    });
    function place(z, inner, p, kind) {
      if (kind === 'tenframe') { const cell = [...inner.children].find((c) => !c.firstChild); if (cell) cell.appendChild(p); else inner.appendChild(p); }
      else inner.appendChild(p);
    }
    const supply = h('<div class="dd-supply zone-home"></div>');
    const basket = remove ? h('<div class="dd-target basket" data-id="down"><div class="dd-in"></div><div class="basket-front" aria-hidden="true"></div><span class="dd-count">0</span></div>') : null;
    if (remove) { wrap.appendChild(basket); ACT.zone(basket); basket._t = { count: 0 }; }
    else {
      for (let i = 0; i < ex.items.supply; i++) { const p = h(`<span class="piece">${objSVG(thing, i, 52)}</span>`); supply.appendChild(p); dragPiece(p); }
      wrap.appendChild(supply); ACT.zone(supply);
    }
    function dragPiece(p) {
      ACT.drag(p, {
        zones: () => (remove ? [basket, ...zones] : [...zones, supply]),
        drop: (z, el) => {
          const fromZone = el._in || (remove ? zones[0] : null);
          if (z === fromZone || (z === supply && !el._in)) return false;
          if (z === supply || (remove && zones.includes(z))) { // taking it back out
            if (remove) { // back up the tree from the basket
              if (el._in !== basket) return false;
              basket._t.count--; upd(basket); z._t.count++; upd(z); el._in = z; z.querySelector('.dd-in').appendChild(el); check(); return true;
            }
            if (fromZone) { fromZone._t.count--; upd(fromZone); }
            el._in = null; supply.appendChild(el); return true;
          }
          if (remove) { // to the basket
            zones[0]._t.count--; upd(zones[0]); basket._t.count++; upd(basket); el._in = basket;
            basket.querySelector('.dd-in').appendChild(el); api.progress(basket._t.count); pop(el); check(); return true;
          }
          const t = z._t;
          if (t.count >= t.need) { api.wrong(); return false; } // too many — bounce back with a hint
          if (fromZone) { fromZone._t.count--; upd(fromZone); }
          t.count++; upd(z); el._in = z; place(z, z.querySelector('.dd-in'), el, t.kind);
          api.progress(t.count); api.sayNum(t.count); pop(el); check(); return true;
        }
      });
    }
    function upd(z) { const c = z.querySelector(':scope > .dd-count'); if (c) c.textContent = z._t.count; }
    function done() { return zones.every((z) => z._t.count === z._t.need); }
    function check() { if (done()) api.right(); }
    async function demo() {
      for (const z of zones) {
        while (z._t.count !== z._t.need) {
          if (remove) { const p = [...z.querySelectorAll('.dd-in .piece')].pop(); z._t.count--; upd(z); basket._t.count++; upd(basket); p._in = basket; await flyTo(p, basket.querySelector('.dd-in')); }
          else if (z._t.count < z._t.need) { const p = supply.querySelector('.piece'); z._t.count++; upd(z); p._in = z; await flyTo(p, z.querySelector('.dd-in')); }
          else { const p = [...z.querySelectorAll('.dd-in .piece:not(.static)')].pop(); z._t.count--; upd(z); p._in = null; await flyTo(p, supply); }
          api.progress(remove ? basket._t.count : z._t.count);
        }
      }
    }
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Drag a number tile into the empty box of an equation.
  TYPES.drag_equation = (api) => {
    const { ex, body } = api;
    body.innerHTML = `${ex.visual ? visual(ex.visual) : ''}<div class="eqn" dir="ltr">${ex.equation.map((p) => (p === '__' ? '<span class="blank" aria-label="empty box"></span>' : `<span class="tok ${/^[+−×=]$/.test(p) ? 'op' : ''}">${esc(p)}</span>`)).join('')}</div><div class="tiles zone-home"></div>`;
    const blank = body.querySelector('.blank'), tiles = body.querySelector('.tiles');
    ACT.zone(blank);
    ex.items.forEach((v) => {
      const t = h(`<span class="tile" data-v="${esc(v)}">${esc(v)}</span>`); tiles.appendChild(t);
      ACT.drag(t, { zones: () => [blank], drop: (z, el) => {
        if (el.dataset.v === String(ex.answer)) { blank.appendChild(el); el.classList.add('locked'); blank.classList.add('filled'); pop(el); api.right(); return true; }
        api.wrong(); return false;
      } });
    });
    const demo = async () => { const t = tiles.querySelector(`[data-v="${CSS.escape(String(ex.answer))}"]`); await flyTo(t, blank); t.classList.add('locked'); blank.classList.add('filled'); };
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Sort cards into two (or more) bins.
  TYPES.drag_sort = (api) => {
    const { ex, body } = api;
    body.innerHTML = `<div class="bins">${ex.targets.map((t) => `<div class="bin" data-id="${esc(t.id)}"><b>${api.T(t.am, t.en)}</b><div class="bin-in"></div></div>`).join('')}</div><div class="cards zone-home"></div>`;
    const bins = [...body.querySelectorAll('.bin')], cards = body.querySelector('.cards');
    bins.forEach((b) => ACT.zone(b));
    let left = ex.items.length;
    ex.items.forEach((it) => {
      const c = h(`<span class="card" data-id="${esc(it.id)}">${it.visual ? visual(it.visual, { small: true }) : ''}${it.label ? `<b>${esc(it.label)}</b>` : ''}</span>`);
      cards.appendChild(c);
      ACT.drag(c, { zones: () => bins, drop: (z, el) => {
        if (ex.answer[it.id] === z.dataset.id) { z.querySelector('.bin-in').appendChild(el); el.classList.add('locked'); pop(el); LK.sfx && LK.sfx.tap && LK.sfx.tap(); if (--left === 0) api.right(); return true; }
        api.wrong(); return false;
      } });
    });
    const demo = async () => { for (const c of [...cards.querySelectorAll('.card')]) { const b = bins.find((x) => x.dataset.id === ex.answer[c.dataset.id]); await flyTo(c, b.querySelector('.bin-in')); c.classList.add('locked'); } };
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Put numbers in their places on a number line.
  TYPES.drag_numberline = (api) => {
    const { ex, body } = api, { min, max, step, labels } = ex.line;
    const n = (max - min) / step;
    let ticks = '';
    for (let k = 0; k <= n; k++) {
      const v = min + k * step, x = (k / n) * 100;
      const show = labels === 'tens' ? v % 10 === 0 : labels === 'none' ? k === 0 : (k === 0 || k === n);
      ticks += `<span class="tick" style="left:${x}%" data-v="${v}"><i></i>${show ? `<em>${v}</em>` : ''}<span class="slot" data-v="${v}"></span></span>`;
    }
    body.innerHTML = `<div class="nl"><div class="nl-line"></div>${ticks}</div><div class="tiles zone-home"></div>`;
    const line = body.querySelector('.nl'), tiles = body.querySelector('.tiles');
    const slots = [...body.querySelectorAll('.slot')];
    slots.forEach((s) => ACT.zone(s));
    let left = ex.items.length;
    ex.items.forEach((v) => {
      const t = h(`<span class="tile small" data-v="${esc(v)}">${esc(v)}</span>`); tiles.appendChild(t);
      ACT.drag(t, {
        zones: () => slots.filter((s) => !s.firstChild),
        drop: (z, el, pt) => {
          // the nearest tick wins, so small screens are forgiving
          let target = z;
          if (pt) { let best = Infinity; slots.forEach((s) => { const r = s.getBoundingClientRect(); const d = Math.abs(pt.x - (r.left + r.width / 2)); if (d < best && !s.firstChild) { best = d; target = s; } }); }
          if (target.dataset.v === el.dataset.v) { target.appendChild(el); el.classList.add('locked'); pop(el); LK.sfx && LK.sfx.tap && LK.sfx.tap(); if (--left === 0) api.right(); return true; }
          api.wrong(); return false;
        }
      });
    });
    const demo = async () => { for (const t of [...tiles.querySelectorAll('.tile')]) { await flyTo(t, slots.find((s) => s.dataset.v === t.dataset.v)); t.classList.add('locked'); } };
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Build a number with (hundreds flats,) tens rods and ones cubes. Ten loose cubes bundle themselves
  // into a rod and ten rods into a flat, unless the exercise fixes how many tens / hundreds to use
  // (targets[0].tens / .hundreds — "build 342 with only 2 hundreds" practises breaking a hundred).
  TYPES.drag_placevalue = (api) => {
    const { ex, body } = api, tg = ex.targets[0], fixT = tg.tens, fixH = tg.hundreds;
    const hasH = !!(ex.items && ex.items.flats) || ex.answer >= 100;
    const col = (k, am, en) => `<div class="pv-col ${k}"><b>${api.T(am, en)}</b><div class="pv-in"></div><span class="pv-n">0</span></div>`;
    body.innerHTML = `<div class="pv ${hasH ? 'h3' : ''}">
      <div class="pv-src">${hasH ? `<span class="src-flat" aria-label="hundred">${flat(1.15)}</span>` : ''}<span class="src-rod" aria-label="ten">${rod()}</span><span class="src-cube" aria-label="one">${cube(2)}</span></div>
      <div class="pv-mat">${hasH ? col('hundreds', 'መቶዎች', 'Hundreds') : ''}${col('tens', 'አስሮች', 'Tens')}${col('ones', 'አንዶች', 'Ones')}</div>
      <div class="pv-total" dir="ltr"><span class="t">0</span></div></div>`;
    const cols = { flat: body.querySelector('.pv-col.hundreds'), rod: body.querySelector('.pv-col.tens'), cube: body.querySelector('.pv-col.ones') };
    const ins = Object.fromEntries(Object.entries(cols).map(([k, c]) => [k, c && c.querySelector('.pv-in')]));
    const st = { flat: 0, rod: 0, cube: 0 };
    const VAL = { flat: 100, rod: 10, cube: 1 };
    Object.values(cols).forEach((c) => c && ACT.zone(c));
    const home = body.querySelector('.pv-src'); ACT.zone(home);
    const total = () => st.flat * 100 + st.rod * 10 + st.cube;
    function show() {
      for (const k in cols) if (cols[k]) cols[k].querySelector('.pv-n').textContent = st[k];
      body.querySelector('.pv-total .t').textContent = total();
    }
    const pic = (k) => (k === 'flat' ? flat(hasH ? 0.62 : 0.8) : k === 'rod' ? rod(hasH ? 0.62 : 0.9) : cube(hasH ? 1.05 : 1.4));
    function addPiece(k) {
      const p = h(`<span class="piece ${k}">${pic(k)}</span>`);
      ins[k].appendChild(p); pop(p);
      ACT.drag(p, { zones: () => [home], drop: () => { // drag back off the mat to remove
        p.remove(); st[k]--; show(); return 'keep-place';
      } });
    }
    async function bundle(from, to, line) { // ten ones → one ten; ten tens → one hundred
      const ps = [...ins[from].querySelectorAll('.piece.' + from)].slice(0, 10);
      ps.forEach((c) => c.classList.add('bundling'));
      await wait(reduce() ? 0 : 500);
      ps.forEach((c) => c.remove()); st[from] -= 10; st[to]++; addPiece(to); show();
      api.say && api.say(line);
    }
    const ONE_TEN = { am: 'አስር አንዶች አንድ አስር ይሆናሉ።', en: 'Ten ones make one ten.', audio_url: 'audio/am/lesson.g2_add2d.example.2.mp3' };
    const ONE_HUNDRED = { am: 'አስር አስሮች አንድ መቶ ይሆናሉ።', en: 'Ten tens make one hundred.', audio_url: 'audio/am/lesson.g3_hundreds.example.0.mp3' };
    function accept(k) {
      const fixed = k === 'flat' ? fixH : k === 'rod' ? fixT : null;
      if (fixed != null ? st[k] >= fixed : total() + VAL[k] > ex.answer) { api.wrong(); return false; }
      if (total() + VAL[k] > ex.answer) { api.wrong(); return false; }
      st[k]++; addPiece(k);
      show(); api.progress(Math.min(10, st[k]));
      (async () => {
        if (k === 'cube' && fixT == null && st.cube === 10) await bundle('cube', 'rod', ONE_TEN);
        if (hasH && fixH == null && st.rod === 10) await bundle('rod', 'flat', ONE_HUNDRED);
        check();
      })();
      return true;
    }
    function check() {
      if (total() !== ex.answer) return;
      if (fixT == null ? st.cube >= 10 : st.rod !== fixT) return;
      if (hasH && (fixH == null ? st.rod >= 10 : st.flat !== fixH)) return;
      api.right();
    }
    const src = { flat: body.querySelector('.src-flat'), rod: body.querySelector('.src-rod'), cube: body.querySelector('.src-cube') };
    for (const k in src) if (src[k]) ACT.drag(src[k], { clone: true, zones: () => Object.values(cols).filter(Boolean), drop: (z) => (z === cols[k] ? accept(k) : (api.wrong(), false)) });
    function want() {
      const hh = hasH ? (fixH != null ? fixH : Math.floor(ex.answer / 100)) : 0;
      const t = fixT != null ? fixT : Math.floor((ex.answer - 100 * hh) / 10);
      return { flat: hh, rod: t, cube: ex.answer - 100 * hh - 10 * t };
    }
    async function demo() {
      for (const k in ins) if (ins[k]) ins[k].innerHTML = '';
      st.flat = 0; st.rod = 0; st.cube = 0; show();
      const w = want();
      for (const k of ['flat', 'rod', 'cube']) for (let i = 0; i < w[k]; i++) { st[k]++; addPiece(k); show(); await wait(reduce() ? 0 : k === 'cube' ? 160 : 280); }
    }
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Match words / Ge'ez numerals / pictures to their partners.
  TYPES.drag_match_word = (api) => {
    const { ex, body } = api;
    body.innerHTML = `<div class="match-slots">${ex.targets.map((t) => `<div class="mslot" data-id="${esc(t.id)}">${t.visual ? visual(t.visual, { small: true }) : `<b dir="ltr">${esc(t.label)}</b>`}<div class="m-in"></div></div>`).join('')}</div><div class="cards zone-home"></div>`;
    const slots = [...body.querySelectorAll('.mslot')], cards = body.querySelector('.cards');
    slots.forEach((s) => ACT.zone(s));
    let left = ex.items.length;
    ex.items.forEach((it) => {
      const c = h(`<span class="card word ${it.lang === 'geez' ? 'geez' : ''}" data-id="${esc(it.id)}" ${it.lang === 'am' ? 'lang="am"' : ''}>${esc(it.label)}</span>`);
      cards.appendChild(c);
      ACT.drag(c, {
        tap: () => { if (it.audio_url) api.say({ am: it.label, en: it.label, audio_url: it.audio_url }); },
        zones: () => slots.filter((s) => !s.querySelector('.card')),
        drop: (z, el) => {
          if (ex.answer[it.id] === z.dataset.id) { z.querySelector('.m-in').appendChild(el); el.classList.add('locked'); z.classList.add('done'); pop(el); LK.sfx && LK.sfx.tap && LK.sfx.tap(); if (--left === 0) api.right(); return true; }
          api.wrong(); return false;
        }
      });
    });
    const demo = async () => { for (const c of [...cards.querySelectorAll('.card')]) { const s = slots.find((x) => x.dataset.id === ex.answer[c.dataset.id]); await flyTo(c, s.querySelector('.m-in')); c.classList.add('locked'); s.classList.add('done'); } };
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Pay an exact price at the shop with notes and coins.
  TYPES.drag_make_change = (api) => {
    const { ex, body } = api;
    const PICS = { bread: '🍞', shoes: '👟', pen: '🖊️', book: '📒', bag: '🎒', banana: '🍌', egg: '🥚' };
    body.innerHTML = `<div class="shop"><div class="shop-item"><span class="pic" aria-hidden="true">${PICS[ex.item.pic] || '🛍️'}</span><span class="price" dir="ltr">${ex.price} <span lang="am">ብር</span></span></div>
      <div class="counter zone"><span class="lbl">${api.T('እዚህ እንክፈል', 'Pay here')}</span><div class="c-in"></div><span class="paid" dir="ltr"><b>0</b> / ${ex.price}</span></div></div>
      <div class="wallet zone-home"></div>`;
    const counter = body.querySelector('.counter'), wallet = body.querySelector('.wallet'), cIn = counter.querySelector('.c-in');
    ACT.zone(counter); ACT.zone(wallet);
    let paid = 0;
    const show = () => { counter.querySelector('.paid b').textContent = paid; };
    [...ex.items].sort((a, b) => b - a).forEach((v, i) => {
      const m = h(`<span class="cash" data-v="${v}" aria-label="${v} birr">${money(v)}</span>`); wallet.appendChild(m);
      ACT.drag(m, { zones: () => [counter, wallet], drop: (z, el) => {
        if (z === wallet) { if (!el._paid) return false; el._paid = false; paid -= v; wallet.appendChild(el); show(); return true; }
        if (el._paid) return false;
        if (paid + v > ex.price) { api.wrong(); return false; } // too much — bounce back
        el._paid = true; paid += v; cIn.appendChild(el); show(); pop(el); LK.sfx && LK.sfx.tap && LK.sfx.tap();
        if (paid === ex.price) api.right();
        return true;
      } });
    });
    async function demo() {
      for (const m of [...cIn.querySelectorAll('.cash')]) { m._paid = false; paid -= Number(m.dataset.v); await flyTo(m, wallet); }
      show();
      let need = ex.price;
      for (const m of [...wallet.querySelectorAll('.cash')]) { const v = Number(m.dataset.v); if (v <= need) { need -= v; paid += v; m._paid = true; await flyTo(m, cIn); show(); } if (!need) break; }
    }
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // Fill an injera with fraction pieces. `parts` (default 4) is how many equal parts make the whole;
  // a "half" piece covers parts/2 of them, every other piece (quarter, third, sixth…) covers one.
  TYPES.drag_fraction = (api) => {
    const { ex, body } = api, P = ex.parts || 4;
    const filled = Array.from({ length: P }, () => false);
    for (let i = 0; i < (ex.targets[0].start || 0); i++) filled[i] = true;
    body.innerHTML = `<div class="frac"><div class="inj zone">${injera(1, 0, true, 200)}<svg class="inj-fill" viewBox="0 0 96 96" width="200" height="200" aria-hidden="true"></svg></div><div class="pieces zone-home"></div></div>
      <p class="frac-count" dir="ltr"><b>0</b>/${P}</p>`;
    const inj = body.querySelector('.inj'), fillSvg = body.querySelector('.inj-fill'), pieces = body.querySelector('.pieces');
    ACT.zone(inj);
    const ang = (k) => (k * 360 / P - 90) * Math.PI / 180;
    const sector = (k, n = 1, c = 48, r = 44) => `M${c} ${c} L${(c + r * Math.cos(ang(k))).toFixed(1)} ${(c + r * Math.sin(ang(k))).toFixed(1)} A${r} ${r} 0 ${n * 360 / P > 180 ? 1 : 0} 1 ${(c + r * Math.cos(ang(k + n))).toFixed(1)} ${(c + r * Math.sin(ang(k + n))).toFixed(1)} Z`;
    function draw() {
      fillSvg.innerHTML = filled.map((f, k) => (f ? `<path d="${sector(k)}" fill="#f2b705" opacity=".9"/>` : '')).join('') +
        filled.map((_, k) => `<path d="M48 48 L${(48 + 44 * Math.cos(ang(k))).toFixed(1)} ${(48 + 44 * Math.sin(ang(k))).toFixed(1)}" stroke="#1d2540" stroke-width="1.5" stroke-dasharray="3 3"/>`).join('');
      body.querySelector('.frac-count b').textContent = filled.filter(Boolean).length;
    }
    draw();
    const sizeOf = (kind) => (kind === 'half' ? P / 2 : 1);
    function pieceSVG(kind) { // the piece on its own, cropped to its shape, at the size it has on the injera
      const n = sizeOf(kind), pts = [[48, 48]];
      for (let i = 0; i <= 24; i++) { const a = ang(0) + (i / 24) * n * 2 * Math.PI / P; pts.push([48 + 44 * Math.cos(a), 48 + 44 * Math.sin(a)]); }
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const x0 = Math.min(...xs) - 3, y0 = Math.min(...ys) - 3, w = Math.max(...xs) + 3 - x0, hh = Math.max(...ys) + 3 - y0;
      const k = 200 / 96; // same scale as the 200px injera
      return `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${hh.toFixed(1)}" width="${Math.round(w * k * 0.62)}" height="${Math.round(hh * k * 0.62)}" aria-hidden="true"><path d="${sector(0, n)}" fill="#e9dcc0" stroke="#b59a6a" stroke-width="3"/><circle cx="${(48 + 26 * Math.cos(ang(0) + n * Math.PI / P)).toFixed(1)}" cy="${(48 + 26 * Math.sin(ang(0) + n * Math.PI / P)).toFixed(1)}" r="2" fill="#c9b68e"/></svg>`;
    }
    function slotFor(kind) {
      const n = sizeOf(kind);
      for (let k = 0; k < P; k++) { let ok = true; for (let j = 0; j < n; j++) if (filled[(k + j) % P]) ok = false; if (ok) return Array.from({ length: n }, (_, j) => (k + j) % P); }
      return null;
    }
    ex.items.forEach((p) => { for (let i = 0; i < p.count; i++) {
      const el = h(`<span class="fpiece ${p.piece}" data-kind="${p.piece}" aria-label="${p.piece}">${pieceSVG(p.piece)}</span>`); pieces.appendChild(el);
      ACT.drag(el, { zones: () => [inj], drop: (z, e2) => {
        const size = sizeOf(p.piece), now = filled.filter(Boolean).length, s = slotFor(p.piece);
        if (!s || now + size > ex.answer) { api.wrong(); return false; }
        s.forEach((k) => { filled[k] = true; }); e2.remove(); draw(); pop(inj); api.progress(now + size);
        if (now + size === ex.answer) api.right();
        return 'keep-place';
      } });
    } });
    async function demo() {
      let need = ex.answer - filled.filter(Boolean).length;
      for (const el of [...pieces.querySelectorAll('.fpiece')]) {
        const size = sizeOf(el.dataset.kind); if (size > need) continue;
        const s = slotFor(el.dataset.kind); if (!s) continue;
        await flyTo(el, inj); s.forEach((k) => { filled[k] = true; }); el.remove(); draw(); need -= size; if (!need) break;
      }
    }
    return { demo, solve: () => demo().then(() => api.right()) };
  };

  // ---- tap to choose (numbers, words or pictures), read aloud ----
  function options(api, opts, onPick) {
    const wrap = h('<div class="opts"></div>');
    opts.forEach((o) => {
      const inner = o.visual ? visual(o.visual, { small: true }) + (o.am || o.en ? api.T(o.am || '', o.en || '') : '')
        : o.am || o.en ? api.T(o.am || o.label || '', o.en || o.label || '') : `<b dir="ltr">${esc(o.label != null ? o.label : o.v)}</b>`;
      const b = h(`<button type="button" class="opt" data-v="${esc(o.v)}">${inner}</button>`);
      b.addEventListener('click', () => onPick(o, b));
      wrap.appendChild(b);
    });
    return wrap;
  }
  function chooser(api, opts, answer) {
    let done = false;
    const el = options(api, opts, (o, b) => {
      if (done) return;
      if (typeof o.v === 'number' && o.v <= 1000) api.sayNum(o.v);
      if (String(o.v) === String(answer)) { done = true; b.classList.add('right'); pop(b); api.right(); }
      else { b.classList.add('nope'); b.disabled = true; api.wrong(); }
    });
    const demo = async () => { done = true; const b = el.querySelector(`[data-v="${CSS.escape(String(answer))}"]`); b.classList.add('right', 'pulse'); await wait(900); };
    return { el, demo, solve: () => { el.querySelector(`[data-v="${CSS.escape(String(answer))}"]`).click(); } };
  }
  TYPES.tap_choose = (api) => {
    const { ex, body } = api;
    if (ex.visual) body.insertAdjacentHTML('beforeend', visual(ex.visual));
    const c = chooser(api, ex.options, ex.answer); body.appendChild(c.el); return c;
  };
  TYPES.listen_choose = (api) => {
    const { ex, body } = api;
    const b = h(`<button type="button" class="big-listen" aria-label="Listen">🔊</button>`);
    b.addEventListener('click', () => { api.say(ex.say); pop(b); });
    body.appendChild(b);
    setTimeout(() => api.say(ex.say), 1900);
    const c = chooser(api, ex.options, ex.answer); body.appendChild(c.el); return c;
  };
  TYPES.tap_count = (api) => {
    const { ex, body } = api, n = ex.items.n;
    const field = h('<div class="tapfield"></div>');
    let count = 0;
    for (let i = 0; i < n; i++) {
      const b = h(`<button type="button" class="tapobj" aria-label="${i + 1}">${objSVG(ex.items.thing, i, 58)}<span class="badge"></span></button>`);
      b.style.setProperty('--r', ((i * 37) % 17 - 8) + 'deg');
      b.addEventListener('click', () => {
        if (b.classList.contains('lit')) return;
        count++; b.classList.add('lit'); b.querySelector('.badge').textContent = count; pop(b);
        api.progress(count); api.sayNum(count);
        if (count === n) c.el.classList.remove('dim');
      });
      field.appendChild(b);
    }
    body.appendChild(field);
    const c = chooser(api, ex.options, ex.answer); c.el.classList.add('dim'); body.appendChild(c.el);
    const demo = async () => { for (const b of [...field.querySelectorAll('.tapobj:not(.lit)')]) { b.click(); await wait(reduce() ? 0 : 320); } await c.demo(); };
    return { demo, solve: () => { field.querySelectorAll('.tapobj:not(.lit)').forEach((b) => b.click()); c.solve(); } };
  };

  // ---- number pad ----
  TYPES.numpad = (api) => {
    const { ex, body } = api;
    if (ex.visual) body.insertAdjacentHTML('beforeend', visual(ex.visual));
    body.insertAdjacentHTML('beforeend', `<output class="np-out" dir="ltr" aria-live="polite">&nbsp;</output><div class="np">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button type="button" class="np-k ${k === '✓' ? 'ok' : ''}" data-k="${k}" aria-label="${k === '⌫' ? 'Delete' : k === '✓' ? 'Check' : k}">${k}</button>`).join('')}</div>`);
    const out = body.querySelector('.np-out'); let v = ''; let done = false;
    const show = () => { out.textContent = v || ' '; };
    body.querySelector('.np').addEventListener('click', (e) => {
      const b = e.target.closest('.np-k'); if (!b || done) return;
      const k = b.dataset.k; LK.sfx && LK.sfx.tap && LK.sfx.tap();
      if (k === '⌫') v = v.slice(0, -1);
      else if (k === '✓') {
        if (!v) return;
        if (Number(v) === ex.answer) { done = true; out.classList.add('right'); api.right(); }
        else { out.classList.add('nope'); setTimeout(() => { out.classList.remove('nope'); v = ''; show(); }, 600); api.wrong(); }
        return;
      } else if (v.length < (ex.max_digits || 2)) v += k;
      show();
    });
    const demo = async () => { done = true; v = ''; for (const ch of String(ex.answer)) { v += ch; show(); await wait(350); } out.classList.add('right'); };
    return { demo, solve: () => { v = String(ex.answer); show(); body.querySelector('[data-k="✓"]').click(); } };
  };

  // ---- true / false swipe ----
  TYPES.true_false = (api) => {
    const { ex, body } = api;
    body.innerHTML = `<div class="tf-card" tabindex="0">${ex.visual ? visual(ex.visual) : ''}<p class="tf-s">${api.T(ex.statement_am, ex.statement_en)}</p><span class="tf-stamp"></span></div>
      <div class="tf-btns"><button type="button" class="tf-no" aria-label="Not true">✗</button><span class="tf-help">${api.T('← አይደለም · ልክ ነው →', '← not true · true →')}</span><button type="button" class="tf-yes" aria-label="True">✓</button></div>`;
    const card = body.querySelector('.tf-card'); let done = false;
    function answer(v) {
      if (done) return;
      card.style.transition = 'transform .3s'; card.style.transform = `translateX(${v ? 140 : -140}px) rotate(${v ? 12 : -12}deg)`;
      if (v === ex.answer) { done = true; card.classList.add('right'); card.querySelector('.tf-stamp').textContent = v ? '✓' : '✗'; setTimeout(() => { card.style.transform = ''; }, 400); api.right(); }
      else { setTimeout(() => { card.style.transform = ''; }, 380); api.wrong(); }
    }
    body.querySelector('.tf-yes').addEventListener('click', () => answer(true));
    body.querySelector('.tf-no').addEventListener('click', () => answer(false));
    let sx = null;
    card.addEventListener('pointerdown', (e) => { sx = e.clientX; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; });
    card.addEventListener('pointermove', (e) => { if (sx === null) return; const dx = e.clientX - sx; card.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`; card.classList.toggle('lean-yes', dx > 40); card.classList.toggle('lean-no', dx < -40); });
    card.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; card.classList.remove('lean-yes', 'lean-no'); if (Math.abs(dx) > 80) answer(dx > 0); else { card.style.transition = 'transform .25s'; card.style.transform = ''; } });
    card.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') answer(true); if (e.key === 'ArrowLeft') answer(false); });
    const demo = async () => { done = true; card.classList.add('right'); card.querySelector('.tf-stamp').textContent = ex.answer ? '✓' : '✗'; body.querySelector(ex.answer ? '.tf-yes' : '.tf-no').classList.add('pulse'); await wait(900); };
    return { demo, solve: () => answer(ex.answer) };
  };

  // ---- clock: drag the hands ----
  TYPES.clock = (api) => {
    const { ex, body } = api;
    let nums = ''; for (let k = 1; k <= 12; k++) { const a = (k * 30 - 90) * Math.PI / 180; nums += `<text x="${(100 + 76 * Math.cos(a)).toFixed(1)}" y="${(100 + 76 * Math.sin(a) + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="#1d2540" font-family="Noto Sans, sans-serif">${k}</text>`; }
    let marks = ''; for (let k = 0; k < 60; k++) { const a = k * 6 * Math.PI / 180, r1 = k % 5 ? 90 : 86; marks += `<path d="M${(100 + r1 * Math.sin(a)).toFixed(1)} ${(100 - r1 * Math.cos(a)).toFixed(1)} L${(100 + 94 * Math.sin(a)).toFixed(1)} ${(100 - 94 * Math.cos(a)).toFixed(1)}" stroke="#586178" stroke-width="${k % 5 ? 1 : 2.5}"/>`; }
    body.innerHTML = `<svg class="clock" viewBox="0 0 200 200" width="270" height="270" role="img" aria-label="clock"><circle cx="100" cy="100" r="97" fill="#fff" stroke="#1d2540" stroke-width="4"/>${marks}${nums}
      <g class="hand hour" data-h="hour"><path d="M100 100 L100 52" stroke="#1d2540" stroke-width="9" stroke-linecap="round"/><circle cx="100" cy="52" r="14" fill="transparent"/></g>
      <g class="hand minute" data-h="minute"><path d="M100 100 L100 22" stroke="#b8456e" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="24" r="16" fill="transparent"/></g>
      <circle cx="100" cy="100" r="7" fill="#1d2540"/></svg>
      <button type="button" class="btn adey ck">✓ ${api.T('እንፈትሽ', 'Check')}</button>`;
    const svg = body.querySelector('svg');
    const ang = { hour: 0, minute: 0 }; // degrees, 0 = 12 o'clock
    const setHand = (k) => body.querySelector(`.hand.${k}`).setAttribute('transform', `rotate(${ang[k]} 100 100)`);
    let active = null;
    const toAngle = (e) => { const r = svg.getBoundingClientRect(); const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; };
    body.querySelectorAll('.hand').forEach((g) => {
      g.style.cursor = 'grab'; g.style.touchAction = 'none';
      g.addEventListener('pointerdown', (e) => { active = g.dataset.h; g.setPointerCapture(e.pointerId); e.preventDefault(); });
      g.addEventListener('pointermove', (e) => { if (active !== g.dataset.h) return; const a = toAngle(e); ang[active] = active === 'minute' ? Math.round(a / 30) * 30 % 360 : Math.round(a / 15) * 15 % 360; setHand(active); });
      g.addEventListener('pointerup', () => { if (active) LK.sfx && LK.sfx.tap && LK.sfx.tap(); active = null; });
    });
    // tap on the face also moves the closest-fitting hand (helps small fingers)
    let done = false;
    body.querySelector('.ck').addEventListener('click', () => {
      if (done) return;
      const m = Math.round(ang.minute / 6) % 60, hourPos = ang.hour / 30; // 0–12
      const hOk = ex.answer.m === 30 ? Math.abs(hourPos - (ex.answer.h % 12 + 0.5)) <= 0.5 : Math.abs(((hourPos - ex.answer.h % 12) + 12) % 12) <= 0.25 || Math.abs(((ex.answer.h % 12 - hourPos) + 12) % 12) <= 0.25;
      if (m === ex.answer.m && hOk) { done = true; svg.classList.add('right'); api.right(); } else api.wrong();
    });
    const target = () => ({ minute: ex.answer.m * 6, hour: ((ex.answer.h % 12) + ex.answer.m / 60) * 30 });
    const demo = async () => { done = true; const t = target(); for (let i = 1; i <= 12; i++) { ang.minute = t.minute * i / 12; ang.hour = t.hour * i / 12; setHand('minute'); setHand('hour'); await wait(reduce() ? 0 : 50); } svg.classList.add('right'); };
    return { demo, solve: () => { const t = target(); ang.minute = t.minute; ang.hour = t.hour; setHand('minute'); setHand('hour'); body.querySelector('.ck').click(); } };
  };

  // ---- trace a number or word with a finger ----
  TYPES.trace = (api) => {
    const { ex, body } = api;
    const W = 320, H = 240;
    body.innerHTML = `<div class="trace"><canvas width="${W * 2}" height="${H * 2}" style="width:${W}px;height:${H}px" aria-label="tracing area"></canvas></div>
      <div class="trace-btns"><button type="button" class="btn ghost clr">↺ ${api.T('እንደገና', 'Again')}</button><button type="button" class="btn adey ck">✓ ${api.T('እንፈትሽ', 'Check')}</button></div>`;
    const cv = body.querySelector('canvas'), g = cv.getContext('2d');
    g.scale(2, 2);
    const font = ex.script === 'ethiopic' ? `700 120px "Noto Sans Ethiopic", sans-serif` : `800 ${ex.text.length > 1 ? 170 : 200}px "Andika", "Noto Sans", sans-serif`;
    // guide points: sample the inside of the letters
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d');
    o.font = font; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText(ex.text, W / 2, H / 2 + 8);
    const data = o.getImageData(0, 0, W, H).data, guide = [];
    for (let y = 0; y < H; y += 7) for (let x = 0; x < W; x += 7) if (data[(y * W + x) * 4 + 3] > 128) guide.push([x, y]);
    let strokes = [], cur = null, done = false;
    function paint() {
      g.clearRect(0, 0, W, H);
      g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(31,122,140,.13)'; g.fillText(ex.text, W / 2, H / 2 + 8);
      g.setLineDash([6, 8]); g.lineWidth = 2; g.strokeStyle = 'rgba(31,122,140,.6)'; g.strokeText(ex.text, W / 2, H / 2 + 8); g.setLineDash([]);
      if (guide.length) { g.fillStyle = '#b8456e'; g.beginPath(); g.arc(guide[0][0], guide[0][1], 8, 0, 6.3); g.fill(); }
      g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = done ? '#2f8f5b' : '#f2b705';
      strokes.forEach((s) => { g.beginPath(); s.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    }
    paint();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', (e) => { if (done) return; cv.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.push(cur); paint(); });
    cv.addEventListener('pointermove', (e) => { if (!cur) return; cur.push(pos(e)); paint(); });
    cv.addEventListener('pointerup', () => { cur = null; if (score().cover >= 0.62 && score().stray <= 0.4) finishTrace(); });
    function score() {
      const pts = strokes.flat(); if (!pts.length || !guide.length) return { cover: 0, stray: 1 };
      const near = (a, b, d) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 <= d * d;
      const cover = guide.filter((gp) => pts.some((p) => near(gp, p, 16))).length / guide.length;
      const stray = pts.filter((p) => !guide.some((gp) => near(gp, p, 18))).length / pts.length;
      return { cover, stray };
    }
    function finishTrace() { if (done) return; done = true; paint(); api.right(); }
    body.querySelector('.clr').addEventListener('click', () => { if (done) return; strokes = []; paint(); });
    body.querySelector('.ck').addEventListener('click', () => { const s = score(); if (s.cover >= 0.5 && s.stray <= 0.45) finishTrace(); else { api.wrong(); } });
    const demo = async () => {
      strokes = []; const pts = guide.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      for (let i = 0; i < pts.length; i += 3) { strokes.push([pts[i], [pts[i][0] + 1, pts[i][1] + 1]]); if (i % 30 === 0) { paint(); await wait(reduce() ? 0 : 30); } }
      done = true; paint();
    };
    return { demo, solve: () => { strokes = [guide.slice()]; finishTrace(); } };
  };

  // ---- speak (optional): record and replay for the grown-up ----
  TYPES.speak = (api) => {
    const { ex, body } = api;
    body.innerHTML = `<p class="say-word" lang="am">${esc(ex.say.am)}</p><button type="button" class="big-listen" aria-label="Listen">🔊</button>
      <div class="rec"><button type="button" class="mic" aria-label="Record">🎙️</button><audio controls hidden></audio></div>
      <p class="rec-msg muted"></p>`;
    body.querySelector('.big-listen').addEventListener('click', () => api.say(ex.say));
    const mic = body.querySelector('.mic'), audio = body.querySelector('audio'), m = body.querySelector('.rec-msg');
    mic.addEventListener('click', async () => {
      if (!navigator.mediaDevices || !G.MediaRecorder) { m.innerHTML = api.T('በዚህ መሣሪያ ላይ መቅዳት አይቻልም።', 'Recording is not available on this device.'); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream), chunks = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
          audio.src = URL.createObjectURL(blob); audio.hidden = false; mic.classList.remove('on');
          if (LK.recordings) LK.recordings.save(ex.id, blob, ex.say.am);
          api.right();
        };
        mic.classList.add('on'); rec.start(); setTimeout(() => rec.state !== 'inactive' && rec.stop(), 3000);
      } catch (err) { m.innerHTML = api.T('ማይክሮፎኑን መጠቀም አልተፈቀደም። መዝለል ይቻላል።', 'The microphone is not allowed. You can skip this.'); }
    });
    return { solve: () => api.right() };
  };

  // Simple recordings store (IndexedDB) for the grown-ups page.
  LK.recordings = {
    _db() {
      return new Promise((res, rej) => {
        if (!G.indexedDB) { rej(new Error('no idb')); return; }
        const r = indexedDB.open('lk-recordings', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('rec', { keyPath: 'id' });
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      });
    },
    async save(id, blob, word) { try { const db = await this._db(); db.transaction('rec', 'readwrite').objectStore('rec').put({ id, blob, word, at: Date.now() }); } catch (e) { /* storage off */ } },
    async list() { try { const db = await this._db(); return await new Promise((res) => { const q = db.transaction('rec').objectStore('rec').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); } catch (e) { return []; } }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
