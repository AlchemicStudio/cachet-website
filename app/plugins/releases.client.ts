import type { ReleaseData } from '#shared/types'
import { fetchReleases, RELEASES_KEY, FALLBACK } from '~/composables/useReleases'

/**
 * Refreshes the release data from GitHub on every page load.
 *
 * The prerendered payload is already populated, so this never blocks the first
 * paint; it just swaps in whatever GitHub says right now. If the call fails —
 * the anonymous API allows 60 requests an hour per IP, which a shared address
 * can exhaust — the baked-in data stays on screen and only a small "as of"
 * note changes.
 */
export default defineNuxtPlugin({
  name: 'cachet:releases-live',
  parallel: true,
  hooks: {
    'app:mounted': async () => {
      const config = useRuntimeConfig()
      const cached = useNuxtData<ReleaseData>(RELEASES_KEY)

      try {
        const releases = await fetchReleases(config.public.repo)
        if (!releases.length && FALLBACK.releases.length) return
        cached.data.value = {
          releases,
          fetchedAt: new Date().toISOString(),
          source: 'live'
        }
      } catch {
        const current = cached.data.value
        if (current) cached.data.value = { ...current, error: 'live-refresh-failed' }
      }
    }
  }
})
