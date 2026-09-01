<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const current = computed(() => locales.value.find(l => l.code === locale.value))

const items = computed<DropdownMenuItem[][]>(() => [
  locales.value.map(l => ({
    label: l.name ?? l.code,
    // `to` keeps these real links, so they work without JavaScript and can be
    // opened in a new tab — a plain click handler would break both.
    to: switchLocalePath(l.code),
    checked: l.code === locale.value,
    type: 'checkbox' as const,
    onSelect: (event: Event) => {
      // Let the anchor navigate; only stop the menu swallowing it.
      event.preventDefault()
      navigateTo(switchLocalePath(l.code))
    }
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
