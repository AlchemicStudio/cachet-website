import { LOCALES } from './site'

/**
 * The documentation is one page per section, each on a URL written in the
 * reader's own language: `/docs/the-three-modes`, `/de/docs/die-drei-modi`.
 *
 * Slugs live here rather than in the message catalogs because they are routing,
 * not prose: `nuxt.config.ts` reads them to enumerate the pages to prerender,
 * and `[slug].vue` reads them to resolve a URL back to a section. Keeping them
 * in one typed table is also what lets the language switcher rewrite the slug
 * when you change language mid-page.
 *
 * Slugs are ASCII, lowercase and hyphenated — no accents, so they survive
 * being copied, mailed and typed by hand.
 */
export const DOC_SECTION_IDS = [
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

export type DocSectionId = (typeof DOC_SECTION_IDS)[number]

/** section id -> locale -> slug */
export const DOC_SLUGS: Record<DocSectionId, Record<string, string>> = {
  features: {
    en: 'features',
    fr: 'fonctionnalites',
    nl: 'functies',
    de: 'funktionen',
    es: 'funciones',
    pt: 'funcionalidades',
    it: 'funzionalita'
  },
  modes: {
    en: 'the-three-modes',
    fr: 'les-trois-modes',
    nl: 'de-drie-modi',
    de: 'die-drei-modi',
    es: 'los-tres-modos',
    pt: 'os-tres-modos',
    it: 'le-tre-modalita'
  },
  walkthrough: {
    en: 'signing-step-by-step',
    fr: 'signer-etape-par-etape',
    nl: 'stap-voor-stap-ondertekenen',
    de: 'schritt-fuer-schritt-signieren',
    es: 'firmar-paso-a-paso',
    pt: 'assinar-passo-a-passo',
    it: 'firmare-passo-per-passo'
  },
  cli: {
    en: 'command-line',
    fr: 'ligne-de-commande',
    nl: 'opdrachtregel',
    de: 'befehlszeile',
    es: 'linea-de-comandos',
    pt: 'linha-de-comandos',
    it: 'riga-di-comando'
  },
  levels: {
    en: 'signature-levels',
    fr: 'niveaux-de-signature',
    nl: 'handtekeningniveaus',
    de: 'signaturstufen',
    es: 'niveles-de-firma',
    pt: 'niveis-de-assinatura',
    it: 'livelli-di-firma'
  },
  tiers: {
    en: 'aes-or-qes',
    fr: 'aes-ou-qes',
    nl: 'aes-of-qes',
    de: 'aes-oder-qes',
    es: 'aes-o-qes',
    pt: 'aes-ou-qes',
    it: 'aes-o-qes'
  },
  requirements: {
    en: 'requirements',
    fr: 'prerequis',
    nl: 'vereisten',
    de: 'voraussetzungen',
    es: 'requisitos',
    pt: 'requisitos',
    it: 'requisiti'
  },
  install: {
    en: 'installation',
    fr: 'installation',
    nl: 'installatie',
    de: 'installation',
    es: 'instalacion',
    pt: 'instalacao',
    it: 'installazione'
  },
  glossary: {
    en: 'glossary',
    fr: 'glossaire',
    nl: 'woordenlijst',
    de: 'glossar',
    es: 'glosario',
    pt: 'glossario',
    it: 'glossario'
  },
  sources: {
    en: 'sources',
    fr: 'sources',
    nl: 'bronnen',
    de: 'quellen',
    es: 'fuentes',
    pt: 'fontes',
    it: 'fonti'
  },
  legal: {
    en: 'things-to-know',
    fr: 'a-savoir',
    nl: 'goed-om-te-weten',
    de: 'wissenswertes',
    es: 'conviene-saber',
    pt: 'a-ter-em-conta',
    it: 'da-sapere'
  }
}

/** The slug for one section in one locale, falling back to English. */
export function docSlug(section: DocSectionId, locale: string): string {
  const slugs = DOC_SLUGS[section]
  return slugs[locale] ?? slugs.en!
}

/** Resolves a URL segment back to the section it names, in a given locale. */
export function sectionFromSlug(slug: string, locale: string): DocSectionId | null {
  return (
    DOC_SECTION_IDS.find(id => docSlug(id, locale) === slug)
    // A slug from another language still resolves, so a link shared between
    // colleagues reading in different languages does not dead-end.
    ?? DOC_SECTION_IDS.find(id => Object.values(DOC_SLUGS[id]).includes(slug))
    ?? null
  )
}

/** Every documentation path, for `nitro.prerender.routes`. */
export function allDocRoutes(): string[] {
  const routes: string[] = []
  for (const { code } of LOCALES) {
    const prefix = code === 'en' ? '' : `/${code}`
    routes.push(`${prefix}/docs`)
    for (const id of DOC_SECTION_IDS) {
      routes.push(`${prefix}/docs/${docSlug(id, code)}`)
    }
  }
  return routes
}

/** `{ en: { slug: '…' }, fr: { slug: '…' }, … }` for `useSetI18nParams`. */
export function slugParamsForLocales(section: DocSectionId): Record<string, { slug: string }> {
  return Object.fromEntries(
    LOCALES.map(({ code }) => [code, { slug: docSlug(section, code) }])
  )
}
