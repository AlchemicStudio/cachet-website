/**
 * Restores the visitor's analytics choice from their cookie.
 *
 * Runs before the other client plugins so `gtm.client.ts` sees the real answer
 * on its first check, and the banner never flashes at someone who already
 * decided. The prerendered payload cannot carry this: it was rendered once, at
 * build time, for everybody.
 */
export default defineNuxtPlugin({
  name: 'cachet:consent',
  enforce: 'pre',
  setup() {
    useConsentState().value = readStoredConsent()
  }
})
