"""Play every hands-on lesson end to end in a phone-sized browser, the way a child would:
real drags (pointer events), swipes and taps; the hook video plays (sped up) and pauses at its
checkpoints. Also checks: one wrong drop bounces back with a hint, two wrong tries show the answer,
the page never scrolls sideways, and the map, stars, streak and badges update.

    node build.js && PORT=4321 node server.js &
    python3 test/lessons_e2e.py http://localhost:4321 [lesson ids…] [--shots DIR]
"""
import json
import sys
import time

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://localhost:4321'
ARGS = [a for a in sys.argv[1:] if not a.startswith('http')]
SHOTS = ARGS[ARGS.index('--shots') + 1] if '--shots' in ARGS else None
ONLY = [a for a in ARGS if a != '--shots' and a != SHOTS]
errors = []
WRONG = {'done': False}  # test the wrong-answer path once, on the first drag-equation seen


def center(pg, sel_or_el):
    el = pg.query_selector(sel_or_el) if isinstance(sel_or_el, str) else sel_or_el
    assert el, f'not found: {sel_or_el}'
    el.scroll_into_view_if_needed()
    b = el.bounding_box()
    return b['x'] + b['width'] / 2, b['y'] + b['height'] / 2


def drag(pg, src, dst, wait=0.45):
    """A real drag: press, move in steps, release (pointer events, like a finger)."""
    sx, sy = center(pg, src)
    pg.mouse.move(sx, sy)
    pg.mouse.down()
    dx, dy = center(pg, dst)
    sx2, sy2 = center(pg, src) if isinstance(src, str) and pg.query_selector(src) else (sx, sy)
    for k in range(1, 9):
        pg.mouse.move(sx + (dx - sx) * k / 8, sy + (dy - sy) * k / 8)
    pg.mouse.up()
    time.sleep(wait)


def ex_json(pg):
    return pg.evaluate('''() => { const s = LK.adv.state, st = s.steps[s.i];
      const cp = document.querySelector('.cp-layer:not([hidden]) .ex');
      if (cp) { const v = s.L.video.checkpoints.find((c) => c.exercise.id === cp.dataset.id); }
      if (st.k !== 'ex') return null;
      if (st.src === 'guided') return s.L.guided[st.i].levels[s.level - 1];
      if (st.src === 'extra') return s.L.extra[st.i];
      return s.L.challenge[st.i]; }''')


def solve(pg, e, scope='#adv-stage'):
    """Answer one exercise with real interactions."""
    t = e['type']
    q = lambda s: f'{scope} {s}'
    if t == 'drag_drop_count':
        if e['items']['mode'] == 'remove':
            tree = e['targets'][0]
            for _ in range(tree['start'] - tree['need']):
                drag(pg, q('.dd-target.tree .dd-in .piece'), q('.dd-target.basket'))
        else:
            for tg in e['targets']:
                for _ in range(tg['need'] - tg['start']):
                    drag(pg, q('.dd-supply .piece'), q(f'.dd-target[data-id="{tg["id"]}"]'))
    elif t == 'drag_equation':
        drag(pg, q(f'.tiles .tile[data-v="{e["answer"]}"]'), q('.blank'))
    elif t == 'drag_sort':
        for it in e['items']:
            drag(pg, q(f'.cards .card[data-id="{it["id"]}"]'), q(f'.bin[data-id="{e["answer"][it["id"]]}"]'))
    elif t == 'drag_numberline':
        for v in e['items']:
            drag(pg, q(f'.tiles .tile[data-v="{v}"]'), q(f'.slot[data-v="{v}"]'))
    elif t == 'drag_placevalue':
        fixed = e['targets'][0].get('tens')
        tens = fixed if fixed is not None else e['answer'] // 10
        for _ in range(tens):
            drag(pg, q('.src-rod'), q('.pv-col.tens'), 0.3)
        for _ in range(e['answer'] - 10 * tens):
            drag(pg, q('.src-cube'), q('.pv-col.ones'), 0.25)
    elif t == 'drag_match_word':
        for it in e['items']:
            drag(pg, q(f'.cards .card[data-id="{it["id"]}"]'), q(f'.mslot[data-id="{e["answer"][it["id"]]}"]'))
    elif t == 'drag_make_change':
        need = e['price']
        for v in sorted(e['items'], reverse=True):
            if v <= need:
                drag(pg, q(f'.wallet .cash[data-v="{v}"]'), q('.counter'))
                need -= v
            if not need:
                break
    elif t == 'drag_fraction':
        need = e['answer'] - (e['targets'][0].get('start') or 0)
        while need:
            kind = 'half' if need >= 2 and pg.query_selector(q('.fpiece.half')) else 'quarter'
            drag(pg, q(f'.fpiece.{kind}'), q('.inj'))
            need -= 2 if kind == 'half' else 1
    elif t in ('tap_choose', 'listen_choose'):
        pg.click(q(f'.opt[data-v="{e["answer"]}"]'))
    elif t == 'tap_count':
        for b in pg.query_selector_all(q('.tapobj')):
            b.click()
            time.sleep(0.08)
        pg.click(q(f'.opt[data-v="{e["answer"]}"]'))
    elif t == 'numpad':
        for ch in str(e['answer']):
            pg.click(q(f'.np-k[data-k="{ch}"]'))
        pg.click(q('.np-k[data-k="✓"]'))
    elif t == 'true_false':  # a real swipe
        x, y = center(pg, q('.tf-card'))
        pg.mouse.move(x, y); pg.mouse.down()
        for k in range(1, 9):
            pg.mouse.move(x + (150 if e['answer'] else -150) * k / 8, y)
        pg.mouse.up()
    elif t == 'speak':
        pg.click(q('.skipbtn'))
    else:  # clock and trace: use the component's own correct path
        pg.evaluate(f'document.querySelector("{scope} .ex")._solve()')


