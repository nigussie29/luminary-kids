# End-to-end smoke test in headless Chromium: plays a sample lesson, the starting game, and opens the grown-ups report.
import sys, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
URL = 'file:///home/claude/lk-repo/dist/luminary-kids.html'
errors = []
def run(page, label):
    page.on('pageerror', lambda e: errors.append(f'{label}: {e}'))
    page.on('console', lambda m: errors.append(f'{label} console {m.type}: {m.text}') if m.type == 'error' and 'fonts' not in m.text else None)

def play_item(page, wrong_first=False):
    it = page.evaluate('LK.app.S.run.item')
    inp, ans = it['input'], it['answer']
    if wrong_first and inp == 'choose':
        other = [o for o in it['options'] if o != ans][0]
        page.click(f'.opt[data-v="{other}"]')
    if inp in ('choose', 'pick'):
        page.click(f'.opt[data-v="{ans}"]')
    elif inp == 'line':
        page.click(f'[data-n="{ans}"]')
    elif inp == 'build':
        for i in range(ans): page.click(f'[data-cell="{i}"]')
        page.click('[data-act="buildcheck"]')
    state = page.evaluate('LK.app.S.run.state')
    assert state == 'right', (it['type'], state)
    page.click('[data-act="next"]')

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, vp in [('desktop', {'width': 1280, 'height': 900}), ('phone', {'width': 390, 'height': 844})]:
        ctx = b.new_context(viewport=vp, device_scale_factor=1)
        page = ctx.new_page(); run(page, name)
        page.goto(URL)
        page.screenshot(path=f'{OUT}/{name}-landing.png', full_page=(name == 'desktop'))
        sw = page.evaluate('document.documentElement.scrollWidth'); assert sw <= vp['width'], f'{name} horizontal scroll {sw}'
        # sample lesson 1
        page.click('.hero [data-act="sample"]')
        page.screenshot(path=f'{OUT}/{name}-story.png')
        page.click('[data-act="next"]'); page.screenshot(path=f'{OUT}/{name}-example.png')
        page.click('[data-act="next"]')
        # tap-to-count on first item
        it = page.evaluate('LK.app.S.run.item')
        if it['type'] == 'count':
            objs = page.query_selector_all('.visual [data-obj]')
            for o in objs: o.click()
            assert page.evaluate('LK.app.S.run.tapped.length') == it['answer']
        page.screenshot(path=f'{OUT}/{name}-item.png')
        play_item(page, wrong_first=True)
        guard = 0
        while page.evaluate('LK.app.S.run.steps[LK.app.S.run.i].k') == 'item' and guard < 20:
            if guard == 3: page.screenshot(path=f'{OUT}/{name}-item2.png')
            if page.evaluate('LK.app.S.run.item.input') == 'build' and guard < 9:
                page.screenshot(path=f'{OUT}/{name}-build.png')
            play_item(page); guard += 1
        page.screenshot(path=f'{OUT}/{name}-done.png')
        sw = page.evaluate('document.documentElement.scrollWidth'); assert sw <= vp['width'], f'{name} horizontal scroll in lesson {sw}'
        if name == 'phone':
            # grown-ups: gate, add child, starting game, lesson 4 hint state, report
            page.click('[data-act="home"]')
            page.click('.top [data-act="gate"]')
            g = page.evaluate('LK.app.S.gate'); page.fill('#gate-answer', str(g['a'] * g['b'])); page.click('form[data-form="gate"] button[type="submit"]')
            page.fill('#kid-name', 'Selam'); page.click('form[data-form="addkid"] button[type="submit"]')
            page.click('[data-act="home"]')
            page.screenshot(path=f'{OUT}/phone-home-new.png')
            page.click('.next-card [data-act="diag"]'); page.click('[data-act="next"]')
            for k in range(6): play_item(page)
            page.click('.done [data-act="home"]')
            page.screenshot(path=f'{OUT}/phone-home.png', full_page=True)
            page.click('.stone[data-skill="make10"]'); page.click('[data-act="next"]'); page.click('[data-act="next"]')
            page.click('[data-act="hint"]'); page.screenshot(path=f'{OUT}/phone-hint.png')
            play_item(page)
            page.evaluate("LK.app.S.run.item = LK.generate('add10', 3, LK.rng(4)); LK.app.render()"); page.click('[data-act="hint"]'); page.screenshot(path=f'{OUT}/phone-line.png')
            page.evaluate("LK.app.S.run.item = LK.generate('compare', 1, LK.rng(4)); LK.app.S.run.state='ask'; LK.app.S.run.hintOn=false; LK.app.render()"); page.screenshot(path=f'{OUT}/phone-compare.png')
            page.evaluate("LK.app.S.run.item = LK.generate('sub10', 2, LK.rng(8)); LK.app.render()"); page.screenshot(path=f'{OUT}/phone-sub.png')
            page.evaluate("LK.app.S.run.item = LK.generate('teens', 2, LK.rng(8)); LK.app.render()"); page.screenshot(path=f'{OUT}/phone-teens.png')
            page.click('[data-act="home"]')
            page.click('.top [data-act="gate"]')
            g = page.evaluate('LK.app.S.gate'); page.fill('#gate-answer', str(g['a'] * g['b'])); page.click('form[data-form="gate"] button[type="submit"]')
            page.screenshot(path=f'{OUT}/phone-parents.png', full_page=True)
            # progress recovery: reload keeps the profile and diagnostic
            page.reload(); assert page.evaluate("LK.app.DB.profiles[0].learner.diagnosticDone") is True
            n = page.evaluate("LK.app.DB.profiles[0].learner.sessions.length"); print('sessions saved after reload:', n)
            # dark theme check
            page.emulate_media(color_scheme='dark'); page.screenshot(path=f'{OUT}/phone-home-dark.png')
            # language switch to English
            page.click('[data-act="lang"][data-v="en"]'); page.screenshot(path=f'{OUT}/phone-home-en.png')
        ctx.close()
    b.close()
print('ERRORS:', json.dumps(errors, indent=1) if errors else 'none')
