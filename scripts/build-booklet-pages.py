#!/usr/bin/env python3
"""Render the unmodified Home Affairs PDF into browser-native scrolling images.

The original PDF remains authoritative and available alongside these images.
Generated assets are ephemeral build artefacts, not replacements for the PDF.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "assets" / "our-common-bond-testable.pdf"
OUTPUT = ROOT / "assets" / "booklet-pages"
EXPECTED_PAGES = 50
SCALE = 1.7


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = PDF.read_bytes()
    if not source.startswith(b"%PDF-"):
        raise ValueError("Source is not a PDF")
    document = fitz.open(stream=source, filetype="pdf")
    if document.page_count != EXPECTED_PAGES:
        raise ValueError(f"PDF has {document.page_count} pages instead of {EXPECTED_PAGES}")
    pages = []
    text_pages = {}
    for i, page in enumerate(document):
        pdf_number = i + 1
        rendered = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), alpha=False)
        jpeg = rendered.tobytes("jpeg", jpg_quality=82)
        filename = f"page-{pdf_number:03d}.jpg"
        (OUTPUT / filename).write_bytes(jpeg)
        printed = pdf_number - 2 if 9 <= pdf_number <= 45 else None
        pages.append({
            "pdf_page": pdf_number,
            "printed_page": printed,
            "file": filename,
            "width": rendered.width,
            "height": rendered.height,
            "bytes": len(jpeg),
        })
        text_pages[str(pdf_number)] = page.get_text("text", sort=True).strip()
    (OUTPUT / "manifest.json").write_text(
        json.dumps({
            "pdf_sha256": hashlib.sha256(source).hexdigest(),
            "pdf_pages": EXPECTED_PAGES,
            "pages": pages,
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUTPUT / "transcripts.json").write_text(
        json.dumps(text_pages, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    if not all((OUTPUT / page["file"]).stat().st_size > 10_000 for page in pages):
        raise ValueError("Rendered page is unexpectedly small")
    print(f"Rendered {EXPECTED_PAGES} source-faithful JPEG pages and optional text transcripts")


if __name__ == "__main__":
    main()
