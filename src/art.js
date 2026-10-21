/* Luminary Kids — original artwork drawn in code (SVG strings, no DOM).
   Characters, scenes and badges use a fixed illustration palette.
   Math visuals use CSS classes (mv-*) so they follow the page theme, and every
   counted object carries data-obj / data-filled / data-crossed so tests can
   prove the picture matches the numbers in the question. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const A = (LK.art = {});

  const P = {
    fur: '#b4733a', furDark: '#7a4a22', light: '#f3dfc3', hoof: '#3b2a20', horn: '#8f7c63', ridge: '#6a5a46',
    eye: '#2b1d14', cheek: '#e58f74', gold: '#f2b705', teal: '#1f7a8c', leaf: '#2f8f5b', berry: '#b8456e',
    cloth: '#fbf7ef', sky: '#bfe3f2', sky2: '#e3f3f8', hill: '#7fbf6a', hill2: '#5aa65a', soil: '#d9b27c'
  };
  A.palette = P;

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const svg = (w, h, label, body, cls = '') =>
    `<svg viewBox="0 0 ${w} ${h}" class="${cls}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(label)}</title>${body}</svg>`;
  A.svg = svg;

  // ---------------- Wali, the Walia ibex guide ----------------
  // Poses: welcome, think, explain, encourage, celebrate.
  A.wali = function (pose = 'welcome', label = 'Wali the Walia ibex') {
    const arm = (d, hx, hy) =>
      `<path d="${d}" stroke="${P.fur}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${hx}" cy="${hy}" r="9" fill="${P.hoof}"/>`;
    const arms = {
      down: arm('M66 142 Q58 162 56 182', 56, 184) + arm('M134 142 Q142 162 144 182', 144, 184),
      waveR: arm('M66 142 Q58 162 56 182', 56, 184) + arm('M134 140 Q158 120 166 88', 167, 84),
      chinR: arm('M66 142 Q58 162 56 182', 56, 184) + arm('M134 142 Q132 128 116 120', 112, 120),
      pointR: arm('M66 142 Q58 162 56 182', 56, 184) + arm('M134 140 Q160 132 184 122', 188, 120),
      upR: arm('M66 142 Q58 162 56 182', 56, 184) + arm('M134 140 Q152 124 152 102', 152, 98),
      bothUp: arm('M66 140 Q44 116 40 88', 39, 84) + arm('M134 140 Q156 116 160 88', 161, 84)
    };
    const eyesOpen = (dx = 0, dy = 0) =>
      `<circle cx="82" cy="80" r="7.5" fill="${P.eye}"/><circle cx="118" cy="80" r="7.5" fill="${P.eye}"/>` +
      `<circle cx="${84 + dx}" cy="${77 + dy}" r="2.4" fill="#fff"/><circle cx="${120 + dx}" cy="${77 + dy}" r="2.4" fill="#fff"/>`;
    const eyesHappy = `<path d="M74 82 Q82 72 90 82" stroke="${P.eye}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M110 82 Q118 72 126 82" stroke="${P.eye}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const smile = `<path d="M89 107 Q100 116 111 107" stroke="${P.eye}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const talk = `<path d="M91 105 Q100 119 109 105 Z" fill="${P.eye}"/><path d="M95 111 Q100 115 105 111" stroke="#e07a7a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const hmm = `<path d="M93 109 Q100 106 107 110" stroke="${P.eye}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const big = `<path d="M88 104 Q100 122 112 104 Z" fill="${P.eye}"/><path d="M94 112 Q100 117 106 112" stroke="#e07a7a" stroke-width="3" fill="none" stroke-linecap="round"/>`;

    const cfg = {
      welcome: { arms: arms.waveR, eyes: eyesOpen(), mouth: smile, extra: '' },
      think: { arms: arms.chinR, eyes: eyesOpen(-2, -2) + `<path d="M74 66 Q82 61 90 65" stroke="${P.furDark}" stroke-width="3" fill="none" stroke-linecap="round"/>`, mouth: hmm,
        extra: `<circle cx="150" cy="58" r="5" fill="#fff" stroke="${P.ridge}" stroke-width="2"/><circle cx="162" cy="42" r="8" fill="#fff" stroke="${P.ridge}" stroke-width="2"/><circle cx="178" cy="22" r="13" fill="#fff" stroke="${P.ridge}" stroke-width="2"/><circle cx="172" cy="22" r="2.5" fill="${P.ridge}"/><circle cx="179" cy="22" r="2.5" fill="${P.ridge}"/><circle cx="186" cy="22" r="2.5" fill="${P.ridge}"/>`, armsFront: true },
      explain: { arms: arms.pointR, eyes: eyesOpen(2, 0), mouth: talk, extra: `<path d="M188 104 l4 -8 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 z" fill="${P.gold}"/>` },
      encourage: { arms: arms.upR, eyes: eyesOpen(), mouth: smile,
        extra: `<path d="M168 70 c-6 -8 -18 -2 -12 8 l12 12 l12 -12 c6 -10 -6 -16 -12 -8 z" fill="${P.berry}"/>` },
      celebrate: { arms: arms.bothUp, eyes: eyesHappy, mouth: big,
        extra: flowerAt(22, 40, 9) + flowerAt(178, 46, 8) + flowerAt(30, 120, 6) + flowerAt(172, 128, 7) +
          `<rect x="58" y="14" width="8" height="4" rx="2" fill="${P.teal}" transform="rotate(25 62 16)"/><rect x="138" y="10" width="8" height="4" rx="2" fill="${P.berry}" transform="rotate(-20 142 12)"/><rect x="100" y="4" width="8" height="4" rx="2" fill="${P.leaf}"/>` }
    }[pose] || {};

    const head =
      // horns (behind head)
      `<path d="M86 54 C76 30 58 20 48 34" stroke="${P.horn}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `<path d="M114 54 C124 30 142 20 152 34" stroke="${P.horn}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `<path d="M74 36 l6 4 M64 30 l5 5 M126 36 l-6 4 M136 30 l-5 5" stroke="${P.ridge}" stroke-width="2.5" stroke-linecap="round"/>` +
      // ears
      `<ellipse cx="54" cy="76" rx="18" ry="9" fill="${P.fur}" transform="rotate(-18 54 76)"/><ellipse cx="56" cy="76" rx="10" ry="4.5" fill="${P.light}" transform="rotate(-18 56 76)"/>` +
      `<ellipse cx="146" cy="76" rx="18" ry="9" fill="${P.fur}" transform="rotate(18 146 76)"/><ellipse cx="144" cy="76" rx="10" ry="4.5" fill="${P.light}" transform="rotate(18 144 76)"/>` +
      // head, forehead mark, muzzle, beard
      `<ellipse cx="100" cy="82" rx="44" ry="41" fill="${P.fur}"/>` +
      `<ellipse cx="100" cy="58" rx="8" ry="15" fill="${P.furDark}" opacity="0.45"/>` +
      `<ellipse cx="100" cy="102" rx="27" ry="20" fill="${P.light}"/>` +
      `<path d="M95 120 Q100 134 105 120 Z" fill="${P.furDark}"/>` +
      `<circle cx="70" cy="97" r="6.5" fill="${P.cheek}" opacity="0.55"/><circle cx="130" cy="97" r="6.5" fill="${P.cheek}" opacity="0.55"/>` +
      `<path d="M94 95 Q100 90 106 95 Q100 102 94 95 Z" fill="${P.eye}"/>` +
      (cfg.eyes || '') + (cfg.mouth || '');

    // tibeb-patterned scarf: a woven border of small diamonds
    let diamonds = '';
    for (let i = 0; i < 6; i++) {
      const x = 74 + i * 10.4, c = i % 2 ? P.leaf : P.gold;
      diamonds += `<path d="M${x} 129 l4 -4 l4 4 l-4 4 z" fill="${c}"/>`;
    }
    const scarf = `<rect x="66" y="119" width="68" height="20" rx="10" fill="${P.cloth}" stroke="${P.teal}" stroke-width="2"/>${diamonds}` +
      `<path d="M116 136 l10 22 l-12 2 z" fill="${P.cloth}" stroke="${P.teal}" stroke-width="2"/><path d="M118 148 h6" stroke="${P.gold}" stroke-width="3"/>`;

    const body =
      `<rect x="77" y="184" width="18" height="30" rx="8" fill="${P.fur}"/><rect x="105" y="184" width="18" height="30" rx="8" fill="${P.fur}"/>` +
      `<rect x="77" y="206" width="18" height="10" rx="4" fill="${P.hoof}"/><rect x="105" y="206" width="18" height="10" rx="4" fill="${P.hoof}"/>` +
      `<ellipse cx="144" cy="150" rx="8" ry="6" fill="${P.furDark}"/>` +
      `<ellipse cx="100" cy="160" rx="45" ry="40" fill="${P.fur}"/><ellipse cx="100" cy="168" rx="27" ry="27" fill="${P.light}"/>`;

    const back = cfg.armsFront ? '' : cfg.arms;
    const front = cfg.armsFront ? cfg.arms : '';
    return svg(210, 224, label, `<g>${back}${body}${scarf}${head}${front}${cfg.extra || ''}</g>`, 'wali');
  };

  // ---------------- children (inclusive avatars) ----------------
  const KIDS = {
    selam: { skin: '#8d5a3b', shirt: P.gold, hair: 'braids', name: 'Selam' },
    dawit: { skin: '#5e3a24', shirt: P.teal, hair: 'short', name: 'Dawit' },
    amira: { skin: '#a8714d', shirt: P.leaf, hair: 'hijab', name: 'Amira' },
    yonas: { skin: '#74472b', shirt: P.berry, hair: 'curls', name: 'Yonas' }
  };
  A.kidIds = Object.keys(KIDS);
  A.kid = function (id, label) {
    const k = KIDS[id] || KIDS.selam;
    const face = `<circle cx="50" cy="50" r="24" fill="${k.skin}"/><circle cx="41" cy="50" r="3" fill="${P.eye}"/><circle cx="59" cy="50" r="3" fill="${P.eye}"/><path d="M42 60 Q50 66 58 60" stroke="${P.eye}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="35" cy="57" r="3.5" fill="${P.cheek}" opacity="0.5"/><circle cx="65" cy="57" r="3.5" fill="${P.cheek}" opacity="0.5"/>`;
    const shirt = `<path d="M18 100 Q22 78 50 76 Q78 78 82 100 Z" fill="${k.shirt}"/>`;
    let hair = '', over = '';
    if (k.hair === 'braids') {
      hair = `<path d="M26 48 Q26 22 50 22 Q74 22 74 48 Q70 34 50 32 Q30 34 26 48 Z" fill="#1d130d"/><path d="M38 24 v12 M50 22 v12 M62 24 v12" stroke="#3a2a20" stroke-width="2"/><path d="M27 48 q-4 14 -2 26" stroke="#1d130d" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M73 48 q4 14 2 26" stroke="#1d130d" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="25" cy="76" r="3.5" fill="${P.gold}"/><circle cx="75" cy="76" r="3.5" fill="${P.gold}"/>`;
    } else if (k.hair === 'short') {
      hair = `<path d="M27 46 Q26 24 50 24 Q74 24 73 46 Q66 34 50 34 Q34 34 27 46 Z" fill="#1d130d"/>`;
    } else if (k.hair === 'hijab') {
      hair = `<path d="M22 60 Q20 20 50 20 Q80 20 78 60 Q80 84 64 90 L36 90 Q20 84 22 60 Z" fill="${P.leaf}"/><path d="M30 56 Q30 34 50 34 Q70 34 70 56" fill="none" stroke="#256f47" stroke-width="2"/>`;
    } else {
      hair = `<circle cx="34" cy="32" r="10" fill="#1d130d"/><circle cx="50" cy="26" r="11" fill="#1d130d"/><circle cx="66" cy="32" r="10" fill="#1d130d"/>`;
      over = `<circle cx="41" cy="50" r="7" fill="none" stroke="#2c3e50" stroke-width="2.2"/><circle cx="59" cy="50" r="7" fill="none" stroke="#2c3e50" stroke-width="2.2"/><path d="M48 50 h4" stroke="#2c3e50" stroke-width="2.2"/><path d="M75 50 q5 2 3 8 q-2 4 -5 2" fill="#d8d0c4" stroke="#8a7f70" stroke-width="1.2"/>`;
    }
    const bg = `<circle cx="50" cy="50" r="48" fill="${P.sky2}"/>`;
    const body = k.hair === 'hijab' ? bg + shirt + hair + face : bg + shirt + hair + face + over;
    return svg(100, 100, label || k.name, `<clipPath id="kc-${id}"><circle cx="50" cy="50" r="48"/></clipPath><g clip-path="url(#kc-${id})">${body}</g>`, 'kid');
  };

  // ---------------- countable objects (unit ≈ 44×44, centred on 0,0) ----------------
  function flowerAt(x, y, r) {
    let p = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      p += `<ellipse cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" rx="${(r * 0.62).toFixed(1)}" ry="${(r * 0.38).toFixed(1)}" fill="${P.gold}" transform="rotate(${i * 45} ${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)})"/>`;
    }
    return p + `<circle cx="${x}" cy="${y}" r="${(r * 0.55).toFixed(1)}" fill="#6b4a1a"/>`;
  }
  A.flowerAt = flowerAt;

  const OBJ = {
    flower: () => `<path d="M0 6 q-2 10 0 16" stroke="${P.leaf}" stroke-width="3" fill="none"/><ellipse cx="6" cy="16" rx="6" ry="3" fill="${P.leaf}" transform="rotate(-30 6 16)"/>` + flowerAt(0, -4, 11),
    orange: () => `<circle cx="0" cy="2" r="16" fill="#f28c28"/><circle cx="-5" cy="-3" r="4" fill="#ffd08a" opacity="0.7"/><ellipse cx="5" cy="-15" rx="7" ry="3.5" fill="${P.leaf}" transform="rotate(-25 5 -15)"/>`,
    mango: () => `<ellipse cx="0" cy="2" rx="13" ry="17" fill="#f2b33d" transform="rotate(20)"/><ellipse cx="4" cy="6" rx="9" ry="12" fill="#e9762f" opacity="0.55" transform="rotate(20)"/><path d="M-3 -15 q2 -5 6 -6" stroke="#6b4a1a" stroke-width="2.5" fill="none"/><ellipse cx="8" cy="-19" rx="7" ry="3" fill="${P.leaf}" transform="rotate(-15 8 -19)"/>`,
    cup: () => `<ellipse cx="0" cy="14" rx="18" ry="4" fill="#e7dccb"/><path d="M-13 -8 L13 -8 L9 12 L-9 12 Z" fill="#fffdf8" stroke="#bfae8e" stroke-width="1.5"/><ellipse cx="0" cy="-8" rx="13" ry="3.5" fill="#5a3418"/><path d="M-11 0 h22" stroke="${P.teal}" stroke-width="2.5"/>`,
    chicken: () => `<ellipse cx="0" cy="6" rx="15" ry="12" fill="#f5ead6" stroke="#b08a5a" stroke-width="1.5"/><circle cx="10" cy="-8" r="8" fill="#f5ead6" stroke="#b08a5a" stroke-width="1.5"/><path d="M6 -16 q2 -6 5 0 q2 -6 5 1" fill="#d6453d"/><path d="M17 -8 l6 2 l-6 2 z" fill="${P.gold}"/><circle cx="11" cy="-9" r="1.6" fill="${P.eye}"/><path d="M-4 18 v6 M4 18 v6" stroke="${P.gold}" stroke-width="2"/>`,
    child: (i = 0) => {
      const shirts = [P.gold, P.teal, P.leaf, P.berry], skins = ['#8d5a3b', '#5e3a24', '#a8714d', '#74472b'];
      return `<rect x="-11" y="2" width="22" height="20" rx="8" fill="${shirts[i % 4]}"/><circle cx="0" cy="-8" r="10" fill="${skins[(i + 1) % 4]}"/><path d="M-10 -11 Q0 -22 10 -11 Q0 -15 -10 -11 Z" fill="#1d130d"/><circle cx="-3.5" cy="-8" r="1.4" fill="${P.eye}"/><circle cx="3.5" cy="-8" r="1.4" fill="${P.eye}"/>`;
    },
    counter: () => `<circle cx="0" cy="0" r="15" class="mv-counter"/>`
  };
  A.object = (thing, x, y, i = 0, extra = '') => `<g data-obj="${thing}" data-i="${i}" class="obj" transform="translate(${x} ${y})"${extra}>${OBJ[thing](i)}</g>`;

  // ---------------- math visuals ----------------
  const cross = `<g data-crossed="1"><path d="M-16 -16 L16 16 M16 -16 L-16 16" class="mv-cross"/></g>`;

  // A group of n objects: rows of five (five-structure) or a non-overlapping scatter.
  A.group = function ({ thing, n, layout = 'rows', positions }, label) {
    let body = '', w, h;
    if (layout === 'scatter' && positions) {
      w = 5 * 64 + 16; h = 4 * 60 + 16;
      positions.forEach((p, i) => { body += A.object(thing, 40 + p.col * 64 + p.jx, 38 + p.row * 60 + p.jy, i); });
    } else {
      const rows = Math.ceil(n / 5);
      w = 5 * 58 + 18; h = rows * 58 + 16;
      for (let i = 0; i < n; i++) body += A.object(thing, 38 + (i % 5) * 58, 36 + Math.floor(i / 5) * 58, i);
    }
    return svg(w, h, label, body, 'mv');
  };

  // One ten frame (5 × 2). Cells carry data-filled; filled cells show a counter or object.
  function frame(x, y, filled, opts = {}) {
    const c = 50; let out = `<g class="tenframe" transform="translate(${x} ${y})">`;
    out += `<rect x="0" y="0" width="${5 * c}" height="${2 * c}" rx="6" class="mv-frame"/>`;
    for (let i = 0; i < 10; i++) {
      const cx = (i % 5) * c, cy = Math.floor(i / 5) * c, on = i < filled;
      out += `<g data-cell="${i}" data-filled="${on ? 1 : 0}"${opts.tap ? ' class="cell tap" tabindex="0" role="button"' : ' class="cell"'}><rect x="${cx}" y="${cy}" width="${c}" height="${c}" class="mv-cell"/>`;
      if (on) {
        const thing = opts.thingFor ? opts.thingFor(i) : opts.thing;
        if (thing && thing !== 'counter') out += A.object(thing, cx + c / 2, cy + c / 2 + 2, i);
        else out += `<g data-obj="counter" class="obj ${opts.cls ? opts.cls(i) : ''}" transform="translate(${cx + c / 2} ${cy + c / 2})"><circle r="16" class="mv-counter ${opts.cls ? opts.cls(i) : ''}"/></g>`;
      }
      out += `</g>`;
    }
    return out + `</g>`;
  }
  A.tenframe = ({ filled }, label) => svg(270, 120, label, frame(10, 10, filled), 'mv');
  A.tenframes = ({ filled, thing }, label) =>
    svg(270, 236, label, frame(10, 10, Math.min(10, filled), { thing }) + frame(10, 126, Math.max(0, filled - 10), { thing }), 'mv');
  A.buildframe = (_, label) => svg(270, 120, label, frame(10, 10, 0, { tap: true }), 'mv build');
  // Make ten: a counters in frame 1, b in frame 2 (second colour). Hint state shows the move.
  A.maketen = ({ a, b }, label, showMove = false) => {
    let s = frame(10, 10, a, { cls: () => 'ca' }) + frame(10, 126, b, { cls: () => 'cb' });
    if (showMove) {
      const need = 10 - a;
      s += `<path d="M260 160 C 300 140, 300 80, 262 64" class="mv-hop" marker-end="url(#mk)"/><text x="292" y="118" class="mv-num small">${need}</text>`;
      s = `<defs><marker id="mk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="mv-arrowhead"/></marker></defs>` + s;
    }
    return svg(showMove ? 320 : 270, 236, label, s, 'mv');
  };

  // Two trays to compare. Each side is a tappable group.
  A.compare = ({ thing, left, right }, label, labels = ['', '']) => {
    const tray = (x, n, side, lab) => {
      let o = `<g data-side="${side}" class="side tap" tabindex="0" role="button" aria-label="${esc(lab)}"><rect x="${x}" y="8" width="150" height="${Math.ceil(10 / 2) * 46 + 20}" rx="14" class="mv-tray"/>`;
      for (let i = 0; i < n; i++) o += A.object(thing, x + 40 + (i % 2) * 70, 36 + Math.floor(i / 2) * 46, i);
      return o + `</g>`;
    };
    return svg(330, 268, label, tray(8, left, 'left', labels[0]) + tray(172, right, 'right', labels[1]), 'mv');
  };

  // Joining two groups (addition story): a children already in the bajaj, b getting in.
  A.join = ({ thing, a, b }, label) => {
    const col = (n, x0, part, off) => {
      let o = `<g data-part="${part}">`;
      for (let i = 0; i < n; i++) o += A.object(thing, x0 + (i % 2) * 44, 40 + Math.floor(i / 2) * 50, i + off);
      return o + '</g>';
    };
    const rowsA = Math.ceil(a / 2), rowsB = Math.ceil(b / 2), h = Math.max(rowsA, rowsB) * 50 + 30;
    return svg(300, h, label,
      `<rect x="6" y="6" width="120" height="${h - 12}" rx="16" class="mv-tray"/>` + col(a, 44, 'a', 0) +
      `<text x="150" y="${h / 2 + 10}" class="mv-num" text-anchor="middle">+</text>` +
      `<rect x="174" y="6" width="120" height="${h - 12}" rx="16" class="mv-tray dashed"/>` + col(b, 212, 'b', a), 'mv');
  };

  // Take away (subtraction story): a mangoes, the last b crossed out.
  A.takeaway = ({ thing, a, b }, label) => {
    let o = '';
    const rows = Math.ceil(a / 5), h = rows * 58 + 16;
    for (let i = 0; i < a; i++) {
      const gone = i >= a - b;
      o += A.object(thing, 38 + (i % 5) * 58, 36 + Math.floor(i / 5) * 58, i, gone ? ' opacity="0.45"' : '');
      if (gone) o += `<g transform="translate(${38 + (i % 5) * 58} ${36 + Math.floor(i / 5) * 58})">${cross}</g>`;
    }
    return svg(5 * 58 + 18, h, label, o, 'mv');
  };

  // Number line with tappable ticks. hops shown only in the hint state.
  A.numberline = ({ min, max, start, hops, dir = 1, marks }, label, showHops = false) => {
    const span = max - min, step = span > 10 ? 34 : 56, x0 = 26, w = x0 * 2 + span * step, y = 84;
    const X = (n) => x0 + (n - min) * step;
    let o = `<defs><marker id="nl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="mv-arrowhead"/></marker></defs>`;
    o += `<line x1="${x0 - 14}" y1="${y}" x2="${w - x0 + 14}" y2="${y}" class="mv-line"/>`;
    for (let n = min; n <= max; n++) {
      const big = span <= 10 || n % 5 === 0;
      o += `<g data-n="${n}" class="tick tap" tabindex="0" role="button" aria-label="${n}"><rect x="${X(n) - step / 2}" y="${y - 30}" width="${step}" height="70" class="hit"/><line x1="${X(n)}" y1="${y - (big ? 12 : 8)}" x2="${X(n)}" y2="${y + (big ? 12 : 8)}" class="mv-line"/>` +
        (span <= 10 || n % 5 === 0 ? `<text x="${X(n)}" y="${y + 44}" text-anchor="middle" class="mv-num">${n}</text>` : '') + `</g>`;
    }
    if (marks) marks.forEach((m) => { o += `<circle cx="${X(m)}" cy="${y}" r="9" class="mv-mark" data-mark="${m}"/><text x="${X(m)}" y="${y - 22}" text-anchor="middle" class="mv-marknum">${m}</text>`; });
    if (start !== undefined) {
      o += `<circle cx="${X(start)}" cy="${y}" r="9" class="mv-start" data-start="${start}"/>`;
      if (showHops) {
        for (let k = 0; k < hops; k++) {
          const a = X(start + dir * k), b = X(start + dir * (k + 1));
          o += `<path data-hop="${k}" d="M${a} ${y - 10} Q ${(a + b) / 2} ${y - 46} ${b} ${y - 10}" class="mv-hop" marker-end="url(#nl)"/>`;
        }
      }
    }
    return svg(w, 138, label, o, 'mv line');
  };

  A.visual = function (v, label, hintState = false) {
    switch (v.kind) {
      case 'group': return A.group(v, label);
      case 'tenframe': return A.tenframe(v, label);
      case 'tenframes': return A.tenframes(v, label);
      case 'compare': return A.compare(v, label, v.labels);
      case 'join': return A.join(v, label);
      case 'takeaway': return A.takeaway(v, label);
      case 'numberline': return A.numberline(v, label, hintState);
      case 'maketen': return A.maketen(v, label, hintState);
      case 'buildframe': return A.buildframe(v, label);
      default: return '';
    }
  };

  // ---------------- scenes (lesson covers / story backdrops) ----------------
  const sky = (top = P.sky) => `<rect width="360" height="200" fill="${top}"/><circle cx="300" cy="44" r="22" fill="#ffd45c"/>`;
  const hills = `<path d="M0 140 Q60 96 130 128 T260 118 T360 126 V200 H0 Z" fill="${P.hill}"/><path d="M0 162 Q90 132 180 156 T360 150 V200 H0 Z" fill="${P.hill2}"/>`;
  const SCENES = {
    garden: () => sky() + hills +
      `<path d="M20 150 h320" stroke="#a5784a" stroke-width="4"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${30 + i * 36} 150 v-14" stroke="#a5784a" stroke-width="4"/>`).join('') +
      Array.from({ length: 8 }, (_, i) => `<g transform="translate(${36 + i * 40} ${176 - (i % 2) * 8})">${OBJ.flower()}</g>`).join(''),
    market: () => sky() + `<rect y="140" width="360" height="60" fill="${P.soil}"/>` +
      [20, 130, 240].map((x, k) => `<rect x="${x}" y="82" width="100" height="60" fill="#fff6e6"/><path d="M${x - 6} 82 h112 l-10 -24 h-92 z" fill="${[P.teal, P.gold, P.berry][k]}"/>` +
        Array.from({ length: 5 }, (_, i) => `<path d="M${x + 4 + i * 20} 82 l10 -24" stroke="#fff" stroke-width="5" opacity="0.5"/>`).join('') +
        `<rect x="${x + 6}" y="118" width="88" height="24" rx="4" fill="#a5784a"/>` +
        `<g transform="translate(${x + 30} 112) scale(0.55)">${OBJ.orange()}</g><g transform="translate(${x + 50} 112) scale(0.55)">${OBJ.orange()}</g><g transform="translate(${x + 40} 98) scale(0.55)">${OBJ.orange()}</g><g transform="translate(${x + 70} 112) scale(0.55)">${OBJ.mango()}</g>`).join(''),
    school: () => sky() + hills + `<rect x="70" y="76" width="200" height="86" rx="4" fill="#f4ead8"/><path d="M60 80 L170 40 L280 80 Z" fill="${P.berry}"/>` +
      [92, 132, 208, 248].map((x) => `<rect x="${x - 12}" y="96" width="24" height="22" rx="3" fill="${P.sky}" stroke="#a5784a" stroke-width="2"/>`).join('') +
      `<rect x="156" y="120" width="28" height="42" rx="4" fill="#a5784a"/><circle cx="320" cy="140" r="26" fill="${P.leaf}"/><rect x="316" y="150" width="8" height="30" fill="#7a4a22"/><path d="M150 200 L162 162 h16 L190 200 Z" fill="${P.soil}"/>`,
    road: () => sky() + hills + `<rect y="160" width="360" height="40" fill="#8a8f98"/><path d="M0 180 h360" stroke="#f4ead8" stroke-width="3" stroke-dasharray="18 14"/>` +
      `<g transform="translate(140 118)"><path d="M0 46 V14 Q0 0 20 0 H62 Q80 0 84 20 L92 46 Z" fill="${P.teal}"/><rect x="8" y="8" width="30" height="20" rx="4" fill="${P.sky2}"/><rect x="44" y="8" width="30" height="20" rx="4" fill="${P.sky2}"/><path d="M84 20 L98 26 L98 46 L92 46" fill="${P.teal}"/><rect x="-4" y="40" width="100" height="8" rx="3" fill="#2b2f36"/><circle cx="16" cy="50" r="10" fill="#2b2f36"/><circle cx="16" cy="50" r="4" fill="#ccc"/><circle cx="80" cy="50" r="10" fill="#2b2f36"/><circle cx="80" cy="50" r="4" fill="#ccc"/><rect x="0" y="-6" width="80" height="8" rx="4" fill="${P.gold}"/></g>`,
    tree: () => sky() + hills + `<rect x="168" y="96" width="24" height="84" rx="6" fill="#7a4a22"/><circle cx="180" cy="78" r="58" fill="#3f9a5a"/><circle cx="136" cy="96" r="34" fill="#4aa866"/><circle cx="226" cy="96" r="34" fill="#4aa866"/>` +
      [[150, 70], [196, 56], [212, 92], [160, 106], [184, 92]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(0.6)">${OBJ.mango()}</g>`).join('') +
      `<g transform="translate(120 176) scale(0.6)">${OBJ.mango()}</g><g transform="translate(236 182) scale(0.6) rotate(60)">${OBJ.mango()}</g>`,
    meadow: () => sky(P.sky2) + `<path d="M0 120 L60 70 L110 110 L170 56 L240 112 L300 74 L360 116 V200 H0 Z" fill="#9db7c9"/>` + hills +
      Array.from({ length: 22 }, (_, i) => `<g transform="translate(${10 + ((i * 53) % 350)} ${150 + ((i * 17) % 44)}) scale(${0.45 + (i % 3) * 0.1})">${flowerAt(0, 0, 11)}</g>`).join('')
  };
  A.scene = (id, label) => svg(360, 200, label, SCENES[id] ? SCENES[id]() : '', 'scene');
  A.sceneIds = Object.keys(SCENES);

  // ---------------- badges ----------------
  const BADGE_COLORS = [P.gold, P.teal, P.berry, P.leaf, '#e9762f', '#6a5acd'];
  A.badge = (n, earned, label) => {
    const c = earned ? BADGE_COLORS[(n - 1) % 6] : '#c9c4ba';
    let petals = '';
    for (let i = 0; i < 12; i++) petals += `<ellipse cx="50" cy="14" rx="8" ry="14" fill="${c}" opacity="${earned ? 1 : 0.6}" transform="rotate(${i * 30} 50 50)"/>`;
    return svg(100, 100, label, petals + `<circle cx="50" cy="50" r="28" fill="${earned ? '#fffaf0' : '#eeebe5'}" stroke="${c}" stroke-width="4"/>` +
      `<text x="50" y="62" text-anchor="middle" font-size="32" font-weight="700" fill="${earned ? '#3b2a20' : '#9a958c'}" font-family="Andika, sans-serif">${n}</text>`, 'badge');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
