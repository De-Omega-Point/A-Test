"""Civic Dash gameplay acceptance across modern browser engines and viewports."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

@contextmanager
def serve():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    thread=Thread(target=server.serve_forever,daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}/'
    finally:
        server.shutdown()
        server.server_close()

def validate(engine, url, width, height):
    browser=engine.launch(headless=True)
    context=browser.new_context(viewport={'width':width,'height':height},has_touch=True,reduced_motion='reduce' if width==320 else 'no-preference')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(url+'#play',wait_until='domcontentloaded',timeout=30000)
    page.locator('.dash-lobby').wait_for()
    assert page.locator('.dash-badge').count()==5, 'Five trackable badges'
    assert not page.evaluate("JSON.parse(localStorage.getItem('atest-arcade-v1')||'{}').sound===true"), 'Sound is opt-in'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), 'No lobby horizontal overflow'
    page.locator('.dash-help summary').click()
    effects=page.locator('[data-dash-setting="effects"]')
    assert effects.get_attribute('aria-pressed')=='true'
    effects.click()
    assert effects.get_attribute('aria-pressed')=='false'
    assert page.evaluate("JSON.parse(localStorage.getItem('atest-arcade-v1')).effects") is False
    effects.click()
    assert effects.get_attribute('aria-pressed')=='true'
    if width==320:
        assert page.locator('.dash-mode.selected').get_attribute('data-dash-mode')=='chill', 'Reduced-motion defaults to Chill'
    page.locator('[data-dash-mode="adventure"]').click()
    page.locator('[data-dash-start]').first.click()
    page.locator('[data-dash-action="begin"]').click()
    page.locator('#dash-canvas').wait_for()
    assert page.locator('#dash-boost-banner').count()==1, 'Boost legend appears on the skyway'
    assert page.locator('[data-dash-lane]').count()==3
    image_a=page.locator('#dash-canvas').evaluate('(canvas)=>canvas.toDataURL()')
    page.wait_for_timeout(550)
    image_b=page.locator('#dash-canvas').evaluate('(canvas)=>canvas.toDataURL()')
    assert image_a!=image_b, 'The canvas should animate'
    page.locator('[data-dash-action="pause"]').click()
    assert 'Cloud break' in page.locator('#dash-overlay').inner_text()
    pause_effects=page.locator('[data-dash-action="toggle-effects"]')
    assert pause_effects.get_attribute('aria-pressed')=='true'
    pause_effects.click()
    assert pause_effects.get_attribute('aria-pressed')=='false', 'Pause toggles effects'
    pause_effects.click()
    page.locator('[data-dash-action="resume"]').click()
    page.keyboard.press('ArrowRight')
    assert page.locator('[data-dash-lane="2"]').get_attribute('aria-pressed')=='true'
    page.locator('[data-dash-action="exit"]').click()
    page.locator('[data-dash-action="leave"]').click()
    assert page.locator('.dash-lobby').count()==1
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), 'No overflow after exit'
    assert not errors, 'Unexpected JS errors: '+str(errors)
    print(f'PASS {engine.name} {width}x{height}: animation, effects toggles, controls, pause, exit, badges',flush=True)
    context.close()
    browser.close()

if __name__=='__main__':
    with serve() as base,sync_playwright() as pw:
        for engine in (pw.chromium,pw.firefox,pw.webkit):
            for viewport in ((320,568),(390,844),(1280,900)):
                validate(engine,base,*viewport)
    print('PASS all nine engine/viewport Civic Dash combinations',flush=True)
