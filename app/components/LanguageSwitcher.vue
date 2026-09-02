<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { pathInLocale } from '#shared/site'

const { locale, locales, t } = useI18n()
const route = useRoute()

/**
 * A page with a translated slug says where its versions live; everything else
 * is the current path with its locale prefix swapped.
 */
function targetFor(code: string): string {
  return localisedPathFor(route, code) ?? pathInLocale(route.path, code)
}

const current = computed(() => locales.value.find(l => l.code === locale.value))

/**
 * Real links, not checkbox items.
 *
 * Each entry navigates to the same page in another language — and on a
 * documentation section that means a different URL entirely
 * (`/docs/the-three-modes` becomes `/de/docs/die-drei-modi`). Rendering them as
 * anchors keeps those translations crawlable and lets them be opened in a new
 * tab, which a `menuitemcheckbox` cannot do.
 *
 * `locale: false` is essential. `ULink` otherwise passes every `to` through
 * `localePath()`, which prefixes it with the locale being *read* — so the
 * English entry, the only unprefixed one, came back pointing at the page you
 * were already on. Paths that already start with a locale code are left alone,
 * which is why the other six languages worked and this went unnoticed. These
 * paths are computed here and must be used exactly as given.
 */
const items = computed<DropdownMenuItem[][]>(() => [
  locales.value.map(l => ({
    label: l.name ?? l.code,
    to: targetFor(l.code),
    locale: false,
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
