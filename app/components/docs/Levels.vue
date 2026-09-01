<script setup lang="ts">
import { PADES_LEVELS } from '~/content'

const { t } = useI18n()
const { reference, translated: referenceTranslated } = useDocsReference()
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.levels.lead') }}
    </p>

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[38rem] border-collapse text-sm">
        <thead>
          <tr class="border-b border-accented text-left">
            <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.levels.table.level') }}</th>
            <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.levels.table.adds') }}</th>
            <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.levels.table.network') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="level in PADES_LEVELS" :key="level.id" class="border-b border-muted align-top">
            <td class="whitespace-nowrap py-3.5 pr-4">
              <code class="font-mono text-xs font-semibold text-highlighted">{{ level.id }}</code>
              <UBadge
                v-if="'default' in level && level.default"
                color="secondary"
                variant="subtle"
                size="sm"
                class="ml-2"
              >
                {{ t('docs.levels.default') }}
              </UBadge>
            </td>
            <td class="py-3.5 pr-4 text-muted">{{ t(`docs.levels.adds.${level.id}`) }}</td>
            <td class="py-3.5 text-muted">
              {{ level.offline
                ? t('docs.levels.networkNone')
                : level.id === 'b-t'
                  ? t('docs.levels.networkTsa')
                  : t('docs.levels.networkFull') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DocsReferenceBlock
      v-if="reference.levels"
      class="mt-8"
      :section="reference.levels"
      :translated="referenceTranslated"
    />
    <DocsReferenceBlock
      v-if="reference.glance"
      class="mt-6"
      :section="reference.glance"
      :translated="referenceTranslated"
      hide-note
    />
  </div>
</template>
