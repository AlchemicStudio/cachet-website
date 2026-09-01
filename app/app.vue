<script setup lang="ts">
const { locale, locales } = useI18n()
const head = useLocaleHead({ seo: true })

// Nuxt UI's colour-mode integration needs the html class; i18n supplies the
// lang/dir attributes and the hreflang alternates for all seven locales.
useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang ?? locale.value,
    dir: head.value.htmlAttrs?.dir ?? 'ltr'
  },
  link: head.value.link,
  meta: head.value.meta
}))

const localeName = computed(
  () => locales.value.find(l => l.code === locale.value)?.name ?? locale.value
)
useSeoMeta({ ogLocale: () => localeName.value })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
