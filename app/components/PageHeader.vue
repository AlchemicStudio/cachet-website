<script setup lang="ts">
/** Shared band at the top of `/docs` and `/news`. */
defineProps<{ title: string, lead?: string }>()
</script>

<template>
  <section class="border-b border-default bg-default">
    <UContainer class="py-14 sm:py-16">
      <h1 class="font-display text-4xl font-bold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <p v-if="lead" class="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {{ lead }}
      </p>
      <div v-if="$slots.actions" class="mt-6">
        <slot name="actions" />
      </div>
    </UContainer>
  </section>
</template>
