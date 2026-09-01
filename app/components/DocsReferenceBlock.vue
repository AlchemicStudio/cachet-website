<script setup lang="ts">
import type { DocSectionData } from '~/composables/useAppDocs'

/**
 * Wraps a section of the application's own reference documentation, ported
 * verbatim from `i18n_docs.py`. The frame makes the provenance visible — the
 * wording is the app's, not the site's — and warns when the visitor's language
 * is one the app does not ship yet.
 */
withDefaults(defineProps<{
  section: DocSectionData
  /** False when the reference is falling back to English. */
  translated?: boolean
  hideTitle?: boolean
  hideNote?: boolean
}>(), {
  translated: true,
  hideTitle: false,
  hideNote: false
})

const { t } = useI18n()
</script>

<template>
  <section class="rounded-[var(--ui-radius)] border border-default bg-muted/40 p-6">
    <p v-if="!hideNote" class="eyebrow flex items-center gap-2 text-dimmed">
      <UIcon name="i-lucide-book-marked" class="size-3.5" aria-hidden="true" />
      {{ t('docs.reference.fromApp') }}
    </p>

    <h3
      v-if="!hideTitle && section.title"
      class="font-display text-lg font-semibold text-highlighted"
      :class="hideNote ? '' : 'mt-3'"
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
