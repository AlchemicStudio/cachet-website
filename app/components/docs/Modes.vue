<script setup lang="ts">
import { MODES } from '~/content'

const { t } = useI18n()
const { reference, translated: referenceTranslated } = useDocsReference()
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.modes.lead') }}
    </p>

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr class="border-b border-accented text-left">
            <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.mode') }}</th>
            <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.requires') }}</th>
            <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.nature') }}</th>
            <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.modes.table.output') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mode in MODES" :key="mode.id" class="border-b border-muted align-top">
            <td class="py-4 pr-4">
              <span class="flex items-center gap-2 font-display font-semibold text-highlighted">
                <UIcon :name="mode.icon" class="size-4 shrink-0 text-muted" aria-hidden="true" />
                {{ t(`docs.modes.${mode.id}.name`) }}
              </span>
              <code class="mt-1 block font-mono text-xs text-dimmed">
                {{ t(`docs.modes.${mode.id}.flag`) }}
              </code>
            </td>
            <td class="py-4 pr-4 text-muted">{{ t(`docs.modes.${mode.id}.requires`) }}</td>
            <td class="py-4 pr-4 text-muted">{{ t(`docs.modes.${mode.id}.nature`) }}</td>
            <td class="py-4 text-muted">{{ t(`docs.modes.${mode.id}.output`) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DocsReferenceBlock
      v-if="reference.modes"
      class="mt-8"
      :section="reference.modes"
      :translated="referenceTranslated"
    />
  </div>
</template>
