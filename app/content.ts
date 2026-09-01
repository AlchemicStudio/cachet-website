/**
 * Ordering, icons and links for content whose *prose* lives in the i18n
 * catalogs. Keeping the structure here rather than in seven JSON files means a
 * new feature or wizard step is added once, and every locale that has not been
 * translated yet falls back visibly instead of silently dropping the entry.
 */
import { SITE } from '#shared/site'

export interface FeatureDef {
  id: string
  icon: string
}

/** Feature grid on `/` and `/docs`, in display order. */
export const FEATURES: FeatureDef[] = [
  { id: 'batch', icon: 'i-lucide-layers' },
  { id: 'modes', icon: 'i-lucide-git-fork' },
  { id: 'pades', icon: 'i-lucide-shield-check' },
  { id: 'timestamp', icon: 'i-lucide-clock' },
  { id: 'ltv', icon: 'i-lucide-archive' },
  { id: 'verify', icon: 'i-lucide-badge-check' },
  { id: 'template', icon: 'i-lucide-ruler' },
  { id: 'placement', icon: 'i-lucide-mouse-pointer-click' },
  { id: 'vignette', icon: 'i-lucide-stamp' },
  { id: 'safety', icon: 'i-lucide-file-lock' },
  { id: 'i18n', icon: 'i-lucide-languages' },
  { id: 'standalone', icon: 'i-lucide-package' }
]

/** The GUI wizard, step by step — mirrors the app's own stepper. */
export const WIZARD_STEPS = [
  { id: 'template', icon: 'i-lucide-file-check-2' },
  { id: 'documents', icon: 'i-lucide-files' },
  { id: 'validation', icon: 'i-lucide-list-checks' },
  { id: 'output', icon: 'i-lucide-folder-output' },
  { id: 'type', icon: 'i-lucide-key-round' },
  { id: 'placement', icon: 'i-lucide-move' },
  { id: 'signing', icon: 'i-lucide-pen-tool' },
  { id: 'report', icon: 'i-lucide-clipboard-check' }
] as const

/** The three signing modes, with the palette each is drawn in. */
export const MODES = [
  { id: 'beid', icon: 'i-lucide-credit-card', accent: 'indigo' },
  { id: 'azure', icon: 'i-lucide-cloud', accent: 'violet' },
  { id: 'image', icon: 'i-lucide-image', accent: 'neutral' }
] as const

/** PAdES baseline levels, weakest to strongest. `b-lta` is Cachet's default. */
export const PADES_LEVELS = [
  { id: 'b-b', offline: true },
  { id: 'b-t', offline: false },
  { id: 'b-lt', offline: false },
  { id: 'b-lta', offline: false, default: true }
] as const

/** Curated CLI surface — the flags a first-time user actually reaches for. */
export const CLI_FLAGS = [
  '--gui',
  '--input',
  '--output',
  '--template',
  '--mode',
  '--pades-level',
  '--page',
  '--x-y',
  '--image-path',
  '--timestamp-url',
  '--digest',
  '--azure-vault-url',
  '--azure-trust-anchors',
  '--refresh-trust-list'
] as const

/** Runtime prerequisites, grouped by the mode that needs them. */
export const REQUIREMENTS = [
  { id: 'beid', icon: 'i-lucide-usb' },
  { id: 'azure', icon: 'i-lucide-globe' },
  { id: 'image', icon: 'i-lucide-check' }
] as const

export const DOC_LINKS = [
  { id: 'readme', url: `${SITE.repoUrl}#readme`, icon: 'i-lucide-book-open' },
  { id: 'build', url: `${SITE.repoUrl}/blob/main/BUILD.md`, icon: 'i-lucide-hammer' },
  { id: 'spec', url: `${SITE.repoUrl}/blob/main/specifications.md`, icon: 'i-lucide-file-text' },
  { id: 'issues', url: `${SITE.repoUrl}/issues`, icon: 'i-lucide-circle-dot' }
] as const

/** Sections of `/docs`, used to build the table of contents and the anchors. */
export const DOC_SECTIONS = [
  'overview',
  'features',
  'modes',
  'walkthrough',
  'cli',
  'levels',
  'tiers',
  'requirements',
  'install',
  'glossary',
  'sources',
  'legal'
] as const

export type DocSection = (typeof DOC_SECTIONS)[number]

/**
 * Locales that have the application's reference documentation.
 *
 * The app itself ships six languages, and `scripts/extract_app_docs.py` ports
 * those verbatim; Italian is translated by hand in `i18n/docs/it.json`. Any
 * locale added here without a matching file breaks the build, and any locale
 * missing from it falls back to English behind a visible notice.
 */
export const REFERENCE_LOCALES = ['en', 'fr', 'nl', 'de', 'es', 'pt', 'it'] as const

/**
 * Commands are the same in every language; only their captions are translated
 * (`docs.cli.examples.*` / `docs.install.*`).
 */
export const CLI_EXAMPLES = [
  {
    id: 'beid',
    command: 'cachet-cli --input ./pdfs --output ./signed --mode beid'
  },
  {
    id: 'offline',
    command: 'cachet-cli --input ./pdfs --output ./signed --pades-level b-b'
  },
  {
    id: 'image',
    command: 'cachet-cli --mode image --template ./pdfs/MODEL.pdf \\\n  --input ./pdfs --output ./signed \\\n  --image-path signature.png --page 1 --x 360 --y 150'
  },
  {
    id: 'azure',
    command: 'cachet-cli --mode azure \\\n  --azure-vault-url https://myorg-sign.vault.azure.net \\\n  --azure-trust-anchors ./internal-ca-chain.pem \\\n  --input ./pdfs --output ./signed'
  },
  { id: 'gui', command: 'cachet' }
] as const

export const INSTALL_SOURCE = `git clone https://github.com/AlchemicStudio/Cachet.git
cd Cachet
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

# Debian / Ubuntu, if the GUI reports tkinter missing:
sudo apt install python3-tk

./venv/bin/python sign_pdfs_beid.py --gui`

/**
 * How the application names its output. Interpolated into the catalogs as
 * `{pattern}` rather than written into them literally: `{name}` is the app's
 * own placeholder, and a message containing raw braces is either swallowed as
 * an interpolation or needs an escape the i18n runtime does not honour.
 */
export const OUTPUT_FILE_PATTERN = '{name}_signe.pdf'

export const VERIFY_COMMANDS = {
  linux: 'sha256sum -c <<< "{checksum}  {file}"',
  windows: 'certutil -hashfile {file} SHA256'
} as const

/** Notices surfaced on `/docs`, with the tone each should be read in. */
export const LEGAL_NOTICES = [
  { id: 'rrn', color: 'warning', icon: 'i-lucide-shield-alert' },
  { id: 'tsa', color: 'info', icon: 'i-lucide-clock-alert' },
  { id: 'aes', color: 'info', icon: 'i-lucide-scale' },
  { id: 'archival', color: 'neutral', icon: 'i-lucide-archive-restore' }
] as const
