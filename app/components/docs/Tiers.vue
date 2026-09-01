<script setup lang="ts">
const { reference, translated: referenceTranslated } = useDocsReference()
</script>

<template>
  <div>
    <DocsReferenceBlock
      v-if="reference.tiers"
      class="mt-6"
      :section="reference.tiers"
      :translated="referenceTranslated"
      hide-title
    />
  </div>
</template>
