#!/usr/bin/env python3
"""Check that every locale catalog matches the English one.

Compares `i18n/locales/*.json` against `en.json`: every key present, no stray
keys, and identical `{placeholders}` in each string — a mismatched placeholder
renders as literal braces rather than a value, which is easy to miss by eye. It
also flags long strings left identical to the English, the usual sign of an
entry that was copied but never translated.

    python3 scripts/check_locales.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "i18n" / "locales"
REFERENCE = "en"
PLACEHOLDER = re.compile(r"\{[a-zA-Z_]+\}")
# Below this length, an identical string is usually a real cognate or a
# brand name, not a missed translation.
SUSPICIOUS_LENGTH = 25


def flatten(value, prefix: str = "") -> dict[str, str]:
    if isinstance(value, dict):
        out: dict[str, str] = {}
        for key, item in value.items():
            out.update(flatten(item, f"{prefix}.{key}" if prefix else key))
        return out
    if isinstance(value, list):
        out = {}
        for index, item in enumerate(value):
            out.update(flatten(item, f"{prefix}[{index}]"))
        return out
    return {prefix: value}


def main() -> int:
    base = flatten(json.loads((LOCALES / f"{REFERENCE}.json").read_text(encoding="utf-8")))
    failed = False

    for path in sorted(LOCALES.glob("*.json")):
        locale = path.stem
        if locale == REFERENCE:
            continue

        catalog = flatten(json.loads(path.read_text(encoding="utf-8")))
        missing = sorted(set(base) - set(catalog))
        extra = sorted(set(catalog) - set(base))
        shared = set(base) & set(catalog)
        placeholders = [
            key for key in shared
            if sorted(PLACEHOLDER.findall(str(base[key])))
            != sorted(PLACEHOLDER.findall(str(catalog[key])))
        ]
        untranslated = [
            key for key in shared
            if isinstance(base[key], str)
            and len(base[key]) > SUSPICIOUS_LENGTH
            and base[key] == catalog[key]
        ]

        broken = bool(missing or extra or placeholders)
        failed = failed or broken
        print(
            f"{locale}: {'FAIL' if broken else 'ok'}  {len(catalog)} keys, "
            f"{len(missing)} missing, {len(extra)} extra, "
            f"{len(placeholders)} placeholder mismatch, {len(untranslated)} untranslated"
        )
        for key in missing:
            print(f"    missing: {key}")
        for key in extra:
            print(f"    extra:   {key}")
        for key in placeholders:
            print(f"    placeholder: {key}\n      en: {base[key]}\n      {locale}: {catalog[key]}")
        for key in untranslated[:10]:
            print(f"    untranslated: {key}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
