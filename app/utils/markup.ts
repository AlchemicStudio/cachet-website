const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/**
 * Renders the light markup used across the message catalogs and the ported app
 * documentation: `**bold**` and `` `code` ``.
 *
 * Same escape-first contract as the release-note renderer — the source is
 * escaped before any rule runs, so the only tags in the output are the ones
 * added here. That keeps translated strings safe to interpolate even though
 * they arrive from JSON rather than from a template.
 */
export function renderInlineMarkup(text: string): string {
  const escaped = text.replace(/[&<>"']/g, c => ESCAPES[c]!)

  // Split on code spans so bold inside backticks is left alone.
  return escaped
    .split(/`([^`]+)`/g)
    .map((part, index) =>
      index % 2 === 1
        ? `<code class="rounded bg-elevated px-1 py-0.5 font-mono text-[0.85em] text-toned">${part}</code>`
        : part.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-highlighted">$1</strong>')
    )
    .join('')
}
