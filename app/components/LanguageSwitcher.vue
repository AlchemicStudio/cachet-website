<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const current = computed(() => locales.value.find(l => l.code === locale.value))

/**
 * Real links, not checkbox items.
 *
 * Each entry navigates to the same page in another language — and on a
 * documentation section that means a different URL entirely
 * (`/docs/the-three-modes` becomes `/de/docs/die-drei-modi`, resolved by the
 * `useSetI18nParams` call on that page). Rendering them as anchors keeps those
 * translations crawlable and lets them be opened in a new tab, which a
 * `menuitemcheckbox` cannot do.
 */
const items = computed<DropdownMenuItem[][]>(() => [
  locales.value.map(l => ({
    label: l.name ?? l.code,
    to: localisedPathFor(route, l.code) ?? switchLocalePath(l.code),
    // The active language is marked by an icon rather than a checkbox role,
    // so the item stays a link.
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    class: l.code === locale.value ? 'font-medium text-highlighted' : undefined
  }))
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'w-44' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-languages"
      :aria-label="t('nav.changeLanguage')"
      :title="t('nav.changeLanguage')"
    >
      <span class="hidden sm:inline text-sm font-medium">{{ current?.code.toUpperCase() }}</span>
    </UButton>
  </UDropdownMenu>
</template>
