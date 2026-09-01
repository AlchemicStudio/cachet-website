<script setup lang="ts">
import { FEATURES, OUTPUT_FILE_PATTERN } from '~/content'

const { t } = useI18n()
</script>

<template>
  <div>
    <ul class="mt-6 grid gap-4 sm:grid-cols-2">
      <li
        v-for="feature in FEATURES"
        :key="feature.id"
        class="rounded-[var(--ui-radius)] border border-default bg-default p-5"
      >
        <UIcon :name="feature.icon" class="size-5 text-primary" aria-hidden="true" />
        <h3 class="mt-3 font-display text-base font-semibold text-highlighted">
          {{ t(`docs.features.${feature.id}.title`) }}
        </h3>
        <InlineMarkup
          as="p"
          :text="t(`docs.features.${feature.id}.text`, { pattern: OUTPUT_FILE_PATTERN })"
          class="mt-1.5 text-sm leading-relaxed text-muted"
        />
      </li>
    </ul>
  </div>
</template>
