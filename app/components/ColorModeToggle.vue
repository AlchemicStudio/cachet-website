<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

/**
 * Three-state control: system, light, dark. `preference` is what the visitor
 * chose; `value` is what that resolves to right now. Rendering only after mount
 * avoids announcing the wrong state in the prerendered HTML, which is shared by
 * visitors on both themes.
 */
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const next = computed(() => {
  if (colorMode.preference === 'system') return 'light'
  return colorMode.preference === 'light' ? 'dark' : 'system'
})

const icon = computed(() => {
  if (colorMode.preference === 'system') return 'i-lucide-monitor'
  return colorMode.preference === 'light' ? 'i-lucide-sun' : 'i-lucide-moon'
})

const label = computed(() => {
  const name =
    colorMode.preference === 'system'
      ? t('nav.themeSystem')
      : colorMode.preference === 'light'
        ? t('nav.themeLight')
        : t('nav.themeDark')
  return `${t('nav.theme')}: ${name}`
})
</script>

<template>
  <ClientOnly>
    <UButton
      color="neutral"
      variant="ghost"
      :icon="icon"
      :aria-label="label"
      :title="label"
      @click="colorMode.preference = next"
    />
    <template #fallback>
      <!-- Same footprint as the button, so the header does not shift on hydrate. -->
      <div class="size-8" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>
