<script setup lang="ts">
import { REQUIREMENTS } from '~/content'

const { t, tm, rt } = useI18n()

/** `tm` returns the raw array; `rt` resolves each entry to a plain string. */
function requirementItems(id: string): string[] {
  const list = tm(`docs.requirements.${id}.items`) as unknown[]
  return Array.isArray(list) ? list.map(entry => rt(entry as never)) : []
}
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.requirements.lead') }}
    </p>

    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <div
        v-for="requirement in REQUIREMENTS"
        :key="requirement.id"
        class="rounded-[var(--ui-radius)] border border-default bg-default p-5"
      >
        <div class="flex items-center gap-2.5">
          <UIcon :name="requirement.icon" class="size-4 text-primary" aria-hidden="true" />
          <h3 class="font-display text-base font-semibold text-highlighted">
            {{ t(`docs.requirements.${requirement.id}.title`) }}
          </h3>
        </div>
        <ul class="mt-3 space-y-2">
          <li
            v-for="(item, index) in requirementItems(requirement.id)"
            :key="index"
            class="flex gap-2 text-sm leading-relaxed text-muted"
          >
            <span class="mt-2 size-1 shrink-0 rounded-full bg-aqua-500" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p class="mt-5 max-w-prose text-sm text-muted">{{ t('docs.requirements.preview') }}</p>
  </div>
</template>
