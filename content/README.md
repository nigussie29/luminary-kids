# Lesson content — the exercise JSON format

Every lesson is one file, `content/lessons/<id>.json`, built by `node content/build.js` from the lesson
plans in that script. The app reads these files (and has a copy built in, so lessons keep working
offline). Grown-ups with the admin password can add or change exercises at **/admin** without code;
those edits are saved on the server (`DATA_DIR/lessons`) and win over the built files.
`docs/lesson-plans.md` shows every lesson in a readable table for teacher review.

## A lesson

```jsonc
{
  "id": "g2_add2d", "grade": 2, "n": 2, "place": "library",
  "title": { "am": "…", "en": "…", "audio_url": "audio/am/lesson.g2_add2d.title.mp3" },
  "video": {
    "src": "video/g2_add2d.mp4", "src_low": "video/low/g2_add2d.mp4", "poster": "video/g2_add2d.jpg",
    "captions": { "am": "video/g2_add2d.am.vtt", "en": "video/g2_add2d.en.vtt" },
    "duration": 30.4,
    "checkpoints": [ { "t": 9.6, "at": "step:1", "exercise": { …tap_choose… } }, … ],   // the video pauses at t
    "reteach": { "start": 9.6, "end": 30.4 }       // replayed after two misses in a row
  },
  "guided":   [ { "slot": 1, "levels": [ {…level 1…}, {…level 2…}, {…level 3…} ] }, … ],  // 4–6 slots
  "extra":    [ { …optional speaking exercise… } ],
  "play":     { "game": "balloon", "intro": {…}, "rounds": [ { "target": 30, "balloons": [15, 12, 18, 25, 5, 9] } ] },
  "challenge": [ …5 exercises… ]
}
```

Lesson flow in the app: **hook video with 2 checkpoints → guided practice → mini-game → 5-question
challenge → celebration**. Guided practice starts at level 1 (or the level the child reached last
time), moves up a level after 3 first-try answers in a row and down after 2 misses in a row, when the
re-teach clip also plays.

## An exercise

Every exercise has the same core fields:

```jsonc
{ "id": "g2_add2d.03", "type": "drag_equation",
  "prompt_am": "ባዶውን ቦታ በትክክለኛው ቁጥር እንሙላ።", "prompt_en": "Let's fill the empty box with the right number.",
  "audio_url": "audio/am/ex.g2_add2d.03.mp3",
  "hints": [ { "am": "…", "en": "…", "audio_url": "audio/am/…mp3" }, … ],   // shown one at a time
  "answer": …,           // see each type below
  "level": 1 }           // guided practice only
```

Feedback is the same for every type: a happy sound, praise and sparkles when right; on a wrong move
a gentle sound and the next hint; after two wrong tries the answer is demonstrated, then the child
moves on.

### Drag-and-drop

| type | fields | answer |
|---|---|---|
| `drag_drop_count` | `items: { thing, supply, mode: "add" \| "remove" }`, `targets: [{ id, kind: basket \| tray \| tenframe \| bajaj \| tree, start, need, match? }]` | the `need` (or a list of needs, one per target) |
| `drag_equation` | `equation: ["3", "+", "__", "=", "7"]`, `items: ["4", "3", "10"]` (tiles) | the tile that fills `__` |
| `drag_sort` | `targets: [{ id, am, en }]` (bins), `items: [{ id, label?, visual? }]` (cards) | `{ cardId: binId }` |
| `drag_numberline` | `line: { min, max, step, labels: ends \| tens \| none }`, `items: ["12", "15"]` | the same values |
| `drag_placevalue` | `items: { flats?, rods, cubes }`, `targets: [{ id: "mat", tens?, hundreds? }]` (`tens` / `hundreds` = build it with exactly that many; numbers from 100 get a hundreds column) | the number |
| `drag_match_word` | `items: [{ id, label, lang: am \| geez, audio_url? }]`, `targets: [{ id, label? , visual? }]` | `{ cardId: slotId }` |
| `drag_make_change` | `price`, `item: { am, en, pic }`, `items: [10, 5, 5, 1]` (the wallet) | the price |
| `drag_fraction` | `parts` (4 by default; 3 for thirds, 6 for sixths), `items: [{ piece: half \| quarter \| third \| sixth, count }]`, `targets: [{ id: "injera", start }]` | parts to fill (a half covers parts ÷ 2) |

### Other types

| type | fields | answer |
|---|---|---|
| `tap_choose` | `options: [{ v, label?, am?, en?, visual? }]`, `visual?` | an option's `v` |
| `tap_count` | `items: { thing, n }`, `options` | `n` |
| `numpad` | `visual?`, `max_digits` | a number |
| `listen_choose` | `say: { am, en, audio_url }`, `options` | an option's `v` |
| `true_false` | `statement_am`, `statement_en`, `visual?` | `true` / `false` (swipe right / left) |
| `clock` | — | `{ h, m }` (m is 0 or 30) |
| `trace` | `text`, `script: digits \| ethiopic` | the text |
| `speak` | `say`, `optional: true` | the number (any recording counts; the grown-ups page can play it back) |

### Pictures (`visual`)

`group {thing, n}` · `takeaway {thing, n, gone}` · `compare {thing, left, right}` · `tens_ones {hundreds?, tens, ones}` · `array {rows, cols, thing}` ·
`tenframe {n}` · `birr {notes}` · `injera {parts, filled, equal}` · `groups {groups, thing}` · `text {text}`.
Things: orange, mango, cup, flower, child, counter, bean, egg, book, seedling.
`drag_drop_count` targets can also be `row` (a strip of soil, for planting in rows); `drag_equation` understands `÷`.

### Mini-games (`play`)

| game | config |
|---|---|
| `coffee` | `rounds: [{ n, trays? }]` — pour exactly n cups (the same number on every tray) |
| `market` | `rounds: [{ budget, goods: [{ pic, am, en, price }] }]` — spend exactly the budget |
| `balloon` | `rounds: [{ target, balloons: [...] }]` — pop two that add up to the target |
| `race` | `questions: [tap_choose…]` — each right answer moves toward Grandma's house |
| `memory` | `pairs: [{ n, am, geez? , visual? }]` — match number cards with word cards |

Timers are off unless a grown-up turns on "Game timers" on the grown-ups page.

## Rules the checker enforces (`npm test`)

* 2 video checkpoints (in order, inside the video), a re-teach clip, a video under 60 seconds
* 4–6 guided slots with 3 levels each (a slot keeps its type across levels), 5 challenge questions
* on every level path: at least 6 drag-and-drop exercises and 4 other exercise types; 15–25 interactions
* every answer is right: equations balance, wallets can pay the price, every balloon round has a pair,
  number-line values sit on a tick, pictures match their numbers, and every audio file is in a recording script
