<script setup lang="ts">
import type { DocBlock } from '~/composables/useAppDocs'

/**
 * Renders one section of the application's ported reference documentation.
 * The shapes come out of `scripts/extract_app_docs.py`: paragraphs, `term +
 * labelled lines` definitions, and bulleted lists whose items may carry a lead
 * term and their own labelled lines.
 */
const props = defineProps<{ blocks: DocBlock[] }>()

type Group =
  | { kind: 'p', text: string }
  | { kind: 'list', items: Extract<DocBlock, { type: 'list' }>['items'] }
  | { kind: 'definitions', entries: Extract<DocBlock, { type: 'definition' }>[] }

/**
 * Runs of definitions are collapsed into one group so they can be laid out as
 * a grid. The glossary alone carries 26 of them; stacked full-width boxes
 * would make it a very long scroll for no gain.
 */
const groups = computed<Group[]>(() => {
  const out: Group[] = []

  for (const block of props.blocks) {
    if (block.type === 'definition') {
      const last = out[out.length - 1]
      if (last?.kind === 'definitions') last.entries.push(block)
      else out.push({ kind: 'definitions', entries: [block] })
    } else if (block.type === 'list') {
      out.push({ kind: 'list', items: block.items })
    } else {
      out.push({ kind: 'p', text: block.text })
    }
  }

  return out
})
</script>

<template>
  <div class="space-y-5">
    <template v-for="(group, index) in groups" :key="index">
      <InlineMarkup
        v-if="group.kind === 'p'"
        as="p"
        :text="group.text"
        class="max-w-prose text-[0.95rem] leading-relaxed text-toned"
      />

      <dl
        v-else-if="group.kind === 'definitions'"
        class="grid items-start gap-3"
        :class="group.entries.length > 3 ? 'sm:grid-cols-2' : ''"
      >
        <div
          v-for="entry in group.entries"
          :key="entry.term"
          class="rounded-[var(--ui-radius)] border-l-2 border-violet-400 bg-muted/60 py-3 pl-4 pr-4"
        >
          <dt class="font-display text-sm font-semibold text-highlighted">
            {{ entry.term }}
          </dt>
          <dd>
            <ul class="mt-1.5 space-y-1.5">
              <li
                v-for="(line, i) in entry.lines"
                :key="i"
                class="text-[0.9rem] leading-relaxed text-toned"
                :class="line.bullet ? 'flex gap-2' : ''"
              >
                <span
                  v-if="line.bullet"
                  class="mt-2 size-1 shrink-0 rounded-full bg-violet-400"
                  aria-hidden="true"
                />
                <span>
                  <span v-if="line.label" class="font-medium text-highlighted">{{ line.label }} — </span>
                  <InlineMarkup :text="line.text" />
                </span>
              </li>
            </ul>
          </dd>
        </div>
      </dl>

      <ul v-else class="grid items-start gap-3 sm:grid-cols-2">
        <li
          v-for="(item, i) in group.items"
          :key="i"
          class="rounded-[var(--ui-radius)] border border-default bg-default p-4"
        >
          <p v-if="item.term" class="font-display text-sm font-semibold text-highlighted">
            {{ item.term }}
          </p>
          <InlineMarkup
            v-if="item.text"
            as="p"
            :text="item.text"
            class="text-[0.9rem] leading-relaxed text-toned"
            :class="item.term ? 'mt-1' : ''"
          />
          <dl v-if="item.lines.length" class="mt-2.5 space-y-1.5">
            <div v-for="(line, j) in item.lines" :key="j" class="text-[0.85rem] leading-relaxed">
              <dt v-if="line.label" class="inline font-medium text-highlighted">{{ line.label }} — </dt>
              <dd class="inline text-toned">
                <InlineMarkup :text="line.text" />
              </dd>
            </div>
          </dl>
        </li>
      </ul>
    </template>
  </div>
</template>
