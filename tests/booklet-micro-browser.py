"""Browser acceptance: source pages + microlearning + spaced review + values 5/5.
Covers Chromium, Firefox and WebKit, mobile and desktop viewports.
Booklet practice and official mock results must remain separate.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

@contextmanager
def serve():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    worker=Thread(target=server.serve_forever,daemon=True)
    worker.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}/'
    finally:
        server.shutdown()
        server.server_close()

def validate(engine,url,width,height):
    browser=engine.launch(headless=True)
    ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce' if width<400 else 'no-preference')
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    resp=page.goto(url+'#study',wait_until='domcontentloaded',timeout=30000)
    assert resp and resp.ok, 'Study page serves successfully'
    page.locator('#official-booklet-shortcut [data-booklet-open]').click()
    page.locator('#booklet-learning-cockpit').wait_for()
    assert page.locator('.booklet-chapter-panel').count()==4, 'Four source-booklet parts'
    assert page.locator('.booklet-micro-card').count()==27, 'Twenty-seven microlearning exercises'
    assert page.locator('#booklet-values-practice').count()==1, 'Values gate available after Part 4'
    assert page.locator('.booklet-page').count()==50, 'The original document is still fully accessible'
    assert page.locator('.booklet-reader iframe').count()==0, 'No PDF iframe to trap scrolling'
    assert page.locator('.micro-stat-grid').inner_text().find('0 / 27')>=0

    # Answer a real page-8 mini-lesson and ensure no mock result changes.
    mock_before=page.evaluate('localStorage.getItem("atest-state")')
    page.locator('#booklet-learning-cockpit [data-micro-jump="first-peoples"]').click()
    card=page.locator('#booklet-micro-first-peoples')
    assert card.get_attribute('open') is not None
    card.locator('details.micro-recall summary').click()
    assert 'Aboriginal' in card.locator('details.micro-recall p').inner_text()
    correct=page.evaluate('ATEST_MICRO_CARDS[0].correct')
    card.locator('[data-micro-choice="'+str(correct)+'"]').click()
    assert 'Correct' in card.locator('.micro-feedback').inner_text()
    assert page.evaluate('atestMicroRecord("first-peoples").streak')==1
    assert page.evaluate('atestMicroRecord("first-peoples").dueAt>Date.now()')
    assert mock_before==page.evaluate('localStorage.getItem("atest-state")'), 'No exam or mock record changes'

    # A repeat within the same review interval cannot fake mastery.
    card.locator('[data-micro-again]').click()
    card.locator('[data-micro-choice="'+str(correct)+'"]').click()
    assert page.evaluate('atestMicroRecord("first-peoples").streak')==1

    # The chapter cockpit offers return-to-source and due-review shortcuts.
    assert page.locator('[data-micro-resume]').count()==1
    page.locator('[data-micro-resume]').click()
    assert page.locator('.booklet-reader-toolbar').count()==1
    page.locator('[data-micro-chapter-jump="values"]').click()
    assert page.locator('#booklet-chapter-values').count()==1

    # Independent 5/5 values practice; no time limit and five must be correct.
    page.locator('[data-micro-values-jump]').click()
    page.locator('[data-values-start]').click()
    for index in range(5):
        answer=page.evaluate('ATEST_VALUES_PRACTICE[atestValuesRun.order[atestValuesRun.index]].correct')
        page.locator('[data-values-choice="'+str(answer)+'"]').click()
        assert page.locator('#values-challenge-feedback').count()==1
        page.locator('[data-values-next]').click()
    assert '5/5: Perfect practice run' in page.locator('#values-challenge-feedback').inner_text()
    assert page.evaluate('atestMicroRead().values.best')==5
    assert page.evaluate('atestMicroRead().values.lastScore')==5
    assert mock_before==page.evaluate('localStorage.getItem("atest-state")'), 'Values practice does not alter mock results'

    # A 4/5 run cannot be labelled a perfect practice result.
    page.locator('[data-values-start]').click()
    for index in range(5):
        answer=page.evaluate('ATEST_VALUES_PRACTICE[atestValuesRun.order[atestValuesRun.index]].correct')
        if index==0:answer=(answer+1)%3
        page.locator('[data-values-choice="'+str(answer)+'"]').click()
        page.locator('[data-values-next]').click()
    assert '4/5: Revisit and retry' in page.locator('#values-challenge-feedback').inner_text()
    assert page.evaluate('atestMicroRead().values.lastScore')==4
    assert page.evaluate('atestMicroRead().values.best')==5

    # Reader entry after a reload restores local progress and keeps scroll usable.
    page.reload(wait_until='domcontentloaded')
    page.locator('#official-booklet-shortcut [data-booklet-open]').click()
    page.locator('#booklet-learning-cockpit').wait_for()
    assert page.evaluate('atestMicroRecord("first-peoples").streak')==1
    assert page.evaluate('atestMicroRead().values.best')==5
    assert page.locator('#booklet-micro-first-peoples').count()==1
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), 'No horizontal scroll at this viewport'
    assert not errors,'Unexpected JavaScript errors: '+str(errors)
    print(f'PASS {engine.name} {width}x{height}: 27 micro-stops, recall, spaced progression, values 5/5, persistence',flush=True)
    ctx.close()
    browser.close()

if __name__=='__main__':
    with serve() as base,sync_playwright() as pw:
        for engine in (pw.chromium,pw.firefox,pw.webkit):
            for width,height in ((390,844),(1280,850)):
                validate(engine,base,width,height)
    print('PASS six modern-browser booklet microlearning configurations',flush=True)
