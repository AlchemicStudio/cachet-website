/**
 * Single source of truth for anything that depends on where the site lives.
 * Changing the domain is a one-line edit here (plus `public/CNAME`).
 */
export const SITE = {
  url: 'https://cachet.alchemic.studio',
  name: 'Cachet',
  repo: 'AlchemicStudio/Cachet',
  repoUrl: 'https://github.com/AlchemicStudio/Cachet',
  license: 'GPL-3.0',
  org: 'Alchemic Studio',
  orgUrl: 'https://github.com/AlchemicStudio'
} as const

export interface LocaleDef {
  /** Route prefix and message-file basename. */
  code: string
  /** BCP 47 tag used for `lang`, `hreflang` and `Intl` formatting. */
  language: string
  /** Endonym, shown in the language switcher. */
  name: string
}

export const LOCALES: LocaleDef[] = [
  { code: 'en', language: 'en', name: 'English' },
  { code: 'fr', language: 'fr', name: 'Français' },
  { code: 'nl', language: 'nl', name: 'Nederlands' },
  { code: 'de', language: 'de', name: 'Deutsch' },
  { code: 'es', language: 'es', name: 'Español' },
  { code: 'pt', language: 'pt', name: 'Português' },
  { code: 'it', language: 'it', name: 'Italiano' }
]

export const GITHUB_API = 'https://api.github.com'

/** Remembers the visitor's language choice across visits. */
export const LOCALE_COOKIE = 'cachet_locale'