def step_kind(pg):
    return pg.evaluate('LK.adv.state ? LK.adv.state.steps[LK.adv.state.i].k : null')


def no_sideways(pg, where):
    w = pg.evaluate('document.documentElement.scrollWidth')
    if w > 392:
        errors.append(f'{where}: page is {w}px wide (phone is 390)')


def wait_step_change(pg, before, timeout=8):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if pg.evaluate('LK.adv.state ? LK.adv.state.i : -1') != before:
            return True
        time.sleep(0.1)
    return False


def play_lesson(pg, lid, test_wrong=False):
    pg.evaluate(f'LK.adv.start("{lid}")')
    pg.wait_for_selector('.adv-intro')
    pg.click('[data-adv="next"]')
    # --- hook video with checkpoints ---
    pg.wait_for_selector('.adv-video video')
    pg.wait_for_function('document.querySelector(".adv-video video").readyState >= 2', timeout=15000)
    pg.evaluate('document.querySelector(".adv-video video").playbackRate = 3')
    pg.click('.vplay') if pg.is_visible('.vplay') else None
    cps = pg.evaluate('LK.adv.state.L.video.checkpoints.map((c) => c.exercise)')
    for k, cp in enumerate(cps):
        pg.wait_for_selector('.cp-layer:not([hidden]) .ex', timeout=40000)
        assert pg.evaluate('document.querySelector(".adv-video video").paused'), 'video should pause at a checkpoint'
        t_now = pg.evaluate('document.querySelector(".adv-video video").currentTime')
        t_cp = pg.evaluate(f'LK.adv.state.L.video.checkpoints[{k}].t')
        assert abs(t_now - t_cp) < 1.6, f'{lid} checkpoint {k}: paused at {t_now:.1f}s, expected {t_cp:.1f}s'
        if SHOTS and k == 0:
            pg.screenshot(path=f'{SHOTS}/{lid}-checkpoint.png')
        solve(pg, cp, '.cp-layer')
        pg.wait_for_selector('.cp-layer[hidden]', state='attached', timeout=6000)
        pg.evaluate('const v = document.querySelector(".adv-video video"); if (v && !v.ended) v.playbackRate = 3')
    pg.wait_for_selector('.vnext:not([hidden])', timeout=40000)
    pg.click('.vnext')
    # --- guided, extra, game, challenge ---
    while True:
        k = step_kind(pg)
        i = pg.evaluate('LK.adv.state.i')
        if k == 'celebrate':
            break
        if k == 'game':
            pg.wait_for_selector('#adv-stage .game')
            if SHOTS:
                pg.screenshot(path=f'{SHOTS}/{lid}-game.png')
            for _ in range(12):
                if pg.evaluate('LK.adv.state.i') != i:
                    break
                pg.evaluate('LK.adv._solveCurrent()')
                time.sleep(1.8)
            assert wait_step_change(pg, i, 10), f'{lid}: game did not finish'
            continue
        e = ex_json(pg)
        pg.wait_for_selector('#adv-stage .ex')
        no_sideways(pg, f'{lid} {e["id"]}')
        if SHOTS:
            pg.screenshot(path=f'{SHOTS}/{lid}-{e["id"].split(".")[-1]}-{e["type"]}.png')
        if not WRONG['done'] and e['type'] == 'drag_equation':
            wrong = next(v for v in e['items'] if v != e['answer'])
            drag(pg, f'#adv-stage .tiles .tile[data-v="{wrong}"]', '#adv-stage .blank')
            assert pg.query_selector(f'#adv-stage .tiles .tile[data-v="{wrong}"]'), 'wrong tile should bounce back'
            assert 'hint' in pg.get_attribute('#adv-stage .ex-msg', 'class'), 'a hint should show after a wrong drop'
            drag(pg, f'#adv-stage .tiles .tile[data-v="{wrong}"]', '#adv-stage .blank')
            pg.wait_for_selector('#adv-stage .nextbtn', timeout=6000)  # demonstrated after 2 tries
            assert pg.query_selector('#adv-stage .blank .tile'), 'the demo should place the right tile'
            pg.click('#adv-stage .nextbtn')
            WRONG['done'] = True
        else:
            solve(pg, e)
        if not wait_step_change(pg, i, 10):
            raise AssertionError(f'{lid} {e["id"]} ({e["type"]}) did not finish')
        # a re-teach clip may open after two misses
        if pg.query_selector('.sheet'):
            pg.click('.sheet button')
    stars = pg.evaluate('LK.adv.state.final.stars')
    if SHOTS:
        time.sleep(1.2)
        pg.screenshot(path=f'{SHOTS}/{lid}-celebrate.png')
    return stars


