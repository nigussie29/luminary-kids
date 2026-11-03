/* Luminary Kids — the hands-on lesson player, adventure map, rewards and wardrobe.
   Lesson flow (content/lessons/<id>.json):
     1 hook video with 2 tap checkpoints · 2 guided practice (adaptive levels) · 3 mini-game
     4 five-question challenge · 5 celebration (stars, confetti, praise)
   Adaptive: 3 first-try answers in a row → harder level; 2 misses in a row → easier level and a short
   re-teach clip from the hook video. Progress lives on the learner (learner.adv). */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const ADV = (LK.adv = {});
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let APP = null; // hooks from app.js: { say, save, learner, go, render, lang, st, toast }

  // ---------------- content (inlined at build time, refreshed from the server when online) ----------------
  const C = { index: null, lessons: {} };
  function inlined() { return LK.content || { index: { lessons: [], common: {} }, lessons: {} }; }
  ADV.index = () => C.index || inlined().index;
  ADV.common = () => ADV.index().common || {};
  async function loadLesson(id) {
    if (C.lessons[id]) return C.lessons[id];
    let L = inlined().lessons[id];
    if (G.fetch && G.location && G.location.protocol !== 'file:') {
      try { const r = await fetch(`content/lessons/${id}.json`, { cache: 'no-cache' }); if (r.ok) L = await r.json(); } catch (e) { /* offline: use the copy inside the app */ }
    }
    C.lessons[id] = L; return L;
  }
  async function refreshIndex() {
    if (!G.fetch || !G.location || G.location.protocol === 'file:') return;
    try { const r = await fetch('content/index.json', { cache: 'no-cache' }); if (r.ok) C.index = await r.json(); } catch (e) { /* offline */ }
  }

  // ---------------- progress on the learner ----------------
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function P() {
    const L = APP.learner() || (APP.ensureLearner && APP.ensureLearner()); if (!L) return null;
    L.adv = L.adv || { lessons: {}, level: {}, streak: { last: null, days: 0, best: 0 }, badges: [], wardrobe: { owned: ['shirt'], wearing: { outfit: 'shirt' } }, log: [] };
    return L.adv;
  }
  const totalStars = (p) => Object.values(p.lessons).reduce((a, x) => a + (x.stars || 0), 0);

  // ---------------- wardrobe ----------------
  const CLOTHES = [
    { id: 'shirt', slot: 'outfit', stars: 0, am: 'ጥልፍ ሸሚዝ', en: 'Embroidered shirt' },
    { id: 'kemis', slot: 'outfit', stars: 3, am: 'የሀበሻ ቀሚስ', en: 'Habesha kemis' },
    { id: 'netela', slot: 'shawl', stars: 6, am: 'ነጠላ', en: 'Netela shawl' },
    { id: 'beads', slot: 'neck', stars: 9, am: 'የዶቃ ሐብል', en: 'Bead necklace' },
    { id: 'crown', slot: 'head', stars: 12, am: 'የአደይ አበባ ጉንጉን', en: 'Adey Abeba crown' },
    { id: 'gabi', slot: 'shawl', stars: 15, am: 'ጋቢ', en: 'Gabi wrap' },
    { id: 'kofia', slot: 'head', stars: 18, am: 'ኮፍያ', en: 'Embroidered cap' },
    { id: 'sandals', slot: 'feet', stars: 21, am: 'ጫማ', en: 'Sandals' },
    { id: 'suit', slot: 'outfit', stars: 27, am: 'የሀበሻ ልብስ', en: 'Habesha suit' },
    { id: 'masinko', slot: 'hand', stars: 33, am: 'ማሲንቆ', en: 'Masinko' },
    { id: 'kuta', slot: 'shawl', stars: 42, am: 'ኩታ', en: 'Kuta shawl' },
    { id: 'jantila', slot: 'hand', stars: 51, am: 'ጃንጥላ', en: 'Ceremonial umbrella' }
  ];
  ADV.clothes = CLOTHES;
  const SKIN = { selam: '#8d5a3b', dawit: '#6b4228', hana: '#a8714d', yonas: '#5e3a24' };
  function avatar(wearing, opts = {}) {
    const skin = SKIN[opts.kid] || '#8d5a3b', w = wearing || {};
    const tibeb = (y) => `<path d="M30 ${y} H90" stroke="#1f7a8c" stroke-width="3"/><path d="M30 ${y + 4} H90" stroke="#f2b705" stroke-width="2.4" stroke-dasharray="4 3"/><path d="M30 ${y + 8} H90" stroke="#2f8f5b" stroke-width="2"/>`;
    let body = '';
    if (w.outfit === 'kemis') body = `<path d="M40 70 Q60 62 80 70 L94 150 Q60 158 26 150 Z" fill="#fbf7ef" stroke="#d9cbb0" stroke-width="2"/>${tibeb(132)}<path d="M60 70 V108" stroke="#1f7a8c" stroke-width="3"/><path d="M60 72 V106" stroke="#f2b705" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    else if (w.outfit === 'suit') body = `<path d="M40 70 Q60 62 80 70 L84 116 L36 116 Z" fill="#fbf7ef" stroke="#d9cbb0" stroke-width="2"/><path d="M50 70 L60 90 L70 70" fill="none" stroke="#1f7a8c" stroke-width="3"/><rect x="40" y="114" width="16" height="36" rx="5" fill="#fbf7ef" stroke="#d9cbb0" stroke-width="2"/><rect x="64" y="114" width="16" height="36" rx="5" fill="#fbf7ef" stroke="#d9cbb0" stroke-width="2"/><path d="M40 140 h16 M64 140 h16" stroke="#1f7a8c" stroke-width="3"/>`;
    else body = `<path d="M40 70 Q60 62 80 70 L84 116 L36 116 Z" fill="#1f7a8c"/><path d="M52 70 L60 84 L68 70" fill="none" stroke="#f2b705" stroke-width="3"/><rect x="40" y="114" width="16" height="36" rx="5" fill="#2d3a5a"/><rect x="64" y="114" width="16" height="36" rx="5" fill="#2d3a5a"/>`;
    const arms = `<path d="M40 74 Q28 94 30 114" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M80 74 Q92 94 90 114" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>`;
    const legs = w.outfit === 'kemis' ? `<rect x="46" y="150" width="9" height="12" fill="${skin}"/><rect x="65" y="150" width="9" height="12" fill="${skin}"/>` : '';
    const feet = w.feet === 'sandals' ? '<path d="M40 162 h18 M62 162 h18" stroke="#7a4a22" stroke-width="6" stroke-linecap="round"/><path d="M49 156 v6 M71 156 v6" stroke="#b8456e" stroke-width="2.5"/>' : '<path d="M42 162 h15 M63 162 h15" stroke="#3b2a20" stroke-width="6" stroke-linecap="round"/>';
    const shawl = w.shawl === 'netela' ? `<path d="M34 72 Q60 92 86 72 L92 104 Q60 118 28 104 Z" fill="#fff" opacity=".93" stroke="#e6dccb"/><path d="M28 104 Q60 118 92 104" stroke="#2f8f5b" stroke-width="3" fill="none"/><path d="M29 100 Q60 114 91 100" stroke="#f2b705" stroke-width="2" fill="none" stroke-dasharray="4 3"/>`
      : w.shawl === 'gabi' ? '<path d="M32 70 Q60 86 88 70 L94 124 Q60 134 26 124 Z" fill="#f4efe3" stroke="#d2c6ae" stroke-width="2"/><path d="M26 124 Q60 134 94 124" stroke="#b8456e" stroke-width="3" fill="none"/>'
      : w.shawl === 'kuta' ? '<path d="M36 70 Q60 84 84 70 L88 96 Q60 108 32 96 Z" fill="#fff" opacity=".95" stroke="#e6dccb"/><path d="M32 96 Q60 108 88 96" stroke="#1f7a8c" stroke-width="4" fill="none"/><path d="M33 92 Q60 104 87 92" stroke="#b8456e" stroke-width="2" fill="none"/><path d="M34 88 Q60 100 86 88" stroke="#f2b705" stroke-width="2" fill="none" stroke-dasharray="3 3"/>' : '';
    const hand = w.hand === 'masinko' ? '<g transform="rotate(-18 92 112)"><path d="M92 126 L102 112 L92 98 L82 112 Z" fill="#a0672b" stroke="#5c3a12" stroke-width="2"/><path d="M84 112 h16" stroke="#f4efe3" stroke-width="3"/><rect x="90.5" y="58" width="3" height="42" fill="#5c3a12"/><path d="M92 60 V124" stroke="#f4efe3" stroke-width="1"/><path d="M78 92 Q94 84 104 70" stroke="#7a4a22" stroke-width="2" fill="none"/></g>'
      : w.hand === 'jantila' ? '<path d="M92 118 V52" stroke="#5c3a12" stroke-width="3"/><path d="M68 56 Q92 22 116 56 Z" fill="#b8456e" stroke="#7a2848" stroke-width="2"/><path d="M68 56 Q80 62 92 56 Q104 62 116 56" fill="none" stroke="#f2b705" stroke-width="3"/><circle cx="92" cy="33" r="3" fill="#f2b705"/>' : '';
    const neck = w.neck === 'beads' ? '<path d="M48 70 Q60 82 72 70" fill="none" stroke="#b8456e" stroke-width="4" stroke-dasharray="1 5" stroke-linecap="round"/>' : '';
    const face = `<circle cx="60" cy="44" r="22" fill="${skin}"/><circle cx="52" cy="44" r="2.8" fill="#2b1d14"/><circle cx="68" cy="44" r="2.8" fill="#2b1d14"/><path d="M52 53 Q60 59 68 53" stroke="#2b1d14" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="47" cy="51" r="3" fill="#e58f74" opacity=".45"/><circle cx="73" cy="51" r="3" fill="#e58f74" opacity=".45"/>`;
    const hair = '<path d="M38 42 Q38 18 60 18 Q82 18 82 42 Q76 28 60 28 Q44 28 38 42 Z" fill="#1d130d"/>';
    const head = w.head === 'crown' ? `<g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${42 + i * 9}" cy="${22 - (i === 2 ? 4 : i % 2 ? 2 : 0)}" r="5.5" fill="#f2b705" stroke="#c28f00"/>`).join('')}<path d="M40 25 Q60 16 80 25" stroke="#2f8f5b" stroke-width="3" fill="none"/></g>`
      : w.head === 'kofia' ? '<path d="M40 30 Q40 14 60 14 Q80 14 80 30 Z" fill="#fbf7ef" stroke="#d9cbb0" stroke-width="2"/><path d="M41 27 H79" stroke="#1f7a8c" stroke-width="3"/><path d="M42 23 H78" stroke="#f2b705" stroke-width="2" stroke-dasharray="3 3"/>' : '';
    return `<svg class="avatar" viewBox="0 0 120 170" width="${opts.size || 120}" height="${(opts.size || 120) * 170 / 120}" role="img" aria-label="avatar"><ellipse cx="60" cy="164" rx="34" ry="5" fill="#000" opacity=".08"/>${legs}${feet}${arms}${body}${shawl}${neck}${face}${hair}${head}${hand}</svg>`;
  }
  ADV.avatar = avatar;

  // ---------------- badges ----------------
  const BADGE_NAMES = {
    count10: ['የአበባ ቆጣሪ', 'Flower counter'], teens: ['የገበያ አስር', 'Market tens'], compare: ['ብልህ አወዳዳሪ', 'Clever comparer'],
    add10: ['የመደመር ጀግና', 'Addition hero'], sub10: ['የመቀነስ ጀግና', 'Subtraction hero'], make10: ['የአስር ጀግና', 'Ten hero'],
    g2_placevalue: ['የአስሮች ጌታ', 'Tens master'], g2_add2d: ['የቤተ መጽሐፍት ደማሪ', 'Library adder'], g2_sub2d: ['የገበያ ቀናሽ', 'Market subtractor'],
    g2_groups: ['የቡና ቡድን', 'Coffee groups'], g2_birr: ['የብር ቆጣሪ', 'Birr counter'], g2_halves: ['የእንጀራ አካፋይ', 'Injera sharer'],
    g3_hundreds: ['የመቶዎች ጌታ', 'Hundreds master'], g3_add3d: ['የብርቱካን ደማሪ', 'Orchard adder'], g3_sub3d: ['የትምህርት ቤት ቀናሽ', 'School subtractor'],
    g3_times: ['የማባዛት ጀግና', 'Times hero'], g3_share: ['ፍትሃዊ አካፋይ', 'Fair sharer'], g3_fractions: ['የክፍልፋይ ጌታ', 'Fraction master'],
    stars50: ['ሃምሳ ኮከቦች', '50 stars'], streak3: ['ሶስት ቀናት በተከታታይ', '3 days in a row'], streak7: ['አንድ ሳምንት በተከታታይ', '7 days in a row'], stars30: ['ሰላሳ ኮከቦች', '30 stars']
  };
  const BADGE_ICON = { streak3: '🔥', streak7: '🌟', stars30: '🏅', stars50: '🏆' };
  const PLACE_ICON = { garden: '🌼', market: '🍊', school: '☕', road: '🛺', tree: '🥭', meadow: '🌻', home: '🪵', library: '📚', ceremony: '🫖', shop: '💵', kitchen: '🫓',
    store: '📦', orchard: '🧺', schoolyard: '🏫', field: '🌱', village: '🏡', feast: '🎉' };
  const GRADES = [1, 2, 3], MAP_END = { 1: '🏔️', 2: '🏰', 3: '🌄' };

  // ---------------- home: adventure map ----------------
  ADV.homeHTML = function () {
    const p = P(); const lang = APP.lang(); const T = (am, en) => LK.act.T({ lang, showEn: APP.st().showEn }, am, en);
    const idx = ADV.index().lessons;
    // open on the first grade that still has a lesson to finish
    const grades = GRADES.filter((g) => idx.some((l) => l.grade === g));
    const grade = ADV.grade || grades.find((g) => idx.some((l) => l.grade === g && !(p.lessons[l.id] && p.lessons[l.id].done))) || grades[grades.length - 1];
    ADV.grade = grade;
    const list = idx.filter((l) => l.grade === grade);
    const unlocked = (i) => i === 0 || (p.lessons[list[i - 1].id] && p.lessons[list[i - 1].id].done) || (p.lessons[list[i].id] && p.lessons[list[i].id].done);
    const W = 340, rowH = 104;
    const pts = list.map((_, i) => ({ x: i % 2 ? W - 86 : 86, y: 64 + i * rowH }));
    let d = `M${pts[0].x} ${pts[0].y}`; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; d += ` C${a.x} ${a.y + 60} ${b.x} ${b.y - 60} ${b.x} ${b.y}`; }
    const firstOpen = list.findIndex((l, i) => unlocked(i) && !(p.lessons[l.id] && p.lessons[l.id].done));
    const places = list.map((l, i) => {
      const rec = p.lessons[l.id] || {}, open = unlocked(i), done = !!rec.done, cur = i === firstOpen;
      return `<button class="place ${done ? 'done' : ''} ${open ? '' : 'locked'} ${cur ? 'current' : ''}" style="left:${(pts[i].x / W) * 100}%;top:${pts[i].y}px" data-adv="lesson" data-id="${l.id}" ${open ? '' : 'aria-disabled="true"'} aria-label="${esc(l.title.en)}${done ? `, ${rec.stars} stars` : open ? '' : ', locked'}">
        <span class="place-icon" aria-hidden="true">${open ? PLACE_ICON[l.place] || '⭐' : '🔒'}</span>
        <span class="place-name">${T(l.title.am, l.title.en)}</span>
        <span class="place-stars" aria-hidden="true">${[1, 2, 3].map((s) => `<i class="${(rec.stars || 0) >= s ? 'on' : ''}">★</i>`).join('')}</span></button>`;
    }).join('');
    const stars = totalStars(p), next = CLOTHES.find((c) => c.stars > stars);
    const k = APP.active ? APP.active() : null;
    return `<section class="adv-home">
      <div class="adv-top">
        <button class="avatar-btn" data-adv="wardrobe" aria-label="Wardrobe">${avatar(p.wardrobe.wearing, { kid: k && k.avatar, size: 84 })}<span>👗</span></button>
        <div class="adv-stats"><span class="stat"><b class="tnum">${stars}</b> ★ ${T('ኮከቦች', 'stars')}</span><span class="stat streak ${p.streak.last === today() ? 'lit' : ''}"><b class="tnum">${p.streak.days}</b> 🔥 ${T('ተከታታይ ቀናት', 'day streak')}</span>
          ${next ? `<span class="stat small">${T(`${next.am} በ${next.stars} ★`, `${next.en} at ${next.stars} ★`)}</span>` : ''}</div>
      </div>
      <div class="grade-tabs" role="tablist">${grades.map((g) => `<button role="tab" aria-selected="${g === grade}" data-adv="grade" data-g="${g}">${T(`${g}ኛ ክፍል`, `Grade ${g}`)}</button>`).join('')}</div>
      <div class="adv-map" style="height:${pts.length * rowH + 30}px"><svg class="trail" viewBox="0 0 ${W} ${pts.length * rowH + 30}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="#d9b27c" stroke-width="16" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 9"/></svg>${places}
        <span class="map-end" style="left:${(pts[pts.length - 1].x / W) * 100}%;top:${pts[pts.length - 1].y + 70}px" aria-hidden="true">${MAP_END[grade] || '🏰'}</span></div>
      ${p.badges.length ? `<div class="badges"><b>${T('ሽልማቶች', 'Badges')}</b><div class="row">${p.badges.map((b) => `<span class="badge-chip" title="${esc((BADGE_NAMES[b] || [b, b])[1])}">${BADGE_ICON[b] || PLACE_ICON[(ADV.index().lessons.find((l) => l.id === b) || {}).place] || '⭐'}<small>${T(...(BADGE_NAMES[b] || [b, b]))}</small></span>`).join('')}</div></div>` : ''}
    </section>`;
  };

  ADV.wardrobeHTML = function () {
    const p = P(), lang = APP.lang(), T = (am, en) => LK.act.T({ lang, showEn: APP.st().showEn }, am, en);
    const stars = totalStars(p), k = APP.active ? APP.active() : null;
    return `<main class="wrap play adv-wardrobe"><div class="actions"><button class="btn alt small" data-adv="home">← ${T('ተመለስ', 'Back')}</button></div>
      <div class="ward"><div class="ward-avatar">${avatar(p.wardrobe.wearing, { kid: k && k.avatar, size: 160 })}</div>
      <div class="ward-items">${CLOTHES.map((c) => {
        const own = stars >= c.stars, wearing = p.wardrobe.wearing[c.slot] === c.id;
        return `<button class="ward-item ${own ? '' : 'locked'} ${wearing ? 'on' : ''}" data-adv="wear" data-id="${c.id}" ${own ? '' : 'disabled'}>
          ${avatar(Object.assign({}, c.slot === 'outfit' ? {} : { outfit: 'shirt' }, { [c.slot]: c.id }), { size: 54 })}
          <span>${T(c.am, c.en)}</span><small>${own ? (wearing ? T('ለብሰሻል/ለብሰሃል', 'Wearing') : T('ልበስ', 'Wear')) : `🔒 ${c.stars} ★`}</small></button>`;
      }).join('')}</div></div></main>`;
  };

  // ---------------- the lesson player ----------------
  ADV.state = null;
  ADV.start = async function (id, opts = {}) {
    const L = await loadLesson(id);
    if (!L) { APP.toast('This lesson is not available yet.'); return; }
    const p = P(); const lvl = (p.level[id] || 1);
    const steps = [{ k: 'intro' }, { k: 'video' }];
    L.guided.forEach((s, i) => steps.push({ k: 'ex', src: 'guided', i }));
    (L.extra || []).forEach((e, i) => steps.push({ k: 'ex', src: 'extra', i }));
    steps.push({ k: 'game' });
    L.challenge.forEach((e, i) => steps.push({ k: 'ex', src: 'challenge', i }));
    steps.push({ k: 'celebrate' });
    ADV.state = { id, L, steps, i: opts.at || 0, level: lvl, rightRun: 0, missRun: 0, results: [], challenge: [], game: null, started: Date.now(), cp: {} };
    APP.go('adv');
  };
  const S = () => ADV.state;
  function ctx() {
    const lang = APP.lang(), st = APP.st();
    return { lang, showEn: st.showEn, timer: !!st.timers, common: ADV.common(), say: sayLine, done: onDone };
  }
  function sayLine(line) {
    if (!line) return;
    const key = line.audio_url ? line.audio_url.split('/').pop().replace(/\.[a-z0-9]+$/i, '') : null;
    APP.say({ am: line.am, en: line.en, keys: key ? [key] : [] });
  }
  ADV.say = sayLine;

  ADV.view = function () {
    const s = S(); if (!s) return '<main class="wrap play"></main>';
    const total = s.steps.length - 2;
    const dots = s.steps.slice(1, -1).map((st, i) => `<i class="${i + 1 < s.i ? 'on' : i + 1 === s.i ? 'cur' : ''} k-${st.k}"></i>`).join('');
    return `<main class="wrap play adv-lesson"><div class="adv-bar"><button class="btn alt small" data-adv="exit" aria-label="Back to the map">✕</button><div class="dots" aria-label="step ${s.i} of ${total}">${dots}</div><span class="lvl" title="level">${'●'.repeat(s.level)}${'○'.repeat(3 - s.level)}</span></div><div id="adv-stage"></div></main>`;
  };

  ADV.paint = function () {
    const s = S(); const stage = document.getElementById('adv-stage'); if (!s || !stage) return;
    const step = s.steps[s.i], c = ctx(), T = (am, en) => LK.act.T(c, am, en);
    if (step.k === 'intro') {
      const k = APP.active ? APP.active() : null, p = P();
      stage.innerHTML = `<section class="adv-intro"><span class="place-big" aria-hidden="true">${PLACE_ICON[s.L.place] || '⭐'}</span>
        <span class="eyebrow">${T(`${s.L.grade}ኛ ክፍል · ትምህርት ${s.L.n}`, `Grade ${s.L.grade} · Lesson ${s.L.n}`)}</span><h1>${T(s.L.title.am, s.L.title.en)}</h1>
        <div class="intro-av">${avatar(p.wardrobe.wearing, { kid: k && k.avatar, size: 110 })}${LK.art.wali ? LK.art.wali('welcome', 'Wali') : ''}</div>
        <button class="btn adey big" data-adv="next">▶ ${T('እንጀምር', "Let's start")}</button></section>`;
      sayLine(s.L.title);
      return;
    }
    if (step.k === 'video') { paintVideo(stage, s, c); return; }
    if (step.k === 'ex') {
      const ex = exerciseFor(step);
      const m = LK.act.mount(stage, ex, c);
      stage.firstElementChild.dataset.src = step.src;
      return m;
    }
    if (step.k === 'game') { LK.games.mount(stage, s.L.play, Object.assign(c, { done: onGameDone })); return; }
    if (step.k === 'celebrate') { paintCelebrate(stage, s, c); }
  };
  function exerciseFor(step) {
    const s = S();
    if (step.src === 'guided') return s.L.guided[step.i].levels[s.level - 1];
    if (step.src === 'extra') return s.L.extra[step.i];
    return s.L.challenge[step.i];
  }

  // ---- video with checkpoints, captions, replay, low-bandwidth fallback ----
  function slowNet() { const n = navigator.connection; return !!(n && (n.saveData || /(^|-)2g$|^3g$/.test(n.effectiveType || ''))); }
  function paintVideo(stage, s, c) {
    const T = (am, en) => LK.act.T(c, am, en), v = s.L.video, common = c.common;
    const low = slowNet() || APP.st().lowVideo;
    stage.innerHTML = `<section class="adv-video">
      <div class="vwrap"><video playsinline preload="auto" poster="${esc(v.poster)}" src="${esc(low ? v.src_low : v.src)}" crossorigin="anonymous">
        <track kind="captions" srclang="am" label="አማርኛ" src="${esc(v.captions.am)}">
        <track kind="subtitles" srclang="en" label="English" src="${esc(v.captions.en)}"></video>
        <button class="vplay" aria-label="Play">▶</button></div>
      <div class="cp-layer" hidden></div>
      <div class="vctrl"><button class="btn alt small replay">↺ ${T(common.replay.am, common.replay.en)}</button>
        <button class="btn alt small subs" aria-pressed="false">EN</button><span class="grow"></span>
        <button class="btn adey small vnext" hidden>${T('ቀጣይ', 'Next')} →</button></div>
      <p class="vnote muted" hidden></p></section>`;
    const vid = stage.querySelector('video'), playBtn = stage.querySelector('.vplay'), layer = stage.querySelector('.cp-layer'), next = stage.querySelector('.vnext');
    const cps = v.checkpoints.filter((cp) => cp.t != null);
    let pausedAt = null, switched = low;
    vid.addEventListener('loadedmetadata', () => { [...vid.textTracks].forEach((t) => { t.mode = t.language === 'en' ? 'disabled' : 'hidden'; }); });
    const play = () => { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => { playBtn.hidden = false; }); playBtn.hidden = true; };
    playBtn.addEventListener('click', () => { LK.sfx && LK.sfx.unlock && LK.sfx.unlock(); play(); });
    vid.addEventListener('pause', () => { if (!vid.ended && pausedAt === null) playBtn.hidden = false; });
    vid.addEventListener('play', () => { playBtn.hidden = true; });
    vid.addEventListener('timeupdate', () => {
      for (const cp of cps) {
        if (!s.cp[cp.at] && vid.currentTime >= cp.t && vid.currentTime < cp.t + 1.5) { checkpoint(cp); break; }
      }
    });
    vid.addEventListener('ended', () => { cps.forEach((cp) => { if (!s.cp[cp.at]) checkpoint(cp); }); if (cps.every((cp) => s.cp[cp.at])) next.hidden = false; });
    function checkpoint(cp) {
      if (pausedAt !== null) return;
      pausedAt = cp.at; vid.pause(); layer.hidden = false;
      LK.act.mount(layer, cp.exercise, Object.assign({}, c, { done: (r) => {
        s.cp[cp.at] = true; record(cp.exercise, r, 'checkpoint'); layer.hidden = true; layer.innerHTML = ''; pausedAt = null;
        if (vid.ended || vid.currentTime >= (v.duration || vid.duration) - 0.3) next.hidden = false; else play();
      } }));
    }
    stage.querySelector('.replay').addEventListener('click', () => {
      const back = [...cps].reverse().find((cp) => cp.t < vid.currentTime - 0.5);
      vid.currentTime = back ? Math.max(0, back.t - 4) : 0; play();
    });
    const subs = stage.querySelector('.subs');
    subs.addEventListener('click', () => { const on = subs.getAttribute('aria-pressed') !== 'true'; subs.setAttribute('aria-pressed', String(on)); [...vid.textTracks].forEach((t) => { if (t.language === 'en') t.mode = on ? 'showing' : 'disabled'; }); });
    next.addEventListener('click', () => ADV.next());
    // slow connection: switch to the small video if the big one stalls; if nothing plays, carry on without it
    let stallTimer = null;
    vid.addEventListener('waiting', () => { clearTimeout(stallTimer); stallTimer = setTimeout(() => { if (!switched && vid.readyState < 3) { switched = true; const t = vid.currentTime; vid.src = v.src_low; vid.currentTime = t; play(); } }, 4000); });
    vid.addEventListener('playing', () => clearTimeout(stallTimer));
    vid.addEventListener('error', () => {
      if (!switched) { switched = true; vid.src = v.src_low; return; }
      const note = stage.querySelector('.vnote'); note.hidden = false; note.innerHTML = T('ቪዲዮው አሁን ሊጫን አልቻለም፤ ጥያቄዎቹን እንመልስ።', "The video can't load right now — let's answer its questions.");
      let k = 0; const go = () => { if (k >= cps.length) { next.hidden = false; return; } const cp = cps[k++]; layer.hidden = false; LK.act.mount(layer, cp.exercise, Object.assign({}, c, { done: (r) => { s.cp[cp.at] = true; record(cp.exercise, r, 'checkpoint'); layer.innerHTML = ''; layer.hidden = true; go(); } })); };
      go();
    });
    ADV._video = vid;
    setTimeout(play, 300);
  }

  // re-teach: replay the explaining part of the hook video in a sheet over the lesson
  function reteach() {
    const s = S(), c = ctx(), v = s.L.video, T = (am, en) => LK.act.T(c, am, en);
    if (v.reteach.start == null) return Promise.resolve();
    return new Promise((resolve) => {
      const sheet = h(`<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in"><h2>${T(c.common.reteach.am, c.common.reteach.en)}</h2>
        <video playsinline preload="auto" src="${esc(slowNet() ? v.src_low : v.src)}#t=${v.reteach.start},${v.reteach.end}"></video>
        <button class="btn adey">${T('ቀጣይ', 'Continue')} →</button></div></div>`);
      document.body.appendChild(sheet);
      const vid = sheet.querySelector('video');
      sayLine(c.common.reteach);
      vid.addEventListener('loadedmetadata', () => { vid.currentTime = v.reteach.start; setTimeout(() => { const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {}); }, 1200); });
      vid.addEventListener('timeupdate', () => { if (vid.currentTime >= v.reteach.end) vid.pause(); });
      vid.addEventListener('error', () => close());
      const close = () => { vid.pause(); sheet.remove(); resolve(); };
      sheet.querySelector('button').addEventListener('click', close);
      sheet.querySelector('button').focus();
    });
  }

  // ---- results, adaptivity ----
  function record(ex, r, src) {
    const s = S();
    s.results.push({ id: ex.id, type: ex.type, src, correct: !!r.correct, tries: r.tries || 0, shown: !!r.shown, level: s.level, at: Date.now() });
  }
  async function onDone(r) {
    const s = S(); if (!s) return;
    const step = s.steps[s.i];
    const ex = exerciseFor(step);
    record(ex, r, step.src);
    if (step.src === 'challenge') s.challenge.push(!!r.correct);
    if (step.src === 'guided' && !r.skipped) {
      if (r.correct) { s.missRun = 0; s.rightRun++; if (s.rightRun >= 3 && s.level < 3) { s.level++; s.rightRun = 0; APP.toast(c2('ጎበዝ! ደረጃው ከፍ አለ ⬆', 'Great! Level up ⬆')); } }
      else { s.rightRun = 0; s.missRun++; if (s.missRun >= 2) { s.missRun = 0; if (s.level > 1) s.level--; await reteach(); } }
    }
    ADV.next();
  }
  function c2(am, en) { return APP.lang() === 'en' ? en : am; }
  function onGameDone(stats) { S().game = stats; S().results.push({ id: S().id + '.game', type: 'game', src: 'game', correct: stats.firstTry === stats.rounds, rounds: stats.rounds, firstTry: stats.firstTry }); ADV.next(); }
  ADV.next = function () {
    const s = S(); if (!s) return;
    if (ADV._video) { try { ADV._video.pause(); } catch (e) { /* ignore */ } ADV._video = null; }
    s.i = Math.min(s.i + 1, s.steps.length - 1);
    APP.go('adv');
    const top = document.querySelector('.adv-lesson'); if (top) top.scrollIntoView({ block: 'start' });
  };

  // ---- celebration: stars, confetti, praise; streak, badges, wardrobe ----
  function finish(s) {
    const p = P();
    const right = s.challenge.filter(Boolean).length;
    const stars = right >= 5 ? 3 : right >= 3 ? 2 : 1;
    const before = totalStars(p);
    const rec = p.lessons[s.id] || { stars: 0, plays: 0 };
    rec.stars = Math.max(rec.stars || 0, stars); rec.done = true; rec.plays = (rec.plays || 0) + 1; rec.last = Date.now(); rec.lastStars = stars;
    rec.firstTry = s.results.filter((r) => r.src !== 'game' && r.correct).length; rec.total = s.results.filter((r) => r.src !== 'game').length;
    p.lessons[s.id] = rec;
    p.level[s.id] = s.level;
    const L = APP.learner(); L.stars = (L.stars || 0) + Math.max(0, totalStars(p) - before);
    // daily streak
    const t = today();
    if (p.streak.last !== t) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yest = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      p.streak.days = p.streak.last === yest ? p.streak.days + 1 : 1; p.streak.last = t; p.streak.best = Math.max(p.streak.best || 0, p.streak.days);
    }
    const newBadges = [];
    const add = (b) => { if (!p.badges.includes(b)) { p.badges.push(b); newBadges.push(b); } };
    add(s.id);
    if (p.streak.days >= 3) add('streak3');
    if (p.streak.days >= 7) add('streak7');
    if (totalStars(p) >= 30) add('stars30');
    if (totalStars(p) >= 50) add('stars50');
    const unlocked = CLOTHES.filter((c) => c.stars > before && c.stars <= totalStars(p));
    unlocked.forEach((c) => { if (!p.wardrobe.owned.includes(c.id)) p.wardrobe.owned.push(c.id); });
    p.log.push({ id: s.id, at: Date.now(), stars, mins: Math.round((Date.now() - s.started) / 6e4), level: s.level, firstTry: rec.firstTry, total: rec.total });
    if (p.log.length > 200) p.log.splice(0, p.log.length - 200);
    APP.save();
    return { stars, newBadges, unlocked };
  }
  function paintCelebrate(stage, s, c) {
    const T = (am, en) => LK.act.T(c, am, en);
    if (!s.final) s.final = finish(s);
    const f = s.final, p = P();
    stage.innerHTML = `<section class="celebrate"><canvas class="confetti" aria-hidden="true"></canvas>
      <h1>${T(c.common.celebrate.am, c.common.celebrate.en)}</h1>
      <div class="big-stars" aria-label="${f.stars} stars">${[1, 2, 3].map((k) => `<span class="${k <= f.stars ? 'on' : ''}" style="--d:${k * 0.25}s">★</span>`).join('')}</div>
      <p class="streak-line">🔥 ${T(c.common.streak.am, c.common.streak.en)} <b class="tnum">${p.streak.days}</b></p>
      ${f.newBadges.length ? `<div class="new-badges">${f.newBadges.map((b) => `<span class="badge-chip big">${BADGE_ICON[b] || PLACE_ICON[s.L.place] || '⭐'}<small>${T(...(BADGE_NAMES[b] || [b, b]))}</small></span>`).join('')}</div>` : ''}
      ${f.unlocked.length ? `<div class="unlocked"><b>${T(c.common.unlocked.am, c.common.unlocked.en)}</b>${f.unlocked.map((cl) => `<span>${avatar({ [cl.slot]: cl.id, outfit: cl.slot === 'outfit' ? cl.id : 'shirt' }, { size: 64 })}${T(cl.am, cl.en)}</span>`).join('')}</div>` : ''}
      <div class="actions center"><button class="btn adey" data-adv="home">🗺️ ${T('ወደ ካርታው', 'Back to the map')}</button><button class="btn alt" data-adv="again">↺ ${T('እንደገና', 'Play again')}</button></div></section>`;
    LK.sfx && LK.sfx.badge && LK.sfx.badge();
    sayLine(c.common.celebrate);
    setTimeout(() => sayLine(c.common.praise[f.stars >= 3 ? 1 : 0]), 2600);
    confetti(stage.querySelector('.confetti'));
  }
  function confetti(cv) {
    if (!cv || document.documentElement.classList.contains('reduce')) return;
    const r = cv.parentElement.getBoundingClientRect(); cv.width = r.width; cv.height = Math.max(r.height, 420);
    const g = cv.getContext('2d'), cols = ['#f2b705', '#1f7a8c', '#2f8f5b', '#b8456e', '#7a5bb5'];
    const bits = Array.from({ length: 110 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, s: 5 + Math.random() * 6, a: Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    const t0 = performance.now();
    (function frame(t) {
      g.clearRect(0, 0, cv.width, cv.height);
      bits.forEach((b) => { b.x += b.vx; b.y += b.vy; b.a += 0.1; g.save(); g.translate(b.x, b.y); g.rotate(b.a); g.fillStyle = b.c; g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); g.restore(); });
      if (t - t0 < 4200 && cv.isConnected) requestAnimationFrame(frame); else g.clearRect(0, 0, cv.width, cv.height);
    })(t0);
  }

  // ---------------- grown-ups page section ----------------
  ADV.parentHTML = function (profile) {
    const s = APP.st();
    let rows = '<p class="muted">No lessons played yet.</p>';
    const p = profile && profile.learner.adv;
    if (p && Object.keys(p.lessons).length) {
      rows = `<div class="tablewrap"><table><thead><tr><th>Lesson</th><th>Stars</th><th>Right first try</th><th>Level</th><th>Played</th></tr></thead><tbody>${ADV.index().lessons.filter((l) => p.lessons[l.id]).map((l) => {
        const r = p.lessons[l.id]; return `<tr><td>G${l.grade}·${l.n} ${esc(l.title.en)}<span class="en-sub am" lang="am">${esc(l.title.am)}</span></td><td>${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</td><td class="tnum">${r.firstTry} of ${r.total}</td><td class="tnum">${p.level[l.id] || 1} of 3</td><td class="tnum">${r.plays}×</td></tr>`;
      }).join('')}</tbody></table></div>
      <p>Day streak: <b>${p.streak.days}</b> (best ${p.streak.best || p.streak.days}) · Total stars: <b>${totalStars(p)}</b> · Badges: <b>${p.badges.length}</b></p>`;
    }
    return `<div class="section"><h2 style="font-size:1.3rem">Hands-on lessons</h2>${rows}
      <h3 style="margin-top:14px">Your child's voice</h3><div class="recs"><p class="muted">Recordings from the speaking exercises appear here.</p></div>
      <h3 style="margin-top:14px">Lesson settings</h3>
      <label class="toggle"><input type="checkbox" data-set="timers" ${s.timers ? 'checked' : ''}> Game timers (off by default; better for older children)</label>
      <label class="toggle"><input type="checkbox" data-set="lowVideo" ${s.lowVideo ? 'checked' : ''}> Always use small videos (saves data)</label>
      <h3 style="margin-top:14px">Offline</h3><p>Download every lesson video and narration clip so lessons work without internet.</p>
      <div class="actions"><button class="btn alt small" data-adv="offline">Download all lessons</button><span class="offline-status muted"></span></div></div>`;
  };
  ADV.paintParents = async function () {
    const box = document.querySelector('.recs'); if (!box) return;
    const recs = await LK.recordings.list(); if (!recs.length) return;
    box.innerHTML = recs.sort((a, b) => b.at - a.at).map((r) => `<div class="rec-row"><span lang="am">${esc(r.word)}</span><audio controls src="${URL.createObjectURL(r.blob)}"></audio><small class="muted">${new Date(r.at).toLocaleDateString()}</small></div>`).join('');
  };

  // ---------------- offline (service worker) ----------------
  function swOK() { return 'serviceWorker' in navigator && G.location && /^https?:$/.test(G.location.protocol); }
  ADV.registerSW = function () {
    if (!swOK()) return;
    navigator.serviceWorker.register('sw.js').catch(() => {});
  };
  function lessonFiles(L) {
    const files = new Set([L.video.poster, L.video.captions.am, L.video.captions.en, slowNet() || APP.st().lowVideo ? L.video.src_low : L.video.src, `content/lessons/${L.id}.json`]);
    const walk = (o) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'audio_url' && v) files.add(v); else walk(v); } };
    walk(L);
    // only audio files that exist on the server
    const have = LK.narr && LK.narr.clips ? new Set(Object.values(LK.narr.clips)) : null;
    return [...files].filter((f) => !/^audio\//.test(f) || !have || [...have].some((u) => u.replace(/\.[a-z0-9]+$/, '') === f.replace(/\.[a-z0-9]+$/, '')))
      .map((f) => (/^audio\//.test(f) && have ? [...have].find((u) => u.replace(/\.[a-z0-9]+$/, '') === f.replace(/\.[a-z0-9]+$/, '')) : f));
  }
  async function cacheFiles(files, onProgress) {
    if (!('caches' in G)) return 0;
    const cache = await caches.open('lk-media-v1'); let n = 0;
    for (const f of files) { try { if (!(await cache.match(f))) { const r = await fetch(f); if (r.ok) await cache.put(f, r); } } catch (e) { /* skip */ } n++; if (onProgress) onProgress(n, files.length); }
    return n;
  }
  // quietly pre-cache the next lesson's video and clips (not on metered / slow connections)
  ADV.precacheNext = async function () {
    if (!swOK() || slowNet() || !navigator.onLine) return;
    const p = P(); if (!p) return;
    const next = ADV.index().lessons.find((l) => !(p.lessons[l.id] && p.lessons[l.id].done));
    if (!next) return;
    const L = await loadLesson(next.id); if (L) cacheFiles(lessonFiles(L));
  };
  async function downloadAll(statusEl) {
    if (!swOK()) { statusEl.textContent = 'Offline download needs the app to be opened from its web address.'; return; }
    const all = [];
    for (const l of ADV.index().lessons) { const L = await loadLesson(l.id); if (L) all.push(...lessonFiles(L)); }
    const files = [...new Set(all)];
    await cacheFiles(files, (n, t) => { statusEl.textContent = `Downloading ${n} of ${t}…`; });
    statusEl.textContent = `Done — ${files.length} files saved on this device.`;
  }

  // ---------------- wiring ----------------
  ADV.init = function (app) {
    APP = app;
    refreshIndex();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-adv]'); if (!b) return;
      const a = b.dataset.adv;
      if (a === 'lesson') { if (b.getAttribute('aria-disabled') === 'true') { APP.toast(c2('መጀመሪያ ያለፈውን ቦታ እንጨርስ።', 'Finish the place before it first.')); return; } LK.sfx && LK.sfx.unlock && LK.sfx.unlock(); ADV.start(b.dataset.id); return; }
      if (a === 'grade') { ADV.grade = Number(b.dataset.g); APP.render(); return; }
      if (a === 'next') { LK.sfx && LK.sfx.unlock && LK.sfx.unlock(); ADV.next(); return; }
      if (a === 'exit' || a === 'home') { if (ADV._video) ADV._video.pause(); ADV.state = null; APP.go(APP.learner() && !APP.isGuest() ? 'home' : APP.homeOrLanding()); ADV.precacheNext(); return; }
      if (a === 'again') { const id = S().id; ADV.start(id); return; }
      if (a === 'wardrobe') { APP.go('adv-wardrobe'); return; }
      if (a === 'wear') { const c = CLOTHES.find((x) => x.id === b.dataset.id); const p = P(); if (p.wardrobe.wearing[c.slot] === c.id && c.slot !== 'outfit') delete p.wardrobe.wearing[c.slot]; else p.wardrobe.wearing[c.slot] = c.id; APP.save(); LK.sfx && LK.sfx.tap && LK.sfx.tap(); APP.render(); return; }
      if (a === 'offline') { downloadAll(document.querySelector('.offline-status')); }
    });
    ADV.registerSW();
  };

  // test helper: finish whatever is on screen the right way
  ADV._solveCurrent = function () {
    const ex = document.querySelector('#adv-stage .cp-layer:not([hidden]) .ex') || document.querySelector('#adv-stage .ex');
    if (ex && ex._solve) return ex._solve();
    const g = document.querySelector('#adv-stage .game'); if (g && g._solve) return g._solve();
    return null;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
