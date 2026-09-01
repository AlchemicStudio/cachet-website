<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-default focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
    >
      {{ t('nav.skip') }}
    </a>

    <AppHeader />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <AppFooter />

    <ConsentBanner />
  </div>
</template>
