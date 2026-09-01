import { GTM_ID } from '#shared/site'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Reports in-site navigation to Tag Manager.
 *
 * The container's own Page View trigger fires once, on the document load. Every
 * link after that is a client-side route change with no document load behind
 * it, so without this the container would only ever see the page a visitor
 * landed on — the docs and news pages they actually read would be invisible.
 *
 * Pushes a named event rather than relying on the built-in History Change
 * trigger, so the container has an explicit signal carrying the locale, and so
 * the tag fires once per navigation rather than once per history entry (a hash
 * change to `#glossary` is not a page view).
 *
 * Pair it with a Custom Event trigger on `cachet_pageview` in Tag Manager.
 */
/**
 * Resolves once the document title reflects the page just navigated to.
 *
 * Vue's `nextTick` is not enough on its own: unhead renders the head on its
 * own animation frame, so reporting straight after the route settles sends the
 * *previous* page's title with every event. Waiting for the title to actually
 * change is the only signal that does not depend on that timing, with a short
 * ceiling so a page that legitimately reuses a title still reports.
 */
async function titleSettled(timeoutMs = 400): Promise<void> {
  const before = document.title
  const deadline = performance.now() + timeoutMs

  await nextTick()
  while (document.title === before && performance.now() < deadline) {
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
  }
}

/** `/it/` and `/it` are the same page; `/` stays `/`. */
function normalise(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

export default defineNuxtPlugin(nuxtApp => {
  if (!GTM_ID) return

  const router = useRouter()
  let previousPath = ''

  router.afterEach(async (to, from) => {
    const path = normalise(to.path)

    // `from.name` is undefined only for the initial navigation, which the
    // container already counted as the document's page view.
    if (!from.name) {
      previousPath = path
      return
    }

    // Landing on `/it/` redirects to `/it`, and jumping to `#glossary` stays
    // put. Neither is a new page, and counting them would inflate exactly the
    // pages visitors arrive on.
    if (path === previousPath) return
    previousPath = path

    await titleSettled()

    window.dataLayer?.push({
      event: 'cachet_pageview',
      page_path: to.fullPath,
      page_location: window.location.href,
      page_title: document.title,
      page_locale: nuxtApp.$i18n.locale.value
    })
  })
})
