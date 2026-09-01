<script setup lang="ts">
import manifest from '~/data/screenshots.json'

/**
 * Screenshot for one wizard step, when `scripts/capture_screenshots.py` has
 * produced one. The manifest is generated rather than hand-maintained, so a
 * step with no capture renders nothing instead of a broken image.
 */
const props = defineProps<{ step: string, index: number, alt?: string }>()

const { t } = useI18n()

interface Shot { width: number, height: number, file: string }
const shots = manifest.shots as Record<string, Shot | undefined>

const shot = computed(() => shots[props.step])
const label = computed(
  () => props.alt || t(`docs.walkthrough.steps.${props.step}.title`)
)
</script>

<template>
  <figure
    v-if="shot"
    class="overflow-hidden rounded-[var(--ui-radius)] border border-default bg-elevated"
  >
    <img
      :src="`/screenshots/${shot.file}`"
      :width="shot.width"
      :height="shot.height"
      :alt="label"
      loading="lazy"
      decoding="async"
      class="w-full"
    >
  </figure>
</template>
