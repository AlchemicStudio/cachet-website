#!/usr/bin/env python3
"""Derive every web asset from the single source `logo.png`.

The repository keeps one 2048×2048 master. Everything the site serves — the
sized marks, the white variant the guide calls for on dark grounds, the favicon
set, the PWA icons and the per-locale Open Graph cards — is generated here so
the master stays the only file anyone edits.

    python3 scripts/build_assets.py

Re-run it after changing `logo.png`, the palette in `main.css`, or the
`seo.ogTagline` / `site.tagline` strings in the locale catalogs.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "logo.png"
PUBLIC = ROOT / "public"
CACHE = ROOT / ".cache" / "fonts"

# Straight from charte-graphique.html.
ABYSS = (1, 22, 137)
PLUM = (91, 16, 139)
PERIWINKLE = (140, 129, 197)
AQUA_300 = (174, 229, 226)
INDIGO_200 = (214, 214, 228)
WHITE = (255, 255, 255)

MARK_SIZES = (64, 128, 256, 512)
ICON_BG = WHITE

SPACE_GROTESK_URL = (
    "https://github.com/floriankarsten/space-grotesk/raw/master/fonts/otf/SpaceGrotesk-Bold.otf"
)
INTER_CANDIDATES = (
    Path("/usr/share/fonts/opentype/inter/Inter-Regular.otf"),
    Path("/usr/share/fonts/truetype/inter/Inter-Regular.ttf"),
)
MONO_CANDIDATES = (
    Path.home() / ".local/share/fonts/JetBrainsMonoNerdFont-Regular.ttf",
    Path("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"),
)


def log(message: str) -> None:
    print(f"  {message}")


def trimmed_master() -> Image.Image:
    """The master, cropped to its visible ink with a one-cube margin.

    The guide asks for "une marge égale à la largeur d'un cube" around the
    mark. The PNG's alpha carries a faint halo, so the bounding box is taken
    above a threshold rather than from `getbbox()`, which would return the
    whole canvas.
    """
    image = Image.open(SOURCE).convert("RGBA")
    mask = image.getchannel("A").point(lambda a: 255 if a > 24 else 0)
    box = mask.getbbox()
    if box is None:
        raise SystemExit("logo.png appears to be fully transparent")

    left, top, right, bottom = box
    side = max(right - left, bottom - top)
    padding = round(side * 0.06)

    # Re-centre on a square so every derived size keeps the same proportions.
    cx, cy = (left + right) // 2, (top + bottom) // 2
    half = side // 2 + padding
    square = image.crop((cx - half, cy - half, cx + half, cy + half))

    square = normalise_alpha(square)
    log(f"master trimmed to {square.width}×{square.height} (from {image.width}×{image.height})")
    return square


def normalise_alpha(image: Image.Image) -> Image.Image:
    """Make the mark's solid strokes fully opaque.

    The master's strokes top out around 75% alpha, which washes the colours out
    on a white tile and turns the white variant grey. Stretching alpha so the
    dominant stroke value reaches 255 restores the intended density while
    keeping the anti-aliased edges soft.
    """
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    # The most common non-transparent value is the body of the stroke.
    solid = max(range(32, 256), key=lambda value: histogram[value])
    if solid >= 250:
        return image

    scale = 255 / solid
    stretched = alpha.point(lambda a: min(255, round(a * scale)))
    out = image.copy()
    out.putalpha(stretched)
    log(f"alpha stretched: stroke value {solid} → 255")
    return out


def white_variant(mark: Image.Image) -> Image.Image:
    """The guide's white version: the mark's own shape, filled flat white."""
    white = Image.new("RGBA", mark.size, (*WHITE, 0))
    white.putalpha(mark.getchannel("A"))
    return white


def on_tile(mark: Image.Image, size: int, *, padding: float = 0.14, bg=ICON_BG) -> Image.Image:
    """Mark centred on an opaque tile — favicons and PWA icons need a ground."""
    tile = Image.new("RGBA", (size, size), (*bg, 255))
    inner = round(size * (1 - padding * 2))
    resized = mark.resize((inner, inner), Image.LANCZOS)
    offset = (size - inner) // 2
    tile.alpha_composite(resized, (offset, offset))
    return tile


def save_png(image: Image.Image, path: Path, *, optimise: bool = True) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)
    if optimise and shutil.which("optipng"):
        subprocess.run(
            ["optipng", "-quiet", "-o2", str(path)],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def find_font(candidates: tuple[Path, ...]) -> Path | None:
    return next((path for path in candidates if path.exists()), None)


def space_grotesk() -> Path | None:
    """Space Grotesk is not packaged on most systems; cache a copy locally."""
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / "SpaceGrotesk-Bold.otf"
    if cached.exists():
        return cached
    try:
        log("downloading Space Grotesk (display face for the OG cards)…")
        with urllib.request.urlopen(SPACE_GROTESK_URL, timeout=30) as response:
            cached.write_bytes(response.read())
        return cached
    except Exception as error:  # noqa: BLE001 - a missing face must not break the build
        print(f"  ! could not fetch Space Grotesk ({error}); falling back to Inter", file=sys.stderr)
        return None


def load(path: Path | None, size: int, fallback: Path | None) -> ImageFont.FreeTypeFont:
    for candidate in (path, fallback):
        if candidate and candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default(size)


def isometric_hatching(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    """The guide's 48×28 isometric grid, drawn over the core gradient."""
    colour = (*PERIWINKLE, 46)
    step_x, step_y = 48, 28
    for x in range(-height, width + height, step_x):
        draw.line([(x, 0), (x + height * step_x / step_y, height)], fill=colour, width=1)
        draw.line([(x, height), (x + height * step_x / step_y, 0)], fill=colour, width=1)


