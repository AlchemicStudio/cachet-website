<script setup lang="ts">
/**
 * Asks before anything is loaded from Google.
 *
 * Rendered client-side only: the pages are prerendered and shared by every
 * visitor, so the decision cannot be baked into the HTML — and rendering it on
 * the server would mismatch on hydration for anyone who already answered.
 *
 * Declining is one click, in a button of the same size and weight as accepting.
 * A refusal that costs more effort than agreement is not a free choice.
 */
const { undecided, applicable, decide } = useConsent()
const { t } = useI18n()
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="applicable && undecided"
        role="dialog"
        aria-modal="false"
        :aria-label="t('consent.title')"
        class="fixed inset-x-0 bottom-0 z-50 border-t border-default bg-default/95 backdrop-blur-md"
      >
        <UContainer class="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-8">
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-base font-semibold text-highlighted">
              {{ t('consent.title') }}
            </h2>
            <p class="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
              {{ t('consent.body') }}
            </p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-3">
            <UButton color="neutral" variant="outline" size="lg" @click="decide('denied')">
              {{ t('consent.decline') }}
            </UButton>
            <UButton color="secondary" size="lg" @click="decide('granted')">
              {{ t('consent.accept') }}
            </UButton>
          </div>
        </UContainer>
      </div>
    </Transition>
  </ClientOnly>
</template>
