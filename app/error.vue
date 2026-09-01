<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const key = computed(() => (props.error.statusCode === 404 ? '404' : '500'))

useHead(() => ({ title: t(`error.${key.value}.title`) }))
</script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col">
      <AppHeader />

      <main class="flex flex-1 items-center">
        <UContainer class="py-24 text-center">
          <p class="eyebrow text-secondary">{{ error.statusCode }}</p>
          <h1 class="mt-3 font-display text-3xl font-bold text-highlighted sm:text-4xl">
            {{ t(`error.${key}.title`) }}
          </h1>
          <p class="mx-auto mt-4 max-w-md text-base text-muted">
            {{ t(`error.${key}.text`) }}
          </p>
          <UButton
            :to="localePath('/')"
            color="secondary"
            size="lg"
            class="mt-8"
            icon="i-lucide-arrow-left"
            @click="clearError({ redirect: localePath('/') })"
          >
            {{ t(`error.${key}.cta`) }}
          </UButton>
        </UContainer>
      </main>

      <AppFooter />
    </div>
  </UApp>
</template>
