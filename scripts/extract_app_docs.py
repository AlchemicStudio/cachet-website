#!/usr/bin/env python3
"""Port the Cachet app's own documentation catalog into the website's i18n data.

The desktop app already ships a translated long-form reference (`i18n_docs.py`,
sections listed by `i18n.DOC_SECTIONS`, sources by `i18n.DOC_SOURCES`) in
English, French, Dutch, German, Spanish and Portuguese. Rather than retranslate
that prose — and let the site and the app drift apart — this reads the catalog
straight out of a checkout and writes `i18n/docs/<locale>.json`.

Italian is not in the app, so it is not produced here; `i18n/docs/it.json` is
authored by hand alongside the rest of the Italian site copy.

    python3 scripts/extract_app_docs.py --source ../python
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Display order of the reference sections, mirroring the app's own popup.
SECTIONS = ("docs.modes", "docs.levels", "docs.tiers", "docs.glossary", "docs.glance")

ROOT = Path(__file__).resolve().parent.parent


def strip_bold(text: str) -> str:
    """`**Heading**` -> `Heading`, for text used as a plain title."""
    m = re.fullmatch(r"\*\*(.+?)\*\*", text.strip(), re.S)
    return m.group(1).strip() if m else text.strip()


def split_label(line: str) -> dict:
    """`What it is: a qualified signature` -> `{label, text}`.

    The guard on label length keeps ordinary prose containing a colon — a URL,
    a ratio, a sentence — from being mistaken for a labelled line. A leading `•`
    is lifted out first: some definition blocks list their points as bullets.
    """
    text = line.strip()
    bullet = text.startswith("•")
    if bullet:
        text = text.lstrip("•").strip()

    label, sep, rest = text.partition(": ")
    if sep and len(label) <= 40 and not label.endswith((".", "!", "?")):
        return {"label": label.strip(), "text": rest.strip(), "bullet": bullet}
    return {"label": None, "text": text, "bullet": bullet}


def parse_item(body: str) -> dict:
    """One `•` bullet, in any of the four shapes the catalog uses."""
    first, *rest = body.split("\n")
    first = first.strip()

    term: str | None = None
    text = first

    # `**Term** — text` and `**Term**: text`
    if m := re.match(r"^\*\*(.+?)\*\*\s*(?:—|:)\s*(.+)$", first):
        term, text = m.group(1).strip(), m.group(2).strip()
    # `**Term**` alone on the line, details on the indented lines below
    elif m := re.fullmatch(r"\*\*(.+?)\*\*", first):
        term, text = m.group(1).strip(), ""
    # `B-B: basic signature, fully offline.`
    elif m := re.match(r"^([A-Za-z0-9][\w .()/+-]{0,14}):\s+(.+)$", first):
        term, text = m.group(1).strip(), m.group(2).strip()

    lines = [split_label(line.strip()) for line in rest if line.strip()]
    return {"term": term, "text": text, "lines": lines}


def parse_section(raw: str) -> dict:
    """Turn one catalog entry into `{title, blocks}`.

    Catalog conventions: the first line is a `**TITLE**`; blocks are separated
    by blank lines; a block of `•` lines is a list, with two-space-indented
    lines continuing the bullet above them; a block whose first line is bold and
    alone is a definition; anything else is a paragraph. Inline `**bold**` is
    left in place — the Vue side renders it, escaping first.
    """
    text = raw.replace("\r\n", "\n").strip("\n")
    lines = text.split("\n")

    title = ""
    if lines and re.fullmatch(r"\*\*(.+?)\*\*", lines[0].strip()):
        title = strip_bold(lines[0])
        lines = lines[1:]

    blocks: list[dict] = []

    for chunk in re.split(r"\n\s*\n", "\n".join(lines).strip("\n")):
        chunk = chunk.rstrip()
        if not chunk.strip():
            continue

        if chunk.lstrip().startswith("•"):
            # Re-join each bullet with the indented lines that follow it.
            raw_items = [b for b in re.split(r"\n(?=\s*•)", chunk) if b.strip()]
            items = [parse_item(item.strip().lstrip("•").strip()) for item in raw_items]
            # The catalog separates long bullets by a blank line, which would
            # otherwise make each one its own single-item list. Consecutive
            # bullet chunks belong to the same list.
            if blocks and blocks[-1]["type"] == "list":
                blocks[-1]["items"].extend(items)
            else:
                blocks.append({"type": "list", "items": items})
            continue

        chunk_lines = [line for line in chunk.split("\n") if line.strip()]
        head = chunk_lines[0].strip()

        if len(chunk_lines) > 1 and re.fullmatch(r"\*\*(.+?)\*\*", head):
            blocks.append({
                "type": "definition",
                "term": strip_bold(head),
                "lines": [split_label(line.strip()) for line in chunk_lines[1:]],
            })
            continue

        blocks.append({"type": "p", "text": " ".join(line.strip() for line in chunk_lines)})

    return {"title": title, "blocks": blocks}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        default="../python",
        help="path to a Cachet checkout containing i18n.py / i18n_docs.py",
    )
    args = parser.parse_args()

    source = (ROOT / args.source).resolve() if not Path(args.source).is_absolute() else Path(args.source)
    if not (source / "i18n_docs.py").exists():
        print(f"error: no i18n_docs.py under {source}", file=sys.stderr)
        return 1

    sys.path.insert(0, str(source))
    import i18n  # noqa: E402  (path must be set first)
    from i18n_docs import DOCS_CATALOG  # noqa: E402

    out_dir = ROOT / "i18n" / "docs"
    out_dir.mkdir(parents=True, exist_ok=True)

    for locale in i18n.LANGUAGES:
        payload = {
            "_generated": (
                "Ported from the Cachet app's i18n_docs.py by "
                "scripts/extract_app_docs.py — edit there, not here."
            ),
            "sections": [
                {"id": key.removeprefix("docs."), **parse_section(DOCS_CATALOG[key][locale])}
                for key in SECTIONS
                if key in DOCS_CATALOG
            ],
            "sources": {
                "heading": strip_bold(DOCS_CATALOG["docs.sources_heading"][locale]),
                "intro": DOCS_CATALOG["docs.sources_intro"][locale].strip(),
                "items": [
                    {"title": DOCS_CATALOG[key][locale].strip(), "url": url}
                    for key, url in i18n.DOC_SOURCES
                    if key in DOCS_CATALOG
                ],
            },
        }

        path = out_dir / f"{locale}.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        sections = len(payload["sections"])
        sources = len(payload["sources"]["items"])
        print(f"{path.relative_to(ROOT)}: {sections} sections, {sources} sources")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
