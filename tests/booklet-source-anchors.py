"""Verify booklet companions are anchored to the original Home Affairs PDF.
This is intentionally a conservative source-page test, not a replacement for
checking the full legal and historical nuance of each original page.
"""
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
doc=fitz.open(ROOT/'assets'/'our-common-bond-testable.pdf')
assert len(doc)==50, "The official booklet should contain 50 PDF pages"
# Printed booklet page = PDF page - 2, checked against actual printed headings.
anchors={
 8:('Aboriginal and Torres Strait Islander peoples',),
 9:('Commonwealth of Australia',),
 10:('six states','two mainland'),
 12:('Welcome to Country','Acknowledgement of Country'),
 13:('Anzac Day','25 April'),
 14:('Commonwealth Star','seven points'),
 16:('Advance Australia Fair',),
 18:('Parliamentary democracy','Rule of Law'),
 19:('Freedom of speech',),
 20:('Gender equality','fair go'),
 21:('Obey the laws','jury'),
 22:('Australian passport',),
 24:('Voting','compulsory'),
 25:('Federation','1901'),
 26:('Legislative power','Executive power','Judicial power'),
 27:('Governor-General','Royal Assent'),
 28:('House of Representatives','Senate'),
 29:('immigration and citizenship',),
 30:('Australian Government formed','House of Representatives'),
 31:('The courts','The police'),
 32:('Domestic','violence'),
 34:('Parliamentary democracy','Australian values'),
 35:('Freedom of speech','peaceful'),
 36:('Equality of all people under the law',),
 37:('Mutual respect and tolerance',),
 38:('mateship','community'),
}
checks=0
for printed,phrases in anchors.items():
    # PDF page is the printed page plus two, 1-indexed.
    page=doc[printed+1]
    text=' '.join(page.get_text().split()).lower()
    for phrase in phrases:
        assert ' '.join(phrase.split()).lower() in text, f'Booklet p. {printed}: missing {phrase!r}'
        checks+=1
print(f'{checks} official booklet source-page anchors verified.')
