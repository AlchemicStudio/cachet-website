<script setup lang="ts">
import { LEGAL_NOTICES } from '~/content'

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="mt-6 space-y-4">
      <UAlert
        v-for="notice in LEGAL_NOTICES"
        :key="notice.id"
        :color="notice.color"
        variant="subtle"
        :icon="notice.icon"
        :title="t(`docs.legal.${notice.id}.title`)"
        :description="t(`docs.legal.${notice.id}.text`)"
      />
    </div>
  </div>
</template>
