<script setup lang="ts">
import { formatDate, formatDateTime } from '~/utils/format'

/**
 * The download card. Data comes from the prerendered snapshot and is replaced
 * by a live GitHub fetch on mount, so it is populated instantly and accurate a
 * moment later. When the live call fails the cached copy stays visible with a
 * note rather than collapsing into an error.
 */
const { latest, isLive, staleError, fetchedAt } = useReleases()
const platform = usePlatform()
const { t, locale } = useI18n()

const assets = computed(() => latest.value?.assets ?? [])

/** Detected platform first, then the rest in the order GitHub returned them. */
const ordered = computed(() => {
  const detected = platform.value
  if (!detected) return assets.value
  return [...assets.value].sort((a, b) =>
    Number(b.platform === detected) - Number(a.platform === detected)
  )
})

const isRecommended = (index: number) =>
  Boolean(platform.value) && ordered.value[index]?.platform === platform.value
</script>

<template>
  <UCard
    id="download"
    :ui="{
      root: 'overflow-hidden ring-0 border border-default shadow-lg shadow-neutral-950/5 scroll-mt-24',
      header: 'p-6 sm:p-8',
      body: 'p-6 sm:p-8 pt-0 sm:pt-0'
    }"
  >
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow text-secondary">{{ t('download.latest') }}</p>
          <h2 class="mt-1.5 font-display text-2xl font-bold text-highlighted">
            {{ t('download.title') }}
            <span v-if="latest" class="text-muted">· {{ latest.tag }}</span>
          </h2>
          <p v-if="latest" class="mt-1 text-sm text-muted">
            {{ t('download.released', { date: formatDate(latest.publishedAt, locale) }) }}
          </p>
        </div>

        <UBadge
          v-if="latest"
          :color="isLive ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
          :icon="isLive ? 'i-lucide-radio' : 'i-lucide-database'"
          :title="fetchedAt ? t('download.asOf', { date: formatDateTime(fetchedAt, locale) }) : undefined"
        >
          {{ isLive ? t('download.live') : t('download.snapshot') }}
        </UBadge>
      </div>

      <p class="mt-4 max-w-prose text-sm leading-relaxed text-toned">
        {{ t('download.lead') }}
      </p>
    </template>

    <UAlert
      v-if="staleError === 'live-refresh-failed'"
      class="mb-5"
      color="warning"
      variant="subtle"
      icon="i-lucide-cloud-off"
      :title="t('download.staleTitle')"
      :description="t('download.staleBody')"
    />

    <div v-if="ordered.length" class="space-y-3">
      <DownloadAsset
        v-for="(asset, index) in ordered"
        :key="asset.name"
        :asset="asset"
        :primary="isRecommended(index)"
      />
    </div>

    <div v-else class="rounded-[var(--ui-radius)] border border-dashed border-default p-8 text-center">
      <UIcon name="i-lucide-package-open" class="mx-auto size-8 text-dimmed" aria-hidden="true" />
      <p class="mt-3 font-medium text-toned">{{ t('download.empty') }}</p>
      <p class="mt-1 text-sm text-dimmed">{{ t('download.emptyHint') }}</p>
    </div>

    <div v-if="latest" class="mt-6 space-y-4 border-t border-muted pt-5">
      <div>
        <h3 class="eyebrow text-dimmed">{{ t('download.contents.title') }}</h3>
        <ul class="mt-2.5 space-y-1.5 text-sm text-muted">
          <li class="flex items-start gap-2">
            <UIcon name="i-lucide-app-window" class="mt-0.5 size-4 shrink-0 text-dimmed" aria-hidden="true" />
            <InlineMarkup :text="t('download.contents.gui')" />
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-lucide-terminal" class="mt-0.5 size-4 shrink-0 text-dimmed" aria-hidden="true" />
            <InlineMarkup :text="t('download.contents.cli')" />
          </li>
        </ul>
      </div>

      <div>
        <h3 class="eyebrow text-dimmed">{{ t('download.afterTitle') }}</h3>
        <ul class="mt-2.5 space-y-1.5 text-sm text-muted">
          <li v-for="key in ['beid', 'network', 'offline']" :key="key" class="flex items-start gap-2">
            <UIcon name="i-lucide-dot" class="mt-0.5 size-4 shrink-0 text-dimmed" aria-hidden="true" />
            <span>{{ t(`download.after.${key}`) }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap gap-3 pt-1">
        <UButton
          :to="latest.htmlUrl"
          target="_blank"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-github"
          size="sm"
        >
          {{ t('download.viewOnGitHub') }}
        </UButton>
        <UButton
          :to="useLocalePath()('/news')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-list"
          size="sm"
        >
          {{ t('download.allReleases') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
