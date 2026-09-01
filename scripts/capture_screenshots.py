#!/usr/bin/env python3
"""Capture the Cachet wizard, step by step, for the walkthrough on /docs.

Rather than clicking through the interface, this imports `gui.py` from a local
checkout and drives `CachetApp` directly — setting the state a step expects,
calling `_goto_step`, then grabbing the window. That makes the run repeatable
and keeps it to a few seconds of windows on screen.

Everything it signs is generated here: three throwaway A4 PDFs and a drawn
signature image, in a temporary directory that is removed afterwards. No real
document is ever opened, and image mode means no card, no PIN and no network.

    python3 scripts/capture_screenshots.py --source ../python

Needs a running X display (it uses ImageMagick's `import`). Writes the PNGs to
`public/screenshots/` and an index to `app/data/screenshots.json`.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "screenshots"
MANIFEST = ROOT / "app" / "data" / "screenshots.json"

# Wizard step index (0-based, as `_goto_step` numbers them) -> site step id.
STEPS = [
    (0, "template"),
    (1, "documents"),
    (2, "validation"),
    (3, "output"),
    (4, "type"),
    (5, "placement"),
    (6, "signing"),
    (7, "report"),
]

A4 = (595.276, 841.89)


def build_pdf(path: Path, title: str, pages: int, size: tuple[float, float] = A4) -> None:
    """Write a minimal, valid multi-page PDF with a line of text per page.

    Hand-rolled because the app's environment carries no PDF writer — pyHanko
    brings its own and never exposes a generic one. Base-14 Helvetica keeps it
    to a handful of objects with no embedded font.
    """
    width, height = size
    objects: list[bytes] = []

    def add(body: str) -> int:
        objects.append(body.encode("latin-1"))
        return len(objects)

    font_id = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    page_ids: list[int] = []
    content_ids: list[int] = []
    for page in range(pages):
        stream = (
            "BT /F1 22 Tf 70 {y0} Td ({title}) Tj ET\n"
            "BT /F1 11 Tf 70 {y1} Td (Sample document generated for the Cachet "
            "documentation screenshots.) Tj ET\n"
            "BT /F1 11 Tf 70 {y2} Td (Page {n} of {total} - not a real record.) Tj ET\n"
            "0.83 0.83 0.85 rg 70 {y3} {w} 1 re f\n"
        ).format(
            y0=height - 110,
            y1=height - 150,
            y2=height - 172,
            y3=height - 200,
            title=title,
            n=page + 1,
            total=pages,
            w=width - 140,
        )
        content_ids.append(add(f"<< /Length {len(stream)} >>\nstream\n{stream}endstream"))
        page_ids.append(0)  # placeholder, filled once the Pages id is known

    pages_id = len(objects) + pages + 1
    for index in range(pages):
        page_ids[index] = add(
            f"<< /Type /Page /Parent {pages_id} 0 R "
            f"/MediaBox [0 0 {width:.3f} {height:.3f}] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> "
            f"/Contents {content_ids[index]} 0 R >>"
        )

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    add(f"<< /Type /Pages /Kids [{kids}] /Count {pages} >>")
    catalog_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode("latin-1") + body + b"\nendobj\n"

    xref_at = len(out)
    out += f"xref\n0 {len(objects) + 1}\n".encode("latin-1")
    out += b"0000000000 65535 f \n"
    for offset in offsets[1:]:
        out += f"{offset:010d} 00000 n \n".encode("latin-1")
    out += (
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_at}\n%%EOF\n"
    ).encode("latin-1")

    path.write_bytes(bytes(out))


def build_signature_image(path: Path) -> None:
    """A drawn 'signature' for image mode — no real handwriting involved."""
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGBA", (520, 190), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)

    for candidate in (
        "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        if Path(candidate).exists():
            font = ImageFont.truetype(candidate, 38)
            small = ImageFont.truetype(candidate, 20)
            break
    else:
        font = ImageFont.load_default(38)
        small = ImageFont.load_default(20)

    draw.rounded_rectangle([2, 2, 517, 187], radius=14, outline=(67, 62, 161, 255), width=3)
    draw.text((28, 32), "Specimen", font=font, fill=(67, 62, 161, 255))
    draw.text((30, 96), "Sample stamp — no legal value", font=small, fill=(98, 100, 117, 255))
    image.save(path)


def capture(window_id: int, destination: Path, delay: float = 0.45) -> bool:
    """Grab one window with ImageMagick, giving Tk time to finish painting."""
    time.sleep(delay)
    result = subprocess.run(
        ["import", "-window", hex(window_id), "-silent", str(destination)],
        capture_output=True,
    )
    if result.returncode != 0 or not destination.exists():
        print(f"  ! capture failed: {result.stderr.decode().strip()}", file=sys.stderr)
        return False
    return True


def trim_and_scale(path: Path, max_width: int = 1400) -> tuple[int, int]:
    """Normalise a capture: drop any border, cap the width, strip metadata."""
    from PIL import Image

    image = Image.open(path).convert("RGB")
    if image.width > max_width:
        height = round(image.height * max_width / image.width)
        image = image.resize((max_width, height), Image.LANCZOS)
    image.save(path, "PNG", optimize=True)

    if shutil.which("optipng"):
        subprocess.run(["optipng", "-quiet", "-o2", str(path)], check=False)

    return image.width, image.height


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default="../python", help="path to a Cachet checkout")
    parser.add_argument("--language", default="en", help="GUI language to capture")
    args = parser.parse_args()

    if not os.environ.get("DISPLAY"):
        print("error: no DISPLAY; this needs a running X server", file=sys.stderr)
        return 1
    if not shutil.which("import"):
        print("error: ImageMagick's `import` is not installed", file=sys.stderr)
        return 1

    source = (ROOT / args.source).resolve()
    if not (source / "gui.py").exists():
        print(f"error: no gui.py under {source}", file=sys.stderr)
        return 1

    sys.path.insert(0, str(source))
    os.chdir(source)

    import customtkinter as ctk  # noqa: E402
    import i18n  # noqa: E402
    from gui import CachetApp  # noqa: E402

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # A fixed name rather than a random one: the output path is visible in
    # the step-8 capture, and "/tmp/Cachet-demo/signed" reads as a demo.
    workspace = Path(tempfile.gettempdir()) / "Cachet-demo"
    shutil.rmtree(workspace, ignore_errors=True)
    workspace.mkdir(parents=True)

    try:
        template = workspace / "TEMPLATE.pdf"
        build_pdf(template, "Decision template", pages=2)

        inputs = []
        for index, name in enumerate(("decision-2026-041", "decision-2026-042", "decision-2026-043"), 1):
            path = workspace / f"{name}.pdf"
            build_pdf(path, f"Decision {index:03d}", pages=2)
            inputs.append(path)

        signature = workspace / "signature.png"
        build_signature_image(signature)

        output_dir = workspace / "signed"
        output_dir.mkdir()

        ctk.set_appearance_mode("light")
        i18n.set_language(args.language)

        app = CachetApp(argparse.Namespace(lib=None))
        app.geometry("1180x900")
        app.update()
        app.lift()
        app.update()

        shots: dict[str, dict] = {}
        window = app.winfo_id()

        print(f"Capturing into {OUT_DIR.relative_to(ROOT)}")

        # Landing page, before the wizard opens. It carries far less than a
        # wizard step, so it is shot in a shorter window rather than padded out
        # with empty space.
        app.geometry("1180x560")
        app.update()
        landing = OUT_DIR / "welcome.png"
        if capture(window, landing, delay=0.9):
            width, height = trim_and_scale(landing)
            shots["welcome"] = {"file": "welcome.png", "width": width, "height": height}
            print("  welcome.png")

        app.geometry("1180x900")
        app.update()
        app._start_wizard()
        app.update()

        # State each step expects, applied just before it is shown.
        def prepare(index: int) -> None:
            if index >= 1:
                app.template_path = template
                import sign_pdfs_beid as core

                app.template_dims = core.page_dimensions(template)
                app.template_error = None
            if index >= 2:
                app.input_paths = list(inputs)
            if index >= 3:
                app.output_dir = output_dir
            if index >= 4:
                app.mode_var.set("image")
                app.image_path = signature
            if index >= 5:
                app.place_page = 2
                app.place_x = 330.0
                app.place_y = 140.0
                app.page_text = "2"
                # Preview the page that will actually be signed, so the shot
                # does not show "page 1/2" next to a target page of 2.
                app.cur_page = 1

        for step_index, step_id in STEPS:
            prepare(step_index)

            if step_id == "validation":
                app._goto_step(step_index)
                app.update()
                app._validate()
            elif step_id == "report":
                # A real image-mode run: offline, no card, genuine results.
                app._goto_step(6)
                app.update()
                app._launch()
                for _ in range(200):
                    app.update()
                    if app.run_results is not None or app.run_error:
                        break
                    time.sleep(0.05)
                app._goto_step(7)
            else:
                app._goto_step(step_index)

            app.update()
            app.lift()
            app.update()

            destination = OUT_DIR / f"step-{step_index + 1}-{step_id}.png"
            if capture(window, destination):
                width, height = trim_and_scale(destination)
                shots[step_id] = {
                    "file": destination.name,
                    "width": width,
                    "height": height,
                }
                print(f"  {destination.name}")

        app.destroy()

        MANIFEST.write_text(
            json.dumps(
                {
                    "_generated": (
                        "Written by scripts/capture_screenshots.py — "
                        "re-run it rather than editing this file."
                    ),
                    "language": args.language,
                    "shots": shots,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {MANIFEST.relative_to(ROOT)} with {len(shots)} shot(s)")
        return 0 if shots else 1

    finally:
        shutil.rmtree(workspace, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
