<script setup lang="ts">
const props = defineProps<{
  code: string
  caption?: string
}>()

const { t } = useI18n()
const toast = useToast()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    toast.add({ title: t('download.copied'), icon: 'i-lucide-check', color: 'success' })
  } catch {
    // Clipboard permission can be refused; the text stays selectable.
  }
}
</script>

<template>
  <figure class="overflow-hidden rounded-[var(--ui-radius)] border border-default bg-elevated">
    <figcaption
      v-if="caption"
      class="flex items-center gap-2 border-b border-default px-4 py-2.5 text-xs font-medium text-muted"
    >
      <UIcon name="i-lucide-terminal" class="size-3.5 shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1">{{ caption }}</span>
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-copy"
        :aria-label="t('a11y.copy')"
        @click="copy"
      />
    </figcaption>
    <pre class="overflow-x-auto px-4 py-3.5"><code class="font-mono text-[0.8rem] leading-relaxed text-toned">{{ code }}</code></pre>
  </figure>
</template>
