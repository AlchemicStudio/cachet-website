<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { formatBytes } from '~/utils/format'

/** Header download control: the latest version's files, one click away. */
const { latest } = useReleases()
const platform = usePlatform()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const assets = computed(() =>
  (latest.value?.assets ?? []).filter(a => a.platform !== 'other')
)

/** The visitor's platform first, so the obvious choice is the top item. */
const ordered = computed(() => {
  const detected = platform.value
  if (!detected) return assets.value
  return [...assets.value].sort((a, b) =>
    Number(b.platform === detected) - Number(a.platform === detected)
  )
})

const items = computed<DropdownMenuItem[][]>(() => {
  const files = ordered.value.map(asset => ({
    label: t(`download.platform.${asset.platform}`),
    // The site is static; downloads come straight from GitHub's CDN.
    to: asset.url,
    target: '_blank' as const,
    icon:
      asset.platform === 'windows'
        ? 'i-simple-icons-windows'
        : asset.platform === 'macos'
          ? 'i-simple-icons-apple'
          : 'i-simple-icons-linux',
    kbds: undefined,
    suffix: formatBytes(asset.size, locale.value)
  }))

  return [
    files.length ? files : [{ label: t('download.empty'), disabled: true }],
    [
      { label: t('download.allReleases'), icon: 'i-lucide-list', to: localePath('/news') }
    ]
  ]
})
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }" :ui="{ content: 'w-64' }">
    <UButton color="secondary" trailing-icon="i-lucide-chevron-down" icon="i-lucide-download">
      <span class="hidden lg:inline">
        {{ latest ? t('nav.downloadVersion', { version: latest.tag }) : t('nav.download') }}
      </span>
      <span class="lg:hidden">{{ t('nav.download') }}</span>
    </UButton>

    <template #item-trailing="{ item }">
      <span v-if="(item as { suffix?: string }).suffix" class="text-xs text-muted font-mono">
        {{ (item as { suffix?: string }).suffix }}
      </span>
    </template>
  </UDropdownMenu>
</template>
