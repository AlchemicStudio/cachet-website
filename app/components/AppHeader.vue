<script setup lang="ts">
import { SITE } from '#shared/site'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const open = ref(false)
watch(() => route.fullPath, () => {
  open.value = false
})

const links = computed(() => [
  { label: t('nav.docs'), to: localePath('/docs'), icon: 'i-lucide-book-open' },
  { label: t('nav.news'), to: localePath('/news'), icon: 'i-lucide-newspaper' }
])

/** Marks the current section without matching every nested path. */
function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-default bg-[var(--page-bg)]/85 backdrop-blur-md"
  >
    <!-- The signature spectrum gradient, used exactly once per screen. -->
    <div class="grad-spectrum h-0.5 w-full" aria-hidden="true" />

    <UContainer
      class="flex h-[var(--ui-header-height)] items-center gap-3 sm:gap-4"
    >
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2.5 rounded-lg"
        :aria-label="t('nav.home')"
      >
        <LogoMark :size="32" />
        <span class="font-display text-lg font-bold tracking-tight text-highlighted">
          {{ t('site.name') }}
        </span>
      </NuxtLink>

      <nav class="mx-auto hidden items-center gap-1 md:flex" :aria-label="t('nav.docs')">
        <UButton
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          color="neutral"
          variant="ghost"
          :aria-current="isActive(link.to) ? 'page' : undefined"
          :class="isActive(link.to) ? 'text-highlighted font-semibold' : 'text-muted'"
        >
          {{ link.label }}
        </UButton>
        <UButton
          :to="SITE.repoUrl"
          target="_blank"
          color="neutral"
          variant="ghost"
          class="text-muted"
          trailing-icon="i-lucide-arrow-up-right"
        >
          {{ t('nav.github') }}
        </UButton>
      </nav>

      <div class="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
        <div class="hidden sm:block">
          <DownloadMenu />
        </div>
        <LanguageSwitcher />
        <ColorModeToggle />

        <UButton
          class="md:hidden"
          color="neutral"
          variant="ghost"
          icon="i-lucide-menu"
          :aria-label="t('nav.menu')"
          :aria-expanded="open"
          @click="open = true"
        />
      </div>
    </UContainer>

    <USlideover v-model:open="open" :title="t('site.name')" side="right">
      <template #body>
        <nav class="flex flex-col gap-1" :aria-label="t('nav.menu')">
          <UButton
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :icon="link.icon"
            color="neutral"
            variant="ghost"
            size="lg"
            block
            class="justify-start"
            :aria-current="isActive(link.to) ? 'page' : undefined"
          >
            {{ link.label }}
          </UButton>
          <UButton
            :to="SITE.repoUrl"
            target="_blank"
            icon="i-simple-icons-github"
            color="neutral"
            variant="ghost"
            size="lg"
            block
            class="justify-start"
          >
            {{ t('nav.github') }}
          </UButton>

          <USeparator class="my-3" />
          <DownloadMenu />
        </nav>
      </template>
    </USlideover>
  </header>
</template>
