/* Luminary Kids — lesson admin panel (/admin). Add, edit, reorder and preview exercises without code.
   Saves through the server (PUT /api/lessons/<id>, Bearer ADMIN_TOKEN). The live preview uses the
   same exercise components the children use. */
(function () {
  const LK = window.LK;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const root = document.getElementById('admin');
  const A = { token: sessionStorage.getItem('lk-admin') || '', index: null, lesson: null, id: null, dirty: false, edit: null, msg: '' };

  const api = async (method, url, body) => {
    const r = await fetch(url, { method, headers: Object.assign({ Authorization: 'Bearer ' + A.token }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  };

  // starter JSON for each exercise type (prompts, audio file name and answer are filled in by the editor)
  const TPL = {
    drag_drop_count: { items: { thing: 'orange', supply: 10, mode: 'add' }, targets: [{ id: 'basket', kind: 'basket', start: 0, need: 5 }], answer: 5 },
    drag_equation: { equation: ['3', '+', '__', '=', '7'], items: ['4', '3', '10'], targets: [{ id: 'blank' }], answer: '4' },
    drag_sort: { targets: [{ id: 'more', am: 'ከ5 ይበልጣል', en: 'More than 5' }, { id: 'less', am: 'ከ5 ያንሳል', en: 'Fewer than 5' }], items: [{ id: 'a', label: '7' }, { id: 'b', label: '2' }], answer: { a: 'more', b: 'less' } },
    drag_numberline: { line: { min: 0, max: 10, step: 1, labels: 'ends' }, items: ['3', '7'], answer: ['3', '7'] },
    drag_placevalue: { items: { rods: true, cubes: true }, targets: [{ id: 'mat' }], answer: 34, max_tens: 9 },
    drag_match_word: { items: [{ id: 'w0', label: 'አምስት', lang: 'am' }, { id: 'w1', label: 'ሶስት', lang: 'am' }], targets: [{ id: 't0', label: '5' }, { id: 't1', label: '3' }], answer: { w0: 't0', w1: 't1' } },
    drag_make_change: { price: 15, item: { am: 'ዳቦው', en: 'bread', pic: 'bread' }, items: [10, 5, 5, 1, 1], targets: [{ id: 'counter' }], answer: 15 },
    drag_fraction: { shape: 'injera', parts: 4, items: [{ piece: 'quarter', count: 4 }], targets: [{ id: 'injera', start: 0 }], answer: 2 },
    tap_choose: { options: [{ v: 4 }, { v: 5 }, { v: 6 }], answer: 5 },
    tap_count: { items: { thing: 'bean', n: 6 }, options: [{ v: 5 }, { v: 6 }, { v: 7 }], answer: 6 },
    numpad: { answer: 9, max_digits: 2 },
    listen_choose: { say: { am: 'ሰባት', en: 'seven', audio_url: 'audio/am/num.7.mp3' }, options: [{ v: 7 }, { v: 1 }, { v: 17 }], answer: 7 },
    true_false: { statement_am: 'ሶስት ሲደመር ሁለት አምስት ነው።', statement_en: 'Three plus two is five.', answer: true },
    clock: { answer: { h: 3, m: 30 } },
    trace: { text: '5', script: 'digits', answer: '5' },
    speak: { say: { am: 'አምስት', en: 'five', audio_url: 'audio/am/num.5.mp3' }, answer: 5, optional: true }
  };
  const TYPES = Object.keys(TPL);

  // quick checks so a broken exercise can't be saved (the full checks run in test/content.test.js)
  function problems(e) {
    const p = [];
    if (!TYPES.includes(e.type)) p.push('Unknown type.');
    if (!e.prompt_am) p.push('Amharic prompt is empty.');
    if (!('answer' in e)) p.push('No answer.');
    const opts = (e.options || []).map((o) => String(o.v));
    if (['tap_choose', 'listen_choose', 'tap_count'].includes(e.type) && !opts.includes(String(e.answer))) p.push('The answer is not one of the options.');
    if (e.type === 'drag_equation') {
      if (!e.equation.includes('__')) p.push('The equation needs an empty box: __');
      if (!e.items.map(String).includes(String(e.answer))) p.push('The answer tile is missing from the tiles.');
      const parts = e.equation.map((x) => (x === '__' ? String(e.answer) : x)), k = parts.indexOf('=');
      const ev = (t) => { let v = Number(t[0]); for (let i = 1; i < t.length; i += 2) { const n = Number(t[i + 1]); v = t[i] === '+' ? v + n : t[i] === '−' || t[i] === '-' ? v - n : t[i] === '×' ? v * n : NaN; } return v; };
      if (k < 1 || ev(parts.slice(0, k)) !== ev(parts.slice(k + 1))) p.push(`${parts.join(' ')} does not balance.`);
    }
    if (e.type === 'drag_make_change') {
      let sums = new Set([0]); e.items.forEach((v) => { sums = new Set([...sums, ...[...sums].map((s) => s + v)]); });
      if (!sums.has(e.price)) p.push(`The wallet cannot pay exactly ${e.price}.`);
    }
    if (e.type === 'drag_drop_count') {
      const needs = e.targets.map((t) => t.need); const a = Array.isArray(e.answer) ? e.answer : [e.answer];
      if (JSON.stringify(needs) !== JSON.stringify(a)) p.push('The answer must equal the target "need".');
    }
    if (e.type === 'drag_sort' || e.type === 'drag_match_word') (e.items || []).forEach((it) => { if (!e.targets.some((t) => t.id === e.answer[it.id])) p.push(`Card ${it.id} has no place to go.`); });
    if (e.type === 'drag_numberline') e.items.forEach((v) => { const n = Number(v); if (n < e.line.min || n > e.line.max || (n - e.line.min) % e.line.step) p.push(`${v} is not on the line.`); });
    return p;
  }

  // ---------- views ----------
  function render() {
    if (!A.token) { root.innerHTML = loginView(); return; }
    root.innerHTML = `<header class="adm-top"><b>Luminary Kids · Lesson editor</b><span class="grow"></span><a href="/" target="_blank">Open the app ↗</a><button class="btn alt small" data-a="logout">Sign out</button></header>
      <div class="adm"><nav class="adm-list">${(A.index ? A.index.lessons : []).map((l) => `<button class="${l.id === A.id ? 'on' : ''}" data-a="open" data-id="${l.id}">G${l.grade}·${l.n} ${esc(l.title.en)}<small lang="am">${esc(l.title.am)}</small></button>`).join('')}</nav>
      <main class="adm-main">${A.msg ? `<p class="panel" role="status">${A.msg}</p>` : ''}${A.lesson ? lessonView() : '<p class="muted">Choose a lesson.</p>'}</main></div>
      ${A.edit ? editorView() : ''}`;
    if (A.edit) paintPreview();
  }
  function loginView() {
    return `<main class="wrap play"><div class="section"><h1>Lesson editor</h1><p>Enter the admin password (the server's ADMIN_TOKEN).</p>
      <form data-f="login" class="formrow"><label for="tok">Password</label><input id="tok" type="password" autocomplete="current-password" required>${A.msg ? `<p style="color:var(--berry)">${esc(A.msg)}</p>` : ''}<div class="actions"><button class="btn">Sign in</button></div></form></div></main>`;
  }
  const row = (e, where, i, extra = '') => `<li class="adm-ex"><span class="tag ${e.type.startsWith('drag') ? 'lake' : 'plain'}">${esc(e.type)}</span><span class="grow"><span lang="am">${esc(e.prompt_am)}</span><small>${esc(e.prompt_en)} · answer: <code>${esc(JSON.stringify(e.answer))}</code>${problems(e).length ? ` · <b style="color:var(--berry)">⚠ ${esc(problems(e).join(' '))}</b>` : ''}</small></span>${extra}
    <button class="btn alt small" data-a="edit" data-w="${where}" data-i="${i}">Edit</button><button class="btn alt small" data-a="up" data-w="${where}" data-i="${i}" aria-label="Move up">↑</button><button class="btn alt small" data-a="del" data-w="${where}" data-i="${i}" aria-label="Delete">✕</button></li>`;
  function lessonView() {
    const L = A.lesson;
    const count = { drag: 0, other: new Set() };
    [...L.guided.map((s) => s.levels[0]), ...L.challenge].forEach((e) => { if (e.type.startsWith('drag')) count.drag++; else count.other.add(e.type); });
    L.video.checkpoints.forEach((c) => count.other.add(c.exercise.type));
    const ok = count.drag >= 6 && count.other.size >= 4 && L.challenge.length === 5;
    return `<div class="actions"><h1 class="grow">${esc(L.title.en)} <small lang="am">${esc(L.title.am)}</small></h1>
        <button class="btn adey" data-a="save" ${A.dirty ? '' : 'disabled'}>Save${A.dirty ? ' *' : ''}</button><button class="btn alt small" data-a="revert">Undo all edits to this lesson</button><button class="btn alt small" data-a="download">Download JSON</button></div>
      <p class="${ok ? 'muted' : ''}" ${ok ? '' : 'style="color:var(--berry)"'}>Design check: ${count.drag} drag-and-drop (need 6) · ${count.other.size} other types (need 4) · ${L.challenge.length} challenge questions (need 5).</p>
      <section><h2>Hook video checkpoints</h2><p class="muted">The video pauses at each time (seconds) and asks the question. Times come from the video's timeline; change them only if you re-cut the video.</p>
        <ul class="adm-ul">${L.video.checkpoints.map((c, i) => row(c.exercise, 'cp', i, `<label class="t">t=<input type="number" step="0.1" value="${c.t}" data-a="cpt" data-i="${i}"></label>`)).join('')}</ul></section>
      <section><h2>Guided practice</h2><p class="muted">Each slot has three levels. The app starts at level 1, moves up after 3 first-try answers and down after 2 misses.</p>
        ${L.guided.map((s, si) => `<h3>Slot ${s.slot}</h3><ul class="adm-ul">${s.levels.map((e, li) => row(e, `g${si}`, li, `<span class="tag adey">L${li + 1}</span>`)).join('')}</ul>`).join('')}</section>
      <section><h2>Extra (optional)</h2><ul class="adm-ul">${(L.extra || []).map((e, i) => row(e, 'extra', i)).join('')}</ul>${adder('extra')}</section>
      <section><h2>Mini-game: ${esc(L.play.game)}</h2><textarea class="json" data-a="game" rows="8">${esc(JSON.stringify(L.play, null, 2))}</textarea></section>
      <section><h2>Challenge</h2><ul class="adm-ul">${L.challenge.map((e, i) => row(e, 'ch', i)).join('')}</ul>${adder('ch')}</section>`;
  }
  const adder = (where) => `<div class="actions"><select data-add="${where}">${TYPES.map((t) => `<option>${t}</option>`).join('')}</select><button class="btn alt small" data-a="add" data-w="${where}">+ Add exercise</button></div>`;
  function editorView() {
    const e = A.edit.ex;
    return `<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in adm-edit">
      <div class="actions"><h2 class="grow">${esc(e.type)} · ${esc(e.id)}</h2><button class="btn alt small" data-a="close">Cancel</button><button class="btn adey small" data-a="apply">Apply</button></div>
      <div class="adm-cols"><div>
        <label>Amharic prompt<input data-k="prompt_am" value="${esc(e.prompt_am)}" lang="am"></label>
        <label>English prompt<input data-k="prompt_en" value="${esc(e.prompt_en)}"></label>
        <label>Audio file to record<input data-k="audio_url" value="${esc(e.audio_url)}"></label>
        <label>Everything else (JSON)<textarea class="json" data-k="json" rows="16">${esc(JSON.stringify(rest(e), null, 2))}</textarea></label>
        <p class="adm-prob" role="status"></p></div>
        <div><b>Preview</b><div class="adm-prev"></div></div></div></div></div>`;
  }
  const rest = (e) => { const o = Object.assign({}, e); ['id', 'type', 'prompt_am', 'prompt_en', 'audio_url'].forEach((k) => delete o[k]); return o; };
  function editorValue() {
    const box = $('.adm-edit'); const e = A.edit.ex;
    let more; try { more = JSON.parse($('[data-k="json"]', box).value); } catch (err) { return { err: 'The JSON is not valid: ' + err.message }; }
    return { ex: Object.assign({ id: e.id, type: e.type, prompt_am: $('[data-k="prompt_am"]', box).value, prompt_en: $('[data-k="prompt_en"]', box).value, audio_url: $('[data-k="audio_url"]', box).value }, more) };
  }
  function paintPreview() {
    const v = editorValue(), prob = $('.adm-prob'), prev = $('.adm-prev');
    if (v.err) { prob.textContent = v.err; return; }
    const p = problems(v.ex); prob.innerHTML = p.length ? `⚠ ${esc(p.join(' '))}` : '✓ Looks right.';
    try { LK.act.mount(prev, v.ex, { lang: 'am', showEn: true, autoSay: false, common: A.index.common, say: () => {}, done: () => { prob.innerHTML = '✓ Solved in the preview.'; } }); } catch (err) { prev.textContent = 'Preview failed: ' + err.message; }
  }

  // ---------- data helpers ----------
  function list(where) {
    const L = A.lesson;
    if (where === 'cp') return L.video.checkpoints;
    if (where === 'ch') return L.challenge;
    if (where === 'extra') return (L.extra = L.extra || []);
    return L.guided[Number(where.slice(1))].levels;
  }
  const getEx = (where, i) => (where === 'cp' ? list(where)[i].exercise : list(where)[i]);
  const setEx = (where, i, e) => { if (where === 'cp') list(where)[i].exercise = e; else list(where)[i] = e; };
  function newId() { let n = 1; const ids = new Set(); JSON.stringify(A.lesson, (k, v) => { if (k === 'id' && typeof v === 'string') ids.add(v); return v; }); while (ids.has(`${A.id}.c${n}`)) n++; return `${A.id}.c${n}`; }

  // ---------- events ----------
  root.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (e.target.dataset.f === 'login') {
      A.token = $('#tok').value;
      try { await api('GET', '/api/check'); sessionStorage.setItem('lk-admin', A.token); A.msg = ''; await loadIndex(); }
      catch (err) { A.token = ''; A.msg = err.message; }
      render();
    }
  });
  root.addEventListener('input', (e) => {
    if (e.target.closest('.adm-edit')) { clearTimeout(A.t); A.t = setTimeout(paintPreview, 350); return; }
    if (e.target.dataset.a === 'cpt') { A.lesson.video.checkpoints[e.target.dataset.i].t = Number(e.target.value); A.dirty = true; $('[data-a="save"]').disabled = false; }
    if (e.target.dataset.a === 'game') { try { A.lesson.play = JSON.parse(e.target.value); A.dirty = true; $('[data-a="save"]').disabled = false; e.target.style.outline = ''; } catch (err) { e.target.style.outline = '3px solid var(--berry)'; } }
  });
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
    const a = b.dataset.a, w = b.dataset.w, i = Number(b.dataset.i);
    try {
      if (a === 'logout') { sessionStorage.removeItem('lk-admin'); A.token = ''; A.lesson = null; render(); return; }
      if (a === 'open') { if (A.dirty && !confirm('Leave without saving?')) return; A.id = b.dataset.id; A.lesson = await api('GET', `/api/lessons/${A.id}`); A.dirty = false; A.msg = ''; render(); return; }
      if (a === 'edit') { A.edit = { where: w, i, ex: JSON.parse(JSON.stringify(getEx(w, i))) }; render(); return; }
      if (a === 'close') { A.edit = null; render(); return; }
      if (a === 'apply') { const v = editorValue(); if (v.err) return; setEx(A.edit.where, A.edit.i, v.ex); A.edit = null; A.dirty = true; render(); return; }
      if (a === 'del') { if (w === 'cp' || w.startsWith('g')) { alert('Checkpoints and guided slots keep their place; edit them instead.'); return; } list(w).splice(i, 1); A.dirty = true; render(); return; }
      if (a === 'up') { const L = list(w); if (i > 0) { [L[i - 1], L[i]] = [L[i], L[i - 1]]; A.dirty = true; render(); } return; }
      if (a === 'add') {
        const type = $(`[data-add="${w}"]`).value, id = newId();
        const ex = Object.assign({ id, type, prompt_am: 'አዲስ ጥያቄ', prompt_en: 'New question', audio_url: `audio/am/ex.${id.replace(/\./g, '-')}.mp3` }, JSON.parse(JSON.stringify(TPL[type])), { hints: [] });
        list(w).push(ex); A.dirty = true; A.edit = { where: w, i: list(w).length - 1, ex }; render(); return;
      }
      if (a === 'save') { await api('PUT', `/api/lessons/${A.id}`, A.lesson); A.dirty = false; A.msg = 'Saved. Children see the change the next time the lesson opens.'; render(); return; }
      if (a === 'revert') { if (!confirm('Undo every saved edit to this lesson and go back to the original?')) return; await api('DELETE', `/api/lessons/${A.id}`); A.lesson = await api('GET', `/api/lessons/${A.id}`); A.dirty = false; A.msg = 'Back to the original lesson.'; render(); return; }
      if (a === 'download') { const blob = new Blob([JSON.stringify(A.lesson, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = `${A.id}.json`; l.click(); URL.revokeObjectURL(u); }
    } catch (err) { A.msg = `⚠ ${esc(err.message)}`; render(); }
  });
  async function loadIndex() { const r = await fetch('/content/index.json', { cache: 'no-cache' }); A.index = await r.json(); }
  (async () => { if (A.token) { try { await api('GET', '/api/check'); await loadIndex(); } catch (e) { A.token = ''; A.msg = e.message; } } render(); })();
})();
