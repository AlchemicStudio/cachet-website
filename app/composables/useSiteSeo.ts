import { SITE } from '#shared/site'

/**
 * Per-page metadata. `useLocaleHead` in `app.vue` already emits the canonical
 * and the seven `hreflang` alternates, so this only adds the title, the
 * description and the Open Graph card — with the locale's own OG image.
 */
export function useSiteSeo(page: 'home' | 'docs' | 'news') {
  const { t, locale } = useI18n()

  const title = computed(() => t(`seo.${page}.title`))
  const description = computed(() => t(`seo.${page}.description`))
  const image = computed(() => `${SITE.url}/og/og-${locale.value}.png`)

  useSeoMeta({
    title: () => (page === 'home' ? title.value : `${title.value} · ${SITE.name}`),
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: SITE.name,
    ogImage: image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => `${SITE.name} — ${t('seo.ogTagline')}`,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image
  })

  useHead({
    titleTemplate: page === 'home' ? undefined : `%s`
  })
}

/**
 * Schema.org description of the application itself, emitted once on the home
 * page. Downloads are versioned, so the tag and the asset URLs are read from
 * the same release data the download card shows.
 */
export function useSoftwareSchema() {
  const { t, locale } = useI18n()
  const { latest } = useReleases()

  useHead(() => ({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE.name,
          description: t('site.description'),
          url: SITE.url,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Linux, Windows',
          inLanguage: locale.value,
          softwareVersion: latest.value?.tag,
          datePublished: latest.value?.publishedAt,
          downloadUrl: latest.value?.assets[0]?.url ?? `${SITE.repoUrl}/releases/latest`,
          license: `${SITE.repoUrl}/blob/main/LICENSE`,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          author: { '@type': 'Organization', name: SITE.org, url: SITE.orgUrl },
          codeRepository: SITE.repoUrl
        })
      }
    ]
  }))
}
