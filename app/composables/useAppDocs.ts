export interface DocLine {
  label: string | null
  text: string
  bullet: boolean
}

export interface DocItem {
  term: string | null
  text: string
  lines: DocLine[]
}

export type DocBlock =
  | { type: 'p', text: string }
  | { type: 'definition', term: string, lines: DocLine[] }
  | { type: 'list', items: DocItem[] }

export interface DocSectionData {
  id: string
  title: string
  blocks: DocBlock[]
}

export interface AppDocs {
  sections: DocSectionData[]
  sources: {
    heading: string
    intro: string
    items: { title: string, url: string }[]
  }
}

/**
 * Loaders are declared one by one rather than built from a template string so
 * Vite can statically analyse them: each locale becomes its own chunk and a
 * page only ever downloads the language it is rendering.
 */
type DocsModule = Promise<{ default: unknown }>

const LOADERS: Record<string, () => DocsModule> = {
  en: () => import('~~/i18n/docs/en.json'),
  fr: () => import('~~/i18n/docs/fr.json'),
  nl: () => import('~~/i18n/docs/nl.json'),
  de: () => import('~~/i18n/docs/de.json'),
  es: () => import('~~/i18n/docs/es.json'),
  pt: () => import('~~/i18n/docs/pt.json'),
  it: () => import('~~/i18n/docs/it.json')
}

/**
 * The application's own reference documentation, ported locale by locale from
 * `i18n_docs.py`. Loading it separately from the UI catalog keeps ~25 kB of
 * long-form prose off every page that does not show it.
 */
export function useAppDocs() {
  const { locale } = useI18n()

  const { data } = useAsyncData<AppDocs | null>(
    () => `app-docs-${locale.value}`,
    async () => {
      const load = LOADERS[locale.value] ?? LOADERS.en!
      const module = await load()
      return (module.default ?? module) as AppDocs
    },
    { watch: [locale] }
  )

  return data
}
