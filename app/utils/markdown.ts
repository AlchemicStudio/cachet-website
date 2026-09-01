/**
 * Minimal renderer for GitHub release notes.
 *
 * Release bodies are third-party input as far as this site is concerned, so the
 * strategy is escape-first: every character is HTML-escaped before any rule
 * runs, and the rules only ever re-introduce tags from a fixed set. No markup
 * in the source can survive into the output, which is why this needs neither a
 * markdown parser nor a sanitizer dependency — and it renders identically
 * during prerender and in the browser.
 *
 * Supported: ATX headings, unordered and ordered lists, blockquotes, fenced
 * code, horizontal rules, paragraphs; inline bold, italic, code, explicit
 * links, bare URLs, @mentions and #123 issue references.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, c => ESCAPES[c]!)
}

/** Only absolute http(s) URLs become anchors; anything else stays plain text. */
function safeUrl(url: string): string | null {
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : null
}

function link(href: string, text: string): string {
  const url = safeUrl(href)
  // `href` arrives already HTML-escaped, so no quote can break the attribute.
  return url ? `<a href="${url}" rel="noopener noreferrer nofollow" target="_blank">${text}</a>` : text
}

/** `…/pull/2` becomes `owner/repo#2`, a compare URL its range, else host+path. */
function shortenUrl(url: string): string {
  const ref = url.match(/github\.com\/([^/]+\/[^/]+)\/(?:pull|issues)\/(\d+)/)
  if (ref) return `${ref[1]}#${ref[2]}`
  const compare = url.match(/github\.com\/[^/]+\/[^/]+\/compare\/(.+)$/)
  if (compare) return compare[1]!
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Inline rules for a run of text known to contain no code span. */
function renderText(escaped: string, repo: string): string {
  let out = escaped

  out = out.replace(/\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^)]*&quot;)?\)/g, (_m, text: string, href: string) =>
    link(href, text || href)
  )

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s.,;:)!?])/g, '$1<em>$2</em>')
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')

  // Bare URLs — skipped inside an href="…" produced just above.
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)]*[^\s<).,;:])/g, (_m, pre: string, url: string) =>
    `${pre}${link(url, shortenUrl(url))}`
  )

  // The two references GitHub itself auto-expands in release notes.
  out = out.replace(/(^|[\s(])@([A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38})\b/g, (_m, pre: string, user: string) =>
    `${pre}${link(`https://github.com/${user}`, `@${user}`)}`
  )
  out = out.replace(/(^|[\s(])#(\d+)\b/g, (_m, pre: string, num: string) =>
    `${pre}${link(`https://github.com/${repo}/issues/${num}`, `#${num}`)}`
  )

  return out
}

/**
 * Splits on backtick code spans and applies the inline rules only to the text
 * between them, so code content is never rewritten. Splitting beats the usual
 * placeholder trick: there is no token an author could forge.
 */
function renderInline(escaped: string, repo: string): string {
  const parts = escaped.split(/`([^`]+)`/g)
  return parts
    .map((part, index) => (index % 2 === 1 ? `<code>${part}</code>` : renderText(part, repo)))
    .join('')
}

export function renderReleaseNotes(markdown: string, repo: string): string {
  if (!markdown.trim()) return ''

  const lines = escapeHtml(markdown.replace(/\r\n/g, '\n')).split('\n')
  const html: string[] = []
  const paragraph: string[] = []
  let i = 0

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${renderInline(paragraph.join(' ').trim(), repo)}</p>`)
    paragraph.length = 0
  }

  while (i < lines.length) {
    const line = lines[i]!

    const fence = line.match(/^\s*```+\s*(\S*)/)
    if (fence) {
      flushParagraph()
      const lang = fence[1] ? ` class="language-${fence[1].replace(/[^\w-]/g, '')}"` : ''
      const code: string[] = []
      i++
      while (i < lines.length && !/^\s*```+/.test(lines[i]!)) {
        code.push(lines[i]!)
        i++
      }
      i++
      html.push(`<pre><code${lang}>${code.join('\n')}</code></pre>`)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      i++
      continue
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      flushParagraph()
      html.push('<hr>')
      i++
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushParagraph()
      // Demoted by two, so a release note's own headings never outrank the page's.
      const level = Math.min(6, heading[1]!.length + 2)
      html.push(`<h${level}>${renderInline(heading[2]!.trim(), repo)}</h${level}>`)
      i++
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      flushParagraph()
      const quote: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i]!)) {
        quote.push(lines[i]!.replace(/^\s*>\s?/, ''))
        i++
      }
      html.push(`<blockquote>${renderReleaseNotes(quote.join('\n'), repo)}</blockquote>`)
      continue
    }

    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      flushParagraph()
      const ordered = /^\s*\d+\.\s+/.test(line)
      const items: string[] = []
      while (i < lines.length && /^\s*(?:[-*+]|\d+\.)\s+/.test(lines[i]!)) {
        let item = lines[i]!.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')
        i++
        // Indented continuation lines belong to the item above them.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]!) && !/^\s*(?:[-*+]|\d+\.)\s+/.test(lines[i]!)) {
          item += ` ${lines[i]!.trim()}`
          i++
        }
        items.push(`<li>${renderInline(item, repo)}</li>`)
      }
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`)
      continue
    }

    paragraph.push(line.trim())
    i++
  }

  flushParagraph()
  return html.join('\n')
}

/** First run of plain prose, for meta descriptions and feed summaries. */
export function releaseExcerpt(markdown: string, max = 200): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s\S*$/, '')}…` : text
}
