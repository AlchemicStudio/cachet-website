<script setup lang="ts">
import { SITE } from '#shared/site'
import { INSTALL_SOURCE } from '~/content'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div>
    <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ t('docs.install.lead') }}
    </p>

    <div class="mt-6 space-y-6">
      <div class="rounded-[var(--ui-radius)] border border-default bg-default p-6">
        <h3 class="font-display text-base font-semibold text-highlighted">
          {{ t('docs.install.binaryTitle') }}
        </h3>
        <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          {{ t('docs.install.binaryText') }}
        </p>
        <UButton
          :to="`${localePath('/')}#download`"
          color="secondary"
          size="sm"
          icon="i-lucide-download"
          class="mt-4"
        >
          {{ t('docs.install.downloadCta') }}
        </UButton>
      </div>

      <div>
        <h3 class="font-display text-base font-semibold text-highlighted">
          {{ t('docs.install.sourceTitle') }}
        </h3>
        <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          {{ t('docs.install.sourceText') }}
        </p>
        <CodeBlock class="mt-4" :code="INSTALL_SOURCE" :caption="t('docs.install.sourceTitle')" />
      </div>

      <div>
        <h3 class="font-display text-base font-semibold text-highlighted">
          {{ t('docs.install.buildTitle') }}
        </h3>
        <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          {{ t('docs.install.buildText') }}
        </p>
        <UButton
          :to="`${SITE.repoUrl}/blob/main/BUILD.md`"
          target="_blank"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-hammer"
          class="mt-3"
        >
          BUILD.md
        </UButton>
      </div>
    </div>
  </div>
</template>
