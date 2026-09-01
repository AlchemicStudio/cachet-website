# Cachet — website

The site for [Cachet](https://github.com/AlchemicStudio/Cachet), a batch PDF
signer for the Belgian eID card. Nuxt 4 + TypeScript + Tailwind CSS v4 +
Nuxt UI, generated as a fully static site and served from GitHub Pages at
**cachet.alchemic.studio**.

## What it is

Three pages — `/`, `/docs` and `/news` — in **seven languages**: English (at
the root), then `/fr/`, `/nl/`, `/de/`, `/es/`, `/pt/` and `/it/`.

Download links and the release list come **live from the GitHub API on every
page load**. Because the site is static, the same data is also prerendered into
each page at build time, so nothing is ever empty: the baked-in copy paints
immediately, the browser refreshes it from GitHub on mount, and if that call
fails — the anonymous API allows 60 requests an hour per IP — the cached copy
stays on screen behind a short notice. A committed snapshot
(`app/data/releases-snapshot.json`) backs the build itself.

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm generate       # static output in .output/public
```

## Where the content lives

| Content | Source | How to change it |
|---|---|---|
| Interface strings, home page, feature list, walkthrough, CLI reference | `i18n/locales/<locale>.json` | Edit `en.json`, then the six others; run `pnpm check:locales` |
| The reference sections on `/docs` (modes, PAdES levels, AES vs QES, glossary, sources) | `i18n/docs/<locale>.json` | **Generated** — edit `i18n_docs.py` in the app, then re-run `pnpm docs` |
| Ordering, icons, anchors, CLI examples | `app/content.ts` | Edit directly; prose stays in the catalogs |
| Release data | GitHub API | Nothing to edit; `pnpm snapshot` refreshes the offline fallback |
| Colours, type, gradients | `app/assets/css/main.css` | Transcribed from `charte-graphique.html` |
| Domain, repository, licence | `shared/site.ts` | One place, plus `public/CNAME` |

**Italian is the exception.** The desktop app ships six languages, so
`extract_app_docs.py` produces `en/fr/nl/de/es/pt`; `i18n/docs/it.json` is
translated by hand and has to be updated alongside the app's `i18n_docs.py`.
`app/content.ts` lists which locales have a reference — a locale left out of
that list falls back to English behind a visible notice rather than silently
showing the wrong language.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm generate` | Develop / build the static site |
| `pnpm docs` | Re-import the app's reference documentation from a local Cachet checkout (`--source ../python`) |
| `pnpm check:locales` | Verify every locale has the same keys and the same `{placeholders}` as English |
| `pnpm snapshot` | Refresh the committed release fallback from the GitHub API |
| `pnpm assets` | Rebuild every web asset from `logo.png` — marks, favicons, PWA icons, per-locale OG cards |
| `pnpm screenshots` | Re-capture the wizard walkthrough from a local Cachet checkout (needs an X display) |

`pnpm assets` and `pnpm screenshots` need Python with Pillow; screenshots also
need ImageMagick and the app's own virtualenv:

```bash
../python/venv/bin/python scripts/capture_screenshots.py --source ../python
```

The capture script drives the wizard programmatically against three throwaway
PDFs it generates itself, signs them in image mode (no card, no network), and
deletes the workspace afterwards. No real document is ever opened.

## Design

Every colour, ramp, gradient and type step in `app/assets/css/main.css` is
transcribed from `charte-graphique.html`. Two things to know when editing:

- **The `spectrum` gradient appears once per screen.** It is the signature
  element; the guide is explicit that repeating it drains it. It currently
  lives in the hairline under the header.
- **Aqua never carries text on a light background** — aqua 700 on white is
  2.75:1. It is used for the focus ring, for wireframe rules, and on dark
  grounds, where aqua 400 on `#0A0713` reaches AAA.

The guide describes an earlier, cube-based mark and references files that are
not in this repository (`logo-mark-white.png`, `design-tokens.json`). Its
palette still holds: the stroke gradient of the current `logo.png` is exactly
the guide's `spectrum`. The cube-face descriptions are stale; the values are not.

## Analytics

Google Tag Manager container `GTM-PS4XN2Z2`, wired the way Tag Manager's own
install instructions specify: the loader inline in `<head>`, the `<noscript>`
frame first inside `<body>`. Both are emitted by `nuxt.config.ts` and land in
every prerendered page, including `404.html`. The container ID lives in
`shared/site.ts` — set `GTM_ID` to an empty string and neither tag is emitted
at all, which is what a fork should run with.

The loader is ordered *after* the language-redirect script on purpose. That
script calls `location.replace`, so a first-time non-English visitor never
finishes loading `/`; firing the tag first would count a page nobody saw.

**One thing has to be configured in Tag Manager.** After hydration the site is
a single-page app, so only the first page of a visit causes a document load.
`app/plugins/gtm-pageview.client.ts` pushes a `cachet_pageview` event on every
subsequent route change, carrying `page_path`, `page_location`, `page_title`
and `page_locale`. Without a matching trigger, the container sees only landing
pages:

1. In Tag Manager, create a **Custom Event** trigger on `cachet_pageview`.
2. Point your GA4 event tag at it, alongside the built-in page view.

The plugin deliberately does not fire on the initial load (the container
already counted it), on `/it/` → `/it` trailing-slash redirects, or on in-page
anchors like `#glossary` — each of those would otherwise inflate the numbers.

> **Consent.** The tag currently loads for everyone, on first paint. Visitors
> in the EU are covered by the ePrivacy directive, under which analytics
> cookies generally need consent *before* they are set. If that matters for
> this audience, the tag needs to move behind a consent banner — see the note
> in `shared/site.ts`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`. It also accepts a `repository_dispatch` of type
`cachet-release`, so the app's own release workflow can refresh the site:

```bash
gh api repos/AlchemicStudio/cachet-website/dispatches -f event_type=cachet-release
```

To change the domain, edit `shared/site.ts` and `public/CNAME`.

## Licence

The site's code follows the application: **GPL-3.0**.
