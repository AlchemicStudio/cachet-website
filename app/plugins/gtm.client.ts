import { GTM_ID } from '#shared/site'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    google_tag_manager?: Record<string, unknown>
  }
}

/**
 * Loads the Tag Manager container, but only once the visitor has agreed.
 *
 * This is the same work the inline snippet from Tag Manager does — seed
 * `dataLayer`, push `gtm.js` with a start time, append the async script — moved
 * behind the consent check. Nothing is requested from Google before that, so a
 * visitor who declines, or who never answers, is never in touch with it.
 *
 * The watcher covers agreeing on the current page: the container loads
 * immediately, and its own page view counts the page they are looking at.
 */
export default defineNuxtPlugin(() => {
  if (!GTM_ID) return

  const { granted } = useConsent()

  watch(
    granted,
    isGranted => {
      if (isGranted) load(GTM_ID)
    },
    { immediate: true }
  )
})

function load(id: string) {
  // Agreeing, navigating and agreeing again must not load it twice.
  if (window.google_tag_manager?.[id] || document.getElementById('gtm-loader')) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.id = 'gtm-loader'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
  document.head.appendChild(script)
}
