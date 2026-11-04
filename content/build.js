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
require(path.join(ROOT, 'src', 'lessons-g3.js'));
const LK = globalThis.LK;

// ---------- words ----------
const ones = LK.numWords, tens = LK.tensWords;
function word(n, lang = 'am') {
  if (n <= 20) return ones[lang][n];
  if (n === 100) return tens[lang][10];
  if (n > 100) return LK.numberWord(n, lang); // ሁለት መቶ አርባ አምስት · two hundred forty-five
  const t = Math.floor(n / 10), o = n % 10;
  if (!o) return tens[lang][t];
  return lang === 'am' ? `${tens.am[t]} ${ones.am[o]}` : `${tens.en[t]}-${ones.en[o]}`;
}
const GEEZ_1 = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
const GEEZ_10 = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];
// Ge'ez: 245 = ፪፻፵፭ (two, hundred, forty, five); 100 = ፻
const geez = (n) => (n >= 100 ? (Math.floor(n / 100) > 1 ? GEEZ_1[Math.floor(n / 100)] : '') + '፻' + (n % 100 ? geez(n % 100) : '')
  : GEEZ_10[Math.floor(n / 10)] + GEEZ_1[n % 10]);

const THINGS = {
  orange: ['ብርቱካን', 'ብርቱካኖች', 'orange', 'oranges'],
  mango: ['ማንጎ', 'ማንጎዎች', 'mango', 'mangoes'],
  cup: ['ስኒ', 'ስኒዎች', 'cup', 'cups'],
  flower: ['አበባ', 'አበቦች', 'flower', 'flowers'],
  child: ['ልጅ', 'ልጆች', 'child', 'children'],
  counter: ['ጠጠር', 'ጠጠሮች', 'counter', 'counters'],
  bean: ['የቡና ፍሬ', 'የቡና ፍሬዎች', 'coffee bean', 'coffee beans'],
  egg: ['እንቁላል', 'እንቁላሎች', 'egg', 'eggs'],
  book: ['መጽሐፍ', 'መጻሕፍት', 'book', 'books'],
  seedling: ['ችግኝ', 'ችግኞች', 'seedling', 'seedlings'],
  square: ['ሰቅ', 'ሰቆች', 'tile', 'tiles'],
  block: ['ሳጥን', 'ሳጥኖች', 'box', 'boxes']
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
  frac: [['ክፍሎቹ እኩል መሆን አለባቸው።', 'The parts must be equal.'], ['ሁለት ሩብ አንድ ግማሽ ይሆናሉ።', 'Two quarters make one half.']],
  // Grade 3
  hundreds: [['አንድ ጠፍጣፋ መቶ ነው፤ አንድ ዘንግ አስር ነው፤ አንድ ኩብ አንድ ነው።', 'One flat is a hundred; one rod is ten; one cube is one.'],
    ['መጀመሪያ መቶዎቹን፣ ከዚያ አስሮቹን፣ በመጨረሻ አንዶቹን እናስቀምጥ።', 'Put the hundreds first, then the tens, then the ones.']],
  column: [['ከአንዶቹ እንጀምር፤ ከዚያ አስሮቹን፣ ከዚያ መቶዎቹን።', 'Start with the ones, then the tens, then the hundreds.'],
    ['አስር ሲሞላ ወደሚቀጥለው ቦታ እንወስዳለን።', 'When we make ten, we carry it to the next place.']],
  borrow: [['ከላይ ያለው አሃዝ ሲያንስ አንድ አስር እንፈታለን።', 'When the top digit is smaller, we break one ten.'],
    ['መልሳችንን በመደመር እንፈትሽ።', 'Check the answer by adding back.']],
  times: [['በረድፍ እንቁጠር፤ በእያንዳንዱ ረድፍ እኩል አሉ።', 'Count row by row; every row has the same number.'],
    ['በዝላይ እንቁጠር፤ ለምሳሌ አምስት፣ አስር፣ አስራ አምስት።', 'Skip count, for example five, ten, fifteen.']],
  share: [['አንድ ለዚህ፣ አንድ ለዚያ፤ በዙር እናካፍል።', 'One for this one, one for that one: share in turns.'],
    ['ሁሉም እኩል መሆን አለባቸው።', 'Everyone must get the same number.']],
  divide: [['ስንት ቡድኖች እንደሆኑ እናስብ።', 'Think how many groups there are.'],
    ['የማባዛት ሰንጠረዥን እናስታውስ፤ ለምሳሌ ሶስት ጊዜ አራት አስራ ሁለት ነው።', 'Remember the times table: three times four is twelve.']],
  thirds: [['ክፍሎቹ እኩል መሆን አለባቸው።', 'The parts must be equal.'],
    ['ሶስት ሶስተኛዎች አንድ ሙሉ ናቸው።', 'Three thirds make one whole.']],
  compare: [['መጀመሪያ መቶዎቹን፣ እኩል ከሆኑ አስሮቹን፣ ከዚያ አንዶቹን እናወዳድር።', 'Compare the hundreds first; if they are equal, the tens; then the ones.'],
    ['የአዞው አፍ ወደ ትልቁ ቁጥር ይከፈታል።', 'The open side of the sign faces the bigger number.']],
  round: [['ቁጥሩ ለየትኛው ይቀርባል? በቁጥር መስመር ላይ እንየው።', 'Which is it closer to? Look on the number line.'],
    ['አምስት ወይም ከዚያ በላይ ከሆነ ወደ ላይ እናጠጋጋለን።', 'Five or more rounds up.']],
  frline: [['ከዜሮ እስከ አንድ ያሉትን እኩል ዝላዮች እንቁጠር።', 'Count the equal jumps from zero to one.'],
    ['ሁለት ሩብ ከግማሽ ጋር አንድ ቦታ ላይ ነው።', 'Two quarters sit at the same place as one half.']],
  measure: [['ከዜሮ እንጀምር፤ ጫፉ የደረሰበትን ቁጥር እናንብብ።', 'Start at zero and read the number where the end reaches.'],
    ['ርዝመት በሜትር እና በሳንቲ ሜትር፣ ክብደት በኪሎ ግራም፣ ፈሳሽ በሊትር ይለካል።', 'Length is in metres and centimetres, mass in kilograms, liquids in litres.']],
  time: [['ትንሹ መርፌ ሰዓቱን፣ ትልቁ መርፌ ደቂቃውን ያሳያል።', 'The short hand shows the hour, the long hand the minutes.'],
    ['በትልቁ መርፌ ላይ በአምስት በአምስት እንቁጠር፦ አምስት፣ አስር፣ አስራ አምስት…', 'Count by fives with the long hand: five, ten, fifteen…']],
  ethtime: [['የኢትዮጵያ ሰዓት ከስድስት ሰዓት ኋላ ነው፤ ሰባት ሰዓት በኢትዮጵያ አንድ ሰዓት ነው።', 'Ethiopian time is six hours behind: seven o\'clock is one o\'clock in Ethiopian time.'],
    ['ከሰዓቱ ስድስት እንቀንሳለን።', 'Take six away from the hour.']],
  shapes: [['ጎኖቹን አንድ በአንድ እንቁጠር።', 'Count the sides one by one.'],
    ['ማዕዘኖቹ ጎኖቹ የሚገናኙበት ቦታ ናቸው።', 'The corners are where the sides meet.']],
  area: [['ስፋት፦ የሚሸፍኑትን ካሬዎች እንቁጠር ወይም ረድፎችን እናባዛ።', 'Area: count the squares that cover it, or multiply the rows.'],
    ['ዙሪያ፦ አራቱንም ጎኖች እንደምር።', 'Perimeter: add all four sides.']],
  graph: [['የአምዱን ጫፍ ተከትለን ቁጥሩን እናንብብ።', 'Follow the top of the bar across and read the number.'],
    ['ጥያቄውን በሁለት ደረጃ እንፍታ፤ መጀመሪያ አንዱን፣ ከዚያ ሌላውን።', 'Solve it in two steps: first one part, then the other.']]
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
  o.prompt || (n >= 100 ? [`${word(n)}ን በመቶዎች፣ በአስሮች እና በአንዶች እንሥራ።`, `Let's build ${n} with hundreds, tens and ones.`]
    : [`${word(n)}ን በአስሮች እና በአንዶች እንሥራ።`, `Let's build ${n} with tens and ones.`]),
  { items: { flats: n >= 100, rods: true, cubes: true }, targets: [{ id: 'mat', tens: o.tens, hundreds: o.hundreds }], answer: n, max_tens: 9 },
  o.hints || (n >= 100 ? H.hundreds : H.place));
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
  { shape: 'injera', parts: o.parts || 4, items: pieces, targets: [{ id: 'injera', start: o.start || 0 }], answer }, o.hints || H.frac);

// numbers on the buttons are read out when tapped, so each needs its number-word clip
const choose = (prompt, options, answer, visual, hints) => {
  options.forEach((v) => { if (typeof v === 'number' && v > 20 && v <= 1000) NUMS.add(v); });
  return ex('tap_choose', prompt, { options: pick(options), answer, visual }, hints || H.tf);
};
const tapCount = (thing, n, options) => ex('tap_count',
  [`እያንዳንዱን ነካ አድርገን እንቁጠር። ስንት ${th(thing).am} አሉ?`, `Let's tap each one as we count. How many ${th(thing).en} are there?`],
  { items: { thing, n }, options: pick(options), answer: n }, H.count);
const numpad = (prompt, answer, visual, hints) => ex('numpad', prompt, { answer, visual, max_digits: String(answer).length > 2 ? 4 : String(answer).length > 1 ? 3 : 2 }, hints || H.equation);
const listen = (n, options, o = {}) => (options.forEach((v) => { if (typeof v === 'number' && v > 20 && v <= 1000) NUMS.add(v); }), ex('listen_choose',
  ['እናዳምጥ፤ የሰማነውን ቁጥር እንንካ።', "Let's listen, then tap the number we hear."],
  { say: o.say || { am: word(n), en: word(n, 'en'), audio_url: url(numKey(n)) }, options: pick(options), answer: o.answer !== undefined ? o.answer : n }, H.listen));
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

// Grade 3: plant seedlings in rows; share things equally on plates
const rowsEx = (r, each, o = {}) => dragCount('seedling', r * each, {
  prompt: o.prompt || [`በእያንዳንዱ ረድፍ ${word(each)} ችግኞችን እንትከል።`, `Let's plant ${each} seedlings in each row.`],
  targets: Array.from({ length: r }, (_, i) => ({ id: 'row' + (i + 1), kind: 'row', start: 0, need: each })),
  supply: r * each + 2, hints: H.times });
const share = (total, plates, thing = 'orange') => dragCount(thing, total, {
  prompt: [`${word(total)} ${th(thing).am}ን ለ${word(plates)} ሳህኖች በእኩል እናካፍል።`, `Let's share ${total} ${th(thing).en} equally on ${plates} plates.`],
  targets: Array.from({ length: plates }, (_, i) => ({ id: 'plate' + (i + 1), kind: 'tray', start: 0, need: total / plates })),
  supply: total, hints: H.share });
const say = (am, en) => ({ am, en, audio_url: url(clip(am, en)) });
// more Grade 3 builders
const cmp = (a, b, o = {}) => ex('drag_equation', o.prompt || ['ትክክለኛውን ምልክት እናስቀምጥ፦ ይበልጣል፣ ያንሳል ወይስ እኩል?', "Let's put the right sign: greater than, less than or equal?"],
  { equation: [String(a), '__', String(b)], items: ['<', '>', '='], targets: [{ id: 'blank' }], answer: a > b ? '>' : a < b ? '<' : '=' }, H.compare);
const ruler = (length, max, thing, am, en) => ex('drag_numberline', [`${am}ን እንለካ፤ ጫፉ የደረሰበት ቁጥር ላይ ምልክቱን እናስቀምጥ።`, `Let's measure the ${en}: put the flag on the number where it ends.`],
  { line: { min: 0, max, step: 1, labels: 'all', object: { thing, length }, unit: 'cm' }, items: [String(length)], answer: [String(length)] }, H.measure);
