<script setup lang="ts">
const { reference, translated: referenceTranslated } = useDocsReference()
</script>

<template>
  <div>
    <DocsReferenceBlock
      v-if="reference.glossary"
      class="mt-6"
      :section="reference.glossary"
      :translated="referenceTranslated"
      hide-title
    />
  </div>
</template>
