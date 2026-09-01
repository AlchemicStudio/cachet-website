<script setup lang="ts">
import { CLI_EXAMPLES, CLI_FLAGS, OUTPUT_FILE_PATTERN } from '~/content'

const { t } = useI18n()
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.cli.lead') }}
    </p>

    <h3 class="mt-8 font-display text-lg font-semibold text-highlighted">
      {{ t('docs.cli.examplesTitle') }}
    </h3>
    <div class="mt-4 space-y-4">
      <CodeBlock
        v-for="example in CLI_EXAMPLES"
        :key="example.id"
        :code="example.command"
        :caption="t(`docs.cli.examples.${example.id}`)"
      />
    </div>

    <h3 class="mt-10 font-display text-lg font-semibold text-highlighted">
      {{ t('docs.cli.flagsTitle') }}
    </h3>
    <p class="mt-2 max-w-prose text-sm text-muted">{{ t('docs.cli.flagsLead') }}</p>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr class="border-b border-accented text-left">
            <th class="eyebrow py-2.5 pr-6 text-dimmed">{{ t('docs.cli.flagColumn') }}</th>
            <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.cli.meaningColumn') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="flag in CLI_FLAGS" :key="flag" class="border-b border-muted align-top">
            <td class="whitespace-nowrap py-3 pr-6">
              <code class="font-mono text-xs text-primary">
                {{ flag === '--x-y' ? '--x --y' : flag }}
              </code>
            </td>
            <td class="py-3 text-muted">
              <InlineMarkup :text="t(`docs.cli.flags.${flag}`, { pattern: OUTPUT_FILE_PATTERN })" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
