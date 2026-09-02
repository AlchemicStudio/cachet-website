import snapshot from '~/data/releases-snapshot.json'
import type { Release, ReleaseData } from '#shared/types'
import { GITHUB_API } from '#shared/site'
import { ghHeaders, normalizeRelease, pickLatest, type GhRelease } from '~/utils/github'

export const RELEASES_KEY = 'github-releases'

/**
 * Fetches the release list straight from the GitHub REST API.
 *
 * Called twice in a page's life: once on the server during `nuxt generate`, so
 * the static HTML ships with data already in it, and once in the browser from
 * `plugins/releases.client.ts`, so what the visitor sees is live. A token is
 * only ever attached server-side — it exists to lift the anonymous 60 req/h
 * limit on CI and must not reach the client bundle.
 */
export async function fetchReleases(repo: string, token?: string): Promise<Release[]> {
  const raw = await $fetch<GhRelease[]>(`${GITHUB_API}/repos/${repo}/releases`, {
    headers: ghHeaders(token),
    query: { per_page: 30 },
    timeout: 10_000,
    retry: 1
  })
  return raw.filter(r => !r.draft).map(normalizeRelease)
}

export const FALLBACK: ReleaseData = snapshot as ReleaseData

export function useReleases() {
  const config = useRuntimeConfig()
  const repo = config.public.repo

  const { data } = useAsyncData<ReleaseData>(
    RELEASES_KEY,
    async () => {
      try {
        const releases = await fetchReleases(repo, import.meta.server ? config.githubToken : undefined)
        // An empty list means the call succeeded against a repo with no
        // releases; a snapshot with entries is still the better answer.
        if (!releases.length && FALLBACK.releases.length) return { ...FALLBACK }
        return { releases, fetchedAt: new Date().toISOString(), source: 'snapshot' as const }
      } catch (error) {
        // Never fail the build over GitHub being unreachable.
        console.warn(`[cachet] build-time release fetch failed, using snapshot: ${(error as Error).message}`)
        return { ...FALLBACK, error: 'build-fetch-failed' }
      }
    },
    { default: () => ({ ...FALLBACK }) }
  )

  const releases = computed(() => data.value?.releases ?? [])
  const latest = computed(() => pickLatest(releases.value))

  // `source`, `fetchedAt` and `error` stay on the payload — the live refresh
  // sets them — but nothing renders them: whether a visitor is looking at the
  // baked-in copy or a fresh one is not something they should have to think
  // about.
  return { data, releases, latest }
}
