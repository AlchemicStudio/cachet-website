<script setup lang="ts">
/**
 * The Cachet mark.
 *
 * The guide reserves the colour version for white and the 50–100 greys, and
 * the white version for the abyss/plum grounds — which is exactly what the dark
 * theme and the hero band are. Rather than swap `src` from JavaScript (a
 * hydration mismatch, and a flash on first paint), both variants are declared
 * as background images and the `.dark` class picks one: the browser fetches
 * only the rule that applies.
 */
withDefaults(defineProps<{
  /** Rendered edge length in CSS pixels; the source is square. */
  size?: number
  /** Forces the white variant regardless of colour mode — for dark bands. */
  onDark?: boolean
  /** Leave empty for a decorative mark next to a visible wordmark. */
  alt?: string
}>(), {
  size: 40,
  onDark: false,
  alt: ''
})
</script>

<template>
  <span
    class="logo-mark inline-block shrink-0 bg-center bg-no-repeat bg-contain"
    :class="onDark ? 'logo-mark--white' : 'logo-mark--auto'"
    :role="alt ? 'img' : undefined"
    :aria-label="alt || undefined"
    :aria-hidden="alt ? undefined : 'true'"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<style scoped>
/* No `display` here: a scoped rule outranks Tailwind's `lg:hidden`, which call
   sites use to swap the mark between layouts. `inline-block` sits on the
   element's class list instead. */
.logo-mark--auto {
  background-image: image-set(url('/logo-256.png') 1x, url('/logo-512.png') 2x);
}

:global(.dark) .logo-mark--auto,
.logo-mark--white {
  background-image: image-set(url('/logo-white-256.png') 1x, url('/logo-white-512.png') 2x);
}
</style>
