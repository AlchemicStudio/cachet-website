<script setup lang="ts">
import { LOCALES, SITE } from '#shared/site'
import {
  DOC_SECTION_IDS,
  docSlug,
  sectionFromSlug,
  slugParamsForLocales,
  type DocSectionId
} from '#shared/docs'
import { SECTION_ICONS } from '~/content'

import DocsCli from '~/components/docs/Cli.vue'
import DocsFeatures from '~/components/docs/Features.vue'
import DocsGlossary from '~/components/docs/Glossary.vue'
import DocsInstall from '~/components/docs/Install.vue'
import DocsLegal from '~/components/docs/Legal.vue'
import DocsLevels from '~/components/docs/Levels.vue'
import DocsModes from '~/components/docs/Modes.vue'
import DocsRequirements from '~/components/docs/Requirements.vue'
import DocsSources from '~/components/docs/Sources.vue'
import DocsTiers from '~/components/docs/Tiers.vue'
import DocsWalkthrough from '~/components/docs/Walkthrough.vue'

/**
 * One documentation section, at a URL written in the reader's language:
 * `/docs/the-three-modes`, `/de/docs/die-drei-modi`.
 *
 * Rekeying on the full path gives every section a fresh component instance, so
 * moving between sections behaves exactly like arriving at one directly —
 * scroll position, focus and the reference fetch all reset.
 */
definePageMeta({
  key: route => route.fullPath
})

const SECTIONS = {
  features: DocsFeatures,
  modes: DocsModes,
  walkthrough: DocsWalkthrough,
  cli: DocsCli,
  levels: DocsLevels,
  tiers: DocsTiers,
  requirements: DocsRequirements,
  install: DocsInstall,
  glossary: DocsGlossary,
  sources: DocsSources,
  legal: DocsLegal
} as const

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = String(route.params.slug ?? '')
const section = sectionFromSlug(slug, locale.value)

if (!section) {
  throw createError({
    statusCode: 404,
    statusMessage: `No documentation section at "${slug}"`,
    fatal: true
  })
}

const current: DocSectionId = section

/**
 * Which slug this page has in each language, so changing language from
 * `/de/docs/die-drei-modi` lands on `/docs/the-three-modes` rather than a 404.
 *
 * `useSetI18nParams` covers the `hreflang` alternates in the head;
 * `setLocalisedPaths` covers the switcher in the header, which renders before
 * this page's setup and so cannot see the i18n params in time.
 */
const setI18nParams = useSetI18nParams()
setI18nParams(slugParamsForLocales(current))

setLocalisedPaths(
  route.path,
  Object.fromEntries(
    LOCALES.map(({ code }) => [
      code,
      `${code === 'en' ? '' : `/${code}`}/docs/${docSlug(current, code)}`
    ])
  )
)

const title = computed(() => t(`docs.sections.${current}`))
const description = computed(() => t(`docs.descriptions.${current}`))

const canonical = computed(
  () => `${SITE.url}${localePath('/docs')}/${docSlug(current, locale.value)}`
)

useSeoMeta({
  title: () => `${title.value} · ${t('docs.title')} · ${SITE.name}`,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'article',
  ogSiteName: SITE.name,
  ogUrl: canonical,
  ogImage: () => `${SITE.url}/og/og-${locale.value}.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: () => `${SITE.url}/og/og-${locale.value}.png`
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }]
}))

/** Previous and next section, so the docs can be read straight through. */
const position = DOC_SECTION_IDS.indexOf(current)

const previous = computed(() => {
  const id = DOC_SECTION_IDS[position - 1]
  return id
    ? { label: t(`docs.sections.${id}`), to: `${localePath('/docs')}/${docSlug(id, locale.value)}` }
    : { label: t('docs.sections.overview'), to: localePath('/docs') }
})

const next = computed(() => {
  const id = DOC_SECTION_IDS[position + 1]
  return id
    ? { label: t(`docs.sections.${id}`), to: `${localePath('/docs')}/${docSlug(id, locale.value)}` }
    : null
})
</script>

<template>
  <div>
    <UContainer class="py-12">
      <div class="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <DocsSidebar :current="current" />

        <div class="min-w-0">
          <nav class="flex items-center gap-1.5 text-sm text-muted" :aria-label="t('docs.breadcrumb')">
            <NuxtLink :to="localePath('/docs')" class="hover:text-highlighted">
              {{ t('docs.title') }}
            </NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="size-3.5 text-dimmed" aria-hidden="true" />
            <span class="text-toned">{{ title }}</span>
          </nav>

          <header class="mt-4">
            <h1 class="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-highlighted">
              <UIcon :name="SECTION_ICONS[current]" class="size-7 shrink-0 text-primary" aria-hidden="true" />
              {{ title }}
            </h1>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ description }}
            </p>
          </header>

          <div class="mt-8">
            <component :is="SECTIONS[current]" />
          </div>

          <!-- Read straight through, or step back to the index. -->
          <nav
            class="mt-16 grid gap-3 border-t border-default pt-8 sm:grid-cols-2"
            :aria-label="t('docs.pagerLabel')"
          >
            <NuxtLink
              :to="previous.to"
              class="group rounded-[var(--ui-radius)] border border-default p-4 transition-colors hover:border-accented"
            >
              <span class="eyebrow flex items-center gap-1.5 text-dimmed">
                <UIcon name="i-lucide-arrow-left" class="size-3.5" aria-hidden="true" />
                {{ t('docs.previous') }}
              </span>
              <span class="mt-1.5 block font-display text-sm font-semibold text-highlighted">
                {{ previous.label }}
              </span>
            </NuxtLink>

            <NuxtLink
              v-if="next"
              :to="next.to"
              class="group rounded-[var(--ui-radius)] border border-default p-4 text-right transition-colors hover:border-accented sm:col-start-2"
            >
              <span class="eyebrow flex items-center justify-end gap-1.5 text-dimmed">
                {{ t('docs.next') }}
                <UIcon name="i-lucide-arrow-right" class="size-3.5" aria-hidden="true" />
              </span>
              <span class="mt-1.5 block font-display text-sm font-semibold text-highlighted">
                {{ next.label }}
              </span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </UContainer>
  </div>
</template>