const fline = (d, nums, o = {}) => ex('drag_numberline', o.prompt || ['ክፍልፋዮቹን በቁጥር መስመሩ ላይ በትክክለኛው ቦታ እናስቀምጥ።', "Let's put the fractions in their places on the number line."],
  { line: { min: 0, max: d, step: 1, labels: 'ends', denom: d }, items: nums.map(String), item_labels: o.labels, answer: nums.map(String) }, H.frline);
const grid = (cols, rows, start = 0) => dragCount('square', cols * rows, {
  prompt: [`ወለሉን በካሬ ሰቆች እንሸፍን፤ ${word(rows)} ረድፎች፣ በእያንዳንዱ ${word(cols)}።`, `Let's cover the floor with square tiles: ${rows} rows of ${cols}.`],
  targets: [{ id: 'floor', kind: 'grid', cols, rows, start, need: cols * rows }], supply: cols * rows - start + 2, start, hints: H.area });
const FRUIT = { banana: { am: 'ሙዝ', en: 'Bananas' }, mango: { am: 'ማንጎ', en: 'Mangoes' }, orange: { am: 'ብርቱካን', en: 'Oranges' } };
const columns = (counts) => { const keys = Object.keys(FRUIT).slice(0, counts.length); return dragCount('block', counts.reduce((a, b) => a + b, 0), {
  prompt: [`ግራፉን እንሥራ፦ ${keys.map((k, i) => `${FRUIT[k].am} ${word(counts[i])}`).join('፣ ')}።`, `Let's build the graph: ${keys.map((k, i) => `${FRUIT[k].en.toLowerCase()} ${counts[i]}`).join(', ')}.`],
  targets: keys.map((k, i) => ({ id: k, kind: 'column', label: FRUIT[k], start: 0, need: counts[i] })), supply: counts.reduce((a, b) => a + b, 0) + 2, hints: H.graph }); };
const groupsOf = (total, each, thing = 'orange') => dragCount(thing, total, {
  prompt: [`${word(total)} ${th(thing).am}ን በእያንዳንዱ ሳህን ላይ ${word(each)} ${word(each)} እናድርግ።`, `Let's put ${total} ${th(thing).en} on plates, ${each} on each plate.`],
  targets: Array.from({ length: total / each }, (_, i) => ({ id: 'plate' + (i + 1), kind: 'tray', start: 0, need: each })), supply: total, hints: H.divide });
const pairs = (list, prompt, hints) => matchWords([], { prompt, hints, custom: list.map(([a, b]) => ({ item: typeof a === 'object' ? a : { label: String(a) }, target: typeof b === 'object' ? b : { label: String(b) } })) });
const clockAt = (h, m, step, am, en) => Object.assign(clock(h, m, am, en), step ? { step } : {}, { hints: H.time.map(([a, e]) => T(a, e)) });
const eth = (h) => ((h + 5) % 12) + 1;   // standard 7:00 → Ethiopian ሰዓት 1
const hhmm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const opt = (v, am, en, visual) => ({ v, am, en, visual });

// number-word clips num.N (0–1000); 0–20 already exist from the app's own script
const NUMS = new Set();
function numKey(n) { NUMS.add(n); return `num.${n}`; }
const N = (n) => { NUMS.add(n); return n; };

