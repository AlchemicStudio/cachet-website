<script setup lang="ts">
const { t } = useI18n()
const { docs } = useDocsReference()
</script>

<template>
  <div>
    <p v-if="docs" class="mt-3 max-w-prose text-base leading-relaxed text-muted">
      {{ docs.sources.intro }}
    </p>

    <ul v-if="docs" class="mt-6 space-y-2">
      <li v-for="source in docs.sources.items" :key="source.url">
        <ULink
          :to="source.url"
          target="_blank"
          class="flex items-start gap-2.5 rounded-lg py-1.5 text-sm text-toned hover:text-highlighted"
        >
          <UIcon name="i-lucide-external-link" class="mt-0.5 size-3.5 shrink-0 text-dimmed" aria-hidden="true" />
          <span>{{ source.title }}</span>
        </ULink>
      </li>
    </ul>
  </div>
</template>
