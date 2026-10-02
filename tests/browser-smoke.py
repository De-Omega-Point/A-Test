"""Browser regression tests against the actual served entry point.
Run: pip install playwright==1.57.0 && playwright install chromium
     python tests/browser-smoke.py
Set ATEST_INLINE=1 only for environments that forbid browser network access.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json, os, re, shutil, threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INLINE = os.environ.get('ATEST_INLINE') == '1'
checks = []

def check(label, condition):
    checks.append({'test': label, 'pass': bool(condition)})
    assert condition, label

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

@contextmanager
def site():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}/'
    finally:
        server.shutdown()
        server.server_close()

def mount(browser, url, width=390, height=844):
    page = browser.new_page(viewport={'width': width, 'height': height}, has_touch=True)
    page.set_default_timeout(7000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    if INLINE:
        html = re.sub(r'<script[^>]*>.*?</script>', '', (ROOT/'index.html').read_text(), flags=re.S)
        html = re.sub(r'<link[^>]*>', '', html)
        page.set_content(html)
        page.evaluate("Object.defineProperty(window,'localStorage',{value:{values:{},getItem(k){return this.values[k]??null},setItem(k,v){this.values[k]=String(v)}}})")
        for filename in ['styles.css', 'arcade.css', 'study-ui.css']:
            page.add_style_tag(content=(ROOT/filename).read_text())
        for filename in ['storage.js', 'app.js', 'study-ui.js', 'arcade.js']:
            page.add_script_tag(content=(ROOT/filename).read_text())
        page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
    else:
        page.goto(url)
    page.locator('.build-label').wait_for()
    return page, errors

with site() as url, sync_playwright() as p:
    options = {'headless': True}
    if INLINE:
        options['executable_path'] = shutil.which('chromium') or shutil.which('google-chrome')
        options['args'] = ['--no-sandbox']
    browser = p.chromium.launch(**options)
    try:
        page, errors = mount(browser, url)
        for view in ['home', 'study', 'practice', 'games', 'readiness', 'readings', 'learn', 'glossary', 'visual', 'map', 'cards', 'syllabus', 'audit']:
            page.evaluate('(view) => route(view)', view)
            check(f'{view}: content renders', bool(page.locator('#app').inner_text().strip()))
            check(f'{view}: no mobile overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
        page.evaluate("route('study')")
        page.locator('[data-section="study-library"]').click()
        page.wait_for_timeout(1200)
        check('Section jump preserves Study', page.locator('.study-parts').count() == 1)
        check('Section jump reaches library', page.locator('#study-library').bounding_box()['y'] < 180)
        check('In-page menu remains sticky', 0 <= page.locator('.onpage-nav').bounding_box()['y'] < 100)
        page.locator('[data-view="readings"]').click()
        check('Readings reachable from library', page.locator('.reading-card').count() == 4)
        page.evaluate("route('cards')")
        first = page.locator('.face').inner_text()
        page.locator('[data-next]').click()
        check('Flashcard Next changes card', page.locator('.face').inner_text() != first)
        page.locator('[data-prev]').click()
        check('Flashcard Previous returns', page.locator('.face').inner_text() == first)
        page.evaluate("route('study')")
        page.locator('[data-domain="first-peoples"]').first.click()
        page.locator('[data-domain="settlement"]').click()
        page.go_back()
        page.wait_for_timeout(100)
        check('Back restores exact lesson', page.url.endswith('#domain/first-peoples') and page.locator('.domain-study').count() == 1)
        if not INLINE:
            page.reload()
            page.locator('.build-label').wait_for()
            check('Reload restores deep lesson URL', page.locator('.domain-study').count() == 1 and 'First Peoples' in page.locator('.page-head').inner_text())
        for domain in page.evaluate('Object.keys(domainKnowledge)'):
            page.evaluate('(id) => route("domain/"+id)', domain)
            check(f'{domain}: lesson and section menu', page.locator('.domain-study').count() == 1 and page.locator('[data-section]').count() == 5)
        page.evaluate("state.domains['first-peoples']=3;route('domain/first-peoples')")
        page.locator('[data-domain-master]').click()
        check('Understand preserves verification', page.evaluate("state.domains['first-peoples']") == 3)
        page.evaluate('orderedDomains().forEach(d=>state.domains[d.id]=3);route("study")')
        check('Completed parts have no invalid links', page.locator('[data-domain="undefined"]').count() == 0)
        page.evaluate("route('topic/people')")
        page.locator('[data-answer]').first.click()
        check('Practice feedback appears', bool(page.locator('#feedback').inner_text()))
        page.locator('#next').click()
        check('Practice advances', page.evaluate('session.i') == 1)
        page.evaluate("route('mock')")
        for _ in range(20):
            answer = page.evaluate('session.q[session.i][3]')
            page.locator(f'[data-mock-answer="{answer}"]').click()
        check('Full mock records result', page.evaluate('state.mocks.at(-1).score') == 20)
        before = page.evaluate('state.mocks.length')
        page.evaluate('finishMock()')
        check('Mock result saved only once', page.evaluate('state.mocks.length') == before)
        page.evaluate("route('mock');mockEnds=Date.now()-1")
        page.locator('[data-mock-answer]').first.click()
        check('Timeout lists unanswered questions', page.locator('.review-row').count() == 20 and 'Not answered' in page.locator('.mock-review').inner_text())
        page.evaluate("route('games')")
        # Adventure is the default game and uses the animated canvas path. Exercise it
        # with roundRect removed to emulate older mobile Safari/WebViews.
        page.evaluate("CanvasRenderingContext2D.prototype.roundRect=undefined")
        page.locator('[data-dash-start]').first.click()
        page.locator('[data-dash-action="begin"]').click()
        page.wait_for_timeout(250)
        travel_a = page.evaluate('active && active.roadTravel')
        page.wait_for_timeout(850)
        travel_b = page.evaluate('active && active.roadTravel')
        check('Adventure visibly advances flight distance', travel_b > travel_a + 50)
        check('Adventure game loop is running', page.locator('.dash-game').count() == 1 and page.locator('#dash-overlay[hidden]').count() == 1)
        page.locator('[data-dash-action="pause"]').click()
        check('Adventure pauses once without glitch loop', 'Cloud break' in page.locator('#dash-overlay').inner_text())
        page.locator('[data-dash-action="resume"]').click()
        check('Adventure resumes', page.locator('#dash-overlay[hidden]').count() == 1)
        page.locator('[data-dash-action="exit"]').click()
        page.locator('[data-dash-action="leave"]').click()
        check('Adventure exit restores lobby', page.locator('.dash-lobby').count() == 1)
        page.locator('[data-dash-mode="chill"]').click()
        page.locator('[data-dash-start]').first.click()
        page.locator('[data-dash-action="begin"]').click()
        for _ in range(3):
            for _ in range(4):
                page.locator('[data-dash-lane][aria-label*="collect star"]').click()
            page.locator('[data-dash-choice]').first.click()
            page.locator('[data-dash-action="next"]').click()
        check('Full Chill game reaches results', 'JOURNEY COMPLETE' in page.locator('#dash-overlay').inner_text())
        page.locator('[data-dash-action="leave"]').click()
        check('Arcade exit restores lobby', page.locator('.dash-lobby').count() == 1)
        page.evaluate("route('study')")
        check('Study restored after game', page.locator('.study-parts').count() == 1)
        check('No runtime errors', not errors)
        page.close()
        for width, height in [(320, 568), (844, 390), (1280, 900)]:
            page, errors = mount(browser, url, width, height)
            for view in ['study', 'domain/first-peoples', 'readings', 'games']:
                page.evaluate('(view) => route(view)', view)
                check(f'{width}px {view}: no overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            check(f'{width}px: no runtime errors', not errors)
            page.close()
    finally:
        browser.close()
report = {'passed': len(checks), 'checks': checks, 'served_entry_point': not INLINE}
print(json.dumps(report, indent=2))
