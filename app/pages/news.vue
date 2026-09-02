<script setup lang="ts">
import { SITE } from '#shared/site'
import { formatDate } from '~/utils/format'

/**
 * Every published release, newest first. The list is prerendered from the
 * build-time GitHub fetch and replaced by a live one on mount, so it is never
 * empty and never more than a page load out of date.
 */
const { releases } = useReleases()
const { t, locale } = useI18n()

useSiteSeo('news')

/**
 * Built by hand rather than through `localePath`: the feed is a prerendered
 * file, not a Vue route, so asking the router to resolve it only produces a
 * "no match found" warning. The shape mirrors `prefix_except_default`.
 */
const feedPath = computed(() =>
  locale.value === 'en' ? '/feed.xml' : `/${locale.value}/feed.xml`
)

useHead(() => ({
  link: [
    {
      rel: 'alternate',
      type: 'application/atom+xml',
      href: `${SITE.url}${feedPath.value}`,
      title: `${SITE.name} — ${t('news.title')}`
    }
  ]
}))
</script>

<template>
  <div>
    <PageHeader :title="t('news.title')" :lead="t('news.lead')">
      <template #actions>
        <UButton
          :to="feedPath"
          external
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-rss"
        >
          {{ t('news.feed') }}
        </UButton>
      </template>
    </PageHeader>

    <UContainer class="pb-16">
      <div v-if="releases.length" class="space-y-8">
        <article
          v-for="(release, index) in releases"
          :key="release.tag"
          :id="release.tag"
          class="scroll-mt-24 overflow-hidden rounded-[var(--ui-radius)] border border-default bg-default"
        >
          <header class="flex flex-wrap items-center gap-3 border-b border-muted px-6 py-5">
            <h2 class="font-display text-xl font-bold text-highlighted">
              {{ release.name }}
            </h2>
            <UBadge v-if="index === 0 && !release.prerelease" color="secondary" variant="subtle">
              {{ t('news.latest') }}
            </UBadge>
            <UBadge v-if="release.prerelease" color="warning" variant="subtle">
              {{ t('news.prerelease') }}
            </UBadge>

            <time
              :datetime="release.publishedAt"
              class="ml-auto text-sm text-muted"
            >
              {{ t('download.released', { date: formatDate(release.publishedAt, locale) }) }}
            </time>
          </header>

          <div class="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_22rem]">
            <div>
              <h3 class="eyebrow text-dimmed">{{ t('news.notesTitle') }}</h3>
              <ReleaseNotes class="mt-3" :body="release.body" :repo="SITE.repo" />
              <p v-if="release.body" class="mt-5 text-xs italic text-dimmed">
                {{ t('news.notesLanguage') }}
              </p>
            </div>

            <div>
              <h3 class="eyebrow text-dimmed">{{ t('news.downloadsTitle') }}</h3>
              <div class="mt-3 space-y-3">
                <DownloadAsset
                  v-for="asset in release.assets"
                  :key="asset.name"
                  :asset="asset"
                />
                <p v-if="!release.assets.length" class="text-sm text-dimmed">
                  {{ t('download.empty') }}
                </p>
              </div>

              <UButton
                :to="release.htmlUrl"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-simple-icons-github"
                class="mt-4"
              >
                {{ t('news.viewOnGitHub') }}
              </UButton>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="rounded-[var(--ui-radius)] border border-dashed border-default p-12 text-center">
        <UIcon name="i-lucide-package-open" class="mx-auto size-10 text-dimmed" aria-hidden="true" />
        <p class="mt-4 font-display text-lg font-semibold text-toned">{{ t('news.empty') }}</p>
        <p class="mx-auto mt-2 max-w-md text-sm text-dimmed">{{ t('news.emptyHint') }}</p>
      </div>
    </UContainer>
  </div>
</template>
