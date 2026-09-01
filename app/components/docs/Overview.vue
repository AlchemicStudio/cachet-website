<script setup lang="ts">
import { DOC_LINKS } from '~/content'

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="mt-5 space-y-4">
      <p
        v-for="key in ['p1', 'p2', 'p3']"
        :key="key"
        class="max-w-prose text-base leading-relaxed text-toned"
      >
        {{ t(`docs.overview.${key}`) }}
      </p>
    </div>

    <blockquote
      class="mt-6 rounded-[var(--ui-radius)] border-l-2 border-magenta-600 bg-magenta-50 p-4 dark:bg-magenta-950/25"
    >
      <p class="max-w-prose text-sm leading-relaxed text-toned">
        {{ t('docs.overview.quote') }}
      </p>
    </blockquote>

    <!-- Links to the canonical docs in the repository -->
    <div class="mt-8 rounded-[var(--ui-radius)] border border-default bg-default p-6">
      <h3 class="font-display text-base font-semibold text-highlighted">
        {{ t('docs.onGitHub') }}
      </h3>
      <p class="mt-1.5 max-w-prose text-sm text-muted">{{ t('docs.onGitHubLead') }}</p>

      <ul class="mt-5 grid gap-3 sm:grid-cols-2">
        <li v-for="link in DOC_LINKS" :key="link.id">
          <ULink
            :to="link.url"
            target="_blank"
            class="flex items-start gap-3 rounded-[var(--ui-radius)] border border-default p-3.5 transition-colors hover:border-accented"
          >
            <UIcon :name="link.icon" class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span class="min-w-0">
              <span class="block font-mono text-sm font-medium text-highlighted">
                {{ t(`docs.links.${link.id}.title`) }}
              </span>
              <span class="mt-0.5 block text-xs text-muted">
                {{ t(`docs.links.${link.id}.text`) }}
              </span>
            </span>
            <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-3.5 shrink-0 text-dimmed" aria-hidden="true" />
          </ULink>
        </li>
      </ul>
    </div>
  </div>
</template>