// visual descriptors (drawn by src/activities.js)
const V = {
  group: (thing, n) => ({ kind: 'group', thing, n }),
  tensOnes: (t, o, hu) => (hu ? { kind: 'tens_ones', hundreds: hu, tens: t, ones: o } : { kind: 'tens_ones', tens: t, ones: o }),
  array: (r, c, thing = 'seedling') => ({ kind: 'array', rows: r, cols: c, thing }),
  rect: (w, h, o = {}) => Object.assign({ kind: 'rect', w, h }, o),
  shape: (shape) => ({ kind: 'shape', shape }),
  bars: (counts, max) => ({ kind: 'bars', max, bars: Object.keys(FRUIT).slice(0, counts.length).map((k, i) => ({ am: FRUIT[k].am, label: FRUIT[k].en, n: counts[i] })) }),
  picto: (rows, key = 1, thing = 'cup') => ({ kind: 'picto', thing, key, rows: rows.map(([am, n]) => ({ am, n })) }),
  clock: (h, m) => ({ kind: 'clock', h, m }),
  scale: (kg, max = 10) => ({ kind: 'scale', kg, max }),
  jug: (l, max = 5) => ({ kind: 'jug', l, max }),
  ruler: (length, max = 15, thing = 'pencil') => ({ kind: 'ruler', length, max, thing }),
  fline: (d, at) => ({ kind: 'fline', d, at }),
  lineplot: (counts) => ({ kind: 'lineplot', counts }),
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
  }),
  // ---------------- Grade 3 ----------------
  g3_hundreds: () => ({
    place: 'store', game: 'memory',
    checkpoints: [
      { at: 'step:0', ex: choose(['ስንት አስሮች አንድ መቶ ይሆናሉ?', 'How many tens make one hundred?'], [5, 10, 100], 10, V.tensOnes(10, 0)) },
      { at: 'step:3', ex: choose(['ቁጥሩ ስንት ነው?', 'What is the number?'], [245, 2045, 452], 245, V.tensOnes(4, 5, 2)) }],
    reteach: ['step:0', 'end'],
    guided: [
      [build(132), build(245), build(406)],
      [choose(['ስንት ነው?', 'How many is this?'], [213, 312, 23], 213, V.tensOnes(1, 3, 2)),
        choose(['ስንት ነው?', 'How many is this?'], [143, 341, 3041], 341, V.tensOnes(4, 1, 3)),
        choose(['ስንት ነው?', 'How many is this?'], [57, 570, 507], 507, V.tensOnes(0, 7, 5), H.hundreds)],
      [matchWords([N(120), N(210), N(201)]), matchWords([N(345), N(354), N(435)]), matchWords([N(608), N(680), N(806)])],
      [line(0, 500, 100, [100, 300]), line(0, 1000, 100, [400, 600, 900]), line(200, 300, 10, [230, 250, 280])],
      [numpad(['ሶስት መቶዎች፣ አምስት አስሮች እና ሁለት አንዶች ስንት ናቸው?', 'What is three hundreds, five tens and two ones?'], 352, V.tensOnes(5, 2, 3), H.hundreds),
        numpad(['ስድስት መቶዎች፣ ዜሮ አስሮች እና አራት አንዶች ስንት ናቸው?', 'What is six hundreds, zero tens and four ones?'], 604, null, H.hundreds),
        numpad(['ስምንት መቶዎች እና ዘጠኝ አስሮች ስንት ናቸው?', 'What is eight hundreds and nine tens?'], 890, null, H.hundreds)],
      [sortEx(['ከአምስት መቶ የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than 500, less than 500."], [['more', 'ከ500 ይበልጣል', 'More than 500'], ['less', 'ከ500 ያንሳል', 'Less than 500']],
        [['a', '620', 'more'], ['b', '480', 'less'], ['c', '705', 'more'], ['d', '99', 'less']], H.hundreds),
      sortEx(['ከአምስት መቶ የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than 500, less than 500."], [['more', 'ከ500 ይበልጣል', 'More than 500'], ['less', 'ከ500 ያንሳል', 'Less than 500']],
        [['a', '551', 'more'], ['b', '455', 'less'], ['c', '509', 'more'], ['d', '490', 'less'], ['e', '600', 'more']], H.hundreds),
      sortEx(['መቶዎቹ ሶስት የሆኑትን እና ያልሆኑትን እንለይ።', "Let's sort: three hundreds, not three hundreds."], [['yes', '3 መቶዎች', '3 hundreds'], ['no', '3 መቶዎች አይደሉም', 'Not 3 hundreds']],
        [['a', '345', 'yes'], ['b', '435', 'no'], ['c', '309', 'yes'], ['d', '543', 'no'], ['e', '390', 'yes']], H.hundreds)]],
    extra: [speak(N(245))],
    challenge: [build(318), matchWords([100, 245, 300], { geez: true }), listen(N(405), [405, 450, 45]),
      tf('ሶስት መቶዎች እና ሁለት አንዶች ሶስት መቶ ሃያ ነው።', 'Three hundreds and two ones is three hundred twenty.', false, V.tensOnes(0, 2, 3)), trace('245')],
    play: { game: 'memory', pairs: [100, 250, 408, 760].map((n) => ({ n, am: word(N(n)), geez: geez(n) })),
      intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ቁጥር፣ ቃል እና የግዕዝ ቁጥር።', "Let's find matching cards: number, word and Ge'ez numeral.") }
  }),
  g3_add3d: () => {
    const plus = (a, b) => [`${word(a)} ሲደመር ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} plus ${word(b, 'en')}?`];
    const newTen = (cards) => sortEx(['አዲስ አስር የሚያስፈልጋቸውን እንለይ።', "Let's sort: needs a new ten, doesn't."], [['yes', 'አዲስ አስር', 'New ten'], ['no', 'አዲስ አስር የለም', 'No new ten']], cards, H.column);
    return {
      place: 'orchard', game: 'balloon',
      checkpoints: [
        { at: 'step:1', ex: choose(['ስምንት እና አምስት ስንት ነው?', 'What is eight and five?'], [12, 13, 14], 13) },
        { at: 'step:3', ex: choose(['አንድ፣ ሶስት እና አራት ስንት ናቸው?', 'What are one, three and four together?'], [7, 8, 9], 8) }],
      reteach: ['step:1', 'end'],
      guided: [
        [eqn([213, '+', 145, '=', '__'], 358, [358, 368, 258], { hints: H.column }), eqn([238, '+', 145, '=', '__'], 383, [383, 373, 3713], { hints: H.column }),
          eqn([467, '+', 285, '=', '__'], 752, [752, 642, 652], { hints: H.column })],
        [choose(['ሁለት መቶ ሲደመር ሶስት መቶ ስንት ነው?', 'What is two hundred plus three hundred?'], [5, 50, 500], 500, null, H.hundreds),
          choose(['ሶስት መቶ አርባ ሲደመር ሁለት መቶ ሃያ ስንት ነው?', 'What is three hundred forty plus two hundred twenty?'], [560, 650, 56], 560, null, H.hundreds),
          choose(['አራት መቶ ሰማንያ ሲደመር ሁለት መቶ ሃምሳ ስንት ነው?', 'What is four hundred eighty plus two hundred fifty?'], [630, 730, 6130], 730, null, H.column)],
        [build(358), build(383), build(517)],
        [eqn([300, '+', '__', '=', 450], 150, [150, 750, 15]), eqn([250, '+', '__', '=', 500], 250, [250, 350, 750]), eqn([375, '+', '__', '=', 600], 225, [225, 325, 975])],
        [numpad(plus(224, 135), 359, null, H.column), numpad(plus(346, 128), 474, null, H.column), numpad(plus(587, 236), 823, null, H.column)],
        [newTen([['a', '238 + 145', 'yes'], ['b', '213 + 145', 'no'], ['c', '306 + 117', 'yes'], ['d', '420 + 356', 'no']]),
          newTen([['a', '129 + 243', 'yes'], ['b', '512 + 136', 'no'], ['c', '455 + 327', 'yes'], ['d', '601 + 294', 'no'], ['e', '348 + 236', 'yes']]),
          sortEx(['አዲስ መቶ የሚያስፈልጋቸውን እንለይ።', "Let's sort: needs a new hundred, doesn't."], [['yes', 'አዲስ መቶ', 'New hundred'], ['no', 'አዲስ መቶ የለም', 'No new hundred']],
            [['a', '250 + 360', 'yes'], ['b', '120 + 340', 'no'], ['c', '475 + 150', 'yes'], ['d', '610 + 280', 'no'], ['e', '380 + 430', 'yes']], H.column)]],
      challenge: [eqn([356, '+', 278, '=', '__'], 634, [634, 524, 5214], { hints: H.column }), build(472),
        tf('መቶ ዘጠና ሲደመር አስር ሁለት መቶ ነው።', 'One hundred ninety plus ten is two hundred.', true), listen(N(634), [634, 436, 364]),
        numpad(plus(350, 260), 610, null, H.column)],
      play: { game: 'balloon', rounds: [{ target: N(500), balloons: [250, 120, 380, 310, 190, 75].map(N) }, { target: N(700), balloons: [350, 260, 440, 125, 515, 90].map(N) },
        { target: N(1000), balloons: [600, 450, 400, 275, 725, 150].map(N) }],
        intro: T('ሁለት ፊኛዎችን ፈንድተን የተጠየቀውን ቁጥር እንሥራ።', "Pop two balloons that add up to the number.") }
    };
  },
  g3_sub3d: () => {
    const minus = (a, b) => [`${word(a)} ሲቀነስ ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} minus ${word(b, 'en')}?`];
    const breakTen = (cards) => sortEx(['አስር መፍታት የሚያስፈልጋቸውን እንለይ።', "Let's sort: must break a ten, doesn't."], [['yes', 'አስር እንፈታለን', 'Break a ten'], ['no', 'አያስፈልግም', 'No need']], cards, H.borrow);
    const fixedHints = (am, en) => [['አንድ አስር ወደ አስር አንዶች ይቀየራል።', 'One ten changes into ten ones.'], [am, en]];
    return {
      place: 'schoolyard', game: 'market',
      checkpoints: [
        { at: 'step:1', ex: choose(['ከሁለት አንዶች ስምንት መውሰድ እንችላለን?', 'Can we take eight ones from two ones?'], [{ v: 'yes', am: 'አዎ', en: 'Yes' }, { v: 'no', am: 'አይ', en: 'No' }], 'no') },
        { at: 'step:3', ex: choose(['አስራ ሁለት ሲቀነስ ስምንት ስንት ነው?', 'What is twelve minus eight?'], [3, 4, 5], 4) }],
      reteach: ['step:1', 'end'],
      guided: [
        [eqn([485, '−', 132, '=', '__'], 353, [353, 617, 343], { hints: H.borrow }), eqn([452, '−', 228, '=', '__'], 224, [224, 236, 680], { hints: H.borrow }),
          eqn([631, '−', 257, '=', '__'], 374, [374, 486, 384], { hints: H.borrow })],
        [choose(['አራት መቶዎች፣ አምስት አስሮች እና ሁለት አንዶች = አራት መቶዎች፣ አራት አስሮች እና ስንት አንዶች?', '4 hundreds, 5 tens and 2 ones = 4 hundreds, 4 tens and how many ones?'], [2, 10, 12], 12, V.tensOnes(5, 2, 4), H.borrow),
          choose(['ሶስት መቶዎች እና ስድስት አስሮች = ሶስት መቶዎች፣ አምስት አስሮች እና ስንት አንዶች?', '3 hundreds and 6 tens = 3 hundreds, 5 tens and how many ones?'], [0, 6, 10], 10, V.tensOnes(6, 0, 3), H.borrow),
          choose(['አምስት መቶዎች = አራት መቶዎች እና ስንት አስሮች?', '5 hundreds = 4 hundreds and how many tens?'], [0, 5, 10], 10, V.tensOnes(0, 0, 5), H.hundreds)],
        [build(112, { tens: 0, prompt: ['መቶ አስራ ሁለትን ያለ አስሮች እንሥራ።', "Let's build one hundred twelve without any tens."], hints: fixedHints('አንድ መቶ እና አስራ ሁለት አንዶች።', 'One hundred and twelve ones.') }),
          build(132, { tens: 2, prompt: ['መቶ ሰላሳ ሁለትን በሁለት አስሮች ብቻ እንሥራ።', "Let's build one hundred thirty-two using only two tens."], hints: fixedHints('አንድ መቶ፣ ሁለት አስሮች፤ ስንት አንዶች ይቀራሉ?', 'One hundred and two tens; how many ones are left?') }),
          build(130, { hundreds: 0, prompt: ['መቶ ሰላሳን ያለ መቶ፣ በአስሮች ብቻ እንሥራ።', "Let's build one hundred thirty with tens only, no hundred."], hints: [['አንድ መቶ ወደ አስር አስሮች ይቀየራል።', 'One hundred changes into ten tens.'], ['አስር አስሮች እና ሶስት አስሮች ስንት አስሮች ናቸው?', 'Ten tens and three tens: how many tens?']] })],
        [eqn([500, '−', '__', '=', 300], 200, [200, 800, 3]), eqn([600, '−', '__', '=', 350], 250, [250, 350, 950]), eqn([900, '−', '__', '=', 475], 425, [425, 535, 1375])],
        [numpad(minus(475, 132), 343, null, H.borrow), numpad(minus(563, 247), 316, null, H.borrow), numpad(minus(700, 365), 335, null, H.borrow)],
        [breakTen([['a', '452 − 228', 'yes'], ['b', '485 − 132', 'no'], ['c', '360 − 125', 'yes'], ['d', '597 − 264', 'no']]),
          breakTen([['a', '541 − 319', 'yes'], ['b', '768 − 245', 'no'], ['c', '723 − 416', 'yes'], ['d', '856 − 431', 'no'], ['e', '470 − 135', 'yes']]),
          sortEx(['መቶ መፍታት የሚያስፈልጋቸውን እንለይ።', "Let's sort: must break a hundred, doesn't."], [['yes', 'መቶ እንፈታለን', 'Break a hundred'], ['no', 'አያስፈልግም', 'No need']],
            [['a', '524 − 281', 'yes'], ['b', '765 − 432', 'no'], ['c', '418 − 275', 'yes'], ['d', '659 − 324', 'no'], ['e', '806 − 350', 'yes']], H.borrow)]],
      challenge: [eqn([614, '−', 258, '=', '__'], 356, [356, 444, 346], { hints: H.borrow }), line(300, 400, 10, [320, 370]),
        tf('አምስት መቶ ሲቀነስ መቶ አራት መቶ ነው።', 'Five hundred minus one hundred is four hundred.', true), listen(N(356), [356, 365, 536]),
        numpad(minus(800, 350), 450, null, H.borrow)],
      play: { game: 'market', budget_currency: 'birr', rounds: [
        { budget: N(200), goods: [{ pic: 'book', am: 'መጽሐፍ', en: 'Book', price: 120 }, { pic: 'pen', am: 'እስክሪብቶ', en: 'Pen', price: 80 }, { pic: 'bread', am: 'ዳቦ', en: 'Bread', price: 150 }] },
        { budget: N(350), goods: [{ pic: 'shoes', am: 'ጫማ', en: 'Shoes', price: 250 }, { pic: 'bag', am: 'ቦርሳ', en: 'Bag', price: 175 }, { pic: 'banana', am: 'ሙዝ', en: 'Bananas', price: 100 }] },
        { budget: N(500), goods: [{ pic: 'bag', am: 'ቦርሳ', en: 'Bag', price: 325 }, { pic: 'book', am: 'መጽሐፍ', en: 'Book', price: 175 }, { pic: 'egg', am: 'እንቁላል', en: 'Eggs', price: 90 }] }],
        intro: T('ገበያ እንሂድ! ያለንን ብር በሙሉ የሚጨርሱ ዕቃዎችን እንግዛ።', "Let's go to the market! Buy things that use up exactly all our birr.") }
    };
  },
  g3_times: () => {
    const times = (a, b) => [`${word(a)} ጊዜ ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} times ${word(b, 'en')}?`];
    const which = ['ይህ የትኛው ነው?', 'Which one is this?'];
    const is = (n, cards) => sortEx([`${word(n)} የሚሆኑትን እና የማይሆኑትን እንለይ።`, `Let's sort: makes ${n}, doesn't make ${n}.`], [['yes', `${n} ነው`, `Makes ${n}`], ['no', `${n} አይደለም`, `Not ${n}`]], cards, H.times);
    const facts = (pairs) => matchWords([], { prompt: ['እያንዳንዱን ማባዛት ከመልሱ ጋር እናገናኝ።', "Let's match each multiplication to its answer."],
      custom: pairs.map(([a, b]) => ({ item: { label: `${a} × ${b}` }, target: { label: String(a * b) } })), hints: H.times });
    return {
      place: 'field', game: 'coffee',
      checkpoints: [
        { at: 'step:1', ex: choose(['ሶስት ረድፎች በአምስት በአምስት ስንት ችግኞች ናቸው?', 'How many seedlings are three rows of five?'], [8, 15, 35], 15, V.array(3, 5), H.times) },
        { at: 'step:3', ex: choose(['ስናዞረው ስንት ችግኞች ይሆናሉ?', 'When we turn it around, how many seedlings are there?'], [8, 15, 53], 15, V.array(5, 3), H.times) }],
      reteach: ['step:0', 'end'],
      guided: [
        [rowsEx(2, 3), rowsEx(3, 3), rowsEx(3, 4)],
        [choose(which, [{ v: 'a', label: '2 × 4' }, { v: 'b', label: '2 + 4' }, { v: 'c', label: '4 × 4' }], 'a', V.array(2, 4), H.times),
          choose(which, [{ v: 'a', label: '3 + 5' }, { v: 'b', label: '3 × 5' }, { v: 'c', label: '5 × 5' }], 'b', V.array(3, 5), H.times),
          choose(which, [{ v: 'a', label: '4 × 4' }, { v: 'b', label: '4 + 6' }, { v: 'c', label: '4 × 6' }], 'c', V.array(4, 6), H.times)],
        [eqn([3, '×', 4, '=', '__'], 12, [12, 7, 34], { hints: H.times }), eqn([5, '×', 6, '=', '__'], 30, [30, 11, 35], { hints: H.times }),
          eqn([7, '×', '__', '=', 28], 4, [4, 21, 5], { hints: H.times })],
        [facts([[2, 5], [3, 3]]), facts([[4, 5], [3, 6], [2, 7]]), facts([[6, 6], [4, 8], [7, 5]])],
        [numpad(times(4, 5), 20, V.array(4, 5), H.times), numpad(times(6, 3), 18, null, H.times), numpad(times(8, 4), 32, null, H.times)],
        [is(12, [['a', '3 × 4', 'yes'], ['b', '2 × 5', 'no'], ['c', '2 × 6', 'yes'], ['d', '3 × 3', 'no']]),
          is(24, [['a', '4 × 6', 'yes'], ['b', '3 × 7', 'no'], ['c', '8 × 3', 'yes'], ['d', '5 × 5', 'no'], ['e', '6 × 4', 'yes']]),
          is(36, [['a', '4 × 9', 'yes'], ['b', '6 × 6', 'yes'], ['c', '5 × 7', 'no'], ['d', '9 × 4', 'yes'], ['e', '8 × 5', 'no']])]],
      challenge: [rowsEx(2, 5), eqn([4, '×', 5, '=', 5, '×', '__'], 4, [4, 5, 20], { hints: H.times }),
        tf('ሶስት ጊዜ ስድስት ከስድስት ጊዜ ሶስት ጋር እኩል ነው።', 'Three times six equals six times three.', true, V.array(3, 6)),
        listen(24, [24, 42, 10], { say: say('ስድስት ጊዜ አራት', 'six times four') }),
        numpad(times(9, 5), 45, null, H.times)],
      play: { game: 'coffee', rounds: [{ n: 8, trays: [4, 4] }, { n: 12, trays: [3, 3, 3, 3] }, { n: 15, trays: [5, 5, 5] }],
        intro: T('ለእንግዶቹ ቡና እንቅዳ! እያንዳንዱ ትሪ እኩል ስኒዎች ይኑረው።', "Let's pour coffee for the guests! Every tray gets the same number of cups.") }
    };
  },
  g3_share: () => {
    const div = (a, b) => [`${word(a)} ሲካፈል ለ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} divided by ${word(b, 'en')}?`];
    const by = (n, cards) => sortEx([`ለ${word(n)} በእኩል የሚካፈሉትን እና የማይካፈሉትን እንለይ።`, `Let's sort: shares equally into ${n}, has some left over.`],
      [['yes', `ለ${n} እኩል`, `Equal into ${n}`], ['no', 'ይተርፋል', 'Some left over']], cards.map(([id, n2, bin]) => [id, String(n2), bin]), H.share);
    const facts = (pairs) => matchWords([], { prompt: ['እያንዳንዱን ማካፈል ከመልሱ ጋር እናገናኝ።', "Let's match each division to its answer."],
      custom: pairs.map(([a, b]) => ({ item: { label: `${a} ÷ ${b}` }, target: { label: String(a / b) } })), hints: H.divide });
    return {
      place: 'village', game: 'race',
      checkpoints: [
        { at: 'step:1', ex: choose(['ከአንድ ዙር በኋላ ስንት ብርቱካኖች ተሰጡ?', 'After one turn, how many oranges have been given out?'], [1, 3, 12], 3, null, H.share) },
        { at: 'step:2', ex: choose(['እያንዳንዱ ልጅ ስንት ብርቱካኖች ያገኛል?', 'How many oranges does each child get?'], [3, 4, 12], 4, null, H.share) }],
      reteach: ['step:0', 'end'],
      guided: [
        [share(6, 2), share(9, 3), share(12, 4)],
        [choose(div(8, 2), [4, 6, 10], 4, V.groups([4, 4], 'orange'), H.divide), choose(div(15, 3), [5, 12, 18], 5, V.groups([5, 5, 5], 'orange'), H.divide),
          choose(div(20, 4), [5, 16, 24], 5, null, H.divide)],
        [eqn([10, '÷', 2, '=', '__'], 5, [5, 8, 12], { hints: H.divide }), eqn([18, '÷', 3, '=', '__'], 6, [6, 15, 21], { hints: H.divide }),
          eqn([24, '÷', '__', '=', 6], 4, [4, 18, 30], { hints: H.divide })],
        [facts([[6, 2], [10, 5]]), facts([[12, 4], [16, 2], [20, 5]]), facts([[24, 3], [30, 6], [28, 4]])],
        [numpad(['አስራ ሁለት ብርቱካኖች ለአራት ልጆች ሲካፈሉ እያንዳንዱ ልጅ ስንት ያገኛል?', 'Twelve oranges are shared by four children. How many does each child get?'], 3, V.groups([3, 3, 3, 3], 'orange'), H.share),
          numpad(div(20, 5), 4, null, H.divide), numpad(div(36, 4), 9, null, H.divide)],
        [by(3, [['a', 9, 'yes'], ['b', 7, 'no'], ['c', 12, 'yes'], ['d', 10, 'no']]),
          by(4, [['a', 8, 'yes'], ['b', 14, 'no'], ['c', 20, 'yes'], ['d', 18, 'no'], ['e', 16, 'yes']]),
          by(5, [['a', 25, 'yes'], ['b', 32, 'no'], ['c', 40, 'yes'], ['d', 21, 'no'], ['e', 35, 'yes']])]],
      challenge: [share(10, 5), eqn([21, '÷', 3, '=', '__'], 7, [7, 18, 24], { hints: H.divide }),
        tf('አስራ ስድስት ሲካፈል ለአራት አራት ነው።', 'Sixteen divided by four is four.', true, V.groups([4, 4, 4, 4], 'orange')),
        listen(6, [6, 9, 3], { say: say('አስራ ስምንት ሲካፈል ለሶስት', 'eighteen divided by three') }),
        numpad(div(30, 5), 6, null, H.divide)],
      play: { game: 'race', questions: [
        choose(['ስምንት ሲካፈል ለሁለት?', 'Eight divided by two?'], [4, 6], 4), choose(['አስራ አምስት ሲካፈል ለአምስት?', 'Fifteen divided by five?'], [3, 10], 3),
        choose(['አስራ ሁለት ሲካፈል ለሶስት?', 'Twelve divided by three?'], [4, 9], 4), choose(['ሃያ ሲካፈል ለሁለት?', 'Twenty divided by two?'], [10, 18], 10),
        choose(['አስራ ስምንት ሲካፈል ለስድስት?', 'Eighteen divided by six?'], [3, 12], 3)],
        intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
    };
  },
  g3_fractions: () => {
    const third = (n) => ({ piece: 'third', count: n }), sixth = (n) => ({ piece: 'sixth', count: n });
    const words = (pairs, prompt) => matchWords([], { prompt: prompt || ['እያንዳንዱን ቃል ከክፍልፋዩ ጋር እናገናኝ።', "Let's match each word to its fraction."],
      custom: pairs.map(([am, f]) => ({ item: { label: am, lang: 'am' }, target: { label: f } })), hints: H.thirds });
    return {
      place: 'feast', game: 'memory',
      checkpoints: [
        { at: 'step:1', ex: choose(['ስንት እኩል ክፍሎች አሉ?', 'How many equal parts are there?'], [2, 3, 4], 3, V.injera(3, 0), H.thirds) },
        { at: 'step:3', ex: choose(['ስንት ሶስተኛዎች አንድ ሙሉ እንጀራ ይሆናሉ?', 'How many thirds make one whole injera?'], [2, 3, 6], 3, V.injera(3, 1), H.thirds) }],
      reteach: ['step:0', 'end'],
      guided: [
        [frac(['አንድ ሶስተኛ እናስቀምጥ።', "Let's put one third."], [third(3)], 1, { parts: 3, hints: H.thirds }),
          frac(['ሁለት ሶስተኛ እናስቀምጥ።', "Let's put two thirds."], [third(3)], 2, { parts: 3, hints: H.thirds }),
          frac(['ግማሹን እንጀራ በስድስተኛ ቁርጥራጮች እንሙላ።', "Let's fill half of the injera with sixth pieces."], [sixth(4), { piece: 'half', count: 1 }], 3,
            { parts: 6, hints: [['ስድስት ስድስተኛዎች አንድ ሙሉ ናቸው።', 'Six sixths make one whole.'], ['ሶስት ስድስተኛዎች ግማሽ ናቸው።', 'Three sixths are one half.']] })],
        [choose(['አንድ ሶስተኛ የቀለመው የትኛው ነው?', 'Which one has one third coloured?'], [{ v: 'a', visual: V.injera(4, 1) }, { v: 'b', visual: V.injera(3, 1) }, { v: 'c', visual: V.injera(2, 1) }], 'b', null, H.thirds),
          choose(['ሁለት ሶስተኛ የቀለመው የትኛው ነው?', 'Which one has two thirds coloured?'], [{ v: 'a', visual: V.injera(3, 2) }, { v: 'b', visual: V.injera(4, 2) }, { v: 'c', visual: V.injera(3, 1) }], 'a', null, H.thirds),
          choose(['በሶስት እኩል ክፍሎች የተከፈለው የትኛው ነው?', 'Which one is cut into three equal parts?'], [{ v: 'a', visual: V.injera(3, 0, false) }, { v: 'b', visual: V.injera(4, 0) }, { v: 'c', visual: V.injera(3, 0) }], 'c', null, H.thirds)],
        [words([['አንድ ሶስተኛ', '1/3'], ['ግማሽ', '1/2']]), words([['አንድ ሶስተኛ', '1/3'], ['ሩብ', '1/4'], ['ሁለት ሶስተኛ', '2/3']]),
          words([['አንድ ስድስተኛ', '1/6'], ['ሁለት ሶስተኛ', '2/3'], ['ሶስት ሩብ', '3/4']])],
        [numpad(['የአስራ ሁለት ብርቱካኖች አንድ ሶስተኛ ስንት ነው?', 'What is one third of twelve oranges?'], 4, V.groups([4, 4, 4], 'orange'), H.share),
          numpad(['የስምንት ብርቱካኖች ሩብ ስንት ነው?', 'What is one quarter of eight oranges?'], 2, V.groups([2, 2, 2, 2], 'orange'), H.share),
          numpad(['የአስራ አምስት ብርቱካኖች ሁለት ሶስተኛ ስንት ነው?', 'What is two thirds of fifteen oranges?'], 10, V.groups([5, 5, 5], 'orange'), H.share)],
        [tf('ይህ በሶስት እኩል ክፍሎች ተከፍሏል።', 'This is cut into three equal parts.', true, V.injera(3, 0)),
          tf('ይህ በሶስት እኩል ክፍሎች ተከፍሏል።', 'This is cut into three equal parts.', false, V.injera(3, 0, false)),
          tf('የቀለመው ክፍል አንድ ሶስተኛ ነው።', 'The coloured part is one third.', false, V.injera(4, 1))],
        [sortEx(['ሶስተኛዎችን እና ሶስተኛ ያልሆኑትን እንለይ።', "Let's sort: thirds, not thirds."], [['yes', 'አንድ ሶስተኛ', 'One third'], ['no', 'ሶስተኛ አይደለም', 'Not a third']],
          [['a', '', 'yes', V.injera(3, 1)], ['b', '', 'no', V.injera(4, 1)], ['c', '', 'no', V.injera(2, 1)], ['d', '', 'yes', V.injera(3, 1)]], H.thirds),
        sortEx(['እኩል ክፍሎችን እና እኩል ያልሆኑትን እንለይ።', "Let's sort: equal parts, not equal parts."], [['yes', 'እኩል', 'Equal'], ['no', 'እኩል አይደለም', 'Not equal']],
          [['a', '', 'yes', V.injera(3, 0)], ['b', '', 'no', V.injera(3, 0, false)], ['c', '', 'yes', V.injera(6, 0)], ['d', '', 'no', V.injera(4, 0, false)], ['e', '', 'yes', V.injera(2, 0)]], H.thirds),
        sortEx(['ከግማሽ የሚበልጡትን እና የሚያንሱትን እንለይ።', "Let's sort: more than a half, less than a half."], [['more', 'ከግማሽ ይበልጣል', 'More than ½'], ['less', 'ከግማሽ ያንሳል', 'Less than ½']],
          [['a', '', 'more', V.injera(3, 2)], ['b', '', 'less', V.injera(3, 1)], ['c', '', 'more', V.injera(4, 3)], ['d', '', 'less', V.injera(6, 1)], ['e', '', 'more', V.injera(6, 4)]], H.thirds)]],
      challenge: [frac(['ሁለት ሶስተኛ እናስቀምጥ።', "Let's put two thirds."], [third(3)], 2, { parts: 3, hints: H.thirds }),
        words([['አንድ ሶስተኛ', '1/3'], ['ሁለት ሶስተኛ', '2/3']]),
        frac(['ሶስት ስድስተኛ እናስቀምጥ።', "Let's put three sixths."], [sixth(5)], 3, { parts: 6, hints: H.thirds }),
        listen('a', [{ v: 'a', visual: V.injera(3, 2) }, { v: 'b', visual: V.injera(3, 1) }, { v: 'c', visual: V.injera(4, 2) }], { say: say('ሁለት ሶስተኛ', 'two thirds'), answer: 'a' }),
        numpad(['ስንት ስድስተኛዎች አንድ ሙሉ እንጀራ ይሆናሉ?', 'How many sixths make one whole injera?'], 6, V.injera(6, 0), H.thirds)],
      play: { game: 'memory', pairs: [
        { n: '1/2', am: 'ግማሽ', visual: V.injera(2, 1) }, { n: '1/3', am: 'አንድ ሶስተኛ', visual: V.injera(3, 1) },
        { n: '1/4', am: 'ሩብ', visual: V.injera(4, 1) }, { n: '2/3', am: 'ሁለት ሶስተኛ', visual: V.injera(3, 2) }],
        intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ቁጥር፣ ቃል እና ሥዕል።', "Let's find matching cards: number, word and picture.") }
    };
  },
  g3_round: () => {
    const bigger = (a, b) => choose(['የትኛው ይበልጣል?', 'Which is greater?'], [{ v: 'a', label: String(a) }, { v: 'b', label: String(b) }], a > b ? 'a' : 'b', null, H.compare);
    const roundSort = (to, lo, cards) => sortEx([`ወደ ቅርብ ${to === 10 ? 'አስር' : 'መቶ'} ስናጠጋጋ ${word(lo)} ወይስ ${word(lo + to)}?`, `Round to the nearest ${to === 10 ? 'ten' : 'hundred'}: ${lo} or ${lo + to}?`],
      [['lo', String(lo), String(lo)], ['hi', String(lo + to), String(lo + to)]], cards.map((n, i) => ['c' + i, String(n), Math.round(n / to) * to === lo ? 'lo' : 'hi']), H.round);
    const nearest = (n, to) => [`${word(n)} ወደ ቅርብ ${to === 10 ? 'አስር' : 'መቶ'} ሲጠጋጋ ስንት ይሆናል?`, `What is ${word(n, 'en')} rounded to the nearest ${to === 10 ? 'ten' : 'hundred'}?`];
    const toHundred = (list) => pairs(list.map((n) => [n, Math.round(n / 100) * 100]), ['እያንዳንዱን ቁጥር ከቅርብ መቶው ጋር እናገናኝ።', "Let's match each number to its nearest hundred."], H.round);
    return {
      place: 'farm', game: 'race',
      checkpoints: [
        { at: 'step:1', ex: bigger(348, 384) },
        { at: 'step:3', ex: choose(['ሶስት መቶ አርባ ስምንት ለየትኛው መቶ ይቀርባል?', 'Which hundred is three hundred forty-eight closer to?'], [300, 400], 300, null, H.round) }],
      reteach: ['step:0', 'end'],
      guided: [
        [cmp(452, 425), cmp(608, 680), cmp(799, 801)],
        [line(300, 400, 10, [340, 370], { labels: 'ends' }), line(500, 600, 10, [520, 550, 580]), line(0, 1000, 100, [300, 700, 900])],
        [roundSort(10, 40, [43, 47, 41, 48]), roundSort(100, 300, [320, 380, 349, 351, 399]), roundSort(100, 500, [549, 551, 507, 586, 550])],
        [choose(nearest(87, 10), [80, 85, 90], 90, null, H.round), choose(nearest(234, 10), [200, 230, 240], 230, null, H.round), choose(nearest(765, 100), [700, 760, 800], 800, null, H.round)],
        [numpad(['በ2፣ 5 እና 1 አሃዞች ትልቁን ቁጥር እንሥራ።', "Make the biggest number with the digits 2, 5 and 1."], 521, null, H.compare),
          numpad(['በ4፣ 0 እና 8 አሃዞች ትልቁን ቁጥር እንሥራ።', "Make the biggest number with the digits 4, 0 and 8."], 840, null, H.compare),
          numpad(['በ6፣ 1 እና 9 አሃዞች ትንሹን ቁጥር እንሥራ።', "Make the smallest number with the digits 6, 1 and 9."], 169, null, H.compare)],
        [toHundred([312, 587]), toHundred([149, 451, 650]), toHundred([249, 251, 849])]],
      challenge: [cmp(563, 536), roundSort(10, 60, [62, 68, 65, 61]),
        tf('ሶስት መቶ አርባ ስምንት ከሶስት መቶ ሰማንያ አራት ይበልጣል።', 'Three hundred forty-eight is greater than three hundred eighty-four.', false),
        listen(N(350), [350, 305, 530]), numpad(nearest(457, 10), 460, null, H.round)],
      play: { game: 'race', questions: [bigger(256, 265), bigger(910, 901), bigger(478, 487), bigger(630, 603), bigger(199, 201)],
        intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
    };
  },
  g3_tables: () => {
    const times = (a, b) => [`${word(a)} ጊዜ ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} times ${word(b, 'en')}?`];
    const facts = (list) => pairs(list.map(([a, b]) => [`${a} × ${b}`, a * b]), ['እያንዳንዱን ማባዛት ከመልሱ ጋር እናገናኝ።', "Let's match each multiplication to its answer."], H.times);
    const boxes = (g, each) => dragCount('egg', g * each, { prompt: [`በእያንዳንዱ ሳጥን ${word(each)} እንቁላሎችን እናስቀምጥ።`, `Let's put ${each} eggs in each box.`],
      targets: Array.from({ length: g }, (_, i) => ({ id: 'box' + (i + 1), kind: 'tray', start: 0, need: each })), supply: g * each + 2, hints: H.times });
    const next = (seq, ans, opts) => choose([`ቀጥሎ የሚመጣው ቁጥር የቱ ነው? ${seq.join('፣ ')}፣ …`, `What number comes next? ${seq.join(', ')}, …`], opts, ans, null, H.times);
    const table = (n, cards) => sortEx([`በ${word(n)} ሰንጠረዥ ውስጥ ያሉትን እና የሌሉትን እንለይ።`, `Let's sort: in the ${n} times table, not in it.`], [['yes', `በ${n} ሰንጠረዥ`, `In the ${n} table`], ['no', 'የለም', 'Not in it']],
      cards.map((v, i) => ['c' + i, String(v), v % n === 0 ? 'yes' : 'no']), H.times);
    return {
      place: 'eggs', game: 'memory',
      checkpoints: [
        { at: 'step:0', ex: choose(['ሶስት ሳጥኖች ስንት እንቁላሎች ናቸው?', 'How many eggs are in three boxes?'], [9, 18, 36], 18, V.groups([6, 6, 6], 'egg'), H.times) },
        { at: 'step:3', ex: choose(times(6, 7), [36, 42, 49], 42, null, H.times) }],
      reteach: ['step:0', 'end'],
      guided: [
        [eqn([6, '×', 7, '=', '__'], 42, [42, 48, 13], { hints: H.times }), eqn([8, '×', 6, '=', '__'], 48, [48, 54, 14], { hints: H.times }), eqn([9, '×', '__', '=', 63], 7, [7, 8, 54], { hints: H.times })],
        [numpad(times(7, 8), 56, null, H.times), numpad(times(9, 6), 54, null, H.times), numpad(times(8, 8), 64, null, H.times)],
        [boxes(2, 4), boxes(2, 5), boxes(2, 6)],
        [facts([[6, 6], [7, 5]]), facts([[8, 7], [9, 4], [6, 9]]), facts([[9, 9], [8, 9], [7, 9]])],
        [next([7, 14, 21], 28, [22, 28, 35]), next([9, 18, 27], 36, [28, 36, 45]), next([8, 16, 24, 32], 40, [36, 40, 48])],
        [table(6, [18, 20, 30, 25]), table(7, [21, 24, 28, 30, 35]), table(9, [27, 45, 46, 58, 72])]],
      challenge: [eqn([7, '×', 8, '=', '__'], 56, [56, 15, 54], { hints: H.times }), facts([[9, 7], [8, 4]]),
        tf('ዘጠኝ ጊዜ ስድስት ሃምሳ አራት ነው።', 'Nine times six is fifty-four.', true),
        listen(56, [56, 54, 15], { say: say('ስምንት ጊዜ ሰባት', 'eight times seven') }), numpad(times(10, 10), 100, null, H.times)],
      play: { game: 'memory', pairs: [[6, 7], [7, 8], [8, 9], [10, 10]].map(([a, b]) => ({ n: N(a * b), am: `${a} × ${b}` })),
        intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ማባዛት እና መልሱ።', "Let's find matching cards: a multiplication and its answer.") }
    };
  },
  g3_divide: () => {
    const div = (a, b) => [`${word(a)} ሲካፈል ለ${word(b)} ስንት ነው?`, `What is ${word(a, 'en')} divided by ${word(b, 'en')}?`];
    const family = (list) => pairs(list.map(([a, b]) => [`${a} ÷ ${b}`, `${a / b} × ${b}`]), ['እያንዳንዱን ማካፈል ከሚረዳው ማባዛት ጋር እናገናኝ።', "Let's match each division to the multiplication that helps."], H.divide);
    const check = (am, en, ok) => tf(am, en, ok);
    return {
      place: 'playground', game: 'coffee',
      checkpoints: [
        { at: 'step:1', ex: choose(['ስንት ቡድኖች ሆኑ?', 'How many teams are there?'], [3, 4, 6], 4, V.groups([6, 6, 6, 6], 'child'), H.divide) },
        { at: 'step:3', ex: choose(['ሃያ አራት ሲካፈል ለስድስት አራት መሆኑን የሚያሳየው የትኛው ማባዛት ነው?', 'Which multiplication shows that twenty-four divided by six is four?'],
          [{ v: 'a', label: '4 × 6 = 24' }, { v: 'b', label: '4 + 6 = 10' }, { v: 'c', label: '6 × 6 = 36' }], 'a', null, H.divide) }],
      reteach: ['step:0', 'end'],
      guided: [
        [groupsOf(8, 4), groupsOf(10, 5), groupsOf(12, 3)],
        [eqn([24, '÷', 6, '=', '__'], 4, [4, 6, 18], { hints: H.divide }), eqn([35, '÷', '__', '=', 5], 7, [7, 5, 30], { hints: H.divide }), eqn(['__', '÷', 8, '=', 6], 48, [48, 14, 2], { hints: H.divide })],
        [family([[12, 3], [10, 2]]), family([[21, 7], [32, 8], [27, 9]]), family([[42, 6], [56, 7], [63, 9]])],
        [choose(['ሰላሳ ብርቱካኖች በአምስት በአምስት በከረጢት ቢቀመጡ ስንት ከረጢቶች ያስፈልጋሉ?', 'Thirty oranges go into bags of five. How many bags are needed?'], [5, 6, 25], 6, null, H.divide),
          choose(['ሃያ ስምንት ልጆች በሰባት በሰባት ቡድን ቢሆኑ ስንት ቡድኖች ይሆናሉ?', 'Twenty-eight children make teams of seven. How many teams?'], [4, 7, 21], 4, null, H.divide),
          choose(['አርባ አምስት ብር ለዘጠኝ ልጆች በእኩል ቢካፈል እያንዳንዱ ስንት ብር ያገኛል?', 'Forty-five birr is shared equally by nine children. How much does each get?'], [5, 9, 36], 5, null, H.divide)],
        [numpad(div(42, 7), 6, null, H.divide), numpad(div(56, 8), 7, null, H.divide), numpad(div(81, 9), 9, null, H.divide)],
        [check('ሰላሳ ሲካፈል ለስድስት አምስት ነው፤ ምክንያቱም አምስት ጊዜ ስድስት ሰላሳ ነው።', 'Thirty divided by six is five, because five times six is thirty.', true),
          check('ሰባት ጊዜ አራት ሃያ ስምንት ነው፤ ስለዚህ ሃያ ስምንት ሲካፈል ለአራት ስድስት ነው።', 'Seven times four is twenty-eight, so twenty-eight divided by four is six.', false),
          check('ዘጠኝ ጊዜ ስምንት ሰባ ሁለት ነው፤ ስለዚህ ሰባ ሁለት ሲካፈል ለዘጠኝ ስምንት ነው።', 'Nine times eight is seventy-two, so seventy-two divided by nine is eight.', true)]],
      challenge: [groupsOf(10, 2), eqn([36, '÷', 4, '=', '__'], 9, [9, 32, 40], { hints: H.divide }), family([[18, 3], [20, 4]]),
        listen(6, [6, 9, 45], { say: say('ሃምሳ አራት ሲካፈል ለዘጠኝ', 'fifty-four divided by nine') }), numpad(div(64, 8), 8, null, H.divide)],
      play: { game: 'coffee', rounds: [{ n: 12, trays: [6, 6] }, { n: 15, trays: [3, 3, 3, 3, 3] }, { n: 14, trays: [7, 7] }],
        intro: T('ለእንግዶቹ ቡና እንቅዳ! እያንዳንዱ ትሪ እኩል ስኒዎች ይኑረው።', "Let's pour coffee for the guests! Every tray gets the same number of cups.") }
    };
  },
  g3_fracline: () => {
    const fr = (f) => ({ v: f, label: f });
    const less = (cards) => sortEx(['ከግማሽ የሚያንሱትን እና የሚበልጡትን እንለይ።', "Let's sort: less than a half, more than a half."], [['less', 'ከ1/2 ያንሳል', 'Less than 1/2'], ['more', 'ከ1/2 ይበልጣል', 'More than 1/2']],
      cards.map((f, i) => { const [a, b] = f.split('/').map(Number); return ['c' + i, f, a / b < 0.5 ? 'less' : 'more']; }), H.frline);
    const same = (list) => pairs(list, ['እኩል የሆኑትን ክፍልፋዮች እናገናኝ።', "Let's match the fractions that are equal."], H.frline);
    const bigger = (a, b) => { const v = (f) => { const [x, y] = f.split('/').map(Number); return y ? x / y : x; }; return choose(['የትኛው ይበልጣል?', 'Which is greater?'], [fr(a), fr(b)], v(a) > v(b) ? a : b, null, H.frline); };
    return {
      place: 'path', game: 'race',
      checkpoints: [
        { at: 'step:1', ex: choose(['እያንዳንዱ ዝላይ ስንት ነው?', 'How long is each jump?'], [fr('1/2'), fr('1/4'), fr('1/3')], '1/4', V.fline(4, 1), H.frline) },
        { at: 'step:3', ex: choose(['ሁለት ሩብ ከየትኛው ጋር እኩል ነው?', 'Two quarters are equal to which?'], [fr('1/2'), fr('1/4'), fr('1')], '1/2', V.fline(4, 2), H.frline) }],
      reteach: ['step:0', 'end'],
      guided: [
        [fline(2, [1]), fline(4, [1, 3]), fline(3, [1, 2])],
        [choose(['ነጥቡ የት ነው?', 'Where is the dot?'], [fr('1/4'), fr('1/2'), fr('3/4')], '1/4', V.fline(4, 1), H.frline),
          choose(['ነጥቡ የት ነው?', 'Where is the dot?'], [fr('1/3'), fr('2/3'), fr('3/4')], '2/3', V.fline(3, 2), H.frline),
          choose(['ነጥቡ የት ነው?', 'Where is the dot?'], [fr('5/6'), fr('4/6'), fr('1/6')], '5/6', V.fline(6, 5), H.frline)],
        [frac(['ግማሽ እንዲሆን በሩብ ቁርጥራጮች እንሙላ።', "Let's make one half with quarter pieces."], [{ piece: 'quarter', count: 4 }], 2, { hints: H.frline }),
          frac(['ግማሽ እንዲሆን በስድስተኛ ቁርጥራጮች እንሙላ።', "Let's make one half with sixth pieces."], [{ piece: 'sixth', count: 5 }], 3, { parts: 6, hints: H.frline }),
          frac(['ሁለት ሶስተኛ እንዲሆን በስድስተኛ ቁርጥራጮች እንሙላ።', "Let's make two thirds with sixth pieces."], [{ piece: 'sixth', count: 6 }], 4, { parts: 6, hints: H.frline })],
        [same([['1/2', '2/4'], ['1', '4/4']]), same([['1/2', '2/4'], ['1/3', '2/6'], ['1', '3/3']]), same([['2/3', '4/6'], ['1/2', '3/6'], ['3/4', '6/8']])],
        [less(['1/4', '3/4', '1/3', '2/3']), less(['1/6', '5/6', '3/4', '1/3', '4/6']), less(['2/6', '5/8', '3/8', '7/8', '2/3'])],
        [tf('ሁለት ሩብ ከግማሽ ጋር እኩል ነው።', 'Two quarters are equal to one half.', true, V.fline(4, 2)),
          tf('አንድ ሶስተኛ ከአንድ ሩብ ያንሳል።', 'One third is less than one quarter.', false),
          tf('ሶስት ሩብ ከአንድ ሙሉ ያንሳል።', 'Three quarters are less than one whole.', true, V.fline(4, 3))]],
      challenge: [fline(4, [2], { prompt: ['ግማሽን በሩብ መስመሩ ላይ እናስቀምጥ።', "Let's put one half on the quarters line."], labels: ['1/2'] }),
        frac(['ሶስት ሩብ እናስቀምጥ።', "Let's put three quarters."], [{ piece: 'quarter', count: 4 }], 3, { hints: H.frline }),
        listen('3/4', [fr('3/4'), fr('1/4'), fr('3/3')], { say: say('ሶስት ሩብ', 'three quarters'), answer: '3/4' }),
        numpad(['ስንት ሩቦች አንድ ሙሉ ይሆናሉ?', 'How many quarters make one whole?'], 4, V.fline(4, 4), H.frline),
        tf('ሁለት ስድስተኛ ከአንድ ሶስተኛ ጋር እኩል ነው።', 'Two sixths are equal to one third.', true, V.fline(6, 2))],
      play: { game: 'race', questions: [bigger('1/4', '3/4'), bigger('1/2', '1/3'), bigger('1/4', '2/4'), bigger('1', '3/4'), bigger('1/3', '2/3')],
        intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
    };
  },
  g3_measure: () => {
    const U = { cm: opt('cm', 'ሳንቲ ሜትር', 'centimetres'), m: opt('m', 'ሜትር', 'metres'), kg: opt('kg', 'ኪሎ ግራም', 'kilograms'), l: opt('l', 'ሊትር', 'litres') };
    const unit = (am, en, list, ans) => choose([am, en], list.map((k) => U[k]), ans, null, H.measure);
    const two = (bins, cards, prompt) => sortEx(prompt, bins, cards, H.measure);
    return {
      place: 'scales', game: 'balloon',
      checkpoints: [
        { at: 'step:0', ex: choose(['እርሳሱ ስንት ሳንቲ ሜትር ይረዝማል?', 'How many centimetres long is the pencil?'], [10, 12, 15], 12, V.ruler(12, 15), H.measure) },
        { at: 'step:2', ex: choose(['ጀሪካኑ ስንት ሊትር ውሃ ይይዛል?', 'How many litres of water does the jerrycan hold?'], [3, 5, 10], 5, V.jug(5, 5), H.measure) }],
      reteach: ['step:0', 'end'],
      guided: [
        [ruler(8, 12, 'pencil', 'እርሳሱ', 'pencil'), ruler(11, 15, 'stick', 'ዱላው', 'stick'), ruler(13, 15, 'ribbon', 'ሪባኑ', 'ribbon')],
        [unit('የበሩን ቁመት በምን እንለካለን?', 'What do we use to measure how tall a door is?', ['m', 'kg', 'l'], 'm'),
          unit('የውሃ ጠርሙስ በምን ይለካል?', 'What do we use to measure a bottle of water?', ['kg', 'l', 'cm'], 'l'),
          unit('የእርሳስ ርዝመትን በምን እንለካለን?', "What do we use to measure a pencil's length?", ['m', 'cm', 'kg'], 'cm')],
        [numpad(['ከረጢቱ ስንት ኪሎ ግራም ይመዝናል?', 'How many kilograms does the bag weigh?'], 4, V.scale(4), H.measure),
          numpad(['ከረጢቱ ስንት ኪሎ ግራም ይመዝናል?', 'How many kilograms does the bag weigh?'], 7, V.scale(7), H.measure),
          numpad(['ከረጢቱ ስንት ኪሎ ግራም ይመዝናል?', 'How many kilograms does the bag weigh?'], 15, V.scale(15, 20), H.measure)],
        [choose(['ስንት ሊትር ውሃ አለ?', 'How many litres of water are there?'], [2, 3, 5], 2, V.jug(2, 5), H.measure),
          choose(['ስንት ሊትር ውሃ አለ?', 'How many litres of water are there?'], [3, 4, 5], 4, V.jug(4, 5), H.measure),
          choose(['ስንት ሊትር ውሃ አለ?', 'How many litres of water are there?'], [4, 6, 10], 6, V.jug(6, 10), H.measure)],
        [two([['short', 'ከ1 ሜትር ያጥራል', 'Shorter than 1 m'], ['long', 'ከ1 ሜትር ይረዝማል', 'Longer than 1 m']],
          [['a', '✏️ እርሳስ', 'short'], ['b', '🚪 በር', 'long'], ['c', '🥄 ማንኪያ', 'short'], ['d', '🚌 አውቶቡስ', 'long']], ['ከአንድ ሜትር የሚያጥሩትን እና የሚረዝሙትን እንለይ።', "Let's sort: shorter than one metre, longer than one metre."]),
          two([['light', 'ከ1 ኪሎ ግራም ያንሳል', 'Lighter than 1 kg'], ['heavy', 'ከ1 ኪሎ ግራም ይበልጣል', 'Heavier than 1 kg']],
            [['a', '🪶 ላባ', 'light'], ['b', '🍉 ሐብሐብ', 'heavy'], ['c', '✏️ እርሳስ', 'light'], ['d', '🛍️ የጤፍ ከረጢት', 'heavy'], ['e', '🥚 እንቁላል', 'light']], ['ከአንድ ኪሎ ግራም የሚቀሉትን እና የሚከብዱትን እንለይ።', "Let's sort: lighter than one kilogram, heavier than one kilogram."]),
          two([['less', 'ከ1 ሊትር ያንሳል', 'Less than 1 L'], ['more', 'ከ1 ሊትር ይበልጣል', 'More than 1 L']],
            [['a', '☕ ስኒ', 'less'], ['b', '🪣 ባልዲ', 'more'], ['c', '🥄 ማንኪያ', 'less'], ['d', '🛢️ በርሜል', 'more'], ['e', '🛁 ገንዳ', 'more']], ['ከአንድ ሊትር ያነሰ እና የበለጠ የሚይዙትን እንለይ።', "Let's sort: holds less than one litre, holds more than one litre."])],
        [eqn([12, '+', 8, '=', '__'], 20, [20, 4, 128], { prompt: ['ሁለት ሪባኖች፦ አስራ ሁለት ሳንቲ ሜትር እና ስምንት ሳንቲ ሜትር። በአጠቃላይ ስንት ናቸው?', 'Two ribbons: twelve centimetres and eight centimetres. How long are they together?'], hints: H.measure }),
          eqn([5, '−', 2, '=', '__'], 3, [3, 7, 52], { prompt: ['ጀሪካኑ አምስት ሊትር ነበረው፤ ሁለት ሊትር ተጠጣ። ስንት ሊትር ቀረ?', 'The jerrycan had five litres; two litres were drunk. How many litres are left?'], hints: H.measure }),
          eqn([100, '−', 35, '=', '__'], 65, [65, 75, 135], { prompt: ['አንድ ሜትር መቶ ሳንቲ ሜትር ነው። ሰላሳ አምስት ሳንቲ ሜትር ቢቆረጥ ስንት ይቀራል?', 'One metre is one hundred centimetres. If thirty-five centimetres are cut off, how much is left?'], hints: H.measure })]],
      challenge: [ruler(9, 12, 'spoon', 'ማንኪያው', 'spoon'),
        eqn([5, '×', 2, '=', '__'], 10, [10, 7, 52], { prompt: ['አምስት ጠርሙሶች፣ እያንዳንዳቸው ሁለት ሊትር። በአጠቃላይ ስንት ሊትር?', 'Five bottles of two litres each. How many litres altogether?'], hints: H.measure }),
        pairs([['1 ሜትር', '100 ሳ.ሜ'], ['1 ኪሎ ግራም', '1000 ግራም']], ['እኩል የሆኑትን እናገናኝ።', "Let's match the ones that are equal."], H.measure),
        listen('a', [{ v: 'a', visual: V.scale(3) }, { v: 'b', visual: V.scale(5) }, { v: 'c', visual: V.scale(8) }], { say: say('ሶስት ኪሎ ግራም', 'three kilograms'), answer: 'a' }),
        tf('ይህ ጀሪካን ሶስት ሊትር ውሃ አለው።', 'This jerrycan has three litres of water.', true, V.jug(3, 5))],
      play: { game: 'balloon', rounds: [{ target: N(20), balloons: [12, 8, 15, 3, 6, 11] }, { target: N(50), balloons: [25, 30, 20, 15, 35, 5].map(N) },
        { target: N(100), balloons: [60, 45, 40, 55, 25, 70].map(N) }],
        intro: T('ሁለት ሪባኖችን የሚያሳዩ ፊኛዎችን ፈንድተን የተጠየቀውን ርዝመት እንሥራ።', "Pop two ribbon balloons that add up to the length asked for.") }
    };
  },
  g3_time: () => {
    const read = (h, m, wrong) => choose(['ሰዓቱ ስንት ነው?', 'What time is it?'], [hhmm(h, m), ...wrong].map((t) => ({ v: t, label: t })), hhmm(h, m), V.clock(h, m), H.time);
    const clocks = (list) => pairs(list.map(([h, m]) => [hhmm(h, m), { visual: V.clock(h, m) }]), ['እያንዳንዱን ሰዓት ከሰዓቱ ሥዕል ጋር እናገናኝ።', "Let's match each time to its clock."], H.time);
    const ethio = (hours) => pairs(hours.map((h) => [`${h}:00`, { label: `ሰዓት ${eth(h)}`, lang: 'am' }]), ['እያንዳንዱን ሰዓት ከኢትዮጵያ ሰዓቱ ጋር እናገናኝ።', "Let's match each time to its Ethiopian time."], H.ethtime);
    const side = (h, m, cards) => sortEx([`ከ${hhmm(h, m)} በፊት እና በኋላ ያሉትን እንለይ።`, `Let's sort: before ${hhmm(h, m)}, after ${hhmm(h, m)}.`], [['before', `ከ${hhmm(h, m)} በፊት`, `Before ${hhmm(h, m)}`], ['after', `ከ${hhmm(h, m)} በኋላ`, `After ${hhmm(h, m)}`]],
      cards.map(([hh, mm], i) => ['c' + i, hhmm(hh, mm), hh * 60 + mm < h * 60 + m ? 'before' : 'after']), H.time);
    const long = (a, b, ans) => numpad([`${a} ላይ ጀምሮ ${b} ላይ አለቀ። ስንት ደቂቃ ፈጀ?`, `It started at ${a} and ended at ${b}. How many minutes did it take?`], ans, null, H.time);
    return {
      place: 'clocktower', game: 'memory',
      checkpoints: [
        { at: 'step:1', ex: choose(['ትልቁ መርፌ አራት ላይ ነው። ስንት ደቂቃ ነው?', 'The long hand is on the four. How many minutes is that?'], [4, 20, 40], 20, V.clock(7, 20), H.time) },
        { at: 'step:3', ex: choose(['ከአርባ ደቂቃ በኋላ ስንት ሰዓት ይሆናል?', 'What time will it be forty minutes later?'], [{ v: '7:60', label: '7:60' }, { v: '8:00', label: '8:00' }, { v: '9:00', label: '9:00' }], '8:00', V.clock(7, 20), H.time) }],
      reteach: ['step:0', 'end'],
      guided: [
        [clockAt(4, 15, 5, 'ሰዓቱን አራት ከአስራ አምስት እናድርግ።', 'Set the clock to four fifteen.'), clockAt(9, 40, 5, 'ሰዓቱን ዘጠኝ ከአርባ እናድርግ።', 'Set the clock to nine forty.'),
          clockAt(6, 48, 1, 'ሰዓቱን ስድስት ከአርባ ስምንት እናድርግ።', 'Set the clock to six forty-eight.')],
        [read(3, 25, ['5:15', '3:05']), read(11, 50, ['10:50', '11:10']), read(8, 43, ['9:43', '8:38'])],
        [clocks([[7, 0], [3, 30]]), clocks([[2, 15], [9, 45], [5, 20]]), clocks([[4, 10], [10, 20], [12, 55]])],
        [long('8:10', '8:40', 30), long('9:25', '10:00', 35), long('1:45', '2:20', 35)],
        [side(8, 0, [[7, 45], [8, 15], [7, 59], [8, 5]]), side(3, 30, [[3, 20], [3, 40], [3, 29], [3, 31], [3, 5]]), side(12, 0, [[11, 50], [12, 10], [10, 30], [12, 45], [11, 59]])],
        [ethio([7, 12]), ethio([8, 9, 6]), ethio([1, 3, 11])]],
      challenge: [clocks([[6, 45], [1, 20]]), side(10, 0, [[9, 50], [10, 25], [9, 5], [10, 1]]), ethio([2, 4]),
        clockAt(5, 35, 5, 'ሰዓቱን አምስት ከሰላሳ አምስት እናድርግ።', 'Set the clock to five thirty-five.'),
        tf('ሰዓቱ ዘጠኝ ከአስራ አምስት ነው።', 'The time is nine fifteen.', true, V.clock(9, 15))],
      play: { game: 'memory', pairs: [
        { n: '7:20', am: 'ሰባት ከሃያ', visual: V.clock(7, 20) }, { n: '3:45', am: 'ሶስት ከአርባ አምስት', visual: V.clock(3, 45) },
        { n: '10:05', am: 'አስር ከአምስት', visual: V.clock(10, 5) }, { n: '12:30', am: 'አስራ ሁለት ተኩል', visual: V.clock(12, 30) }],
        intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ ሰዓቱ እና የሰዓቱ ሥዕል።', "Let's find matching cards: the time and its clock.") }
    };
  },
  g3_shapes: () => {
    const NAME = { triangle: ['ሶስት ማዕዘን', 'triangle'], square: ['ካሬ', 'square'], rectangle: ['አራት ማዕዘን', 'rectangle'], pentagon: ['ባለ አምስት ጎን', 'pentagon'],
      hexagon: ['ባለ ስድስት ጎን', 'hexagon'], circle: ['ክብ', 'circle'], rhombus: ['ሮምበስ', 'rhombus'], trapezoid: ['ትራፔዝ', 'trapezoid'] };
    const pick1 = (am, en, shapes, ans) => choose([am, en], shapes.map((k) => ({ v: k, visual: V.shape(k) })), ans, null, H.shapes);
    const names = (list) => pairs(list.map((k) => [{ label: NAME[k][0], lang: 'am' }, { visual: V.shape(k) }]), ['እያንዳንዱን ስም ከቅርጹ ጋር እናገናኝ።', "Let's match each name to its shape."], H.shapes);
    const SIDES = { triangle: 3, 'right-triangle': 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, parallelogram: 4, kite: 4, pentagon: 5, hexagon: 6 };
    const quad = (list, prompt, bins) => sortEx(prompt, bins, list.map((k, i) => ['c' + i, '', bins.length === 2 ? (SIDES[k] === (bins[0][0] === 'three' ? 3 : 4) ? bins[0][0] : bins[1][0]) : String(SIDES[k]), V.shape(k)]), H.shapes);
    const corners = (list) => sortEx(['ቀጥ ያሉ ማዕዘኖች ያሏቸውን እና የሌሏቸውን እንለይ።', "Let's sort: has square corners, has no square corners."], [['yes', 'ቀጥ ያሉ ማዕዘኖች', 'Square corners'], ['no', 'የሉትም', 'No square corners']],
      list.map((k, i) => ['c' + i, '', ['square', 'rectangle'].includes(k) ? 'yes' : 'no', V.shape(k)]), H.shapes);
    const bySides = (list, ns) => sortEx(['በጎኖቻቸው ብዛት እንለይ።', "Let's sort by the number of sides."], ns.map((n) => [String(n), `${n} ጎኖች`, `${n} sides`]), list.map((k, i) => ['c' + i, '', String(SIDES[k]), V.shape(k)]), H.shapes);
    return {
      place: 'house', game: 'memory',
      checkpoints: [
        { at: 'step:0', ex: choose(['ሶስት ማዕዘን ስንት ጎኖች አሉት?', 'How many sides does a triangle have?'], [3, 4, 5], 3, V.shape('triangle'), H.shapes) },
        { at: 'step:2', ex: choose(['ካሬ ስንት እኩል ጎኖች አሉት?', 'How many equal sides does a square have?'], [2, 3, 4], 4, V.shape('square'), H.shapes) }],
      reteach: ['step:0', 'end'],
      guided: [
        [quad(['triangle', 'square', 'right-triangle', 'rectangle'], ['ሶስት ማዕዘኖችን እና ባለ አራት ጎኖችን እንለይ።', "Let's sort: triangles, four-sided shapes."], [['three', 'ሶስት ማዕዘን', 'Triangle'], ['four', 'ባለ አራት ጎን', 'Four sides']]),
          quad(['rhombus', 'triangle', 'trapezoid', 'right-triangle', 'square'], ['ሶስት ማዕዘኖችን እና ባለ አራት ጎኖችን እንለይ።', "Let's sort: triangles, four-sided shapes."], [['three', 'ሶስት ማዕዘን', 'Triangle'], ['four', 'ባለ አራት ጎን', 'Four sides']]),
          quad(['pentagon', 'kite', 'parallelogram', 'hexagon', 'trapezoid'], ['ባለ አራት ጎኖችን እና ያልሆኑትን እንለይ።', "Let's sort: quadrilaterals, not quadrilaterals."], [['four', 'ባለ አራት ጎን', 'Quadrilateral'], ['other', 'አይደለም', 'Not one']])],
        [pick1('ካሬው የትኛው ነው?', 'Which one is the square?', ['rectangle', 'square', 'triangle'], 'square'), pick1('አራት ማዕዘኑ የትኛው ነው?', 'Which one is the rectangle?', ['rhombus', 'trapezoid', 'rectangle'], 'rectangle'),
          pick1('አምስት ጎኖች ያሉት የትኛው ነው?', 'Which one has five sides?', ['hexagon', 'pentagon', 'kite'], 'pentagon')],
        [names(['triangle', 'square']), names(['triangle', 'square', 'rectangle']), names(['pentagon', 'hexagon', 'circle'])],
        [numpad(['ስንት ጎኖች አሉት?', 'How many sides does it have?'], 5, V.shape('pentagon'), H.shapes), numpad(['ስንት ጎኖች አሉት?', 'How many sides does it have?'], 6, V.shape('hexagon'), H.shapes),
          numpad(['አንድ ሶስት ማዕዘን እና አንድ ካሬ በአጠቃላይ ስንት ማዕዘኖች አሏቸው?', 'How many corners do a triangle and a square have altogether?'], 7, null, H.shapes)],
        [tf('ካሬ አራት ማዕዘንም ነው።', 'A square is also a rectangle.', true, V.shape('square')), tf('ይህ ቅርጽ አራት ጎኖች አሉት።', 'This shape has four sides.', false, V.shape('pentagon')),
          tf('ክብ ማዕዘን የለውም።', 'A circle has no corners.', true, V.shape('circle'))],
        [corners(['square', 'triangle', 'rectangle', 'rhombus']), bySides(['triangle', 'square', 'pentagon', 'trapezoid', 'right-triangle'], [3, 4, 5]),
          bySides(['kite', 'pentagon', 'hexagon', 'rectangle', 'pentagon'], [4, 5, 6])]],
      challenge: [quad(['parallelogram', 'triangle', 'hexagon', 'square'], ['ባለ አራት ጎኖችን እና ያልሆኑትን እንለይ።', "Let's sort: quadrilaterals, not quadrilaterals."], [['four', 'ባለ አራት ጎን', 'Quadrilateral'], ['other', 'አይደለም', 'Not one']]),
        names(['rectangle', 'hexagon']), bySides(['hexagon', 'square', 'triangle', 'kite'], [3, 4, 6]),
        listen('a', [{ v: 'a', visual: V.shape('hexagon') }, { v: 'b', visual: V.shape('pentagon') }, { v: 'c', visual: V.shape('square') }], { say: say('ባለ ስድስት ጎን', 'hexagon'), answer: 'a' }),
        numpad(['ሁለት ሶስት ማዕዘኖች በአጠቃላይ ስንት ጎኖች አሏቸው?', 'How many sides do two triangles have altogether?'], 6, null, H.shapes)],
      play: { game: 'memory', pairs: [['triangle', 3], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6]].map(([k, n]) => ({ n, am: NAME[k][0], visual: V.shape(k) })),
        intro: T('የሚመሳሰሉትን ካርዶች እንፈልግ፤ የጎኖች ብዛት እና ቅርጹ።', "Let's find matching cards: the number of sides and the shape.") }
    };
  },
  g3_area: () => {
    const area = (w, h, o) => numpad(['ስፋቱ ስንት ካሬ አሃድ ነው?', 'What is the area in square units?'], w * h, V.rect(w, h, o), H.area);
    const per = (w, h, opts) => choose(['ዙሪያው ስንት ነው?', 'What is the perimeter?'], opts, 2 * (w + h), V.rect(w, h, { labels: true }), H.area);
    const sortRect = (prompt, bins, list, fn) => sortEx(prompt, bins, list.map(([w, h, o], i) => ['c' + i, '', fn(w, h), V.rect(w, h, o)]), H.area);
    return {
      place: 'floor', game: 'race',
      checkpoints: [
        { at: 'step:1', ex: choose(['ስንት ሰቆች ናቸው?', 'How many tiles are there?'], [7, 12, 14], 12, V.rect(4, 3, { grid: true, fill: 12 }), H.area) },
        { at: 'step:3', ex: choose(['ዙሪያው ስንት ነው?', 'What is the perimeter?'], [7, 12, 14], 14, V.rect(4, 3, { labels: true }), H.area) }],
      reteach: ['step:0', 'end'],
      guided: [
        [grid(3, 2), grid(4, 2), grid(4, 3, 2)],
        [area(5, 2, { grid: true }), area(4, 4, { grid: true }), area(6, 3, { labels: true })],
        [per(3, 2, [5, 6, 10]), per(5, 3, [8, 15, 16]), per(6, 4, [10, 20, 24])],
        [eqn([5, '×', 3, '=', '__'], 15, [15, 8, 53], { prompt: ['አምስት በሶስት የሆነ አራት ማዕዘን ስፋቱ ስንት ነው?', 'What is the area of a five by three rectangle?'], hints: H.area }),
          eqn([4, '+', 2, '+', 4, '+', 2, '=', '__'], 12, [12, 8, 6], { prompt: ['አራት በሁለት የሆነ አራት ማዕዘን ዙሪያው ስንት ነው?', 'What is the perimeter of a four by two rectangle?'], hints: H.area }),
          eqn([7, '×', '__', '=', 28], 4, [4, 21, 35], { prompt: ['ስፋቱ ሃያ ስምንት፣ ርዝመቱ ሰባት ነው። ወርዱ ስንት ነው?', 'The area is twenty-eight and the length is seven. How wide is it?'], hints: H.area })],
        [sortRect(['ስፋታቸው አስራ ሁለት የሆኑትን እንለይ።', "Let's sort: area twelve, not twelve."], [['yes', 'ስፋት 12', 'Area 12'], ['no', '12 አይደለም', 'Not 12']],
          [[4, 3, { grid: true }], [6, 2, { grid: true }], [5, 2, { grid: true }], [3, 3, { grid: true }]], (w, h) => (w * h === 12 ? 'yes' : 'no')),
          sortRect(['ዙሪያቸው አስራ ሁለት የሆኑትን እንለይ።', "Let's sort: perimeter twelve, not twelve."], [['yes', 'ዙሪያ 12', 'Perimeter 12'], ['no', '12 አይደለም', 'Not 12']],
            [[4, 2, { labels: true }], [3, 3, { labels: true }], [5, 2, { labels: true }], [2, 2, { labels: true }], [5, 1, { labels: true }]], (w, h) => (2 * (w + h) === 12 ? 'yes' : 'no')),
          sortRect(['ስፋታቸው ሃያ አራት የሆኑትን እንለይ።', "Let's sort: area twenty-four, not twenty-four."], [['yes', 'ስፋት 24', 'Area 24'], ['no', '24 አይደለም', 'Not 24']],
            [[6, 4, { labels: true }], [8, 3, { labels: true }], [5, 5, { labels: true }], [7, 3, { labels: true }], [12, 2, { labels: true }]], (w, h) => (w * h === 24 ? 'yes' : 'no'))],
        [tf('ስፋቱ ስምንት ካሬ አሃድ ነው።', 'The area is eight square units.', true, V.rect(4, 2, { grid: true })),
          tf('ዙሪያው ስምንት ነው።', 'The perimeter is eight.', true, V.rect(3, 1, { labels: true })),
          tf('የዚህ ካሬ ስፋት እና ዙሪያ እኩል ቁጥሮች ናቸው።', 'The area and the perimeter of this square are the same number.', true, V.rect(4, 4, { labels: true }))]],
      challenge: [grid(3, 3), eqn([6, '+', 3, '+', 6, '+', 3, '=', '__'], 18, [18, 9, 12], { prompt: ['ስድስት በሶስት የሆነ አራት ማዕዘን ዙሪያው ስንት ነው?', 'What is the perimeter of a six by three rectangle?'], hints: H.area }),
        pairs([[12, { visual: V.rect(4, 3, { grid: true }) }], [10, { visual: V.rect(5, 2, { grid: true }) }]], ['እያንዳንዱን ስፋት ከአራት ማዕዘኑ ጋር እናገናኝ።', "Let's match each area to its rectangle."], H.area),
        listen('a', [{ v: 'a', visual: V.rect(5, 4, { grid: true }) }, { v: 'b', visual: V.rect(4, 4, { grid: true }) }, { v: 'c', visual: V.rect(6, 3, { grid: true }) }], { say: say('ስፋቱ ሃያ ካሬ አሃድ ነው', 'the area is twenty square units'), answer: 'a' }),
        numpad(['ዙሪያው ስንት ነው?', 'What is the perimeter?'], 20, V.rect(5, 5, { labels: true }), H.area)],
      play: { game: 'race', questions: [
        choose(['ስፋት፦ ሶስት በአምስት?', 'Area: three by five?'], [15, 8], 15), choose(['ስፋት፦ አራት በአራት?', 'Area: four by four?'], [16, 8], 16),
        choose(['ዙሪያ፦ ሁለት በሁለት?', 'Perimeter: two by two?'], [8, 4], 8), choose(['ስፋት፦ ስድስት በሁለት?', 'Area: six by two?'], [12, 8], 12),
        choose(['ዙሪያ፦ አምስት በአንድ?', 'Perimeter: five by one?'], [12, 5], 12)],
        intro: T('ወደ አያቴ ቤት እንሩጥ! በትክክል ስንመልስ ወደ ፊት እንሄዳለን።', "Let's race to Grandma's house! Each right answer moves us forward.") }
    };
  },
  g3_graphs: () => {
    const fruitOpts = ['banana', 'mango', 'orange'].map((k) => opt(k, FRUIT[k].am, FRUIT[k].en));
    return {
      place: 'chart', game: 'market',
      checkpoints: [
        { at: 'step:1', ex: choose(['ረጅሙ አምድ የትኛው ነው?', 'Which bar is the tallest?'], fruitOpts, 'banana', V.bars([7, 5, 3]), H.graph) },
        { at: 'step:3', ex: choose(['በአጠቃላይ ስንት ልጆች ናቸው?', 'How many children are there altogether?'], [13, 15, 17], 15, V.bars([7, 5, 3]), H.graph) }],
      reteach: ['step:0', 'end'],
      guided: [
        [columns([3, 2]), columns([4, 2, 3]), columns([5, 3, 4])],
        [choose(['ስንት ልጆች ማንጎ ወደዱ?', 'How many children liked mangoes?'], [3, 5, 7], 5, V.bars([7, 5, 3]), H.graph),
          choose(['ሙዝ ከብርቱካን በስንት ይበልጣል?', 'How many more liked bananas than oranges?'], [2, 4, 8], 4, V.bars([6, 4, 2]), H.graph),
          choose(['የትኞቹ ሁለት ፍራፍሬዎች በአንድ ላይ አስር ልጆች ናቸው?', 'Which two fruits together make ten children?'], [{ v: 'bm', label: 'ሙዝ + ማንጎ' }, { v: 'mo', label: 'ማንጎ + ብርቱካን' }, { v: 'bo', label: 'ሙዝ + ብርቱካን' }], 'mo', V.bars([8, 6, 4]), H.graph)],
        [numpad(['ሰላም አስር ብር ነበራት። ሶስት ብር እስክሪብቶ እና ሁለት ብር ከረሜላ ገዛች። ስንት ብር ቀራት?', 'Selam had ten birr. She bought a pen for three birr and a sweet for two birr. How much is left?'], 5, null, H.graph),
          numpad(['አራት ሳጥኖች፣ በእያንዳንዱ ስድስት እንቁላሎች። አምስቱ ተሰበሩ። ስንት ደህና እንቁላሎች ቀሩ?', 'Four boxes with six eggs in each. Five broke. How many good eggs are left?'], 19, null, H.graph),
          numpad(['ሶስት ጓደኞች እያንዳንዳቸው ስምንት ማንጎዎች አሏቸው። ሁሉንም በአራት ቅርጫቶች በእኩል አካፈሉ። በአንዱ ቅርጫት ስንት አሉ?', 'Three friends have eight mangoes each. They share them all equally into four baskets. How many are in each basket?'], 6, null, H.graph)],
        [eqn([7, '−', 5, '=', '__'], 2, [2, 12, 3], { prompt: ['ሙዝ ከማንጎ በስንት ይበልጣል? ሰባት ሲቀነስ አምስት።', 'How many more liked bananas than mangoes? Seven minus five.'], visual: V.bars([7, 5, 3]), hints: H.graph }),
          eqn([6, '+', 4, '+', 2, '=', '__'], 12, [12, 10, 8], { prompt: ['በአጠቃላይ ስንት ልጆች ናቸው?', 'How many children altogether?'], visual: V.bars([6, 4, 2]), hints: H.graph }),
          eqn([3, '×', 4, '+', 2, '=', '__'], 14, [14, 9, 12], { prompt: ['ሶስት ሳጥኖች በአራት በአራት እና ሁለት ብቻቸውን። ስንት ናቸው?', 'Three boxes of four and two more on their own. How many?'], hints: H.graph })],
        [tf('ቡና የወደዱት ከሻይ በሁለት ይበልጣሉ።', 'Two more children liked coffee than tea.', true, V.picto([['ቡና', 4], ['ሻይ', 2]])),
          tf('እያንዳንዱ ስኒ ሁለት ልጆች ነው። ቡና የወደዱት ስድስት ናቸው።', 'Each cup stands for two children. Six children liked coffee.', true, V.picto([['ቡና', 3], ['ሻይ', 2]], 2)),
          tf('በዚህ የነጥብ ግራፍ ላይ ሁለት ልጆች ሶስት ወንድሞች እና እህቶች አሏቸው።', 'On this line plot, two children have three brothers and sisters.', true, V.lineplot({ 0: 1, 1: 3, 2: 4, 3: 2 }))],
        [pay(15, 'ዳቦው እና ሙዙ', 'bread and bananas', [10, 5, 5, 1]), pay(37, 'እስክሪብቶው እና ደብተሩ', 'pen and exercise book', [10, 10, 10, 5, 1, 1, 1], { pic: 'book' }),
          pay(64, 'ጫማው እና ካልሲው', 'shoes and socks', [50, 10, 5, 1, 1, 1, 1], { pic: 'shoes' })]],
      challenge: [columns([6, 3]), eqn([10, '−', 3, '−', 4, '=', '__'], 3, [3, 7, 17], { prompt: ['አስር ብርቱካኖች ነበሩ፤ ሶስቱ ተበሉ፣ አራቱ ተሰጡ። ስንት ቀሩ?', 'There were ten oranges; three were eaten and four were given away. How many are left?'], hints: H.graph }),
        pay(28, 'ሙዙ እና እንቁላሉ', 'bananas and eggs', [10, 10, 5, 5, 1, 1, 1], { pic: 'egg' }), listen(N(15), [15, 51, 5]),
        choose(['በዚህ የነጥብ ግራፍ ላይ ብዙ ልጆች ስንት ወንድሞች እና እህቶች አሏቸው?', 'On this line plot, how many brothers and sisters do most children have?'], [1, 2, 3], 2, V.lineplot({ 0: 1, 1: 3, 2: 4, 3: 2 }), H.graph)],
      play: { game: 'market', budget_currency: 'birr', rounds: [
        { budget: N(30), goods: [{ pic: 'bread', am: 'ዳቦ', en: 'Bread', price: 12 }, { pic: 'banana', am: 'ሙዝ', en: 'Bananas', price: 18 }, { pic: 'egg', am: 'እንቁላል', en: 'Eggs', price: 25 }] },
        { budget: N(50), goods: [{ pic: 'pen', am: 'እስክሪብቶ', en: 'Pen', price: 15 }, { pic: 'book', am: 'ደብተር', en: 'Exercise book', price: 20 }, { pic: 'banana', am: 'ሙዝ', en: 'Bananas', price: 15 }] },
        { budget: N(100), goods: [{ pic: 'shoes', am: 'ጫማ', en: 'Shoes', price: 65 }, { pic: 'bag', am: 'ቦርሳ', en: 'Bag', price: 80 }, { pic: 'book', am: 'ደብተር', en: 'Exercise book', price: 35 }] }],
        intro: T('ገበያ እንሂድ! ያለንን ብር በሙሉ የሚጨርሱ ዕቃዎችን እንግዛ።', "Let's go to the market! Buy things that use up exactly all our birr.") }
    };
  }
};

// ---------- assemble ----------
const META = Object.fromEntries([...LK.lessons.map((l) => [l.id, Object.assign({ grade: 1 }, l)]), ...LK.lessonsG2.map((l) => [l.id, l]), ...LK.lessonsG3.map((l) => [l.id, l])]);
const ORDER = ['count10', 'teens', 'compare', 'add10', 'sub10', 'make10', 'g2_placevalue', 'g2_add2d', 'g2_sub2d', 'g2_groups', 'g2_birr', 'g2_halves',
  'g3_hundreds', 'g3_add3d', 'g3_sub3d', 'g3_times', 'g3_share', 'g3_fractions',
  'g3_round', 'g3_tables', 'g3_divide', 'g3_fracline', 'g3_measure', 'g3_time', 'g3_shapes', 'g3_area', 'g3_graphs'];
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
