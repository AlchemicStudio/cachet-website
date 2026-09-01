<script lang="ts">
import { defineComponent, h } from 'vue'
import { renderInlineMarkup } from '~/utils/markup'

/**
 * Renders a catalog string carrying `**bold**` / `` `code` `` markup.
 *
 * A render function rather than a template: `v-html` on a dynamic
 * `<component :is>` is dropped by the server renderer, so the markup only
 * appeared after hydration and every string routed through this component was
 * missing from the prerendered HTML. `h(tag, { innerHTML })` is serialized
 * server-side, so the text ships in the static page.
 *
 * `renderInlineMarkup` escapes before it substitutes, so the only tags that can
 * reach `innerHTML` are the ones it adds itself.
 */
export default defineComponent({
  name: 'InlineMarkup',
  props: {
    text: { type: String, required: true },
    /** Element to render; anything inline-safe, or a block tag like `p`. */
    as: { type: String, default: 'span' }
  },
  setup(props) {
    return () => h(props.as, { innerHTML: renderInlineMarkup(props.text) })
  }
})
</script>
