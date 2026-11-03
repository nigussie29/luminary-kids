#!/usr/bin/env node
/* Builds the hands-on lesson files from the lesson plans below.
     node content/build.js   →  content/lessons/<id>.json  (one per lesson, the format the app reads)
                               content/index.json         (lesson order, places on the adventure map)
                               dist/narration-script-exercises.csv (every clip to record)
   Each exercise is plain JSON (see content/README.md) so the admin panel can add or edit
   exercises later without code. Checkpoint times come from animations/timelines/<id>.json,
   written when the hook video is rendered. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
require(path.join(ROOT, 'src', 'i18n.js'));
require(path.join(ROOT, 'src', 'lessons-g2.js'));
const LK = globalThis.LK;

// ---------- words ----------
const ones = LK.numWords, tens = LK.tensWords;
function word(n, lang = 'am') {
  if (n <= 20) return ones[lang][n];
  if (n === 100) return tens[lang][10];
  const t = Math.floor(n / 10), o = n % 10;
  if (!o) return tens[lang][t];
  return lang === 'am' ? `${tens.am[t]} ${ones.am[o]}` : `${tens.en[t]}-${ones.en[o]}`;
}
const GEEZ_1 = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
const GEEZ_10 = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];
const geez = (n) => (n === 100 ? '፻' : GEEZ_10[Math.floor(n / 10)] + GEEZ_1[n % 10]);

const THINGS = {
  orange: ['ብርቱካን', 'ብርቱካኖች', 'orange', 'oranges'],
  mango: ['ማንጎ', 'ማንጎዎች', 'mango', 'mangoes'],
  cup: ['ስኒ', 'ስኒዎች', 'cup', 'cups'],
  flower: ['አበባ', 'አበቦች', 'flower', 'flowers'],
  child: ['ልጅ', 'ልጆች', 'child', 'children'],
  counter: ['ጠጠር', 'ጠጠሮች', 'counter', 'counters'],
  bean: ['የቡና ፍሬ', 'የቡና ፍሬዎች', 'coffee bean', 'coffee beans'],
  egg: ['እንቁላል', 'እንቁላሎች', 'egg', 'eggs'],
  book: ['መጽሐፍ', 'መጻሕፍት', 'book', 'books']
};
const th = (t) => ({ am: THINGS[t][1], en: THINGS[t][3] });

// ---------- clips: every distinct sentence gets one audio file, shared wherever it repeats ----------
const CLIPS = new Map(); // text → { key, am, en }
let LESSON = null, clipN = 0;
function clip(am, en) {
  if (CLIPS.has(am)) return CLIPS.get(am).key;
  const key = `ex.${LESSON}.${String(++clipN).padStart(2, '0')}`;
  CLIPS.set(am, { key, am, en });
  return key;
}
const url = (key) => `audio/am/${key}.mp3`;
const T = (am, en) => ({ am, en, audio_url: url(clip(am, en)) });

// ---------- exercise builders (the JSON shape is the contract with src/activities.js) ----------
let exN = 0;
function ex(type, prompt, body, hints) {
  const p = T(prompt[0], prompt[1]);
  return Object.assign({ id: `${LESSON}.${String(++exN).padStart(2, '0')}`, type,
    prompt_am: p.am, prompt_en: p.en, audio_url: p.audio_url }, body,
  { hints: (hints || []).map(([am, en]) => T(am, en)) });
}
const H = {
  count: [['እያንዳንዱን አንድ ጊዜ ብቻ እንቁጠር።', 'Count each one just once.'],
    ['ስንቆጥር የመጨረሻው ቁጥር ስንት እንዳሉ ይነግረናል።', 'The last number we say tells how many.']],
  countOn: [['ቀድሞ ያሉትን አንቆጥርም፤ ከእነሱ ቀጥለን እንቁጠር።', 'Start from the ones already there and count on.'],
    ['ከቁጥሩ ቀጥለን አንድ በአንድ እንጨምር።', 'Add one at a time and count on.']],
  equation: [['ሁለቱ ጎኖች እኩል መሆን አለባቸው።', 'Both sides must be equal.'],
    ['በጣታችን ወይም በቁጥር መስመር ቆጥረን እንፈትሽ።', 'Check by counting on your fingers or on a number line.']],
  numberline: [['ትናንሽ ቁጥሮች በግራ፣ ትልልቅ ቁጥሮች በቀኝ ናቸው።', 'Small numbers are on the left, big numbers on the right.'],
    ['ከዜሮ ጀምረን ምልክቶቹን እንቁጠር።', 'Count the marks from zero.']],
  place: [['አንድ ዘንግ አስር ነው፤ አንድ ኩብ አንድ ነው።', 'One rod is ten; one cube is one.'],
    ['መጀመሪያ አስሮቹን፣ ከዚያ አንዶቹን እናስቀምጥ።', 'Put the tens first, then the ones.']],
  match: [['ቃሉን ቀስ ብለን እናንብብ።', 'Read the word slowly.'],
    ['በድምፅ ቁልፉ እናዳምጥ።', 'Tap the sound button to listen.']],
  geez: [['፩ አንድ፣ ፭ አምስት፣ ፲ አስር ነው።', '፩ is one, ፭ is five, ፲ is ten.'],
    ['የግዕዝ ቁጥሮች በቅደም ተከተል ፩ ፪ ፫ ፬ ፭ ፮ ፯ ፰ ፱ ፲ ናቸው።', 'Ge\'ez numerals in order are ፩ ፪ ፫ ፬ ፭ ፮ ፯ ፰ ፱ ፲.']],
  listen: [['እንደገና እናዳምጥ።', 'Listen again.'], ['ቁጥሩን በሹክሹክታ እንድገመው።', 'Whisper the number back to yourself.']],
  tf: [['ሥዕሉን በደንብ እንመልከት።', 'Look at the picture carefully.'], ['ቆጥረን እንፈትሽ።', 'Count to check.']],
  money: [['ከትልቁ ገንዘብ እንጀምር።', 'Start with the biggest money.'], ['ድምሩን እየቆጠርን እንጨምር።', 'Keep a running total as you add.']],
  trace: [['ከትልቁ ነጥብ እንጀምር።', 'Start at the big dot.'], ['መስመሩን ተከትለን ቀስ ብለን እንሳል።', 'Follow the line slowly.']],
  frac: [['ክፍሎቹ እኩል መሆን አለባቸው።', 'The parts must be equal.'], ['ሁለት ሩብ አንድ ግማሽ ይሆናሉ።', 'Two quarters make one half.']]
};
const pick = (opts) => opts.map((v) => (typeof v === 'object' ? v : { v }));

// type helpers ---------------------------------------------------------------
// children ride in the bajaj; everything else goes in the basket
const BOX = { child: { am: 'ባጃጁ', en: 'the bajaj', kind: 'bajaj' } };
const box = (thing) => BOX[thing] || { am: 'ቅርጫቱ', en: 'the basket', kind: 'basket' };
const dragCount = (thing, n, o = {}) => ex('drag_drop_count',
  o.prompt || (o.start ? [`${box(thing).am} ውስጥ ${word(o.start)} ${th(thing).am} አሉ። በአጠቃላይ ${word(n)} እንዲሆኑ ተጨማሪ እናስገባ።`,
    `There are ${o.start} ${th(thing).en} in ${box(thing).en}. Let's add more so there are ${n} in all.`]
    : [`${word(n)} ${th(thing).am}ን ወደ ${box(thing).am} እናስገባ።`, `Let's put ${n} ${th(thing).en} in ${box(thing).en}.`]),
  { items: { thing, supply: o.supply || Math.max(n + 3, 10) - (o.start || 0), mode: o.mode || 'add' },
    targets: o.targets || [{ id: box(thing).kind, kind: o.frame ? 'tenframe' : box(thing).kind, start: o.start || 0, need: n }],
    answer: o.targets ? o.targets.map((t) => t.need) : n }, o.hints || (o.start ? H.countOn : H.count));
const dragLeave = (thing, start, n) => ex('drag_drop_count',
  [`ዛፉ ላይ ${word(start)} ${th(thing).am} አሉ። ${word(n)} ብቻ እንዲቀሩ የተወሰኑትን ወደ ቅርጫቱ እናውርድ።`,
    `There are ${start} ${th(thing).en} on the tree. Let's take some down to the basket so only ${n} are left.`],
  { items: { thing, supply: 0, mode: 'remove' }, targets: [{ id: 'tree', kind: 'tree', start, need: n }], answer: n },
  [['ስንት ማውረድ እንዳለብን እናስብ፤ ' + word(start) + ' ሲቀነስ ' + word(n) + '።', `How many must come down? ${start} take away ${n}.`],
    ['አንድ በአንድ እያወረድን የቀሩትን እንቁጠር።', 'Take them down one at a time and count what is left.']]);
const equalGroups = (thing, groups, each) => dragCount(thing, groups * each, {
  prompt: [`በእያንዳንዱ ትሪ ላይ ${word(each)} ${th(thing).am}ን እናስቀምጥ።`, `Let's put ${each} ${th(thing).en} on each tray.`],
  targets: Array.from({ length: groups }, (_, i) => ({ id: 'tray' + (i + 1), kind: 'tray', start: 0, need: each })),
  supply: groups * each + 2,
  hints: [['እያንዳንዱ ትሪ እኩል ቁጥር ሊኖረው ይገባል።', 'Every tray must have the same number.'],
    [`በአንዱ ትሪ ላይ ${word(each)} ብቻ።`, `Only ${each} on each tray.`]] });
const eqn = (parts, answer, tiles, o = {}) => ex('drag_equation',
  o.prompt || ['ባዶውን ቦታ በትክክለኛው ቁጥር እንሙላ።', "Let's fill the empty box with the right number."],
  { equation: parts.map(String), items: tiles.map(String), targets: [{ id: 'blank' }], answer: String(answer),
    visual: o.visual }, o.hints || H.equation);
const sortEx = (prompt, bins, cards, hints) => ex('drag_sort', prompt,
  { targets: bins.map(([id, am, en]) => ({ id, am, en })),
    items: cards.map(([id, label, bin, visual]) => ({ id, label, visual })),
    answer: Object.fromEntries(cards.map(([id, , bin]) => [id, bin])) }, hints);
const line = (min, max, step, vals, o = {}) => ex('drag_numberline',
  o.prompt || ['ቁጥሮቹን በቁጥር መስመሩ ላይ በትክክለኛው ቦታ እናስቀምጥ።', "Let's put the numbers in their places on the number line."],
  { line: { min, max, step, labels: o.labels || 'ends' }, items: vals.map(String), answer: vals.map(String) }, H.numberline);
const build = (n, o = {}) => ex('drag_placevalue',
  o.prompt || [`${word(n)}ን በአስሮች እና በአንዶች እንሥራ።`, `Let's build ${n} with tens and ones.`],
  { items: { rods: true, cubes: true }, targets: [{ id: 'mat', tens: o.tens }], answer: n, max_tens: 9 }, o.hints || H.place);
const matchWords = (nums, o = {}) => ex('drag_match_word',
  o.geez ? ['እያንዳንዱን የግዕዝ ቁጥር ከቁጥሩ ጋር እናገናኝ።', "Let's match each Ge'ez numeral to its number."]
    : o.prompt || ['እያንዳንዱን ቃል ከቁጥሩ ጋር እናገናኝ።', "Let's match each word to its number."],
  (() => {
    const list = o.custom || nums.map((n) => ({
      item: o.geez ? { label: geez(n), lang: 'geez' } : { label: word(n), lang: 'am', audio_url: url(numKey(n)) },
      target: { label: String(n) } }));
    return { items: list.map((c, i) => Object.assign({ id: 'w' + i }, c.item)),
      targets: shuffleFixed(list.map((c, i) => Object.assign({ id: 't' + i }, c.target))),
      answer: Object.fromEntries(list.map((c, i) => ['w' + i, 't' + i])) };
  })(), o.geez ? H.geez : o.hints || H.match);
// deterministic shuffle so targets are not in the same order as the cards
function shuffleFixed(a) { const b = a.slice(); if (b.length > 1) b.push(b.shift()); return b; }
const pay = (price, itemAm, itemEn, wallet, o = {}) => ex('drag_make_change',
  [`${itemAm} ${word(price)} ብር ነው። ትክክለኛውን ብር እንክፈል።`, `The ${itemEn} costs ${price} birr. Let's pay exactly ${price} birr.`],
  { price, item: { am: itemAm, en: itemEn, pic: o.pic || 'bread' }, items: wallet, targets: [{ id: 'counter' }], answer: price }, H.money);
const frac = (prompt, pieces, answer, o = {}) => ex('drag_fraction', prompt,
  { shape: 'injera', parts: 4, items: pieces, targets: [{ id: 'injera', start: o.start || 0 }], answer }, H.frac);

const choose = (prompt, options, answer, visual, hints) => ex('tap_choose', prompt, { options: pick(options), answer, visual }, hints || H.tf);
const tapCount = (thing, n, options) => ex('tap_count',
  [`እያንዳንዱን ነካ አድርገን እንቁጠር። ስንት ${th(thing).am} አሉ?`, `Let's tap each one as we count. How many ${th(thing).en} are there?`],
  { items: { thing, n }, options: pick(options), answer: n }, H.count);
const numpad = (prompt, answer, visual, hints) => ex('numpad', prompt, { answer, visual, max_digits: String(answer).length > 1 ? 3 : 2 }, hints || H.equation);
const listen = (n, options, o = {}) => ex('listen_choose',
  ['እናዳምጥ፤ የሰማነውን ቁጥር እንንካ።', "Let's listen, then tap the number we hear."],
  { say: o.say || { am: word(n), en: word(n, 'en'), audio_url: url(numKey(n)) }, options: pick(options), answer: o.answer !== undefined ? o.answer : n }, H.listen);
const tf = (am, en, answer, visual) => ex('true_false', [`ልክ ነው ወይስ አይደለም? ${am}`, `True or not? ${en}`],
  { statement_am: am, statement_en: en, visual, answer }, H.tf);
const trace = (text, o = {}) => ex('trace',
  o.word ? [`«${text}» የሚለውን በጣታችን እንጻፍ።`, `Let's trace «${text}» with a finger.`]
    : [`ቁጥር ${word(Number(text))}ን በጣታችን እንጻፍ።`, `Let's trace the number ${text} with a finger.`],
  { text: String(text), script: o.word ? 'ethiopic' : 'digits', answer: String(text) }, H.trace);
const speak = (n) => Object.assign(ex('speak', [`«${word(n)}» ብለን ጮክ ብለን እንናገር።`, `Let's say «${word(n, 'en')}» out loud.`],
  { say: { am: word(n), en: word(n, 'en'), audio_url: url(numKey(n)) }, answer: n, optional: true },
  [['ቀስ ብለን እንናገር።', 'Say it slowly.']]), { optional: true });
const clock = (h, m, am, en) => ex('clock', [am, en], { answer: { h, m } },
  [['ትንሹ መርፌ ሰዓቱን፣ ትልቁ መርፌ ደቂቃውን ያሳያል።', 'The short hand shows the hour, the long hand the minutes.'],
    ['ተኩል ሲሆን ትልቁ መርፌ 6 ላይ ነው።', 'At half past, the long hand points to 6.']]);

// number-word clips num.N (0–100); 0–20 already exist from the app's own script
const NUMS = new Set();
function numKey(n) { NUMS.add(n); return `num.${n}`; }
const N = (n) => { NUMS.add(n); return n; };

// visual descriptors (drawn by src/activities.js)
const V = {
  group: (thing, n) => ({ kind: 'group', thing, n }),
  tensOnes: (t, o) => ({ kind: 'tens_ones', tens: t, ones: o }),
  compare: (thing, left, right) => ({ kind: 'compare', thing, left, right }),
  takeaway: (thing, n, gone) => ({ kind: 'takeaway', thing, n, gone }),
  frame: (n) => ({ kind: 'tenframe', n }),
  birr: (notes) => ({ kind: 'birr', notes }),
  injera: (parts, filled, equal = true) => ({ kind: 'injera', parts, filled, equal }),
  groups: (groups, thing = 'cup') => ({ kind: 'groups', groups, thing }),
  text: (text) => ({ kind: 'text', text })
};

// ---------- lesson plans ----------
// guided: 6 slots, each [level1, level2, level3] — the player moves between levels as the child does well
// or struggles. challenge: 5 questions. checkpoints pause the hook video before a moment it reveals.
const PLANS = {
  count10: () => ({
    place: 'garden', game: 'coffee',
    checkpoints: [
      { at: 'mark:after3', ex: choose(['እስካሁን ስንት አበቦችን ቆጠርን?', 'How many flowers have we counted so far?'], [2, 3, 4], 3) },
      { at: 'mark:total', ex: choose(['በአጠቃላይ ስንት አበቦች አሉ?', 'How many flowers are there in all?'], [5, 6, 7], 6) }],
    reteach: ['mark:count1', 'end'],
    guided: [
      [dragCount('orange', 4), dragCount('orange', 7), dragCount('orange', 10)],
      [tapCount('bean', 5, [4, 5, 6]), tapCount('bean', 8, [7, 8, 9]), tapCount('bean', 9, [8, 9, 10])],
      [matchWords([1, 2, 3]), matchWords([4, 5, 6]), matchWords([7, 8, 9])],
      [line(0, 10, 1, [3, 5]), line(0, 10, 1, [2, 6, 8]), line(0, 10, 1, [4, 7, 9], { labels: 'none' })],
      [listen(N(3), [3, 5, 8]), listen(N(6), [6, 9, 2]), listen(N(9), [6, 9, 7])],
      [dragCount('bean', 6), dragCount('bean', 8), dragCount('bean', 10)]],
    extra: [speak(N(5))],
    challenge: [dragCount('bean', 9), matchWords([5, 3, 8], { geez: true }),
      numpad(['ስንት ስኒዎች አሉ?', 'How many cups are there?'], 8, V.group('cup', 8), H.count),
      trace('5'), tf('ስድስት ማንጎዎች አሉ።', 'There are six mangoes.', true, V.group('mango', 6))],
    play: { game: 'coffee', rounds: [{ n: 3 }, { n: 5 }, { n: 7 }],
      intro: T('ለእንግዶቹ ቡና እንቅዳ! የተጠየቅነውን ያህል ስኒዎች እንሙላ።', "Let's pour coffee for the guests! Fill as many cups as asked.") }
  }),
  teens: () => ({
    place: 'market', game: 'memory',
    checkpoints: [
      { at: 'step:0', ex: choose(['አንድ ሙሉ የአስር ሳጥን ስንት ብርቱካኖች አሉት?', 'How many oranges fill one ten frame?'], [5, 10, 12], 10) },
      { at: 'step:2', ex: choose(['አስር እና አራት ስንት ነው?', 'What is ten and four?'], [13, 14, 41], 14) }],
    reteach: ['step:0', 'end'],
    guided: [
      [build(13), build(16), build(19)],
      [choose(['ስንት ነው?', 'How many is this?'], [15, 51, 6], 15, V.tensOnes(1, 5)),
        choose(['ስንት ነው?', 'How many is this?'], [71, 17, 8], 17, V.tensOnes(1, 7)),
        choose(['ስንት ነው?', 'How many is this?'], [19, 91, 10], 19, V.tensOnes(1, 9))],
      [eqn([10, '+', '__', '=', 14], 4, [4, 14, 3]), eqn([10, '+', '__', '=', 17], 7, [7, 17, 6]), eqn(['__', '+', 8, '=', 18], 10, [10, 8, 18])],
      [dragCount('orange', 12, { start: 10 }), dragCount('orange', 15, { start: 10 }), dragCount('orange', 18, { start: 10, supply: 10 })],
      [numpad(['አስር እና ስድስት ስንት ነው?', 'What is ten and six?'], 16, V.tensOnes(1, 6)),
        numpad(['አስር እና ሶስት ስንት ነው?', 'What is ten and three?'], 13),
        numpad(['አስር እና ዘጠኝ ስንት ነው?', 'What is ten and nine?'], 19)],
      [matchWords([N(11), N(12), N(13)]), matchWords([N(14), N(15), N(16)]), matchWords([N(17), N(18), N(19)])]],
    extra: [speak(N(14))],
    challenge: [build(17), line(10, 20, 1, [12, 15, 18]), listen(N(11), [11, 12, 21]),
      tf('አንድ አስር እና ሁለት አንዶች ሃያ አንድ ነው።', 'One ten and two ones is twenty-one.', false, V.tensOnes(1, 2)),
      numpad(['አስር እና ስምንት ስንት ነው?', 'What is ten and eight?'], 18)],
    play: { game: 'memory', pairs: [11, 13, 15, 18].map((n) => ({ n, am: word(N(n)), geez: geez(n) })),
      intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ቁጥር፣ ቃል እና የግዕዝ ቁጥር።', "Let's find matching cards: number, word and Ge'ez numeral.") }
  }),
  compare: () => ({
    place: 'school', game: 'race',
    checkpoints: [
      { at: 'step:0', ex: choose(['የትኛው ትሪ ብዙ ስኒዎች አሉት?', 'Which tray has more cups?'], [{ v: 'top', am: 'ላይኛው', en: 'Top' }, { v: 'bottom', am: 'ታችኛው', en: 'Bottom' }], 'top') },
      { at: 'step:1', ex: choose(['ስንት ስኒዎች ጓደኛ የላቸውም?', 'How many cups have no partner?'], [1, 2, 4], 2) }],
    reteach: ['step:0', 'end'],
    guided: [
      [sortEx(['ከአምስት የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than five, fewer than five."], [['more', 'ከ5 ይበልጣል', 'More than 5'], ['less', 'ከ5 ያንሳል', 'Fewer than 5']],
        [['a', '7', 'more', V.group('cup', 7)], ['b', '3', 'less', V.group('cup', 3)], ['c', '8', 'more', V.group('cup', 8)], ['d', '2', 'less', V.group('cup', 2)]], H.tf),
      sortEx(['ከአምስት የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than five, fewer than five."], [['more', 'ከ5 ይበልጣል', 'More than 5'], ['less', 'ከ5 ያንሳል', 'Fewer than 5']],
        [['a', '6', 'more', V.group('cup', 6)], ['b', '4', 'less', V.group('cup', 4)], ['c', '9', 'more', V.group('cup', 9)], ['d', '1', 'less', V.group('cup', 1)]], H.tf),
      sortEx(['ከስድስት የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than six, fewer than six."], [['more', 'ከ6 ይበልጣል', 'More than 6'], ['less', 'ከ6 ያንሳል', 'Fewer than 6']],
        [['a', '7', 'more'], ['b', '5', 'less'], ['c', '9', 'more'], ['d', '4', 'less'], ['e', '10', 'more']], H.numberline)],
      [choose(['የትኛው ብዙ ብርቱካኖች አሉት?', 'Which has more oranges?'], [{ v: 'left', am: 'ግራ', en: 'Left' }, { v: 'right', am: 'ቀኝ', en: 'Right' }], 'right', V.compare('orange', 3, 5)),
        choose(['የትኛው ጥቂት ብርቱካኖች አሉት?', 'Which has fewer oranges?'], [{ v: 'left', am: 'ግራ', en: 'Left' }, { v: 'right', am: 'ቀኝ', en: 'Right' }], 'left', V.compare('orange', 6, 7)),
        choose(['የትኛው ቁጥር ይበልጣል?', 'Which number is greater?'], [9, 6, 8], 9)],
      [line(0, 10, 1, [2, 7]), line(0, 10, 1, [3, 6, 9]), line(0, 10, 1, [1, 5, 8], { labels: 'none' })],
      [dragCount('cup', 4, { prompt: ['በቀኙ ትሪ ላይ ከግራው ጋር እኩል ስኒዎችን እናስቀምጥ።', "Let's put the same number of cups on the right tray as on the left."], targets: [{ id: 'tray', kind: 'tray', start: 0, need: 4, match: 4 }] }),
        dragCount('cup', 6, { prompt: ['በቀኙ ትሪ ላይ ከግራው ጋር እኩል ስኒዎችን እናስቀምጥ።', "Let's put the same number of cups on the right tray as on the left."], targets: [{ id: 'tray', kind: 'tray', start: 0, need: 6, match: 6 }] }),
        dragCount('cup', 7, { prompt: ['በቀኙ ትሪ ላይ ከግራው አንድ የሚበልጡ ስኒዎችን እናስቀምጥ።', "Let's put one more cup on the right tray than on the left."], targets: [{ id: 'tray', kind: 'tray', start: 0, need: 7, match: 6 }] })],
      [tf('ስምንት ከአምስት ይበልጣል።', 'Eight is more than five.', true), tf('ሶስት ከአራት ይበልጣል።', 'Three is more than four.', false), tf('ዘጠኝ ከአስር ያንሳል።', 'Nine is less than ten.', true)],
      [sortEx(['ከአስር የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than ten, less than ten."], [['more', 'ከ10 ይበልጣል', 'More than 10'], ['less', 'ከ10 ያንሳል', 'Less than 10']],
        [['a', '12', 'more'], ['b', '4', 'less'], ['c', '15', 'more'], ['d', '9', 'less']], H.numberline),
      sortEx(['ከአስር የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than ten, less than ten."], [['more', 'ከ10 ይበልጣል', 'More than 10'], ['less', 'ከ10 ያንሳል', 'Less than 10']],
        [['a', '11', 'more'], ['b', '7', 'less'], ['c', '18', 'more'], ['d', '6', 'less'], ['e', '13', 'more']], H.numberline),
      sortEx(['ከአስራ አምስት የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than fifteen, less than fifteen."], [['more', 'ከ15 ይበልጣል', 'More than 15'], ['less', 'ከ15 ያንሳል', 'Less than 15']],
        [['a', '19', 'more'], ['b', '14', 'less'], ['c', '16', 'more'], ['d', '11', 'less'], ['e', '20', 'more']], H.numberline)]],
    challenge: [
      sortEx(['ከስድስት የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than six, fewer than six."], [['more', 'ከ6 ይበልጣል', 'More than 6'], ['less', 'ከ6 ያንሳል', 'Fewer than 6']],
        [['a', '8', 'more', V.group('orange', 8)], ['b', '2', 'less', V.group('orange', 2)], ['c', '9', 'more', V.group('orange', 9)], ['d', '5', 'less', V.group('orange', 5)]], H.tf),
      dragCount('cup', 6, { prompt: ['በቀኙ ትሪ ላይ ከግራው ሁለት የሚበልጡ ስኒዎችን እናስቀምጥ።', "Let's put two more cups on the right tray than on the left."], targets: [{ id: 'tray', kind: 'tray', start: 0, need: 6, match: 4 }] }),
      listen(N(7), [7, 1, 17]),
      choose(['ከእነዚህ ትልቁ ቁጥር የትኛው ነው?', 'Which is the biggest number?'], [6, 10, 8], 10),
      numpad(['ግራው ስንት ተጨማሪ ስኒዎች አሉት?', 'How many more cups does the left tray have?'], 2, V.compare('cup', 6, 4), H.tf)],
    play: { game: 'race', questions: [
      choose(['የትኛው ይበልጣል?', 'Which is more?'], [4, 7], 7), choose(['የትኛው ያንሳል?', 'Which is less?'], [9, 5], 5),
      choose(['የትኛው ይበልጣል?', 'Which is more?'], [12, 10], 12), choose(['የትኛው ያንሳል?', 'Which is less?'], [3, 8], 3),
      choose(['የትኛው ይበልጣል?', 'Which is more?'], [15, 18], 18)],
      intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
  }),
  add10: () => ({
    place: 'road', game: 'balloon',
    checkpoints: [
      { at: 'step:1', ex: choose(['ባጃጁ ውስጥ ስንት ልጆች አሉ?', 'How many children are in the bajaj?'], [2, 3, 4], 3) },
      { at: 'step:2', ex: choose(['አሁን ባጃጁ ውስጥ ስንት ልጆች አሉ?', 'How many children are in the bajaj now?'], [4, 5, 6], 5) }],
    reteach: ['step:0', 'end'],
    guided: [
      [dragCount('child', 6, { start: 4 }), dragCount('child', 7, { start: 4 }), dragCount('child', 9, { start: 5 })],
      [eqn([2, '+', '__', '=', 5], 3, [3, 5, 2]), eqn([3, '+', '__', '=', 7], 4, [4, 3, 10]), eqn(['__', '+', 5, '=', 9], 4, [4, 5, 14])],
      [choose(['ሁለት ሲደመር አራት ስንት ነው?', 'What is two plus four?'], [5, 6, 7], 6, V.group('orange', 6)),
        choose(['አምስት ሲደመር ሶስት ስንት ነው?', 'What is five plus three?'], [7, 8, 9], 8),
        choose(['ስድስት ሲደመር አራት ስንት ነው?', 'What is six plus four?'], [9, 10, 11], 10)],
      [eqn([4, '+', 2, '=', '__'], 6, [6, 5, 8]), eqn([5, '+', 4, '=', '__'], 9, [9, 8, 1]), eqn([6, '+', 3, '=', '__'], 9, [9, 3, 8])],
      [numpad(['ስድስት ሲደመር ሶስት ስንት ነው?', 'What is six plus three?'], 9), numpad(['ሰባት ሲደመር ሁለት ስንት ነው?', 'What is seven plus two?'], 9),
        numpad(['አራት ሲደመር አምስት ስንት ነው?', 'What is four plus five?'], 9)],
      [sortEx(['ስምንት የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes eight, doesn't make eight."], [['yes', '8 ነው', 'Makes 8'], ['no', '8 አይደለም', 'Not 8']],
        [['a', '5 + 3', 'yes'], ['b', '4 + 3', 'no'], ['c', '6 + 2', 'yes'], ['d', '2 + 5', 'no']], H.equation),
      sortEx(['ዘጠኝ የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes nine, doesn't make nine."], [['yes', '9 ነው', 'Makes 9'], ['no', '9 አይደለም', 'Not 9']],
        [['a', '5 + 4', 'yes'], ['b', '6 + 2', 'no'], ['c', '7 + 2', 'yes'], ['d', '3 + 5', 'no'], ['e', '8 + 1', 'yes']], H.equation),
      sortEx(['አስር የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes ten, doesn't make ten."], [['yes', '10 ነው', 'Makes 10'], ['no', '10 አይደለም', 'Not 10']],
        [['a', '6 + 4', 'yes'], ['b', '7 + 2', 'no'], ['c', '3 + 7', 'yes'], ['d', '5 + 4', 'no'], ['e', '8 + 2', 'yes']], H.equation)]],
    challenge: [eqn([2, '+', '__', '=', 9], 7, [7, 9, 6]), dragCount('child', 9, { start: 5 }), listen(N(7), [7, 6, 9]),
      tf('አራት ሲደመር አራት ዘጠኝ ነው።', 'Four plus four is nine.', false), numpad(['ሰባት ሲደመር ሁለት ስንት ነው?', 'What is seven plus two?'], 9)],
    play: { game: 'balloon', rounds: [{ target: 7, balloons: [3, 4, 2, 6, 1, 5] }, { target: 9, balloons: [4, 5, 7, 3, 2, 8] }, { target: 10, balloons: [6, 3, 4, 8, 7, 5] }],
      intro: T('ሁለት ፊኛዎችን ፈንድተን የተጠየቀውን ቁጥር እንሥራ።', "Pop two balloons that add up to the number.") }
  }),
  sub10: () => ({
    place: 'tree', game: 'race',
    checkpoints: [
      { at: 'step:2', ex: choose(['ስንት ማንጎዎች ወደቁ?', 'How many mangoes fell?'], [2, 3, 4], 3) },
      { at: 'step:3', ex: choose(['ስንት ማንጎዎች ቀሩ?', 'How many mangoes are left?'], [3, 4, 10], 4) }],
    reteach: ['step:0', 'end'],
    guided: [
      [dragLeave('mango', 6, 4), dragLeave('mango', 8, 5), dragLeave('mango', 10, 3)],
      [eqn([5, '−', 2, '=', '__'], 3, [3, 7, 2]), eqn([7, '−', 3, '=', '__'], 4, [4, 10, 3]), eqn([9, '−', 5, '=', '__'], 4, [4, 5, 14])],
      [choose(['ስንት ቀሩ?', 'How many are left?'], [2, 3, 5], 3, V.takeaway('mango', 5, 2)),
        choose(['ስንት ቀሩ?', 'How many are left?'], [3, 4, 7], 4, V.takeaway('mango', 7, 3)),
        choose(['ስንት ቀሩ?', 'How many are left?'], [3, 4, 5], 5, V.takeaway('mango', 9, 4))],
      [eqn([6, '−', '__', '=', 4], 2, [2, 4, 10]), eqn([9, '−', '__', '=', 5], 4, [4, 5, 14]), eqn(['__', '−', 3, '=', 6], 9, [9, 3, 6])],
      [numpad(['ሰባት ሲቀነስ ሁለት ስንት ነው?', 'What is seven minus two?'], 5), numpad(['አስር ሲቀነስ ስድስት ስንት ነው?', 'What is ten minus six?'], 4),
        numpad(['ዘጠኝ ሲቀነስ ሰባት ስንት ነው?', 'What is nine minus seven?'], 2)],
      [sortEx(['ሶስት የሚቀሩትን እና የማይቀሩትን እንለይ።', "Let's sort: leaves three, doesn't leave three."], [['yes', '3 ይቀራል', 'Leaves 3'], ['no', '3 አይቀርም', 'Not 3']],
        [['a', '5 − 2', 'yes'], ['b', '6 − 2', 'no'], ['c', '7 − 4', 'yes'], ['d', '4 − 3', 'no']], H.equation),
      sortEx(['አራት የሚቀሩትን እና የማይቀሩትን እንለይ።', "Let's sort: leaves four, doesn't leave four."], [['yes', '4 ይቀራል', 'Leaves 4'], ['no', '4 አይቀርም', 'Not 4']],
        [['a', '7 − 3', 'yes'], ['b', '8 − 3', 'no'], ['c', '9 − 5', 'yes'], ['d', '6 − 1', 'no'], ['e', '10 − 6', 'yes']], H.equation),
      sortEx(['አምስት የሚቀሩትን እና የማይቀሩትን እንለይ።', "Let's sort: leaves five, doesn't leave five."], [['yes', '5 ይቀራል', 'Leaves 5'], ['no', '5 አይቀርም', 'Not 5']],
        [['a', '9 − 4', 'yes'], ['b', '10 − 4', 'no'], ['c', '8 − 3', 'yes'], ['d', '7 − 3', 'no'], ['e', '10 − 5', 'yes']], H.equation)]],
    challenge: [dragLeave('mango', 9, 6), eqn([8, '−', '__', '=', 5], 3, [3, 5, 13]),
      tf('ስምንት ሲቀነስ ሶስት አምስት ነው።', 'Eight minus three is five.', true), listen(N(4), [4, 14, 5]),
      numpad(['አስር ሲቀነስ ሰባት ስንት ነው?', 'What is ten minus seven?'], 3)],
    play: { game: 'race', questions: [
      choose(['አምስት ሲቀነስ አንድ?', 'Five minus one?'], [4, 6], 4), choose(['ሰባት ሲቀነስ ሁለት?', 'Seven minus two?'], [5, 9], 5),
      choose(['ስምንት ሲቀነስ አራት?', 'Eight minus four?'], [4, 3], 4), choose(['ስድስት ሲቀነስ ሶስት?', 'Six minus three?'], [2, 3], 3),
      choose(['አስር ሲቀነስ አምስት?', 'Ten minus five?'], [5, 15], 5)],
      intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
  }),
  make10: () => ({
    place: 'meadow', game: 'balloon',
    checkpoints: [
      { at: 'step:1', ex: choose(['ስምንት አስር እንዲሆን ስንት ያስፈልገዋል?', 'How many more does eight need to make ten?'], [1, 2, 3], 2) },
      { at: 'step:2', ex: choose(['አስር እና ሶስት ስንት ነው?', 'What is ten and three?'], [12, 13, 30], 13) }],
    reteach: ['step:0', 'end'],
    guided: [
      [dragCount('counter', 10, { start: 7, frame: true, prompt: ['የአስሩን ሳጥን በጠጠሮች እንሙላ።', "Let's fill the ten frame with counters."] }),
        dragCount('counter', 10, { start: 6, frame: true, prompt: ['የአስሩን ሳጥን በጠጠሮች እንሙላ።', "Let's fill the ten frame with counters."] }),
        dragCount('counter', 10, { start: 3, frame: true, prompt: ['የአስሩን ሳጥን በጠጠሮች እንሙላ።', "Let's fill the ten frame with counters."] })],
      [eqn([8, '+', '__', '=', 10], 2, [2, 3, 8]), eqn([7, '+', '__', '=', 10], 3, [3, 4, 7]), eqn([4, '+', '__', '=', 10], 6, [6, 4, 5])],
      [choose(['የትኞቹ ሁለት ቁጥሮች አስር ይሆናሉ?', 'Which pair makes ten?'], [{ v: 'a', label: '6 + 4' }, { v: 'b', label: '5 + 4' }, { v: 'c', label: '7 + 2' }], 'a'),
        choose(['የትኞቹ ሁለት ቁጥሮች አስር ይሆናሉ?', 'Which pair makes ten?'], [{ v: 'a', label: '6 + 3' }, { v: 'b', label: '3 + 7' }, { v: 'c', label: '8 + 1' }], 'b'),
        choose(['የትኞቹ ሁለት ቁጥሮች አስር ይሆናሉ?', 'Which pair makes ten?'], [{ v: 'a', label: '5 + 4' }, { v: 'b', label: '6 + 5' }, { v: 'c', label: '9 + 1' }], 'c')],
      [sortEx(['አስር የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes ten, doesn't make ten."], [['yes', '10 ነው', 'Makes 10'], ['no', '10 አይደለም', 'Not 10']],
        [['a', '5 + 5', 'yes'], ['b', '6 + 3', 'no'], ['c', '8 + 2', 'yes'], ['d', '7 + 4', 'no']], H.equation),
      sortEx(['አስር የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes ten, doesn't make ten."], [['yes', '10 ነው', 'Makes 10'], ['no', '10 አይደለም', 'Not 10']],
        [['a', '9 + 1', 'yes'], ['b', '6 + 5', 'no'], ['c', '3 + 7', 'yes'], ['d', '4 + 5', 'no'], ['e', '2 + 8', 'yes']], H.equation),
      sortEx(['አስር የሚሆኑትን እና የማይሆኑትን እንለይ።', "Let's sort: makes ten, doesn't make ten."], [['yes', '10 ነው', 'Makes 10'], ['no', '10 አይደለም', 'Not 10']],
        [['a', '4 + 6', 'yes'], ['b', '7 + 2', 'no'], ['c', '1 + 9', 'yes'], ['d', '5 + 6', 'no'], ['e', '8 + 3', 'no']], H.equation)],
      [numpad(['ዘጠኝ ሲደመር ሁለት ስንት ነው?', 'What is nine plus two?'], 11, V.frame(9)), numpad(['ዘጠኝ ሲደመር አራት ስንት ነው?', 'What is nine plus four?'], 13),
        numpad(['ሰባት ሲደመር አምስት ስንት ነው?', 'What is seven plus five?'], 12)],
      [eqn([8, '+', 3, '=', 10, '+', '__'], 1, [1, 3, 11]), eqn([8, '+', 5, '=', 10, '+', '__'], 3, [3, 5, 13]), eqn([7, '+', 6, '=', 10, '+', '__'], 3, [3, 6, 4])]],
    challenge: [eqn([4, '+', '__', '=', 10], 6, [6, 4, 5]), dragCount('counter', 10, { start: 5, frame: true, prompt: ['የአስሩን ሳጥን በጠጠሮች እንሙላ።', "Let's fill the ten frame with counters."] }),
      tf('ስድስት ሲደመር አራት አስር ነው።', 'Six plus four is ten.', true), listen(N(12), [12, 20, 2]),
      numpad(['ሰባት ሲደመር አምስት ስንት ነው?', 'What is seven plus five?'], 12)],
    play: { game: 'balloon', rounds: [{ target: 10, balloons: [3, 7, 4, 5, 8, 1] }, { target: 10, balloons: [6, 2, 9, 4, 3, 5] }, { target: 10, balloons: [8, 1, 7, 2, 6, 5] }],
      intro: T('ሁለት ፊኛዎችን ፈንድተን አስር እንሥራ።', "Pop two balloons that make ten.") }
  }),
  // ---------------- Grade 2 ----------------
  g2_placevalue: () => ({
    place: 'home', game: 'memory',
    checkpoints: [
      { at: 'step:0', ex: choose(['በአንድ እስር ውስጥ ስንት እንጨቶች አሉ?', 'How many sticks are in one bundle?'], [5, 10, 100], 10) },
      { at: 'step:1', ex: choose(['ሶስት እስሮች ስንት እንጨቶች ናቸው?', 'How many sticks are three bundles?'], [3, 13, 30], 30) }],
    reteach: ['step:0', 'end'],
    guided: [
      [build(23), build(46), build(78)],
      [choose(['ስንት ነው?', 'How many is this?'], [42, 24, 6], 42, V.tensOnes(4, 2)), choose(['ስንት ነው?', 'How many is this?'], [35, 53, 8], 53, V.tensOnes(5, 3)),
        choose(['ስንት ነው?', 'How many is this?'], [70, 17, 7], 70, V.tensOnes(7, 0))],
      [matchWords([N(34), N(43), N(30)]), matchWords([N(56), N(65), N(50)]), matchWords([N(81), N(18), N(88)])],
      [line(0, 100, 10, [20, 50, 80], { labels: 'tens' }), line(0, 100, 10, [30, 60, 90], { labels: 'ends' }), line(0, 50, 5, [15, 25, 45], { labels: 'tens' })],
      [numpad(['አምስት አስሮች እና ሶስት አንዶች ስንት ናቸው?', 'What is five tens and three ones?'], 53), numpad(['ሰባት አስሮች እና ዘጠኝ አንዶች ስንት ናቸው?', 'What is seven tens and nine ones?'], 79),
        numpad(['ዘጠኝ አስሮች እና ዜሮ አንዶች ስንት ናቸው?', 'What is nine tens and zero ones?'], 90)],
      [sortEx(['ከሃምሳ የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than fifty, less than fifty."], [['more', 'ከ50 ይበልጣል', 'More than 50'], ['less', 'ከ50 ያንሳል', 'Less than 50']],
        [['a', '72', 'more'], ['b', '34', 'less'], ['c', '61', 'more'], ['d', '15', 'less']], H.place),
      sortEx(['ከሃምሳ የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than fifty, less than fifty."], [['more', 'ከ50 ይበልጣል', 'More than 50'], ['less', 'ከ50 ያንሳል', 'Less than 50']],
        [['a', '59', 'more'], ['b', '45', 'less'], ['c', '95', 'more'], ['d', '49', 'less'], ['e', '51', 'more']], H.place),
      sortEx(['አስሮቹ ሶስት የሆኑትን እና ያልሆኑትን እንለይ።', "Let's sort: three tens, not three tens."], [['yes', '3 አስሮች', '3 tens'], ['no', '3 አስሮች አይደሉም', 'Not 3 tens']],
        [['a', '34', 'yes'], ['b', '43', 'no'], ['c', '39', 'yes'], ['d', '13', 'no'], ['e', '30', 'yes']], H.place)]],
    extra: [speak(N(34))],
    challenge: [build(65), matchWords([34, 52, 18], { geez: true }), listen(N(52), [52, 25, 50]),
      tf('ስድስት አስሮች እና አንድ አንድ አስራ ስድስት ነው።', 'Six tens and one one is sixteen.', false, V.tensOnes(6, 1)), trace('34')],
    play: { game: 'memory', pairs: [20, 34, 50, 71].map((n) => ({ n, am: word(N(n)), geez: geez(n) })),
      intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ቁጥር፣ ቃል እና የግዕዝ ቁጥር።', "Let's find matching cards: number, word and Ge'ez numeral.") }
  }),
  g2_add2d: () => ({
    place: 'library', game: 'balloon',
    checkpoints: [
      { at: 'step:1', ex: choose(['ሰባት እና አምስት ስንት ነው?', 'What is seven and five?'], [11, 12, 13], 12) },
      { at: 'step:3', ex: choose(['አሁን ስንት አስሮች አሉ?', 'How many tens are there now?'], [3, 4, 5], 4) }],
    reteach: ['step:1', 'end'],
    guided: [
      [eqn([24, '+', 13, '=', '__'], 37, [37, 27, 11]), eqn([27, '+', 15, '=', '__'], 42, [42, 32, 312]), eqn([38, '+', 46, '=', '__'], 84, [84, 74, 714])],
      [choose(['ሰባት አንዶች እና አምስት አንዶች ስንት ናቸው?', 'What are seven ones and five ones?'], [{ v: 'a', am: 'አንድ አስር እና ሁለት አንዶች', en: '1 ten and 2 ones' }, { v: 'b', am: 'አስራ ሁለት አስሮች', en: '12 tens' }, { v: 'c', am: 'ሁለት አንዶች', en: '2 ones' }], 'a'),
        choose(['ስምንት አንዶች እና ስድስት አንዶች ስንት ናቸው?', 'What are eight ones and six ones?'], [{ v: 'a', am: 'አስራ አራት አስሮች', en: '14 tens' }, { v: 'b', am: 'አንድ አስር እና አራት አንዶች', en: '1 ten and 4 ones' }, { v: 'c', am: 'አራት አንዶች', en: '4 ones' }], 'b'),
        choose(['ዘጠኝ አንዶች እና ዘጠኝ አንዶች ስንት ናቸው?', 'What are nine ones and nine ones?'], [{ v: 'a', am: 'ስምንት አንዶች', en: '8 ones' }, { v: 'b', am: 'አስራ ስምንት አስሮች', en: '18 tens' }, { v: 'c', am: 'አንድ አስር እና ስምንት አንዶች', en: '1 ten and 8 ones' }], 'c')],
      [build(37), build(42), build(61)],
      [eqn([30, '+', '__', '=', 45], 15, [15, 75, 51]), eqn([25, '+', '__', '=', 50], 25, [25, 35, 75]), eqn([46, '+', '__', '=', 80], 34, [34, 44, 126])],
      [numpad(['ሰላሳ ስድስት ሲደመር ሃያ ሁለት ስንት ነው?', 'What is thirty-six plus twenty-two?'], 58), numpad(['ሰላሳ ስድስት ሲደመር ሃያ ስምንት ስንት ነው?', 'What is thirty-six plus twenty-eight?'], 64),
        numpad(['አርባ ዘጠኝ ሲደመር ሰላሳ ሰባት ስንት ነው?', 'What is forty-nine plus thirty-seven?'], 86)],
      [sortEx(['አዲስ አስር የሚያስፈልጋቸውን እንለይ።', "Let's sort: needs a new ten, doesn't."], [['yes', 'አዲስ አስር', 'New ten'], ['no', 'አዲስ አስር የለም', 'No new ten']],
        [['a', '27 + 15', 'yes'], ['b', '22 + 13', 'no'], ['c', '38 + 4', 'yes'], ['d', '41 + 5', 'no']], H.place),
      sortEx(['አዲስ አስር የሚያስፈልጋቸውን እንለይ።', "Let's sort: needs a new ten, doesn't."], [['yes', 'አዲስ አስር', 'New ten'], ['no', 'አዲስ አስር የለም', 'No new ten']],
        [['a', '19 + 6', 'yes'], ['b', '34 + 25', 'no'], ['c', '46 + 18', 'yes'], ['d', '52 + 7', 'no'], ['e', '65 + 25', 'yes']], H.place),
      sortEx(['አዲስ አስር የሚያስፈልጋቸውን እንለይ።', "Let's sort: needs a new ten, doesn't."], [['yes', 'አዲስ አስር', 'New ten'], ['no', 'አዲስ አስር የለም', 'No new ten']],
        [['a', '57 + 33', 'yes'], ['b', '61 + 28', 'no'], ['c', '29 + 29', 'yes'], ['d', '44 + 45', 'no'], ['e', '73 + 18', 'yes']], H.place)]],
    challenge: [eqn([45, '+', 27, '=', '__'], 72, [72, 62, 612]), build(53), tf('አስራ ዘጠኝ ሲደመር አምስት ሃያ አራት ነው።', 'Nineteen plus five is twenty-four.', true),
      listen(N(64), [64, 46, 60]), numpad(['ሃምሳ ስድስት ሲደመር አስራ ሰባት ስንት ነው?', 'What is fifty-six plus seventeen?'], 73)],
    play: { game: 'balloon', rounds: [{ target: 30, balloons: [15, 12, 18, 25, 5, 9] }, { target: 50, balloons: [27, 23, 19, 35, 14, 8] }, { target: 60, balloons: [38, 22, 45, 17, 26, 11] }],
      intro: T('ሁለት ፊኛዎችን ፈንድተን የተጠየቀውን ቁጥር እንሥራ።', "Pop two balloons that add up to the number.") }
  }),
  g2_sub2d: () => ({
    place: 'market', game: 'race',
    checkpoints: [
      { at: 'step:1', ex: choose(['ከሁለት አንዶች ሰባት መውሰድ እንችላለን?', 'Can we take seven ones from two ones?'], [{ v: 'yes', am: 'አዎ', en: 'Yes' }, { v: 'no', am: 'አይ', en: 'No' }], 'no') },
      { at: 'step:3', ex: choose(['አስራ ሁለት ሲቀነስ ሰባት ስንት ነው?', 'What is twelve minus seven?'], [4, 5, 6], 5) }],
    reteach: ['step:1', 'end'],
    guided: [
      [eqn([48, '−', 23, '=', '__'], 25, [25, 71, 35]), eqn([42, '−', 17, '=', '__'], 25, [25, 35, 59]), eqn([61, '−', 28, '=', '__'], 33, [33, 47, 89])],
      [choose(['አራት አስሮች እና ሁለት አንዶች = ሶስት አስሮች እና ስንት አንዶች?', '4 tens and 2 ones = 3 tens and how many ones?'], [2, 10, 12], 12, V.tensOnes(4, 2)),
        choose(['አምስት አስሮች እና አንድ አንድ = አራት አስሮች እና ስንት አንዶች?', '5 tens and 1 one = 4 tens and how many ones?'], [1, 11, 15], 11, V.tensOnes(5, 1)),
        choose(['ስድስት አስሮች = አምስት አስሮች እና ስንት አንዶች?', '6 tens = 5 tens and how many ones?'], [0, 6, 10], 10, V.tensOnes(6, 0))],
      [build(42, { tens: 3, prompt: ['አርባ ሁለትን በሶስት አስሮች ብቻ እንሥራ።', "Let's build forty-two using only three tens."], hints: [['አንድ አስር ወደ አስር አንዶች ይቀየራል።', 'One ten changes into ten ones.'], ['ሶስት አስሮች ሰላሳ ናቸው፤ ስንት አንዶች ይቀራሉ?', 'Three tens are thirty; how many ones are left?']] }),
        build(35, { tens: 2, prompt: ['ሰላሳ አምስትን በሁለት አስሮች ብቻ እንሥራ።', "Let's build thirty-five using only two tens."], hints: [['አንድ አስር ወደ አስር አንዶች ይቀየራል።', 'One ten changes into ten ones.'], ['ሁለት አስሮች ሃያ ናቸው፤ ስንት አንዶች ይቀራሉ?', 'Two tens are twenty; how many ones are left?']] }),
        build(53, { tens: 4, prompt: ['ሃምሳ ሶስትን በአራት አስሮች ብቻ እንሥራ።', "Let's build fifty-three using only four tens."], hints: [['አንድ አስር ወደ አስር አንዶች ይቀየራል።', 'One ten changes into ten ones.'], ['አራት አስሮች አርባ ናቸው፤ ስንት አንዶች ይቀራሉ?', 'Four tens are forty; how many ones are left?']] })],
      [eqn([50, '−', '__', '=', 30], 20, [20, 80, 2]), eqn([50, '−', '__', '=', 32], 18, [18, 28, 82]), eqn([70, '−', '__', '=', 26], 44, [44, 54, 96])],
      [numpad(['ስልሳ ሶስት ሲቀነስ ሃያ ስንት ነው?', 'What is sixty-three minus twenty?'], 43), numpad(['ስልሳ ሶስት ሲቀነስ ሃያ አምስት ስንት ነው?', 'What is sixty-three minus twenty-five?'], 38),
        numpad(['ሰማንያ አራት ሲቀነስ አርባ ሰባት ስንት ነው?', 'What is eighty-four minus forty-seven?'], 37)],
      [sortEx(['አስር መፍታት የሚያስፈልጋቸውን እንለይ።', "Let's sort: must break a ten, doesn't."], [['yes', 'አስር እንፈታለን', 'Break a ten'], ['no', 'አያስፈልግም', 'No need']],
        [['a', '42 − 17', 'yes'], ['b', '58 − 23', 'no'], ['c', '30 − 14', 'yes'], ['d', '67 − 5', 'no']], H.place),
      sortEx(['አስር መፍታት የሚያስፈልጋቸውን እንለይ።', "Let's sort: must break a ten, doesn't."], [['yes', 'አስር እንፈታለን', 'Break a ten'], ['no', 'አያስፈልግም', 'No need']],
        [['a', '51 − 9', 'yes'], ['b', '76 − 34', 'no'], ['c', '63 − 28', 'yes'], ['d', '89 − 7', 'no'], ['e', '40 − 15', 'yes']], H.place),
      sortEx(['አስር መፍታት የሚያስፈልጋቸውን እንለይ።', "Let's sort: must break a ten, doesn't."], [['yes', 'አስር እንፈታለን', 'Break a ten'], ['no', 'አያስፈልግም', 'No need']],
        [['a', '82 − 47', 'yes'], ['b', '95 − 42', 'no'], ['c', '71 − 36', 'yes'], ['d', '64 − 31', 'no'], ['e', '50 − 23', 'yes']], H.place)]],
    challenge: [eqn([71, '−', 36, '=', '__'], 35, [35, 45, 107]), line(20, 50, 5, [25, 40], { labels: 'tens' }),
      tf('ሃምሳ ሲቀነስ አስራ ስምንት ሰላሳ ሁለት ነው።', 'Fifty minus eighteen is thirty-two.', true), listen(N(25), [25, 52, 35]),
      numpad(['ሰማንያ አራት ሲቀነስ አርባ ሰባት ስንት ነው?', 'What is eighty-four minus forty-seven?'], 37)],
    play: { game: 'race', questions: [
      choose(['ሰላሳ ሲቀነስ አስር?', 'Thirty minus ten?'], [20, 40], 20), choose(['አርባ ሁለት ሲቀነስ ሁለት?', 'Forty-two minus two?'], [40, 44], 40),
      choose(['ሃምሳ ሲቀነስ አምስት?', 'Fifty minus five?'], [45, 55], 45), choose(['ሰላሳ ሶስት ሲቀነስ አስራ አራት?', 'Thirty-three minus fourteen?'], [19, 21], 19),
      choose(['ስልሳ ሲቀነስ ሃያ አምስት?', 'Sixty minus twenty-five?'], [35, 45], 35)],
      intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
  }),
  g2_groups: () => ({
    place: 'ceremony', game: 'coffee',
    checkpoints: [
      { at: 'step:0', ex: choose(['በአንድ ትሪ ላይ ስንት ስኒዎች አሉ?', 'How many cups are on one tray?'], [3, 4, 12], 4) },
      { at: 'step:2', ex: choose(['ከሶስት ቡድኖች በአራት በአራት ጋር የሚመሳሰለው የትኛው ነው?', 'Which is the same as three groups of four?'], [{ v: 'a', label: '3 × 4' }, { v: 'b', label: '3 + 4' }, { v: 'c', label: '4 − 3' }], 'a', V.groups([4, 4, 4])) }],
    reteach: ['step:0', 'end'],
    guided: [
      [equalGroups('cup', 2, 3), equalGroups('cup', 3, 3), equalGroups('cup', 3, 4)],
      [choose(['ይህ የትኛው ነው?', 'Which one is this?'], [{ v: 'a', label: '2 × 5' }, { v: 'b', label: '2 + 5' }, { v: 'c', label: '5 × 5' }], 'a', V.groups([5, 5])),
        choose(['ይህ የትኛው ነው?', 'Which one is this?'], [{ v: 'a', label: '3 + 3' }, { v: 'b', label: '4 × 3' }, { v: 'c', label: '3 × 4' }], 'b', V.groups([3, 3, 3, 3])),
        choose(['ይህ የትኛው ነው?', 'Which one is this?'], [{ v: 'a', label: '5 × 2' }, { v: 'b', label: '2 × 2' }, { v: 'c', label: '5 + 2' }], 'a', V.groups([2, 2, 2, 2, 2]))],
      [eqn([2, '×', '__', '=', 6], 3, [3, 4, 12]), eqn([3, '×', '__', '=', 12], 4, [4, 9, 15]), eqn([4, '×', '__', '=', 20], 5, [5, 16, 24])],
      [matchWords([], { prompt: ['እያንዳንዱን መደመር ከማባዛቱ ጋር እናገናኝ።', "Let's match each addition to its multiplication."],
        custom: [{ item: { label: '2 + 2 + 2' }, target: { label: '3 × 2' } }, { item: { label: '5 + 5' }, target: { label: '2 × 5' } }], hints: H.equation }),
        matchWords([], { prompt: ['እያንዳንዱን መደመር ከማባዛቱ ጋር እናገናኝ።', "Let's match each addition to its multiplication."],
          custom: [{ item: { label: '4 + 4 + 4' }, target: { label: '3 × 4' } }, { item: { label: '3 + 3 + 3 + 3' }, target: { label: '4 × 3' } }, { item: { label: '2 + 2' }, target: { label: '2 × 2' } }], hints: H.equation }),
        matchWords([], { prompt: ['እያንዳንዱን መደመር ከማባዛቱ ጋር እናገናኝ።', "Let's match each addition to its multiplication."],
          custom: [{ item: { label: '5 + 5 + 5' }, target: { label: '3 × 5' } }, { item: { label: '3 + 3 + 3 + 3 + 3' }, target: { label: '5 × 3' } }, { item: { label: '4 + 4' }, target: { label: '2 × 4' } }], hints: H.equation })],
      [numpad(['አምስት ቡድኖች በሁለት በሁለት ስንት ናቸው?', 'How many are five groups of two?'], 10, V.groups([2, 2, 2, 2, 2])),
        numpad(['ሶስት ቡድኖች በአምስት በአምስት ስንት ናቸው?', 'How many are three groups of five?'], 15),
        numpad(['አራት ቡድኖች በአራት በአራት ስንት ናቸው?', 'How many are four groups of four?'], 16)],
      [sortEx(['እኩል ቡድኖችን እና እኩል ያልሆኑትን እንለይ።', "Let's sort: equal groups, not equal groups."], [['yes', 'እኩል', 'Equal'], ['no', 'እኩል አይደለም', 'Not equal']],
        [['a', '', 'yes', V.groups([3, 3, 3])], ['b', '', 'no', V.groups([3, 2, 4])], ['c', '', 'yes', V.groups([2, 2])], ['d', '', 'no', V.groups([4, 1])]], H.tf),
      sortEx(['እኩል ቡድኖችን እና እኩል ያልሆኑትን እንለይ።', "Let's sort: equal groups, not equal groups."], [['yes', 'እኩል', 'Equal'], ['no', 'እኩል አይደለም', 'Not equal']],
        [['a', '', 'yes', V.groups([4, 4, 4])], ['b', '', 'no', V.groups([4, 4, 3])], ['c', '', 'yes', V.groups([5, 5])], ['d', '', 'no', V.groups([2, 3, 2])]], H.tf),
      sortEx(['እኩል ቡድኖችን እና እኩል ያልሆኑትን እንለይ።', "Let's sort: equal groups, not equal groups."], [['yes', 'እኩል', 'Equal'], ['no', 'እኩል አይደለም', 'Not equal']],
        [['a', '', 'yes', V.groups([2, 2, 2, 2])], ['b', '', 'no', V.groups([3, 3, 2, 3])], ['c', '', 'yes', V.groups([5, 5, 5])], ['d', '', 'no', V.groups([4, 5])], ['e', '', 'yes', V.groups([1, 1, 1])]], H.tf)]],
    challenge: [equalGroups('cup', 2, 5), eqn([2, '×', '__', '=', 10], 5, [5, 8, 12]), tf('ሶስት ቡድኖች በሁለት በሁለት አምስት ናቸው።', 'Three groups of two make five.', false, V.groups([2, 2, 2])),
      listen(12, [12, 7, 34], { say: { am: 'ሶስት ጊዜ አራት', en: 'three times four', audio_url: url(clip('ሶስት ጊዜ አራት', 'three times four')) } }),
      numpad(['አራት ቡድኖች በሶስት በሶስት ስንት ናቸው?', 'How many are four groups of three?'], 12, V.groups([3, 3, 3, 3]))],
    play: { game: 'coffee', rounds: [{ n: 6, trays: [3, 3] }, { n: 8, trays: [4, 4] }, { n: 12, trays: [4, 4, 4] }],
      intro: T('ለእንግዶቹ ቡና እንቅዳ! እያንዳንዱ ትሪ እኩል ስኒዎች ይኑረው።', "Let's pour coffee for the guests! Every tray gets the same number of cups.") }
  }),
  g2_birr: () => ({
    place: 'shop', game: 'market',
    checkpoints: [
      { at: 'step:1', ex: choose(['ሁለት የአስር ብር ኖቶች ስንት ብር ናቸው?', 'How much are two ten-birr notes?'], [12, 20, 100], 20, V.birr([10, 10])) },
      { at: 'step:3', ex: choose(['ሃያ አምስት ብር ሲደመር አንድ ብር ስንት ነው?', 'What is twenty-five birr plus one birr?'], [24, 26, 35], 26) }],
    reteach: ['step:0', 'end'],
    guided: [
      [pay(15, 'ዳቦው', 'bread', [10, 5, 5, 1, 1]), pay(26, 'ዳቦው', 'bread', [10, 10, 10, 5, 1, 1]), pay(38, 'ጫማው', 'pair of shoes', [10, 10, 10, 10, 5, 5, 1, 1, 1], { pic: 'shoes' })],
      [choose(['የትኛው ብዙ ገንዘብ ነው?', 'Which is more money?'], [{ v: 'left', am: 'ግራ', en: 'Left', visual: V.birr([10, 5]) }, { v: 'right', am: 'ቀኝ', en: 'Right', visual: V.birr([5, 5, 1]) }], 'left'),
        choose(['የትኛው ብዙ ገንዘብ ነው?', 'Which is more money?'], [{ v: 'left', am: 'ግራ', en: 'Left', visual: V.birr([10, 1, 1]) }, { v: 'right', am: 'ቀኝ', en: 'Right', visual: V.birr([5, 5, 5]) }], 'right'),
        choose(['የትኛው ብዙ ገንዘብ ነው?', 'Which is more money?'], [{ v: 'left', am: 'ግራ', en: 'Left', visual: V.birr([10, 10, 1]) }, { v: 'right', am: 'ቀኝ', en: 'Right', visual: V.birr([5, 5, 5, 5, 5]) }], 'right')],
      [pay(12, 'እስክሪብቶው', 'pen', [10, 1, 1, 1, 5], { pic: 'pen' }), pay(20, 'ደብተሩ', 'exercise book', [5, 5, 5, 5, 1, 1], { pic: 'book' }), pay(45, 'ቦርሳው', 'school bag', [10, 10, 10, 10, 10, 5, 1], { pic: 'bag' })],
      [sortEx(['ሃያ ብር ያለውን ዳቦ ለመግዛት በቂ የሆኑትን እንለይ።', "Let's sort: enough for the 20-birr bread, not enough."], [['yes', 'በቂ ነው', 'Enough'], ['no', 'በቂ አይደለም', 'Not enough']],
        [['a', '', 'yes', V.birr([10, 10])], ['b', '', 'no', V.birr([10, 5])], ['c', '', 'yes', V.birr([10, 5, 5, 1])], ['d', '', 'no', V.birr([5, 5, 5, 1])]], H.money),
      sortEx(['ሃያ ብር ያለውን ዳቦ ለመግዛት በቂ የሆኑትን እንለይ።', "Let's sort: enough for the 20-birr bread, not enough."], [['yes', 'በቂ ነው', 'Enough'], ['no', 'በቂ አይደለም', 'Not enough']],
        [['a', '', 'yes', V.birr([5, 5, 5, 5])], ['b', '', 'no', V.birr([10, 1, 1, 1])], ['c', '', 'yes', V.birr([10, 10, 1])], ['d', '', 'no', V.birr([5, 5, 5, 1, 1])]], H.money),
      sortEx(['ሰላሳ ብር ያለውን ዕቃ ለመግዛት በቂ የሆኑትን እንለይ።', "Let's sort: enough for the 30-birr item, not enough."], [['yes', 'በቂ ነው', 'Enough'], ['no', 'በቂ አይደለም', 'Not enough']],
        [['a', '', 'yes', V.birr([10, 10, 5, 5])], ['b', '', 'no', V.birr([10, 10, 5, 1])], ['c', '', 'yes', V.birr([10, 10, 10])], ['d', '', 'no', V.birr([5, 5, 5, 5, 5, 1, 1])]], H.money)],
      [numpad(['ስንት ብር ነው?', 'How many birr is this?'], 27, V.birr([10, 10, 5, 1, 1]), H.money), numpad(['ስንት ብር ነው?', 'How many birr is this?'], 36, V.birr([10, 10, 10, 5, 1]), H.money),
        numpad(['ስንት ብር ነው?', 'How many birr is this?'], 58, V.birr([50, 5, 1, 1, 1]), H.money)],
      [eqn([10, '+', 10, '+', 5, '=', '__'], 25, [25, 20, 30]), eqn([10, '+', 5, '+', 5, '=', '__'], 20, [20, 15, 25]), eqn([50, '+', 10, '+', 5, '=', '__'], 65, [65, 60, 75])]],
    challenge: [pay(33, 'ደብተሩ', 'exercise book', [10, 10, 10, 5, 1, 1, 1], { pic: 'book' }), pay(47, 'ቦርሳው', 'school bag', [10, 10, 10, 10, 5, 5, 1, 1], { pic: 'bag' }),
      listen(N(25), [25, 52, 20], { say: { am: 'ሃያ አምስት ብር', en: 'twenty-five birr', audio_url: url(clip('ሃያ አምስት ብር', 'twenty-five birr')) } }),
      tf('ይህ ሃያ ብር ነው።', 'This is twenty birr.', true, V.birr([10, 5, 5])), numpad(['ስንት ብር ነው?', 'How many birr is this?'], 31, V.birr([10, 10, 10, 1]), H.money)],
    play: { game: 'market', budget_currency: 'birr', rounds: [
      { budget: 20, goods: [{ pic: 'bread', am: 'ዳቦ', en: 'Bread', price: 15 }, { pic: 'banana', am: 'ሙዝ', en: 'Banana', price: 5 }, { pic: 'egg', am: 'እንቁላል', en: 'Egg', price: 8 }] },
      { budget: 30, goods: [{ pic: 'pen', am: 'እስክሪብቶ', en: 'Pen', price: 12 }, { pic: 'book', am: 'ደብተር', en: 'Exercise book', price: 18 }, { pic: 'banana', am: 'ሙዝ', en: 'Banana', price: 7 }] },
      { budget: 50, goods: [{ pic: 'bag', am: 'ቦርሳ', en: 'Bag', price: 35 }, { pic: 'pen', am: 'እስክሪብቶ', en: 'Pen', price: 15 }, { pic: 'bread', am: 'ዳቦ', en: 'Bread', price: 20 }] }],
      intro: T('ገበያ እንሂድ! ያለንን ብር በሙሉ የሚጨርሱ ዕቃዎችን እንግዛ።', "Let's go to the market! Buy things that use up exactly all our birr.") }
  }),
  g2_halves: () => ({
    place: 'kitchen', game: 'memory',
    checkpoints: [
      { at: 'step:1', ex: choose(['ሁለቱ ክፍሎች እኩል ናቸው?', 'Are the two parts equal?'], [{ v: 'yes', am: 'አዎ', en: 'Yes' }, { v: 'no', am: 'አይ', en: 'No' }], 'yes', V.injera(2, 1)) },
      { at: 'step:2', ex: choose(['ስንት ሩቦች አንድ ሙሉ እንጀራ ይሆናሉ?', 'How many quarters make a whole injera?'], [2, 4, 8], 4, V.injera(4, 1)) }],
    reteach: ['step:0', 'end'],
    guided: [
      [frac(['እንጀራውን ግማሽ እንዲሆን በሩብ ቁርጥራጮች እንሙላ።', "Let's fill half of the injera with quarter pieces."], [{ piece: 'quarter', count: 4 }], 2),
        frac(['እንጀራውን በሙሉ በግማሽ ቁርጥራጮች እንሙላ።', "Let's fill the whole injera with half pieces."], [{ piece: 'half', count: 3 }], 4),
        frac(['እንጀራውን ሶስት ሩብ እንዲሆን እንሙላ።', "Let's fill three quarters of the injera."], [{ piece: 'quarter', count: 3 }, { piece: 'half', count: 1 }], 3)],
      [choose(['የትኛው በሁለት እኩል ክፍሎች ተከፍሏል?', 'Which one is cut into two equal parts?'], [{ v: 'a', visual: V.injera(2, 0) }, { v: 'b', visual: V.injera(2, 0, false) }], 'a'),
        choose(['የትኛው በአራት እኩል ክፍሎች ተከፍሏል?', 'Which one is cut into four equal parts?'], [{ v: 'a', visual: V.injera(4, 0, false) }, { v: 'b', visual: V.injera(4, 0) }], 'b'),
        choose(['ሩብ የቀለመው የትኛው ነው?', 'Which one has a quarter coloured?'], [{ v: 'a', visual: V.injera(2, 1) }, { v: 'b', visual: V.injera(4, 1) }, { v: 'c', visual: V.injera(4, 2) }], 'b')],
      [frac(['አንድ ሩብ እናስቀምጥ።', "Let's put one quarter."], [{ piece: 'quarter', count: 3 }], 1),
        frac(['አንድ ግማሽ እናስቀምጥ።', "Let's put one half."], [{ piece: 'half', count: 2 }, { piece: 'quarter', count: 2 }], 2),
        frac(['አንድ ሩብ ተቀምጧል። ግማሽ እንዲሆን እንሙላ።', "One quarter is there. Let's fill it to make a half."], [{ piece: 'quarter', count: 3 }], 2, { start: 1 })],
      [matchWords([], { prompt: ['እያንዳንዱን ቃል ከሥዕሉ ጋር እናገናኝ።', "Let's match each word to its picture."],
        custom: [{ item: { label: 'ግማሽ', lang: 'am' }, target: { visual: V.injera(2, 1) } }, { item: { label: 'ሩብ', lang: 'am' }, target: { visual: V.injera(4, 1) } }] }),
        matchWords([], { prompt: ['እያንዳንዱን ቃል ከሥዕሉ ጋር እናገናኝ።', "Let's match each word to its picture."],
          custom: [{ item: { label: 'ግማሽ', lang: 'am' }, target: { visual: V.injera(2, 1) } }, { item: { label: 'ሩብ', lang: 'am' }, target: { visual: V.injera(4, 1) } }, { item: { label: 'ሙሉ', lang: 'am' }, target: { visual: V.injera(1, 1) } }] }),
        matchWords([], { prompt: ['እያንዳንዱን ቃል ከቁጥሩ ጋር እናገናኝ።', "Let's match each word to its number."],
          custom: [{ item: { label: 'ግማሽ', lang: 'am' }, target: { label: '½' } }, { item: { label: 'ሩብ', lang: 'am' }, target: { label: '¼' } }, { item: { label: 'ሶስት ሩብ', lang: 'am' }, target: { label: '¾' } }] })],
      [tf('ይህ በሁለት እኩል ክፍሎች ተከፍሏል።', 'This is cut into two equal parts.', true, V.injera(2, 0)), tf('ይህ በሁለት እኩል ክፍሎች ተከፍሏል።', 'This is cut into two equal parts.', false, V.injera(2, 0, false)),
        tf('የቀለመው ክፍል ሩብ ነው።', 'The coloured part is a quarter.', false, V.injera(4, 2))],
      [sortEx(['ግማሾችን እና ግማሽ ያልሆኑትን እንለይ።', "Let's sort: halves, not halves."], [['yes', 'ግማሽ', 'Half'], ['no', 'ግማሽ አይደለም', 'Not a half']],
        [['a', '', 'yes', V.injera(2, 1)], ['b', '', 'no', V.injera(4, 1)], ['c', '', 'yes', V.injera(4, 2)], ['d', '', 'no', V.injera(2, 1, false)]], H.frac),
      sortEx(['ግማሾችን እና ግማሽ ያልሆኑትን እንለይ።', "Let's sort: halves, not halves."], [['yes', 'ግማሽ', 'Half'], ['no', 'ግማሽ አይደለም', 'Not a half']],
        [['a', '', 'yes', V.injera(4, 2)], ['b', '', 'no', V.injera(4, 3)], ['c', '', 'yes', V.injera(2, 1)], ['d', '', 'no', V.injera(4, 1)]], H.frac),
      sortEx(['ሩቦችን እና ሩብ ያልሆኑትን እንለይ።', "Let's sort: quarters, not quarters."], [['yes', 'ሩብ', 'Quarter'], ['no', 'ሩብ አይደለም', 'Not a quarter']],
        [['a', '', 'yes', V.injera(4, 1)], ['b', '', 'no', V.injera(2, 1)], ['c', '', 'no', V.injera(4, 1, false)], ['d', '', 'no', V.injera(4, 3)], ['e', '', 'yes', V.injera(4, 1)]], H.frac)]],
    challenge: [frac(['በሩብ ቁርጥራጮች ግማሽ እንሥራ።', "Let's make a half with quarter pieces."], [{ piece: 'quarter', count: 4 }], 2),
      matchWords([], { prompt: ['እያንዳንዱን ቃል ከቁጥሩ ጋር እናገናኝ።', "Let's match each word to its number."],
        custom: [{ item: { label: 'ግማሽ', lang: 'am' }, target: { label: '½' } }, { item: { label: 'ሩብ', lang: 'am' }, target: { label: '¼' } }] }),
      numpad(['ስንት ግማሾች አንድ ሙሉ እንጀራ ይሆናሉ?', 'How many halves make a whole injera?'], 2, V.injera(2, 0), H.frac),
      tf('ሁለት ግማሾች አንድ ሙሉ ናቸው።', 'Two halves make one whole.', true, V.injera(2, 2)),
      clock(3, 30, 'ሰዓቱን ሶስት ተኩል እናድርግ፤ ትንሹ መርፌ በ3 እና በ4 መካከል፣ ትልቁ መርፌ 6 ላይ።', 'Set the clock to half past three: short hand between 3 and 4, long hand on 6.')],
    play: { game: 'memory', pairs: [
      { n: '½', am: 'ግማሽ', visual: V.injera(2, 1) }, { n: '¼', am: 'ሩብ', visual: V.injera(4, 1) }, { n: '¾', am: 'ሶስት ሩብ', visual: V.injera(4, 3) }, { n: '1', am: 'ሙሉ', visual: V.injera(1, 1) }],
      intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ቁጥር፣ ቃል እና ሥዕል።', "Let's find matching cards: number, word and picture.") }
  })
};

// ---------- assemble ----------
const META = Object.fromEntries([...LK.lessons.map((l) => [l.id, Object.assign({ grade: 1 }, l)]), ...LK.lessonsG2.map((l) => [l.id, l])]);
const ORDER = ['count10', 'teens', 'compare', 'add10', 'sub10', 'make10', 'g2_placevalue', 'g2_add2d', 'g2_sub2d', 'g2_groups', 'g2_birr', 'g2_halves'];
function timeline(id) {
  const f = path.join(ROOT, 'animations', 'timelines', `${id}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
function at(tl, spec) {
  if (!tl) return null;
  if (spec === 'end') return tl.duration;
  const [kind, name] = spec.split(':');
  const m = tl.marks[kind === 'step' ? `step${name}` : name];
  return m === undefined ? null : Math.max(0, Math.round((m - 0.05) * 100) / 100);
}

LESSON = 'common'; clipN = 0;
const COMMON = {
  replay: T('ደግመህ/ደግመሽ አዳምጥ', 'Listen again'),
  praise: [T('ጎበዝ!', 'Well done!'), T('በጣም ጥሩ!', 'Very good!'), T('ልክ ነው!', "That's right!"), T('አሪፍ ነው!', 'Great!')],
  tryAgain: T('ተጠግተናል! እንደገና እንሞክር።', "So close! Let's try again."),
  watch: T('አብረን እንየው።', "Let's watch together."),
  reteach: T('ይህንን ክፍል እንደገና እንመልከት።', "Let's watch this part again."),
  celebrate: T('ትምህርቱን ጨረስን! በጣም ጎበዝ ነን!', "We finished the lesson! We did so well!"),
  streak: T('ዛሬም ተማርን! ተከታታይ ቀናት፦', 'We learned today too! Days in a row:'),
  unlocked: T('አዲስ ልብስ ተከፈተ!', 'New clothes unlocked!')
};

const out = path.join(__dirname, 'lessons');
fs.mkdirSync(out, { recursive: true });
const index = [];
for (const id of ORDER) {
  LESSON = id; clipN = 0; exN = 0;
  const plan = PLANS[id]();
  const m = META[id], tl = timeline(id);
  const lesson = {
    id, grade: m.grade || 1, n: m.n, title: { am: m.title.am, en: m.title.en, audio_url: `audio/am/lesson.${id}.title.mp3` },
    place: plan.place,
    video: {
      src: `video/${id}.mp4`, src_low: `video/low/${id}.mp4`, poster: `video/${id}.jpg`,
      captions: { am: `video/${id}.am.vtt`, en: `video/${id}.en.vtt` },
      duration: tl ? tl.duration : null,
      checkpoints: plan.checkpoints.map((c) => ({ t: at(tl, c.at), at: c.at, exercise: c.ex })),
      reteach: { start: at(tl, plan.reteach[0]), end: at(tl, plan.reteach[1]), at: plan.reteach }
    },
    guided: plan.guided.map((levels, i) => ({ slot: i + 1, levels: levels.map((e, k) => Object.assign(e, { level: k + 1 })) })),
    extra: plan.extra || [],
    play: plan.play,
    challenge: plan.challenge
  };
  fs.writeFileSync(path.join(out, `${id}.json`), JSON.stringify(lesson, null, 2) + '\n');
  index.push({ id, grade: lesson.grade, n: lesson.n, place: lesson.place, title: lesson.title, game: plan.play.game });
}
fs.writeFileSync(path.join(__dirname, 'index.json'), JSON.stringify({ lessons: index, common: COMMON }, null, 2) + '\n');

// recording script: every exercise sentence + number words up to 100
const rows = [...CLIPS.values()].map((c) => [c.key, c.am, c.en]);
for (const n of [...NUMS].filter((n) => n > 20).sort((a, b) => a - b)) rows.push([numKey(n), word(n), word(n, 'en')]);
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '﻿' + ['n,file name,Amharic to read,English meaning']
  .concat(rows.map((r, i) => [i + 1, r[0] + '.m4a', r[1], r[2]].map(q).join(','))).join('\r\n');
fs.writeFileSync(path.join(ROOT, 'dist', 'narration-script-exercises.csv'), csv);
console.log(`built ${index.length} lessons · ${rows.length} clips in dist/narration-script-exercises.csv`);

// ---------- docs/lesson-plans.md: everything a teacher needs to review, in one readable file ----------
{
  const lines = ['# Luminary Kids — hands-on lesson plans', '',
    'Generated by `node content/build.js` from `content/lessons/*.json` — edit the lessons there (or in the admin panel), not here.',
    'Every line a child hears has an audio file name; record it with that name (see the recording scripts in `dist/`).', ''];
  const audio = (u) => (u ? `\`${path.basename(u)}\`` : '');
  const ans = (e) => (typeof e.answer === 'object' ? JSON.stringify(e.answer) : String(e.answer));
  const exLine = (e, label) => `| ${label} | ${e.type} | ${e.prompt_am}<br><small>${e.prompt_en}</small> | ${ans(e).replace(/\|/g, '\\|')} | ${audio(e.audio_url)} |`;
  for (const id of ORDER) {
    const L = JSON.parse(fs.readFileSync(path.join(out, `${id}.json`), 'utf8'));
    const m = META[id], tl = timeline(id);
    lines.push(`## Grade ${L.grade} · Lesson ${L.n} — ${L.title.am} (${L.title.en})`, '');
    lines.push(`Place on the map: ${L.place} · Mini-game: ${L.play.game} · Hook video: \`${L.video.src}\` (${L.video.duration ? L.video.duration.toFixed(1) + ' s' : 'not rendered'}) · Manim code: \`animations/lessons/${id}.py\``, '');
    lines.push('### 1. Hook video script', '', '| Time | Amharic (burned-in caption) | English (optional subtitle) | Audio |', '|---|---|---|---|');
    lines.push(`| ${tl ? tl.marks.title.toFixed(1) : '—'} s | ${m.title.am} | ${m.title.en} | \`lesson.${id}.title\` |`);
    lines.push(`| ${tl && tl.marks.story != null ? tl.marks.story.toFixed(1) : '—'} s | ${m.story.am} | ${m.story.en} | \`lesson.${id}.story\` |`);
    const steps = (m.example.am.split(/(?<=።)\s*/).filter(Boolean));
    const stepsEn = m.example.en.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (tl && tl.marks.step0 == null && tl.marks.recap != null) lines.push(`| ${tl.marks.recap.toFixed(1)} s | ${m.example.am} | ${m.example.en} | \`lesson.${id}.example\` |`);
    else steps.forEach((s, i) => lines.push(`| ${tl && tl.marks['step' + i] != null ? tl.marks['step' + i].toFixed(1) + ' s' : '—'} | ${s} | ${stepsEn[i] || ''} | \`lesson.${id}.example.${i}\` |`));
    lines.push('', '### 2. Watch & tap — video checkpoints', '', '| Pauses at | Type | Question | Answer | Audio |', '|---|---|---|---|---|');
    L.video.checkpoints.forEach((c) => lines.push(exLine(c.exercise, `${c.t != null ? c.t.toFixed(1) + ' s' : c.at}`)));
    lines.push('', `Re-teach clip after two misses: ${L.video.reteach.start != null ? `${L.video.reteach.start.toFixed(1)}–${L.video.reteach.end.toFixed(1)} s` : '—'}`, '');
    lines.push('### 3. Guided practice (three levels per slot)', '', '| Slot · level | Type | Prompt | Answer | Audio |', '|---|---|---|---|---|');
    L.guided.forEach((s) => s.levels.forEach((e, k) => lines.push(exLine(e, `${s.slot} · L${k + 1}`))));
    (L.extra || []).forEach((e) => lines.push(exLine(e, 'optional')));
    lines.push('', `### 4. Play — ${L.play.game}`, '', `${L.play.intro.am}<br><small>${L.play.intro.en}</small> · ${audio(L.play.intro.audio_url)}`, '',
      '```json', JSON.stringify(L.play.rounds || L.play.pairs || L.play.questions.map((q) => ({ q: q.prompt_am, options: q.options.map((o) => o.v), answer: q.answer })), null, 0), '```', '');
    lines.push('### 5. Challenge', '', '| # | Type | Prompt | Answer | Audio |', '|---|---|---|---|---|');
    L.challenge.forEach((e, i) => lines.push(exLine(e, String(i + 1))));
    const all = [...L.video.checkpoints.map((c) => c.exercise), ...L.guided.map((s) => s.levels[0]), ...L.challenge];
    const drags = all.filter((e) => e.type.startsWith('drag')).length;
    const n = 2 + L.guided.length + (L.play.rounds || L.play.pairs || L.play.questions).length + 5;
    lines.push('', `**Counts:** ${drags} drag-and-drop · ${new Set(all.filter((e) => !e.type.startsWith('drag')).map((e) => e.type)).size} other exercise types · ${n} interactions in all.`, '');
  }
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'lesson-plans.md'), lines.join('\n') + '\n');
}
