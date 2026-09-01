<script setup lang="ts">
import { OUTPUT_FILE_PATTERN, WIZARD_STEPS } from '~/content'

const { t } = useI18n()
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.walkthrough.lead') }}
    </p>

    <WizardShot
      step="welcome"
      :index="0"
      :alt="t('docs.walkthrough.welcomeAlt')"
      class="mt-6"
    />

    <ol class="mt-8 space-y-4">
      <li
        v-for="(step, index) in WIZARD_STEPS"
        :key="step.id"
        class="relative rounded-[var(--ui-radius)] border border-default bg-default p-5 pl-16"
      >
        <span
          class="grad-wireframe absolute left-5 top-5 flex size-8 items-center justify-center rounded-full font-display text-sm font-bold text-neutral-900"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>
        <h3 class="font-display text-base font-semibold text-highlighted">
          {{ t(`docs.walkthrough.steps.${step.id}.title`) }}
        </h3>
        <InlineMarkup
          as="p"
          :text="t(`docs.walkthrough.steps.${step.id}.text`, { pattern: OUTPUT_FILE_PATTERN })"
          class="mt-1.5 max-w-prose text-sm leading-relaxed text-muted"
        />
        <WizardShot :step="step.id" :index="index + 1" />
      </li>
    </ol>

    <p class="mt-6 text-sm text-muted">
      {{ t('docs.walkthrough.cliNote') }}
    </p>
    <p class="mt-2 text-xs italic text-dimmed">
      {{ t('docs.walkthrough.shotNote') }}
    </p>
  </div>
</template>
