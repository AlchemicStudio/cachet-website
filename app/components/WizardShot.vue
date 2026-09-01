<script setup lang="ts">
import manifest from '~/data/screenshots.json'

/**
 * Screenshot for one wizard step, when `scripts/capture_screenshots.py` has
 * produced one. The manifest is generated rather than hand-maintained, so a
 * step with no capture renders nothing instead of a broken image.
 *
 * The thumbnail is a button: the interface it shows is dense — a stepper, a
 * form and a help panel side by side — and unreadable at the width of a
 * documentation column, so clicking opens it full size.
 */
const props = defineProps<{ step: string, index: number, alt?: string }>()

const { t } = useI18n()

interface Shot { width: number, height: number, file: string }
const shots = manifest.shots as Record<string, Shot | undefined>

const shot = computed(() => shots[props.step])
const source = computed(() => (shot.value ? `/screenshots/${shot.value.file}` : ''))
const label = computed(
  () => props.alt || t(`docs.walkthrough.steps.${props.step}.title`)
)

const open = ref(false)
const trigger = useTemplateRef<HTMLButtonElement>('trigger')

/**
 * Sends focus back to the thumbnail when the modal closes. Without a trigger
 * slot the modal has no element to restore to, and focus lands on <body> —
 * which drops a keyboard reader back to the top of the page.
 */
watch(open, isOpen => {
  if (!isOpen) nextTick(() => trigger.value?.focus())
})
</script>

<template>
  <figure v-if="shot" class="mt-4">
    <button
      ref="trigger"
      type="button"
      class="group relative block w-full overflow-hidden rounded-[var(--ui-radius)] border border-default bg-elevated transition-colors hover:border-accented"
      :aria-label="t('docs.walkthrough.viewFullSize', { title: label })"
      @click="open = true"
    >
      <img
        :src="source"
        :width="shot.width"
        :height="shot.height"
        :alt="label"
        loading="lazy"
        decoding="async"
        class="w-full"
      >
      <span
        class="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-neutral-950/70 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <UIcon name="i-lucide-maximize-2" class="size-3.5" aria-hidden="true" />
        {{ t('docs.walkthrough.fullSize') }}
      </span>
    </button>

    <UModal
      v-model:open="open"
      :title="label"
      :description="t('docs.walkthrough.shotNote')"
      :ui="{
        content: 'max-w-[min(96rem,95vw)]',
        body: 'p-0 sm:p-0'
      }"
    >
      <template #body>
        <!-- Capped by height as well as width so a tall capture stays whole
             on a laptop screen rather than forcing the modal to scroll. -->
        <img
          :src="source"
          :width="shot.width"
          :height="shot.height"
          :alt="label"
          class="mx-auto block h-auto max-h-[80vh] w-auto max-w-full"
        >
      </template>
    </UModal>
  </figure>
</template>
