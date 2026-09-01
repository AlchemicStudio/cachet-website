<script setup lang="ts">
import { DOC_SECTION_IDS, docSlug } from '#shared/docs'

/**
 * Navigation across the documentation. Every entry is a real link to a real
 * page, written in the reader's own language.
 */
defineProps<{
  /** Section currently being read, or `null` on the index. */
  current?: string | null
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const indexPath = computed(() => localePath('/docs'))

const entries = computed(() =>
  DOC_SECTION_IDS.map(id => ({
    id,
    label: t(`docs.sections.${id}`),
    to: `${indexPath.value}/${docSlug(id, locale.value)}`
  }))
)
</script>

<template>
  <nav class="mb-10 lg:mb-0" :aria-label="t('docs.navTitle')">
    <div class="lg:sticky lg:top-[calc(var(--ui-header-height)+2rem)]">
      <h2 class="eyebrow text-dimmed">{{ t('docs.navTitle') }}</h2>

      <ul class="mt-4 space-y-0.5 border-l border-default">
        <li>
          <NuxtLink
            :to="indexPath"
            class="-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors"
            :class="!current
              ? 'border-secondary font-medium text-highlighted'
              : 'border-transparent text-muted hover:border-accented hover:text-toned'"
            :aria-current="!current ? 'page' : undefined"
          >
            {{ t('docs.sections.overview') }}
          </NuxtLink>
        </li>
        <li v-for="entry in entries" :key="entry.id">
          <NuxtLink
            :to="entry.to"
            class="-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors"
            :class="current === entry.id
              ? 'border-secondary font-medium text-highlighted'
              : 'border-transparent text-muted hover:border-accented hover:text-toned'"
            :aria-current="current === entry.id ? 'page' : undefined"
          >
            {{ entry.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
