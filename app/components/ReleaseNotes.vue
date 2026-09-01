<script setup lang="ts">
import { renderReleaseNotes } from '~/utils/markdown'

/**
 * GitHub release notes. `renderReleaseNotes` escapes the body before applying
 * any rule, so the v-html below can only emit the tag set that renderer builds
 * — no parser or sanitizer in the bundle, and identical output on the server
 * and in the browser.
 */
const props = defineProps<{ body: string, repo: string }>()

const html = computed(() => renderReleaseNotes(props.body, props.repo))
</script>

<template>
  <div class="release-notes" v-html="html" />
</template>

<style scoped>
.release-notes {
  color: var(--ui-text-toned);
  font-size: 0.9375rem;
  line-height: 1.65;
}

.release-notes :deep(> * + *) {
  margin-top: 0.85rem;
}

.release-notes :deep(h3),
.release-notes :deep(h4),
.release-notes :deep(h5),
.release-notes :deep(h6) {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--ui-text-highlighted);
  margin-top: 1.6rem;
}

.release-notes :deep(h3) { font-size: 1.05rem; }
.release-notes :deep(h4) { font-size: 0.95rem; }
.release-notes :deep(h5),
.release-notes :deep(h6) { font-size: 0.9rem; }

.release-notes :deep(ul),
.release-notes :deep(ol) {
  padding-left: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.release-notes :deep(ul) { list-style: disc; }
.release-notes :deep(ol) { list-style: decimal; }
.release-notes :deep(li)::marker { color: var(--ui-text-dimmed); }

.release-notes :deep(a) {
  color: var(--ui-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.release-notes :deep(a:hover) { text-decoration-thickness: 2px; }

.release-notes :deep(code) {
  background: var(--ui-bg-elevated);
  border-radius: 0.3rem;
  padding: 0.1rem 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.release-notes :deep(pre) {
  background: var(--ui-bg-elevated);
  border-radius: var(--ui-radius);
  padding: 0.9rem 1rem;
  overflow-x: auto;
}

.release-notes :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.8rem;
}

.release-notes :deep(blockquote) {
  border-left: 2px solid var(--ui-border-accented);
  padding-left: 0.9rem;
  color: var(--ui-text-muted);
}

.release-notes :deep(hr) {
  border: 0;
  border-top: 1px solid var(--ui-border);
  margin: 1.4rem 0;
}

.release-notes :deep(strong) {
  font-weight: 600;
  color: var(--ui-text-highlighted);
}
</style>
