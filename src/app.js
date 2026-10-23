/* Luminary Kids — interface. Depends on LK (i18n, engine, art). */
(function () {
  const LK = window.LK, A = LK.art;
  const $ = (sel, el = document) => el.querySelector(sel);
  const root = document.getElementById('app');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const STORE = 'luminary-kids-v1';

  // ---------- storage (best effort; the app works without it) ----------
  function load() {
    try { const raw = localStorage.getItem(STORE); if (raw) return JSON.parse(raw); } catch (e) { /* storage unavailable */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(DB)); return true; } catch (e) { return false; }
  }
  const DB = load() || { profiles: [], activeId: null, settings: { lang: 'am', showEn: true, reduce: false } };

  const S = { view: 'landing', guest: null, run: null, gate: null, confirm: null, parentMsg: '', reserve: false };
  const st = () => DB.settings;
  const lang = () => st().lang;
  const U = () => LK.ui[lang()];
  const active = () => DB.profiles.find((p) => p.id === DB.activeId) || null;
  const learner = () => (S.run && S.run.guest ? S.guest : active() ? active().learner : S.guest);

  function applySettings() {
    LK.sfx.on = st().sfx !== false;
    document.documentElement.lang = lang() === 'am' ? 'am' : 'en';
    document.documentElement.classList.toggle('reduce', !!st().reduce);
  }

  // Bilingual text: Amharic first with optional English line underneath.
  function bi(obj, tag = 'span') {
    if (lang() === 'en') return `<${tag}>${esc(obj.en)}</${tag}>`;
    return `<${tag} class="am" lang="am">${esc(obj.am)}${st().showEn ? `<span class="en-sub" lang="en">${esc(obj.en)}</span>` : ''}</${tag}>`;
  }
  const uiBi = (key) => bi({ am: LK.ui.am[key], en: LK.ui.en[key] });

  // ---------- narration ----------
  // A "line" is { am, en, keys }. Recorded Amharic clips play first (LK.narr); without them the
  // device voice reads the line; with no Amharic voice it reads the English line instead.
  const NR = LK.narr;
  let voices = [], warned = false;
  function loadVoices() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  loadVoices();
  try { if (window.speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { /* ignore */ }
  // Prefer the warmest voice on the device: neural/natural voices first, then known friendly voices.
  const WARM = /natural|neural|enhanced|premium|google|samantha|ava|aria|jenny|libby|sonia|karen|moira|tessa|zira/i;
  const voiceFor = (l) => {
    const pre = l === 'am' ? 'am' : 'en';
    const list = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(pre));
    return list.find((v) => /natural|neural|enhanced|premium/i.test(v.name)) || list.find((v) => WARM.test(v.name)) || list[0];
  };
  function tts(text, v) {
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 0.9; u.pitch = 1.2; u.volume = 1; speechSynthesis.speak(u); return true; } catch (e) { return false; }
  }
  function say(line, fromButton = false) {
    if (!line) return;
    NR.stop();
    if (lang() === 'am') {
      if (NR.hasAll(line.keys)) { NR.playKeys(line.keys); return; }
      const am = voiceFor('am');
      if (am && tts(line.am, am)) return;
      const en = voiceFor('en');
      if (en && line.en && tts(line.en, en)) {
        if (fromButton && !warned) { warned = true; toast(LK.ui.am.noVoiceEn); }
        return;
      }
    } else {
      const en = voiceFor('en');
      if (en && tts(line.en, en)) return;
    }
    if (fromButton) toast(lang() === 'am' ? LK.ui.am.noVoice : 'This device has no voice for reading aloud.');
  }
  const lineFixed = (key, am, en) => ({ am, en, keys: [key] });
  function lineTpl(base, src, vars, thing) {
    const l = lang();
    const t = thing ? LK.things[thing] : null;
    const v = (lg) => Object.assign({ thing: t ? t[lg][0] : '', things: t ? t[lg][1] : '' }, vars || {});
    return { am: LK.fill(src.am, v('am')), en: LK.fill(src.en, v('en')), keys: NR.tplKeys(base, src.am, vars, thing), cur: l };
  }
  let toastTimer;
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  const ICON = {
    speaker: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="var(--adey)" stroke="var(--adey-ink)" stroke-width="1"/></svg>',
    back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bulb: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>'
  };
  const mark = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="var(--ink)"/>${A.flowerAt(20, 20, 9).replace(/#6b4a1a/g, 'var(--ink)')}</svg>`;

  // ---------- header ----------
  function header() {
    const inApp = S.view !== 'landing';
    const L = learner();
    return `<header class="top"><div class="wrap">
      <button class="brand" data-act="${inApp ? 'home' : 'landing'}" aria-label="Luminary Kids">${mark}<span><b>Luminary Kids</b><small lang="am">የሂሳብ ጀብዱ · KingNigUs Academy</small></span></button>
      <span class="spacer"></span>
      ${S.view === 'home' && L ? `<span class="stars tnum hide-sm" title="${esc(U().stars)}">${ICON.star}${L.stars}</span>` : ''}
      <div class="seg" role="group" aria-label="Language"><button data-act="lang" data-v="am" aria-pressed="${lang() === 'am'}" lang="am">አማ</button><button data-act="lang" data-v="en" aria-pressed="${lang() === 'en'}">EN</button></div>
      <button class="linkbtn" data-act="gate">${lang() === 'am' ? '<span lang="am">ለወላጆች</span>' : 'Grown-ups'}</button>
    </div></header>`;
  }

  // ---------- landing (grown-up facing) ----------
  const LAND = {
    am: {
      h1a: 'ሂሳብ በአማርኛ', h1b: 'በትንንሽ ጀብዱዎች።',
      lead: 'ሉሚናሪ ኪድስ ከ5–8 ዓመት ያሉ ልጆች እስከ 20 ያሉ ቁጥሮችን እንዲለማመዱ ይረዳል። መሪያቸው ዋሊ የተባለ የዋልያ ግልገል ሲሆን እያንዳንዱን እርምጃ በአማርኛ ያብራራል፤ እንግሊዝኛም አብሮ ይገኛል።',
      play: 'የናሙና ትምህርት ይሞክሩ', setup: 'ለልጅዎ ያዘጋጁ', bubble: 'ሰላም! እኔ ዋሊ ነኝ። አብረን እንቁጠር?'
    },
    en: {
      h1a: 'Math in Amharic,', h1b: 'one small adventure at a time.',
      lead: 'Luminary Kids helps children aged 5 to 8 practise numbers to 20 with Wali, a young Walia ibex who explains every step in Amharic, with English on tap.',
      play: 'Play a sample lesson', setup: 'Set up for your child', bubble: "Hello! I'm Wali. Shall we count together?"
    }
  };
  function landing() {
    const T = LAND[lang()];
    const lessonsHtml = LK.lessons.map((l) => `<button class="lcard" data-act="sample" data-skill="${l.id}">${A.scene(l.scene, l.title.en)}<span class="body"><span class="num">Lesson ${l.n}</span><b class="am" lang="am">${esc(l.title.am)}</b><span class="muted">${esc(l.title.en)}</span></span></button>`).join('');
    const reserve = S.reserve ? `<div class="panel" role="status"><b>Pilot checkout opens with wave 1.</b><p>To reserve a place now, email the Luminary Academy team with your child's grade and your city. We reply within two working days.</p><div class="copyrow"><code id="mail">support@theluminaryacademy.net</code><button class="btn small alt" data-act="copy" data-target="mail">Copy address</button></div></div>` : '';
    return `<main>
    <section class="hero"><div class="wrap">
      <div><span class="eyebrow">Grade 1 pilot · Numbers to 20</span>
        <h1>${lang() === 'am' ? `<span class="am" lang="am">${T.h1a}</span><span class="am" lang="am" style="display:block">${T.h1b}</span>` : `<span class="am" lang="am">ሂሳብ በአማርኛ</span>${T.h1a} ${T.h1b}`}</h1>
        <p class="lead ${lang() === 'am' ? 'am' : ''}">${esc(T.lead)}</p>
        <div class="ctas"><button class="btn adey" data-act="sample" data-skill="count10">${esc(T.play)}</button><button class="btn alt" data-act="gate">${esc(T.setup)}</button></div>
      </div>
      <div class="hero-art">${A.scene('garden', 'A garden with flowers on Ethiopian hills')}${A.wali('welcome', 'Wali waving hello')}<div class="bubble ${lang() === 'am' ? 'am' : ''}">${esc(T.bubble)}</div></div>
    </div></section>

    <section class="band tint"><div class="wrap">
      <h2>Built for Amharic-speaking families</h2>
      <p class="intro">Most math apps are English-only. Weekend Amharic schools rarely have time for math. Luminary Kids gives your child both, in short sessions they can do on a phone.</p>
      <div class="grid3">
        <div class="point"><span class="dot" style="background:var(--adey-soft);color:var(--adey-ink)">አ</span><h3>Amharic first</h3><p>Clear Amharic instructions with the same math words every time, English underneath when you want it, and a listen button on every question.</p></div>
        <div class="point"><span class="dot" style="background:var(--lake-soft);color:var(--lake)">1</span><h3>Starts where your child is</h3><p>A six-question starting game places each skill. Questions get harder after four first-try answers and easier after two misses.</p></div>
        <div class="point"><span class="dot" style="background:var(--field-soft);color:var(--field)">✓</span><h3>You see the progress</h3><p>The grown-ups page shows each skill, how many questions were right on the first try, hints used, and what Wali suggests next.</p></div>
      </div>
    </div></section>

    <section class="band"><div class="wrap">
      <h2>How a lesson works</h2><p class="intro">Each lesson takes about 10 minutes and follows the same four steps.</p>
      <ol class="steps"><li><b>Story</b><p>A short scene from home, the market or school sets up the problem.</p></li><li><b>Example</b><p>Wali works one problem out loud with a picture.</p></li><li><b>Practice</b><p>Six questions that adjust to your child, with hints and a second try.</p></li><li><b>Game</b><p>Your child builds numbers on a ten frame by tapping.</p></li></ol>
    </div></section>

    <section class="band tint"><div class="wrap">
      <h2>The pilot unit: six lessons</h2><p class="intro">Tap any lesson to play a sample. Pictures always show exactly the numbers in the question.</p>
      <div class="lessons">${lessonsHtml}</div>
    </div></section>

    <section class="band"><div class="wrap">
      <h2>What grown-ups see</h2><p class="intro">An example report. Your own child's report appears on the grown-ups page once they start playing.</p>
      <div class="report-demo"><div class="tablewrap"><table><thead><tr><th>Skill</th><th>Status</th><th>First try</th><th>Hints</th></tr></thead><tbody>
        <tr><td>Counting to 10</td><td><span class="tag field">Mastered</span></td><td class="tnum">9 of 11</td><td class="tnum">1</td></tr>
        <tr><td>Teen numbers</td><td><span class="tag lake">Learning</span></td><td class="tnum">4 of 7</td><td class="tnum">3</td></tr>
        <tr><td>Adding within 10</td><td><span class="tag plain">Not started</span></td><td class="tnum">—</td><td class="tnum">—</td></tr>
      </tbody></table></div><p class="muted" style="margin-top:10px">Example data. Practice records show where to help; they are not test scores.</p></div>
    </div></section>

    <section class="band tint" id="pilot"><div class="wrap offer">
      <div><h2>Founding Families pilot</h2><p class="intro">We are inviting a small group of families to use the Grade 1 unit for six weeks and tell us what works. Your feedback decides what we build next.</p>
        <ul class="checks"><li>Six lessons, the starting game and spaced review for up to two children</li><li>Amharic first, English on tap</li><li>A weekly progress email and a 20-minute call with our team in week 1</li><li>A feedback call in week 6</li></ul>
      </div>
      <div class="price"><span class="tag">Founding-family test price</span><span class="amt tnum">$29</span><span>one payment for 6 weeks · no automatic renewal</span>
        <button class="btn adey" data-act="reserve">Reserve a pilot place</button>${reserve}
        <div class="terms"><p><b>Refunds:</b> full refund within 14 days of payment, for any reason.</p><p><b>After the pilot:</b> nothing renews automatically. If you choose a monthly or yearly plan later, it renews until you cancel, and you can cancel any time from your account.</p><p>For parents and guardians only. Children under 13 use Luminary Kids through a profile a parent creates.</p><p>Read the <button class="linkbtn inline" data-act="legal" data-v="terms">pilot terms</button> and <button class="linkbtn inline" data-act="legal" data-v="privacy">privacy notice</button>.</p></div>
      </div>
    </div></section>

    <section class="band"><div class="wrap">
      <h2>Questions parents ask</h2>
      <details class="faq"><summary>Does my child need to read Amharic?</summary><p>No. Every question has a picture, and a listen button reads it aloud. Today the listen button uses your device's Amharic voice when it has one; recorded narration by an Amharic-speaking teacher is being added during the pilot.</p></details>
      <details class="faq"><summary>Which curriculum does it follow?</summary><p>The unit covers Grade 1 number skills found in international standards such as the US Common Core. Ethiopian teachers are reviewing how each lesson lines up with the Ethiopian Grade 1 syllabus, and we will publish that mapping once it is checked.</p></details>
      <details class="faq"><summary>What ages is it for?</summary><p>Children about 5 to 8, or anyone working on numbers to 20. The starting game finds the right level.</p></details>
      <details class="faq"><summary>Does it work on a phone with weak internet?</summary><p>Yes, it runs in a phone browser and the whole lesson loads at once, so it keeps working if the signal drops mid-lesson. Full offline use is not available yet.</p></details>
      <details class="faq"><summary>What information do you collect?</summary><p>In the pilot, progress is saved only in this browser on this device, under a nickname you choose. We do not ask for your child's full name, photo or email. You can copy a backup code or delete everything from the grown-ups page. Details are in our <button class="linkbtn inline" data-act="legal" data-v="privacy">privacy notice</button>.</p></details>
      <details class="faq"><summary>Can our Saturday school or tutoring center use it?</summary><p>Yes. Class accounts with teacher assignments are planned after the family pilot. Email us to join the school waiting list.</p></details>
    </div></section>
    <footer><div class="wrap footer-row"><span>© 2026 Luminary Kids · KingNigUs Academy · Luminary Academy. Original characters and illustrations. Pilot version: results and testimonials will be shared only after families have used it.</span><nav class="footer-links" aria-label="Legal"><button class="linkbtn" data-act="legal" data-v="privacy">Privacy notice</button><button class="linkbtn" data-act="legal" data-v="terms">Terms</button></nav></div></footer>
    </main>`;
  }

  // ---------- child home ----------
  function statusOf(sk) { return sk.status === 'mastered' ? 'mastered' : sk.history.length ? 'learning' : 'notStarted'; }
  function levelStones(sk) {
    const n = sk.status === 'mastered' ? 3 : sk.level - 1;
    return `<span class="lv" aria-label="level ${sk.level} of 3">${[0, 1, 2].map((i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  }
  function home() {
    const L = learner(); const p = active();
    const rec = LK.recommend(L);
    const recLesson = rec.skill ? LK.lessons.find((l) => l.id === rec.skill) : null;
    const recTitle = rec.kind === 'diagnostic' ? { am: LK.ui.am.diagnostic, en: LK.ui.en.diagnostic } : recLesson.title;
    const recLabel = rec.kind === 'review' ? { am: LK.ui.am.review, en: LK.ui.en.review } : rec.kind === 'complete' ? { am: LK.ui.am.unitDone, en: LK.ui.en.unitDone } : { am: LK.ui.am.recommended, en: LK.ui.en.recommended };
    const hello = p ? { am: `ሰላም ${p.name}!`, en: `Hello ${p.name}!` } : { am: 'ሰላም!', en: 'Hello!' };
    const stones = LK.lessons.map((l) => {
      const sk = L.skills[l.id], locked = L.diagnosticDone && !LK.prereqsMet(L, l.id) && sk.status !== 'mastered';
      return `<li><button class="stone" data-act="lesson" data-skill="${l.id}" data-locked="${locked ? 1 : 0}">${A.badge(l.n, sk.badge, l.title.en)}<span>${bi(l.title)}</span>${levelStones(sk)}</button></li>`;
    }).join('');
    const badges = LK.lessons.filter((l) => L.skills[l.id].badge).map((l) => A.badge(l.n, true, LK.badges[l.id].en)).join('');
    return `<main class="wrap play home">
      <div class="greet">${A.wali('welcome', 'Wali waving')}<div><h1 style="font-size:1.9rem">${bi(hello)}</h1></div></div>
      <div class="next-card">${A.scene(recLesson ? recLesson.scene : 'garden', 'Lesson scene')}<div class="body"><span class="eyebrow">${bi(recLabel)}</span><h2>${bi(recTitle)}</h2>
        <button class="btn adey" data-act="${rec.kind === 'diagnostic' ? 'diag' : rec.kind === 'review' ? 'review' : 'lesson'}" data-skill="${rec.skill || ''}">${uiBi('start')}</button></div></div>
      <h2 style="font-size:1.3rem">${uiBi('lessons')}</h2>
      <ol class="path">${stones}</ol>
      <div class="garden"><b>${bi({ am: 'የዋሊ የአበባ ቦታ', en: "Wali's flower garden" })}</b><div class="row">${badges || `<span class="muted">${bi({ am: 'ትምህርት ሲችሉ አበባ ይበቅላል።', en: 'A flower grows for every lesson you master.' })}</span>`}</div></div>
      ${S.run && S.run.guest ? '' : ''}
    </main>`;
  }

  // ---------- runs: lesson, review, diagnostic ----------
  function newRun(kind, skill, guest = false) {
    const L = guest ? S.guest : learner();
    const rng = LK.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    const steps = [];
    if (kind === 'lesson') {
      steps.push({ k: 'story' }, { k: 'example' });
      for (let i = 0; i < 6; i++) steps.push({ k: 'item', src: 'practice' });
      for (let i = 0; i < 3; i++) steps.push({ k: 'item', src: 'game' });
      steps.push({ k: 'done' });
    } else if (kind === 'review') {
      for (let i = 0; i < 3; i++) steps.push({ k: 'item', src: 'review' });
      steps.push({ k: 'done' });
    } else {
      steps.push({ k: 'intro' });
      LK.diagnosticItems(rng).forEach((it) => steps.push({ k: 'item', src: 'diag', item: it }));
      steps.push({ k: 'done' });
    }
    S.run = { kind, skill, guest, rng, steps, i: 0, stars0: L.stars, events: [], diag: [], started: Date.now(), answered: 0, correct: 0 };
    S.view = 'run';
    enterStep();
  }
  function enterStep() {
    const R = S.run, step = R.steps[R.i];
    R.item = null; R.tries = 0; R.hints = 0; R.state = 'ask'; R.picked = null; R.tapped = []; R.built = new Set(); R.hintOn = false; R.msg = null;
    if (step.k === 'item') {
      const L = learner();
      if (step.item) R.item = step.item;
      else if (step.src === 'game') R.item = Object.assign(LK.buildItem(R.rng, R.skill === 'count10' ? 10 : 10), { skill: R.skill, level: L.skills[R.skill].level, id: 'build-' + R.i });
      else if (step.src === 'review') R.item = LK.generate(R.skill, 3, R.rng);
      else R.item = LK.generate(R.skill, L.skills[R.skill].level, R.rng);
    }
    render();
    const h = $('.player h2, .player .prompt'); if (h) h.focus && h.focus({ preventScroll: true });
  }
  function textFor(item, which) {
    const l = lang();
    const t = item.thing ? LK.things[item.thing] : null;
    const vars = (lg) => Object.assign({ thing: t ? t[lg][0] : '', things: t ? t[lg][1] : '' }, item.vars || {});
    const src = which === 'hint' ? LK.hints[item.hint] : LK.prompts[item.prompt];
    return { am: LK.fill(src.am, vars('am')), en: LK.fill(src.en, vars('en')), cur: LK.fill(src[l], vars(l)) };
  }
  function visualLabel(item) {
    const v = item.visual, en = {
      group: () => `${v.n} ${LK.things[v.thing].en[v.n === 1 ? 0 : 1]}`,
      tenframes: () => `Two ten frames with ${v.filled} oranges: one full ten and ${v.filled - 10} more`,
      tenframe: () => `A ten frame with ${v.filled} counters and ${10 - v.filled} empty spaces`,
      compare: () => `Left tray has ${v.left} cups, right tray has ${v.right} cups`,
      join: () => `${v.a} children in the bajaj and ${v.b} more getting in`,
      takeaway: () => `${v.a} mangoes, ${v.b} crossed out because they fell`,
      numberline: () => v.marks ? `Number line from ${v.min} to ${v.max} with ${v.marks[0]} and ${v.marks[1]} marked` : `Number line from ${v.min} to ${v.max}, starting at ${v.start}`,
      maketen: () => `Ten frame with ${v.a} blue counters and a second ten frame with ${v.b} pink counters`,
      buildframe: () => 'An empty ten frame. Tap a space to place a counter.'
    }[v.kind];
    return en ? en() : 'Math picture';
  }

  function itemView() {
    const R = S.run, it = R.item, txt = textFor(it, 'prompt');
    const v = Object.assign({}, it.visual);
    if (v.kind === 'compare') v.labels = [U().left, U().right];
    let vis = A.visual(v, visualLabel(it), R.hintOn || R.state === 'shown');
    let answer = '';
    if (it.input === 'choose') {
      const isWordy = false;
      answer = `<div class="opts ${it.options.length === 2 ? 'two' : ''}">${it.options.map((o) => {
        const cls = R.state !== 'ask' && o === it.answer && (R.state === 'right' || R.state === 'shown') ? 'right' : R.picked === o && R.state !== 'right' ? 'wrong' : '';
        return `<button class="opt tnum ${isWordy ? 'word' : ''} ${cls}" data-act="answer" data-v="${o}" ${R.state === 'right' || R.state === 'shown' ? 'disabled' : ''}>${o}</button>`;
      }).join('')}</div>`;
    } else if (it.input === 'pick') {
      answer = `<div class="opts two">${['left', 'right'].map((s) => {
        const cls = (R.state === 'right' || R.state === 'shown') && s === it.answer ? 'right' : R.picked === s && R.state !== 'right' ? 'wrong' : '';
        return `<button class="opt word ${cls}" data-act="answer" data-v="${s}" ${R.state === 'right' || R.state === 'shown' ? 'disabled' : ''}>${s === 'left' ? '← ' : ''}${esc(U()[s])}${s === 'right' ? ' →' : ''}</button>`;
      }).join('')}</div>`;
    } else if (it.input === 'line') {
      answer = `<p class="muted">${bi({ am: LK.ui.am.tapLine, en: LK.ui.en.tapLine })}</p>`;
    } else if (it.input === 'build') {
      answer = `<div class="actions"><span class="counted tnum" aria-live="polite">${R.built.size} / 10</span><span class="grow"></span><button class="btn" data-act="buildcheck" ${R.state === 'right' || R.state === 'shown' ? 'disabled' : ''}>${uiBi('check')}</button></div>`;
    }
    if (it.type === 'count' && R.state === 'ask') answer = `<p class="muted">${bi({ am: LK.ui.am.tapToCount, en: LK.ui.en.tapToCount })} <span class="counted tnum" aria-live="polite">${R.tapped.length ? R.tapped.length : ''}</span></p>` + answer;

    const hint = R.hintOn ? `<div class="hintbox">${bi({ am: textFor(it, 'hint').am, en: textFor(it, 'hint').en })}</div>` : '';
    let fb = '';
    if (R.msg) {
      const pose = R.state === 'right' ? 'celebrate' : R.state === 'shown' ? 'explain' : 'encourage';
      fb = `<div class="feedback ${R.state === 'right' ? 'ok' : R.state === 'shown' ? 'show' : 'retry'} pop" role="status">${A.wali(pose, 'Wali')}<div>${bi(R.msg)}</div></div>`;
    }
    const done = R.state === 'right' || R.state === 'shown';
    return `<div class="card">
      <div class="prompt-row"><h2 class="prompt" tabindex="-1">${bi({ am: txt.am, en: txt.en })}</h2><button class="listen" data-act="speak" aria-label="${esc(U().listen)}">${ICON.speaker}</button></div>
      <div class="visual" data-input="${it.input}" data-type="${it.type}">${vis}</div>
      ${hint}${answer}${fb}
      <div class="actions">${!done && it.input !== 'build' && !R.hintOn ? `<button class="btn alt small" data-act="hint">${ICON.bulb}${uiBi('hint')}</button>` : ''}${!done && it.input === 'build' && !R.hintOn ? `<button class="btn alt small" data-act="hint">${ICON.bulb}${uiBi('hint')}</button>` : ''}<span class="grow"></span>${done ? `<button class="btn adey" data-act="next">${uiBi('next')}</button>` : ''}</div>
    </div>`;
  }

  function runView() {
    const R = S.run, step = R.steps[R.i], L = learner();
    const lesson = R.skill ? LK.lessons.find((l) => l.id === R.skill) : null;
    const pct = Math.round((R.i / (R.steps.length - 1)) * 100);
    let body = '';
    if (step.k === 'intro') {
      body = `<div class="card story"><div class="stage">${A.scene('meadow', 'A meadow of yellow Adey Abeba flowers')}${A.wali('welcome', 'Wali waving')}</div>
        <div class="prompt-row"><h2 class="prompt" tabindex="-1">${uiBi('diagnosticIntro')}</h2><button class="listen" data-act="speak" aria-label="${esc(U().listen)}">${ICON.speaker}</button></div>
        <div class="actions"><span class="grow"></span><button class="btn adey" data-act="next">${uiBi('start')}</button></div></div>`;
    } else if (step.k === 'story') {
      body = `<div class="card story"><span class="eyebrow">${bi({ am: `ትምህርት ${lesson.n}`, en: `Lesson ${lesson.n}` })}</span><h2 tabindex="-1">${bi(lesson.title)}</h2>
        <div class="stage">${A.scene(lesson.scene, lesson.title.en)}${A.wali('welcome', 'Wali waving')}</div>
        <div class="prompt-row"><p class="prompt" style="font-weight:400">${bi(lesson.story)}</p><button class="listen" data-act="speak" aria-label="${esc(U().listen)}">${ICON.speaker}</button></div>
        <div class="actions"><span class="grow"></span><button class="btn adey" data-act="next">${uiBi('next')}</button></div></div>`;
    } else if (step.k === 'example') {
      body = `<div class="card"><span class="eyebrow">${uiBi('example')}</span>
        <div class="feedback show">${A.wali('explain', 'Wali explaining')}<div class="prompt" style="font-weight:400;font-size:1.15rem">${bi(lesson.example)}</div></div>
        <div class="visual">${exampleVisual(lesson.id)}</div>
        <div class="actions"><button class="listen" data-act="speak" aria-label="${esc(U().listen)}">${ICON.speaker}</button><span class="grow"></span><button class="btn adey" data-act="next">${uiBi('practice')}</button></div></div>`;
    } else if (step.k === 'item') {
      const tag = step.src === 'game' ? uiBi('game') : step.src === 'review' ? uiBi('review') : step.src === 'diag' ? uiBi('diagnostic') : uiBi('practice');
      body = `<span class="eyebrow">${tag}</span>` + itemView();
    } else if (step.k === 'done') {
      body = doneView();
    }
    return `<main class="wrap play player">
      <div class="bar"><button class="btn alt small" data-act="home" aria-label="${esc(U().home)}">${ICON.back}</button><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div><span class="stars tnum">${ICON.star}${L.stars}</span></div>
      ${body}</main>`;
  }
  function exampleVisual(id) {
    switch (id) {
      case 'count10': return A.group({ thing: 'flower', n: 6, layout: 'rows' }, '6 flowers');
      case 'teens': return A.tenframes({ filled: 14, thing: 'orange' }, 'One full ten frame and four more oranges: 14');
      case 'compare': return A.compare({ thing: 'cup', left: 6, right: 4 }, 'Left tray 6 cups, right tray 4 cups', [U().left, U().right]);
      case 'add10': return A.join({ thing: 'child', a: 3, b: 2 }, '3 children and 2 more');
      case 'sub10': return A.takeaway({ thing: 'mango', a: 7, b: 3 }, '7 mangoes with 3 crossed out');
      case 'make10': return A.maketen({ a: 8, b: 5 }, '8 and 5: move 2 to make ten', true);
    }
    return '';
  }
  function doneView() {
    const R = S.run, L = learner();
    const earned = L.stars - R.stars0;
    if (R.kind === 'diag') {
      return `<div class="card done">${A.wali('celebrate', 'Wali celebrating')}<h2>${bi({ am: 'በጣም ጥሩ! ከየት እንደምንጀምር አሁን አውቀናል።', en: 'Great! Now we know where to start.' })}</h2>
        <button class="btn adey" data-act="home">${uiBi('next')}</button></div>`;
    }
    const lesson = LK.lessons.find((l) => l.id === R.skill);
    const badge = R.events.includes('badge');
    return `<div class="card done">${badge ? A.badge(lesson.n, true, LK.badges[lesson.id].en) : A.wali('celebrate', 'Wali celebrating')}
      <h2>${badge ? uiBi('badgeEarned') : uiBi('lessonDone')}</h2>
      ${badge ? `<p>${bi(LK.badges[lesson.id])}</p>` : `<p>${uiBi('keepGoing')}</p>`}
      <p class="stars tnum" style="justify-self:center">${ICON.star}+${earned}</p>
      <div class="actions" style="justify-content:center"><button class="btn alt" data-act="lesson" data-skill="${R.skill}">${bi({ am: 'እንደገና', en: 'Play again' })}</button><button class="btn adey" data-act="home">${uiBi('home')}</button></div>
      ${R.guest ? `<p class="muted">${bi({ am: 'ይህ ናሙና ነው። ለልጅዎ መገለጫ በማዘጋጀት እድገትን ያስቀምጡ።', en: 'This was a sample. Set up a profile for your child on the grown-ups page to save progress.' })}</p>` : ''}
    </div>`;
  }

  // ---------- answering ----------
  function finishItem(correct) {
    const R = S.run, it = R.item, step = R.steps[R.i];
    const result = { correct, tries: R.tries, hints: R.hints };
    const L = learner();
    if (step.src === 'diag') { R.diag.push({ item: it, result }); if (correct) L.stars += 1; }
    else if (step.src === 'game') { if (correct) L.stars += 1; }
    else {
      const out = LK.record(L, it, result, Date.now(), step.src === 'review' ? 'review' : 'practice');
      R.events.push(...out.events);
      if (out.events.includes('show-example') && R.kind === 'lesson') R.steps.splice(R.i + 1, 0, { k: 'example' });
    }
    R.answered += 1; if (correct) R.correct += 1;
    persist();
  }
  function answer(val) {
    const R = S.run, it = R.item;
    if (R.state === 'right' || R.state === 'shown') return;
    R.tries += 1; R.picked = val;
    const ok = LK.check(it, val);
    if (ok) {
      R.state = 'right'; LK.sfx.correct();
      const c = LK.ui.am.correct, ce = LK.ui.en.correct, k = Math.floor(Math.random() * c.length);
      R.msg = { am: c[k], en: ce[k] }; R.line = lineFixed('ui.correct.' + k, c[k], ce[k]);
      finishItem(true);
    } else if (R.tries < 2) {
      R.state = 'retry'; LK.sfx.retry(); R.msg = { am: LK.ui.am.tryAgain, en: LK.ui.en.tryAgain }; say(lineFixed('ui.tryAgain', R.msg.am, R.msg.en));
    } else {
      R.state = 'shown'; R.hintOn = true; LK.sfx.reveal();
      const shown = it.input === 'pick' ? (it.answer === 'left' ? U().left : U().right) : it.answer;
      R.msg = { am: LK.fill(LK.ui.am.reveal, { ans: it.input === 'pick' ? LK.ui.am[it.answer] : shown }), en: LK.fill(LK.ui.en.reveal, { ans: it.input === 'pick' ? LK.ui.en[it.answer] : shown }) };
      R.line = { am: R.msg.am, en: R.msg.en, keys: NR.tplKeys('ui.reveal', LK.ui.am.reveal, { ans: it.answer }) };
      finishItem(false);
    }
    render();
    if (R.state === 'right' || R.state === 'shown') say(R.line);
  }
  function persist() {
    const R = S.run;
    if (R && R.guest) return;
    save();
  }
  function closeRun() {
    const R = S.run; if (!R || R.closed) return;
    R.closed = true;
    const L = learner();
    if (R.kind === 'diag' && R.diag.length) LK.applyDiagnostic(L, R.diag);
    if (R.answered) L.sessions.push({ start: R.started, end: Date.now(), kind: R.kind, skill: R.skill || null, answered: R.answered, correct: R.correct });
    if (!R.guest) save();
  }

  // ---------- grown-ups ----------
  function gateView() {
    const g = S.gate;
    return `<main class="wrap play parents"><div class="section"><h2>Grown-ups only</h2><p>To open this page, answer this question. It keeps children on the playing side.</p>
      <form data-form="gate" class="formrow"><label for="gate-answer">What is ${g.a} × ${g.b}?</label><input id="gate-answer" type="number" inputmode="numeric" autocomplete="off" required>
      ${g.err ? '<p style="color:var(--berry)">That is not right. Try again, or ask a grown-up.</p>' : ''}
      <div class="actions"><button class="btn" type="submit">Open</button><button class="btn alt" type="button" data-act="${active() ? 'home' : 'landing'}">Back</button></div></form></div></main>`;
  }
  function fmtDate(t) { return t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'; }
  function parentsView() {
    const p = active(); const s = st();
    const kidsList = DB.profiles.map((k) => `<button class="kidbtn" data-act="pick-kid" data-id="${k.id}" aria-pressed="${k.id === DB.activeId}" aria-label="${esc(k.name)}">${A.kid(k.avatar, k.name)}</button>`).join('');
    let report = '<p class="muted">Add a child profile to see a progress report.</p>';
    if (p) {
      const L = p.learner, rows = LK.report(L), rec = LK.recommend(L);
      const answered = rows.reduce((a, r) => a + r.attempts, 0), first = rows.reduce((a, r) => a + r.firstTry, 0);
      const mins = Math.round(L.sessions.reduce((a, x) => a + Math.min(30 * 6e4, x.end - x.start), 0) / 6e4);
      const recText = rec.kind === 'diagnostic' ? 'Play the starting game' : rec.kind === 'review' ? `Review: ${LK.lessons.find((l) => l.id === rec.skill).title.en}` : rec.kind === 'complete' ? 'Unit complete — keep reviewing' : `Lesson ${LK.lessons.find((l) => l.id === rec.skill).n}: ${LK.lessons.find((l) => l.id === rec.skill).title.en}`;
      const tagFor = (r) => r.status === 'mastered' ? (r.dueNow ? '<span class="tag adey">Review due</span>' : '<span class="tag field">Mastered</span>') : r.attempts ? '<span class="tag lake">Learning</span>' : '<span class="tag plain">Not started</span>';
      report = `<div class="tiles"><div class="tile"><b class="tnum">${L.sessions.length}</b>sessions</div><div class="tile"><b class="tnum">${mins}</b>minutes</div><div class="tile"><b class="tnum">${answered}</b>questions</div><div class="tile"><b class="tnum">${answered ? Math.round((first / answered) * 100) + '%' : '—'}</b>right first try, no hint</div></div>
        <p><b>Next:</b> ${esc(recText)}</p>
        <div class="tablewrap"><table><thead><tr><th>Skill</th><th>Status</th><th>Level</th><th>First try</th><th>Hints</th><th>Next review</th></tr></thead><tbody>
        ${rows.map((r) => { const l = LK.lessons.find((x) => x.id === r.id); return `<tr><td>${l.n}. ${esc(l.title.en)}<span class="en-sub am" lang="am">${esc(l.title.am)}</span></td><td>${tagFor(r)}</td><td class="tnum">${r.status === 'mastered' ? '3 ✓' : r.level + ' of 3'}${!r.attempts && p.learner.diagnosticDone ? '<span class="en-sub">set by starting game</span>' : ''}</td><td class="tnum">${r.attempts ? `${r.firstTry} of ${r.attempts}` : '—'}</td><td class="tnum">${r.attempts ? r.hints : '—'}</td><td class="tnum">${r.status === 'mastered' ? fmtDate(r.reviewDue) : '—'}</td></tr>`; }).join('')}
        </tbody></table></div><p class="muted">Practice records show where to help. They are not test scores. Level rises after 4 of the last 5 questions are right on the first try without a hint, and drops after two unsolved questions in a row.</p>`;
    }
    const confirm = S.confirm ? `<div class="confirm" role="alert"><b>${S.confirm === 'wipe' ? 'Delete all profiles and progress on this device?' : `Remove ${esc((DB.profiles.find((k) => k.id === S.confirm) || {}).name || '')}'s profile and progress?`}</b><p>This cannot be undone unless you copied a backup code.</p><div class="actions"><button class="btn small" style="background:var(--berry);color:#fff" data-act="confirm-yes">Delete</button><button class="btn alt small" data-act="confirm-no">Keep</button></div></div>` : '';
    return `<main class="wrap play parents">
      <div class="actions"><h1 style="font-size:1.8rem" class="grow">Grown-ups</h1><button class="btn adey small" data-act="home" ${p ? '' : 'disabled'}>Back to playing</button></div>
      ${S.parentMsg ? `<p class="panel" role="status">${esc(S.parentMsg)}</p>` : ''}
      <div class="section"><h2 style="font-size:1.3rem">Children</h2><div class="kids">${kidsList || '<p class="muted">No profiles yet.</p>'}</div>
        <form data-form="addkid" class="formrow"><label for="kid-name">Add a child: nickname only</label><input id="kid-name" type="text" maxlength="20" placeholder="e.g. Selam" autocomplete="off" required>
          <span class="muted">Choose a picture</span><div class="kids" role="radiogroup">${A.kidIds.map((k, i) => `<label class="kidbtn" style="display:inline-block"><input type="radio" name="avatar" value="${k}" ${i === 0 ? 'checked' : ''} style="position:absolute;opacity:0">${A.kid(k, k)}</label>`).join('')}</div>
          <div class="actions"><button class="btn" type="submit">Add child</button>${p ? `<button class="btn alt small" type="button" data-act="remove-kid" data-id="${p.id}">Remove ${esc(p.name)}</button>` : ''}</div></form></div>
      ${confirm}
      <div class="section"><h2 style="font-size:1.3rem">${p ? `${esc(p.name)}'s progress` : 'Progress'}</h2>${report}</div>
      <div class="section"><h2 style="font-size:1.3rem">Settings</h2>
        <label class="toggle"><input type="checkbox" id="set-en" data-set="showEn" ${s.showEn ? 'checked' : ''}> Show English under Amharic</label>
        <label class="toggle"><input type="checkbox" id="set-motion" data-set="reduce" ${s.reduce ? 'checked' : ''}> Reduce motion</label>
        <label class="toggle"><input type="checkbox" id="set-sfx" data-set="sfx" ${s.sfx !== false ? 'checked' : ''}> Sound effects (gentle chimes for answers and counting)</label>
        <p class="muted">Narration: ${voiceFor('am') ? 'an Amharic voice was found on this device.' : 'this device has no Amharic voice, so the listen button shows a note instead. Recorded narration is being added.'}</p>
      </div>
      <div class="section"><h2 style="font-size:1.3rem">Backup and privacy</h2>
        <p>Progress is saved only in this browser on this device. Nothing is sent to us during this pilot build. Copy a backup code to move progress to another device or browser.</p>
        <div class="actions"><button class="btn alt small" data-act="backup">Copy backup code</button></div>
        <form data-form="restore" class="formrow"><label for="restore-code">Restore from a backup code</label><textarea id="restore-code" required></textarea><div class="actions"><button class="btn alt small" type="submit">Restore</button><button class="btn alt small" type="button" data-act="wipe">Delete everything on this device</button></div></form>
      </div></main>`;
  }

  // ---------- privacy notice and terms ----------
  function legalView(kind) {
    const L = LK.legal[kind];
    const mark = (t) => esc(t).replace(/\[([^\]]+)\]/g, '<mark>[$1]</mark>');
    const am = L.am ? `<section class="section am-summary" lang="am"><h2 style="font-size:1.25rem">${esc(L.am.title)}</h2><ul class="checks">${L.am.points.map((x) => `<li class="am">${esc(x)}</li>`).join('')}</ul><p class="muted" lang="en">Amharic summary: draft awaiting review by an Amharic-speaking educator.</p></section>` : '';
    return `<main class="wrap play legal">
      <div class="actions"><button class="btn alt small" data-act="${active() ? 'home' : 'landing'}">${ICON.back}Back</button></div>
      <p class="draft-note" role="note"><b>Draft.</b> This ${kind === 'privacy' ? 'notice' : 'agreement'} is being reviewed by a lawyer and is not yet in effect. Highlighted details are added once the company is registered.</p>
      <h1>${esc(L.title)}</h1>
      <p class="muted">Effective date: ${mark(LK.company.effective)}</p>
      ${am}
      ${L.sections.map(([h, t]) => `<section class="legal-sec"><h2>${esc(h)}</h2><p>${mark(t)}</p></section>`).join('')}
      <p class="muted">Questions: <span class="copyable">${esc(LK.company.email)}</span></p>
      <div class="actions"><button class="linkbtn" data-act="legal" data-v="${kind === 'privacy' ? 'terms' : 'privacy'}">${kind === 'privacy' ? 'Read the terms' : 'Read the privacy notice'}</button></div>
    </main>`;
  }

  // ---------- render ----------
  function render() {
    applySettings();
    let main = '';
    if (S.view === 'landing') main = landing();
    else if (S.view === 'home') main = home();
    else if (S.view === 'run') main = runView();
    else if (S.view === 'gate') main = gateView();
    else if (S.view === 'parents') main = parentsView();
    else if (S.view === 'privacy' || S.view === 'terms') main = legalView(S.view);
    root.innerHTML = header() + main;
  }
  function go(view) { S.view = view; render(); window.scrollTo(0, 0); }

  // ---------- events ----------
  root.addEventListener('click', (e) => {
    const R = S.run;
    // Taps inside math pictures
    const vis = e.target.closest('.visual');
    if (vis && R && R.item && R.state !== 'right' && R.state !== 'shown') {
      const it = R.item;
      const obj = e.target.closest('[data-obj]');
      if (it.type === 'count' && obj) {
        const i = obj.getAttribute('data-i');
        if (!R.tapped.includes(i)) {
          R.tapped.push(i); obj.classList.add('tapped'); LK.sfx.count(R.tapped.length);
          const ns = 'http://www.w3.org/2000/svg';
          const c = document.createElementNS(ns, 'circle'); c.setAttribute('r', '11'); c.setAttribute('class', 'tapdot'); c.setAttribute('cy', '-2');
          const t = document.createElementNS(ns, 'text'); t.setAttribute('class', 'tapnum'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('y', '3'); t.textContent = R.tapped.length;
          const g = document.createElementNS(ns, 'g'); g.appendChild(c); g.appendChild(t); obj.parentNode.insertBefore(g, obj.nextSibling);
          g.setAttribute('transform', obj.getAttribute('transform'));
          const lbl = $('.counted', root); if (lbl) lbl.textContent = R.tapped.length;
          { const n = R.tapped.length; say({ am: LK.numWords.am[n] || String(n), en: LK.numWords.en[n] || String(n), keys: ['num.' + n] }); }
        }
        return;
      }
      const side = e.target.closest('[data-side]');
      if (it.input === 'pick' && side) { answer(side.getAttribute('data-side')); return; }
      const tick = e.target.closest('[data-n]');
      if (it.input === 'line' && tick) { answer(Number(tick.getAttribute('data-n'))); return; }
      const cell = e.target.closest('[data-cell]');
      if (it.input === 'build' && cell) { toggleCell(cell); return; }
    }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.getAttribute('data-act');
    if (act === 'lang') { st().lang = b.getAttribute('data-v'); save(); render(); return; }
    if (act === 'landing') { S.run = null; go('landing'); return; }
    if (act === 'legal') { if (R) { closeRun(); S.run = null; } go(b.getAttribute('data-v')); return; }
    if (act === 'home') {
      if (R) { closeRun(); const wasGuest = R.guest; S.run = null; if (wasGuest && !active()) { go('landing'); return; } }
      go(active() || S.guest ? 'home' : 'landing'); return;
    }
    if (act === 'gate') { S.gate = { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4), err: false }; if (R) { closeRun(); S.run = null; } go('gate'); return; }
    if (act === 'sample') { S.guest = LK.newLearner(); S.guest.diagnosticDone = true; newRun('lesson', b.getAttribute('data-skill'), true); window.scrollTo(0, 0); return; }
    if (act === 'lesson') { const sk = b.getAttribute('data-skill'); if (R) closeRun(); newRun('lesson', sk, R ? R.guest : !active()); window.scrollTo(0, 0); return; }
    if (act === 'review') { newRun('review', b.getAttribute('data-skill')); return; }
    if (act === 'diag') { newRun('diag', null); return; }
    if (act === 'next') { R.i = Math.min(R.i + 1, R.steps.length - 1); if (R.steps[R.i].k === 'done') { closeRun(); if (R.events.includes('badge')) setTimeout(() => LK.sfx.badge(), 250); } enterStep(); window.scrollTo(0, 0); return; }
    if (act === 'answer') { const v = b.getAttribute('data-v'); answer(R.item.input === 'pick' ? v : Number(v)); return; }
    if (act === 'hint') { R.hints += 1; R.hintOn = true; render(); say(itemLine(R.item, 'hint')); return; }
    if (act === 'buildcheck') { answer(R.built.size); return; }
    if (act === 'speak') { say(currentLine(), true); return; }
    if (act === 'reserve') { S.reserve = true; render(); const el = $('#pilot'); if (el) el.scrollIntoView({ block: 'start' }); return; }
    if (act === 'copy') { const el = document.getElementById(b.getAttribute('data-target')); copyText(el.textContent, el); return; }
    if (act === 'pick-kid') { DB.activeId = b.getAttribute('data-id'); save(); render(); return; }
    if (act === 'remove-kid') { S.confirm = b.getAttribute('data-id'); render(); return; }
    if (act === 'wipe') { S.confirm = 'wipe'; render(); return; }
    if (act === 'confirm-no') { S.confirm = null; render(); return; }
    if (act === 'confirm-yes') {
      if (S.confirm === 'wipe') { DB.profiles = []; DB.activeId = null; try { localStorage.removeItem(STORE); } catch (err) { /* ignore */ } S.parentMsg = 'Everything on this device was deleted.'; }
      else { DB.profiles = DB.profiles.filter((k) => k.id !== S.confirm); if (DB.activeId === S.confirm) DB.activeId = DB.profiles[0] ? DB.profiles[0].id : null; save(); S.parentMsg = 'Profile removed.'; }
      S.confirm = null; render(); return;
    }
    if (act === 'backup') {
      let code = '';
      try { code = btoa(unescape(encodeURIComponent(JSON.stringify(DB)))); } catch (err) { code = ''; }
      copyText(code, null); S.parentMsg = 'Backup code copied. Paste it somewhere safe, such as a note to yourself.'; render(); return;
    }
  });
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.tap[tabindex]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  root.addEventListener('change', (e) => {
    const k = e.target.getAttribute('data-set'); if (!k) return;
    st()[k] = e.target.checked; save(); render();
  });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.getAttribute('data-form');
    if (f === 'gate') {
      const v = Number($('#gate-answer').value);
      if (v === S.gate.a * S.gate.b) { S.parentMsg = ''; go('parents'); } else { S.gate.err = true; render(); }
    } else if (f === 'addkid') {
      const name = $('#kid-name').value.trim().slice(0, 20); if (!name) return;
      const av = (e.target.querySelector('input[name="avatar"]:checked') || {}).value || 'selam';
      const id = 'k' + Date.now().toString(36);
      DB.profiles.push({ id, name, avatar: av, learner: LK.newLearner() }); DB.activeId = id;
      S.parentMsg = save() ? `${name} was added. Tap “Back to playing” to start with the starting game.` : `${name} was added for this visit, but this browser is not saving data, so progress will be lost when the page closes.`;
      render();
    } else if (f === 'restore') {
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob($('#restore-code').value.trim()))));
        if (!data || !Array.isArray(data.profiles)) throw new Error('bad');
        DB.profiles = data.profiles; DB.activeId = data.activeId; DB.settings = Object.assign(DB.settings, data.settings || {});
        save(); S.parentMsg = `Restored ${data.profiles.length} profile(s).`;
      } catch (err) { S.parentMsg = 'That code could not be read. Copy the whole code and try again.'; }
      render();
    }
  });

  function toggleCell(cell) {
    LK.sfx.tap();
    const R = S.run, i = cell.getAttribute('data-cell');
    const ns = 'http://www.w3.org/2000/svg';
    if (R.built.has(i)) { R.built.delete(i); const g = cell.querySelector('[data-obj]'); if (g) g.remove(); cell.setAttribute('data-filled', '0'); }
    else {
      R.built.add(i); cell.setAttribute('data-filled', '1');
      const r = cell.querySelector('rect'); const x = +r.getAttribute('x') + 25, y = +r.getAttribute('y') + 25;
      const g = document.createElementNS(ns, 'g'); g.setAttribute('data-obj', 'counter'); g.setAttribute('transform', `translate(${x} ${y})`);
      const c = document.createElementNS(ns, 'circle'); c.setAttribute('r', '16'); c.setAttribute('class', 'mv-counter'); g.appendChild(c); cell.appendChild(g);
    }
    const lbl = $('.counted', root); if (lbl) lbl.textContent = `${R.built.size} / 10`;
  }
  function itemLine(it, which) {
    const src = which === 'hint' ? LK.hints[it.hint] : LK.prompts[it.prompt];
    return lineTpl((which === 'hint' ? 'hint.' + it.hint : 'prompt.' + it.prompt), src, it.vars, it.thing);
  }
  function currentLine() {
    const R = S.run; if (!R) return null;
    const step = R.steps[R.i];
    const lesson = R.skill ? LK.lessons.find((x) => x.id === R.skill) : null;
    if (step.k === 'intro') return lineFixed('ui.diagnosticIntro', LK.ui.am.diagnosticIntro, LK.ui.en.diagnosticIntro);
    if (step.k === 'story') return { am: lesson.title.am + '። ' + lesson.story.am, en: lesson.title.en + '. ' + lesson.story.en, keys: ['lesson.' + lesson.id + '.title', 'lesson.' + lesson.id + '.story'] };
    if (step.k === 'example') return lineFixed('lesson.' + lesson.id + '.example', lesson.example.am, lesson.example.en);
    if (step.k === 'item') return itemLine(R.item, 'prompt');
    if (step.k === 'done') return lineFixed('ui.lessonDone', LK.ui.am.lessonDone, LK.ui.en.lessonDone);
    return null;
  }
  function copyText(text, el) {
    const done = () => toast('Copied');
    try {
      navigator.clipboard.writeText(text).then(done, () => fallback());
    } catch (err) { fallback(); }
    function fallback() {
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); toast('Press copy on your keyboard or menu'); }
      else { S.parentMsg = 'Copy did not work here. Your code: ' + text; render(); }
    }
  }

  // ---------- start ----------
  const route = (location.hash || '').slice(1) || location.pathname.replace(/^\//, '');
  if (route === 'privacy' || route === 'terms') S.view = route;
  else if (route === 'parents') S.gate = { a: 7, b: 8, err: false }, S.view = 'gate';
  else if (active()) S.view = 'home';
  render();
  NR.load().then((n) => { if (n) S.clips = n; });
  LK.app = { S, DB, render, newRun };
})();