def core_gradient(width: int, height: int) -> Image.Image:
    """`linear-gradient(160deg, abyss, plum)`, approximated on the diagonal."""
    base = Image.new("RGB", (width, height))
    pixels = base.load()
    # 160deg in CSS runs mostly downward with a slight rightward lean.
    for y in range(height):
        for x in range(0, width, 4):
            t = min(1.0, max(0.0, (y / height) * 0.86 + (x / width) * 0.14))
            colour = tuple(round(a + (b - a) * t) for a, b in zip(ABYSS, PLUM))
            for dx in range(4):
                if x + dx < width:
                    pixels[x + dx, y] = colour
    return base


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join([*current, word])
        if draw.textlength(trial, font=font) <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def build_og_card(mark: Image.Image, locale: str, name: str, tagline: str, fonts: dict) -> Image.Image:
    width, height = 1200, 630
    card = core_gradient(width, height).convert("RGBA")

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    isometric_hatching(ImageDraw.Draw(overlay), width, height)
    card.alpha_composite(overlay)

    draw = ImageDraw.Draw(card)

    logo_size = 208
    text_x = 88 + logo_size + 56
    max_text = width - text_x - 88

    # Lay the text block out first so the logo can be centred against it.
    tagline_lines = wrap(draw, tagline, fonts["body"], max_text)[:3]
    name_height = 84
    block_height = name_height + 18 + len(tagline_lines) * 44
    block_top = (height - block_height) // 2 - 14

    logo = white_variant(mark).resize((logo_size, logo_size), Image.LANCZOS)
    card.alpha_composite(logo, (88, (height - logo_size) // 2 - 14))

    draw.text((text_x, block_top), name, font=fonts["display"], fill=WHITE)

    y = block_top + name_height + 18
    for line in tagline_lines:
        draw.text((text_x, y), line, font=fonts["body"], fill=INDIGO_200)
        y += 44

    draw.text((text_x, height - 108), "cachet.alchemic.studio", font=fonts["mono"], fill=AQUA_300)

    # The spectrum hairline, the guide's signature, used once on the card.
    for x in range(width):
        t = x / max(1, width - 1)
        stops = [(17, 207, 201), (120, 143, 190), (67, 62, 161), (125, 68, 163), (192, 22, 162)]
        segment = t * (len(stops) - 1)
        i = min(int(segment), len(stops) - 2)
        local = segment - i
        colour = tuple(round(a + (b - a) * local) for a, b in zip(stops[i], stops[i + 1]))
        draw.line([(x, 0), (x, 5)], fill=colour)

    return card.convert("RGB")


def main() -> int:
    if not SOURCE.exists():
        print(f"error: {SOURCE} not found", file=sys.stderr)
        return 1

    PUBLIC.mkdir(exist_ok=True)
    mark = trimmed_master()
    white = white_variant(mark)

    print("Marks")
    for size in MARK_SIZES:
        save_png(mark.resize((size, size), Image.LANCZOS), PUBLIC / f"logo-{size}.png")
        save_png(white.resize((size, size), Image.LANCZOS), PUBLIC / f"logo-white-{size}.png")
        log(f"logo-{size}.png / logo-white-{size}.png")

    save_png(mark.resize((1024, 1024), Image.LANCZOS), PUBLIC / "logo.png")
    log("logo.png (1024, full colour master for sharing)")

    print("Icons")
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    ico = on_tile(mark, 256, padding=0.08)
    ico.save(PUBLIC / "favicon.ico", format="ICO", sizes=ico_sizes)
    log("favicon.ico (16/32/48/64)")

    save_png(on_tile(mark, 96, padding=0.08), PUBLIC / "favicon-96.png")
    save_png(on_tile(mark, 180, padding=0.12), PUBLIC / "apple-touch-icon.png")
    save_png(on_tile(mark, 192, padding=0.1), PUBLIC / "icon-192.png")
    save_png(on_tile(mark, 512, padding=0.1), PUBLIC / "icon-512.png")
    # Maskable icons are cropped to a circle by some launchers: extra margin.
    save_png(on_tile(mark, 512, padding=0.2), PUBLIC / "icon-maskable-512.png")
    log("favicon-96, apple-touch-icon, icon-192/512, icon-maskable-512")

    print("Open Graph cards")
    inter = find_font(INTER_CANDIDATES)
    mono = find_font(MONO_CANDIDATES)
    display = space_grotesk()
    fonts = {
        "display": load(display, 76, inter),
        "body": load(inter, 30, display),
        "mono": load(mono, 22, inter),
    }

    locales_dir = ROOT / "i18n" / "locales"
    for path in sorted(locales_dir.glob("*.json")):
        locale = path.stem
        messages = json.loads(path.read_text(encoding="utf-8"))
        name = messages.get("site", {}).get("name", "Cachet")
        tagline = messages.get("seo", {}).get("ogTagline") or messages.get("site", {}).get("tagline", "")
        card = build_og_card(mark, locale, name, tagline, fonts)
        out = PUBLIC / "og" / f"og-{locale}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        card.save(out, "PNG", optimize=True)
        log(f"og/og-{locale}.png — {tagline[:52]}")

    print("Manifest")
    manifest = {
        "name": "Cachet",
        "short_name": "Cachet",
        "description": "Batch PDF signing with the Belgian eID card",
        "start_url": "/",
        "display": "browser",
        "background_color": "#F9F9F9",
        "theme_color": "#011689",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (PUBLIC / "site.webmanifest").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    log("site.webmanifest")

    (PUBLIC / "CNAME").write_text("cachet.alchemic.studio\n", encoding="utf-8")
    log("CNAME")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
