<script setup lang="ts">
import type { DocSectionData } from '~/composables/useAppDocs'

/**
 * Wraps a section of the application's own reference documentation, ported
 * verbatim from `i18n_docs.py`. Where the wording comes from is a fact about
 * how the site is built, not something a reader needs, so the block carries no
 * provenance note — only the warning that matters to them, when their language
 * has no reference and the text falls back to English.
 */
withDefaults(defineProps<{
  section: DocSectionData
  /** False when the reference is falling back to English. */
  translated?: boolean
  hideTitle?: boolean
}>(), {
  translated: true,
  hideTitle: false
})

const { t } = useI18n()
</script>

<template>
  <section class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-6">
    <h3
      v-if="!hideTitle && section.title"
      class="font-display text-lg font-semibold text-highlighted"
    >
      {{ section.title }}
    </h3>

    <UAlert
      v-if="!translated"
      class="mt-4"
      color="neutral"
      variant="subtle"
      icon="i-lucide-languages"
      :description="t('docs.reference.notTranslated')"
    />

    <DocsBlocks class="mt-4" :blocks="section.blocks" />
  </section>
</template>
