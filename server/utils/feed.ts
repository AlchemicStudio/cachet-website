import { LOCALES, SITE, GITHUB_API } from '#shared/site'
import type { Release } from '#shared/types'
import snapshot from '../../app/data/releases-snapshot.json'

interface GhAsset { name: string, size: number, download_count: number, browser_download_url: string, digest?: string | null }
interface GhRelease {
  tag_name: string
  name: string | null
  body: string | null
  published_at: string | null
  created_at: string
  prerelease: boolean
  draft: boolean
  html_url: string
  assets: GhAsset[]
}

/**
 * Releases for the feed. This runs during `nuxt generate` only — the feed is a
 * static file — so it may use the build token, and falls back to the committed
 * snapshot exactly like the pages do.
 */
export async function getFeedReleases(token?: string): Promise<Release[]> {
  try {
    const raw = await $fetch<GhRelease[]>(`${GITHUB_API}/repos/${SITE.repo}/releases`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      query: { per_page: 30 },
      timeout: 10_000
    })
    const releases = raw.filter(r => !r.draft).map(r => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      body: r.body || '',
      publishedAt: r.published_at || r.created_at,
      prerelease: r.prerelease,
      draft: r.draft,
      htmlUrl: r.html_url,
      assets: []
    })) as Release[]
    if (releases.length) return releases
  } catch {
    // Fall through to the snapshot.
  }
  return (snapshot as { releases: Release[] }).releases
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}

function xml(value: string): string {
  return value.replace(/[&<>"']/g, c => XML_ESCAPES[c]!)
}

/** Locale-prefixed site path, matching the `prefix_except_default` strategy. */
export function localeUrl(locale: string, path = ''): string {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return `${SITE.url}${prefix}${path}`
}

export function buildAtomFeed(locale: string, releases: Release[], strings: { title: string, subtitle: string }): string {
  const language = LOCALES.find(l => l.code === locale)?.language ?? locale
  const self = localeUrl(locale, '/feed.xml')
  const home = localeUrl(locale, '/news')
  const updated = releases[0]?.publishedAt ?? new Date().toISOString()

  const entries = releases.map(release => `  <entry>
    <title>${xml(release.name)}</title>
    <id>tag:${xml(new URL(SITE.url).host)},${release.publishedAt.slice(0, 10)}:${xml(release.tag)}</id>
    <link rel="alternate" type="text/html" href="${xml(release.htmlUrl)}"/>
    <updated>${xml(release.publishedAt)}</updated>
    <published>${xml(release.publishedAt)}</published>
    <content type="text">${xml(release.body)}</content>
  </entry>`).join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${xml(language)}">
  <title>${xml(strings.title)}</title>
  <subtitle>${xml(strings.subtitle)}</subtitle>
  <id>${xml(self)}</id>
  <link rel="self" type="application/atom+xml" href="${xml(self)}"/>
  <link rel="alternate" type="text/html" href="${xml(home)}"/>
  <updated>${xml(updated)}</updated>
  <author><name>${xml(SITE.org)}</name><uri>${xml(SITE.orgUrl)}</uri></author>
  <generator uri="${xml(SITE.url)}">${xml(SITE.name)}</generator>
${entries}
</feed>
`
}

/** Feed title and subtitle, read straight from the locale's message catalog. */
export async function feedStrings(locale: string): Promise<{ title: string, subtitle: string }> {
  const messages = await loadMessages(locale)
  return {
    title: `${messages.site?.name ?? SITE.name} — ${messages.news?.title ?? 'News'}`,
    subtitle: messages.news?.lead ?? messages.site?.tagline ?? ''
  }
}

interface Messages {
  site?: { name?: string, tagline?: string }
  news?: { title?: string, lead?: string }
}

const CATALOGS: Record<string, () => Promise<{ default: Messages }>> = {
  en: () => import('../../i18n/locales/en.json'),
  fr: () => import('../../i18n/locales/fr.json'),
  nl: () => import('../../i18n/locales/nl.json'),
  de: () => import('../../i18n/locales/de.json'),
  es: () => import('../../i18n/locales/es.json'),
  pt: () => import('../../i18n/locales/pt.json'),
  it: () => import('../../i18n/locales/it.json')
}

async function loadMessages(locale: string): Promise<Messages> {
  const load = CATALOGS[locale] ?? CATALOGS.en!
  const module = await load()
  return module.default ?? (module as unknown as Messages)
}
