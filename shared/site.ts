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

/**
 * Google Tag Manager container. Empty disables analytics entirely — the
 * consent banner does not appear and nothing is ever requested from Google —
 * which is what forks should run with.
 *
 * The container is never loaded on its own: `plugins/gtm.client.ts` waits for
 * the visitor to agree. See `composables/useConsent.ts`.
 */
export const GTM_ID = 'GTM-PS4XN2Z2'

/** Records whether the visitor agreed to analytics. */
export const CONSENT_COOKIE = 'cachet_consent'

/** Locale codes that appear as a URL prefix — every locale except the default. */
const PREFIXED = LOCALES.filter(l => l.code !== 'en').map(l => l.code)

/**
 * The same path in another language.
 *
 * `switchLocalePath` cannot be trusted for this: with `prefix_except_default`
 * it returns the *current* path when asked for the default locale, so from
 * `/it/news` the English entry pointed at `/it/news`. Every other language
 * worked, which made it easy to miss — but it left anyone browsing in one of
 * the six prefixed languages with no way back to English.
 *
 * Swapping the prefix is unambiguous and needs no route table. Pages whose slug
 * differs per language (the documentation sections) override this through
 * `useLocalisedPaths`.
 */
export function pathInLocale(path: string, locale: string): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length && PREFIXED.includes(segments[0]!)) segments.shift()

  const rest = segments.join('/')
  if (locale === 'en') return rest ? `/${rest}` : '/'
  return rest ? `/${locale}/${rest}` : `/${locale}`
}
