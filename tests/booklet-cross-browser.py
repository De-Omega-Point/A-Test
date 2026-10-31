"""Run browser-native booklet scrolling acceptance in modern browser engines.

Chromium covers Chrome/Edge, Firefox covers Firefox, WebKit covers Safari.
Includes mobile-sized viewport checks; no browser PDF plugin is required.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PAGES=ROOT/"assets"/"booklet-pages"
assert (PAGES/"page-009.jpg").is_file(), "Generate booklet images before browser tests"
assert (PAGES/"transcripts.json").is_file(), "Text transcripts must accompany the images"


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass


@contextmanager
def serve():
    server=ThreadingHTTPServer(("127.0.0.1",0),partial(Quiet,directory=str(ROOT)))
    thread=Thread(target=server.serve_forever,daemon=True)
    thread.start()
    try:
        yield "http://127.0.0.1:"+str(server.server_port)+"/"
    finally:
        server.shutdown()
        server.server_close()


def verify(browser_type,base,width,height):
    browser=browser_type.launch(headless=True)
    context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    response=page.goto(base+"#study",wait_until="domcontentloaded",timeout=30000)
    assert response and response.ok, "Study route must load"
    page.locator("#official-booklet-shortcut [data-booklet-open]").click()
    page.locator(".booklet-pages").wait_for()
    assert page.locator(".booklet-reader iframe").count()==0, "No embedded PDF plugin should remain"
    assert page.locator(".booklet-page").count()==50, "Every source PDF page should be readable"
    assert page.locator(".booklet-page img").count()==50
    assert page.locator(".booklet-page img").first.get_attribute("loading") in ("lazy","eager")
    assert page.locator('#booklet-pdf-page-9 img').get_attribute("src")=="assets/booklet-pages/page-009.jpg"
    assert page.locator("a[href*='our-common-bond-testable.pdf']").count()>=1

    # Actual image pixels are fetched, not merely referenced.
    page.locator("#booklet-pdf-page-9").scroll_into_view_if_needed()
    page.wait_for_function("""() => {
       const img=document.querySelector('#booklet-pdf-page-9 img');
       return img && img.complete && img.naturalWidth>0;
    }""")
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),"No horizontal page overflow"

    # Scroll through the actual booklet: the normal document must move.
    page.evaluate("document.querySelector('#booklet-pdf-page-10').scrollIntoView({block:'start'})")
    page.wait_for_function("() => JSON.parse(localStorage.getItem('atest-booklet-reader-v1')).pdfPage === 10")
    scroll=page.evaluate("document.scrollingElement.scrollTop")
    assert scroll>250, "Native document scroll must move, not a nested PDF plugin"
    assert page.locator("#booklet-page-indicator").inner_text().startswith("Booklet page 8")

    page.locator("#booklet-page").fill("25")
    page.locator("[data-booklet-go]").click()
    page.wait_for_function("() => JSON.parse(localStorage.getItem('atest-booklet-reader-v1')).pdfPage===27")
    assert page.locator("#booklet-page-indicator").inner_text().startswith("Booklet page 25")

    # Selectable text helps readers who cannot use page images.
    summary=page.locator('details[data-booklet-transcript="27"] summary')
    summary.click()
    page.wait_for_function("""() => document.querySelector('details[data-booklet-transcript="27"]').dataset.loaded==='true'""")
    transcript=page.locator('details[data-booklet-transcript="27"] .booklet-transcript').inner_text()
    assert len(transcript)>50, "Transcript should include meaningful selectable text"

    page.locator("#booklet-notes").fill("Native reader review")
    assert page.evaluate("JSON.parse(localStorage.getItem('atest-booklet-reader-v1')).notes")=="Native reader review"
    assert page.evaluate("!!localStorage.getItem('atest-state')"),"Keep pre-existing learner progress"

    # Navigate away and return: the last page/notes must survive.
    page.locator('[data-view="study"]').last.click()
    assert page.locator("#study-syllabus").count()==1
    page.locator("#official-booklet-shortcut [data-booklet-open]").click()
    page.wait_for_function("() => JSON.parse(localStorage.getItem('atest-booklet-reader-v1')).pdfPage===27")
    assert page.locator("#booklet-notes").input_value()=="Native reader review"
    assert not errors, "Runtime errors: "+str(errors)
    print(f"PASS {browser_type.name} {width}x{height}: scrolling, image, transcript, bookmarks, progress",flush=True)
    context.close()
    browser.close()


if __name__=="__main__":
    with serve() as base,sync_playwright() as pw:
        for engine in [pw.chromium,pw.firefox,pw.webkit]:
            for width,height in [(390,844),(1280,850)]:
                verify(engine,base,width,height)
    print("PASS all six current-browser engine / viewport combinations",flush=True)
