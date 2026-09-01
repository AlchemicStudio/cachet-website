#!/usr/bin/env python3
"""One-off: split the single /docs page into one component per section.

Lifts each `<section id="…">` body out of the old `app/pages/docs.vue` verbatim
— minus its wrapper and its `<h2>`, both of which the new page supplies — and
writes `app/components/docs/<Name>.vue` with the script block that section
needs. Extracting mechanically rather than retyping keeps the markup identical
through the move.

Kept in the repository as the record of how the split was made; it is not part
of the build and does not need running again.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "app" / "pages" / "docs.vue"
OUT = ROOT / "app" / "components" / "docs"

# section id -> (component name, script block)
SECTIONS: dict[str, tuple[str, str]] = {
    "overview": ("Overview", """<script setup lang="ts">
import { DOC_LINKS } from '~/content'

const { t } = useI18n()
</script>"""),
    "features": ("Features", """<script setup lang="ts">
import { FEATURES, OUTPUT_FILE_PATTERN } from '~/content'

const { t } = useI18n()
</script>"""),
    "modes": ("Modes", """<script setup lang="ts">
import { MODES } from '~/content'

const { t } = useI18n()
const { reference, translated: referenceTranslated } = useDocsReference()
</script>"""),
    "walkthrough": ("Walkthrough", """<script setup lang="ts">
import { OUTPUT_FILE_PATTERN, WIZARD_STEPS } from '~/content'

const { t } = useI18n()
</script>"""),
    "cli": ("Cli", """<script setup lang="ts">
import { CLI_EXAMPLES, CLI_FLAGS, OUTPUT_FILE_PATTERN } from '~/content'

const { t } = useI18n()
</script>"""),
    "levels": ("Levels", """<script setup lang="ts">
import { PADES_LEVELS } from '~/content'

const { t } = useI18n()
const { reference, translated: referenceTranslated } = useDocsReference()
</script>"""),
    "tiers": ("Tiers", """<script setup lang="ts">
const { reference, translated: referenceTranslated } = useDocsReference()
</script>"""),
    "requirements": ("Requirements", """<script setup lang="ts">
import { REQUIREMENTS } from '~/content'

const { t, tm, rt } = useI18n()

/** `tm` returns the raw array; `rt` resolves each entry to a plain string. */
function requirementItems(id: string): string[] {
  const list = tm(`docs.requirements.${id}.items`) as unknown[]
  return Array.isArray(list) ? list.map(entry => rt(entry as never)) : []
}
</script>"""),
    "install": ("Install", """<script setup lang="ts">
import { SITE } from '#shared/site'
import { INSTALL_SOURCE } from '~/content'

const { t } = useI18n()
const localePath = useLocalePath()
</script>"""),
    "glossary": ("Glossary", """<script setup lang="ts">
const { reference, translated: referenceTranslated } = useDocsReference()
</script>"""),
    "sources": ("Sources", """<script setup lang="ts">
const { t } = useI18n()
const { docs } = useDocsReference()
</script>"""),
    "legal": ("Legal", """<script setup lang="ts">
import { LEGAL_NOTICES } from '~/content'

const { t } = useI18n()
</script>"""),
}


def extract(markup: str, section_id: str) -> str:
    """The inner markup of one `<section id="…">`, without its heading."""
    pattern = re.compile(
        rf'<section id="{section_id}"[^>]*>\n(.*?)\n\s*</section>',
        re.S,
    )
    match = pattern.search(markup)
    if not match:
        raise SystemExit(f"section {section_id!r} not found")

    body = match.group(1)

    # Drop the section's own <h2>; the page renders the title as its <h1>.
    body = re.sub(r'\s*<h2 class="font-display text-2xl[^"]*">\n.*?\n\s*</h2>\n', "", body, count=1, flags=re.S)

    # The old markup sat 12 spaces deep inside the page; components start at 2.
    lines = body.split("\n")
    indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
    shift = min(indents) - 4 if indents else 0
    body = "\n".join(l[shift:] if l.strip() else "" for l in lines)

    return body.rstrip()


def main() -> int:
    markup = SOURCE.read_text(encoding="utf-8")
    OUT.mkdir(parents=True, exist_ok=True)

    for section_id, (name, script) in SECTIONS.items():
        body = extract(markup, section_id)
        path = OUT / f"{name}.vue"
        path.write_text(f"{script}\n\n<template>\n  <div>\n{body}\n  </div>\n</template>\n", encoding="utf-8")
        print(f"  {path.relative_to(ROOT)}  ({len(body.splitlines())} lines)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
