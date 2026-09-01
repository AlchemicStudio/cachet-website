<script setup lang="ts">
import type { ReleaseAsset } from '#shared/types'
import { digestAlgo, formatBytes, stripDigestAlgo } from '~/utils/format'

const props = defineProps<{
  asset: ReleaseAsset
  /** Promotes the row matching the visitor's OS to the primary action. */
  primary?: boolean
}>()

const { t, locale } = useI18n()
const toast = useToast()

const icon = computed(() => {
  switch (props.asset.platform) {
    case 'windows': return 'i-simple-icons-windows'
    case 'macos': return 'i-simple-icons-apple'
    case 'linux': return 'i-simple-icons-linux'
    default: return 'i-lucide-file-archive'
  }
})

const checksum = computed(() => (props.asset.digest ? stripDigestAlgo(props.asset.digest) : null))
const algo = computed(() => (props.asset.digest ? digestAlgo(props.asset.digest) : 'SHA-256'))

const showChecksum = ref(false)

async function copyChecksum() {
  if (!checksum.value) return
  try {
    await navigator.clipboard.writeText(checksum.value)
    toast.add({ title: t('download.copied'), icon: 'i-lucide-check', color: 'success' })
  } catch {
    // Clipboard access can be refused; the value stays selectable on screen.
    showChecksum.value = true
  }
}
</script>

<template>
  <div
    class="rounded-[var(--ui-radius)] border p-4 transition-colors"
    :class="primary ? 'border-secondary/40 bg-secondary/5' : 'border-default bg-default'"
  >
    <div class="flex flex-wrap items-center gap-3">
      <UIcon :name="icon" class="size-5 shrink-0 text-toned" aria-hidden="true" />

      <div class="min-w-0 flex-1">
        <p class="flex flex-wrap items-center gap-2">
          <span class="font-display text-sm font-semibold text-highlighted">
            {{ t(`download.platform.${asset.platform}`) }}
          </span>
          <UBadge
            v-if="primary"
            color="secondary"
            variant="subtle"
            size="sm"
            icon="i-lucide-check"
          >
            {{ t('download.recommended') }}
          </UBadge>
        </p>
        <p class="mt-0.5 truncate font-mono text-xs text-dimmed" :title="asset.name">
          {{ asset.name }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="font-mono text-xs text-muted whitespace-nowrap">
          {{ formatBytes(asset.size, locale) }}
        </span>
        <UButton
          :to="asset.url"
          :color="primary ? 'secondary' : 'neutral'"
          :variant="primary ? 'solid' : 'outline'"
          icon="i-lucide-download"
          size="sm"
        >
          {{ t('download.title') }}
        </UButton>
      </div>
    </div>

    <div v-if="checksum" class="mt-3 flex flex-wrap items-center gap-2 border-t border-muted pt-3">
      <span class="eyebrow text-dimmed">{{ t('download.checksum', { algo }) }}</span>
      <code
        class="min-w-0 flex-1 truncate rounded bg-elevated px-2 py-1 font-mono text-[0.7rem] text-muted"
        :title="checksum"
      >{{ checksum }}</code>
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-copy"
        :aria-label="t('download.copyChecksum', { algo })"
        :title="t('download.copyChecksum', { algo })"
        @click="copyChecksum"
      />
    </div>
  </div>
</template>
