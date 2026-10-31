"""Public release verification plus assistive-technology semantics audit.
Run on GitHub Actions with Playwright Chromium and axe-core installed.
This is automated accessibility testing, not human VoiceOver/NVDA certification.
"""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from playwright.sync_api import sync_playwright

BASE=os.environ.get("ATEST_PUBLIC_URL","https://de-omega-point.github.io/A-Test/").rstrip("/")
checks=[]

def check(label, condition):
    checks.append({"name":label,"passed":bool(condition)})
    if not condition:
        raise AssertionError(label)
    print("PASS:",label,flush=True)

def fetch(path, limit=500000):
    url=BASE+"/"+path.lstrip("/")
    req=Request(url,headers={"User-Agent":"AUS-TEST-Live-Release-Verification/1.0","Cache-Control":"no-cache"})
    with urlopen(req,timeout=25) as response:
        check("HTTP 200: "+path,response.status==200)
        return response.read(limit),response.headers.get("Content-Type","")

print("PUBLIC SITE",BASE,flush=True)
manifest_bytes,_=fetch("release-status.json")
manifest=json.loads(manifest_bytes)
check("Public V3 syllabus release marker",manifest.get("syllabusTopics")==42)
html,_=fetch("index.html")
html=html.decode("utf-8")
check("Published entry references V3 and booklet",all(k in html for k in ["booklet-reader.js","study-ui.js","v3-intelligence.js"]))
reader,_=fetch("booklet-reader.js")
check("Published booklet reader is local",b"/A-Test/assets/our-common-bond-testable.pdf" in reader)
pdf,content_type=fetch("assets/our-common-bond-testable.pdf",limit=32)
check("Published source is a valid PDF header",pdf.startswith(b"%PDF-"))

axe_file=Path("node_modules/axe-core/axe.min.js")
check("axe-core audit library installed",axe_file.is_file())
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":390,"height":844},reduced_motion="reduce")
    page_errors=[]
    page.on("pageerror",lambda error:page_errors.append(str(error)))
    response=page.goto(BASE+"/#study",wait_until="domcontentloaded",timeout=30000)
    check("Chromium receives public site",response and response.status==200)
    page.locator("#study-syllabus").wait_for(timeout=20000)
    check("Syllabus visible in real public app",page.locator("#study-syllabus").count()==1)
    check("Official booklet shortcut visible",page.locator("#official-booklet-shortcut [data-booklet-open]").count()==1)
    check("Forty-two syllabus topic links",page.locator(".syllabus-item").count()==42)
    check("Language identifies Australian English",page.locator("html").get_attribute("lang")=="en-AU")
    check("Main and navigation landmarks",page.locator("main#app").count()==1 and page.locator('nav[aria-label="Primary navigation"]').count()==1)
    check("Skip to main content exists",page.locator('a.skip-link[href="#app"]').count()==1)
    check("Study page avoids horizontal overflow",page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"))

    # Accessible names and roles exposed to the native Chromium accessibility API.
    cdp=page.context.new_cdp_session(page)
    ax=cdp.send("Accessibility.getFullAXTree")
    nodes=ax.get("nodes",[])
    roles=[n.get("role",{}).get("value") for n in nodes if not n.get("ignored")]
    check("Accessibility tree includes main landmark","main" in roles)
    check("Accessibility tree includes navigation landmark","navigation" in roles)
    headings=[n.get("name",{}).get("value","") for n in nodes if n.get("role",{}).get("value")=="heading"]
    check("Accessible heading names exist",any(str(name).strip() for name in headings))
    unnamed=[n for n in nodes if n.get("role",{}).get("value")=="button" and not n.get("ignored") and not str(n.get("name",{}).get("value","")).strip()]
    check("Interactive buttons have accessible names",len(unnamed)==0)

    def audit(label):
        page.add_script_tag(content=axe_file.read_text(encoding="utf-8"))
        result=page.evaluate("""async () => await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})""")
        issues=[{"id":v["id"],"impact":v.get("impact"),"description":v.get("description"),"nodes":[n.get("target") for n in v.get("nodes",[])][:8]} for v in result["violations"]]
        print("AXE AUDIT",label,json.dumps(issues,ensure_ascii=False),flush=True)
        check(label+": no serious or critical WCAG issues",not any(v.get("impact") in ("serious","critical") for v in issues))
        return issues

    study_issues=audit("Study syllabus")

    # Navigation by keyboard, with visible focus and understandable targets.
    page.locator("#study-syllabus .syllabus-item [data-domain]").first.focus()
    check("Syllabus lesson button receives keyboard focus",page.evaluate("document.activeElement?.hasAttribute('data-domain')===true"))
    page.keyboard.press("Enter")
    page.locator(".domain-study").wait_for(timeout=10000)
    check("Keyboard opens a specific lesson",page.locator(".domain-study").count()==1)
    check("Lesson includes official PDF source action",page.locator('.domain-study [data-booklet-open]').count()>=1)
    lesson_issues=audit("Lesson")

    # Return and open local reader; use its controls and status announcements.
    page.locator('.domain-study [data-booklet-open]').first.click()
    page.locator(".booklet-reader").wait_for(timeout=10000)
    src=page.locator(".booklet-reader iframe").get_attribute("src") or ""
    check("Reader frames same-origin booklet",src.startswith("/A-Test/assets/our-common-bond-testable.pdf#page="))
    check("Reader announces page progress",page.locator('#booklet-status[role="status"][aria-live="polite"]').count()==1)
    page.locator("#booklet-notes").fill("Testing accessible personal notes")
    page.locator("[data-booklet-notes]").click()
    check("Reader saves notes locally",page.evaluate("JSON.parse(localStorage.getItem('atest-booklet-reader-v1')).notes")=="Testing accessible personal notes")
    check("Reader does not lose learner progress storage",page.evaluate("!!localStorage.getItem('atest-state')"))
    reader_issues=audit("Booklet reader")

    check("No JavaScript errors on public learning journey",len(page_errors)==0)
    print("ACCESSIBILITY SUMMARY",json.dumps({"study":study_issues,"lesson":lesson_issues,"reader":reader_issues},ensure_ascii=False),flush=True)
    browser.close()
print("PUBLIC RELEASE AND ACCESSIBILITY CHECKS PASSED:",len(checks),flush=True)