with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console: {m.text}') if m.type == 'error' and 'fonts.g' not in m.text and 'ERR_TUNNEL' not in m.text and '.mp3' not in m.text else None)
    pg.goto(URL, wait_until='domcontentloaded')
    # a child profile, like a parent would add it
    pg.evaluate('''() => { const D = LK.app.DB; D.profiles.push({ id: 'k1', name: 'Selam', avatar: 'selam', learner: LK.newLearner() }); D.activeId = 'k1'; LK.app.S.view = 'home'; LK.app.render(); }''')
    index = pg.evaluate('LK.adv.index().lessons.map((l) => l.id)')
    ids = ONLY or index
    results = {}
    for n, lid in enumerate(ids):
        t0 = time.time()
        results[lid] = play_lesson(pg, lid, test_wrong=(n == 0))
        pg.click('[data-adv="home"]')
        print(f'✓ {lid}: {results[lid]}★  ({time.time() - t0:.0f}s)')
    # map, stars, streak, badges
    info = pg.evaluate('''() => { const a = LK.app.learner().adv; return { done: Object.keys(a.lessons).length, streak: a.streak.days, badges: a.badges.length,
      lit: document.querySelectorAll('.place.done').length, stars: Object.values(a.lessons).reduce((s, x) => s + x.stars, 0), owned: a.wardrobe.owned.length }; }''')
    print('progress:', json.dumps(info))
    assert info['done'] == len(ids) and info['streak'] == 1 and info['badges'] >= len(ids)
    assert WRONG['done'] or not any(l in ids for l in ('add10', 'teens', 'sub10', 'make10')), 'wrong-answer path was not tested'
    no_sideways(pg, 'map')
    if SHOTS:
        pg.screenshot(path=f'{SHOTS}/map.png', full_page=True)
        pg.click('[data-adv="wardrobe"]')
        pg.screenshot(path=f'{SHOTS}/wardrobe.png', full_page=True)
    b.close()

print('\n'.join(errors) if errors else 'no errors')
sys.exit(1 if errors else 0)
