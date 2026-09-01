import type { Platform, Release, ReleaseAsset } from '#shared/types'

/** Raw shape of the fields we read from `GET /repos/{owner}/{repo}/releases`. */
export interface GhAsset {
  name: string
  size: number
  download_count: number
  browser_download_url: string
  digest?: string | null
}

export interface GhRelease {
  tag_name: string
  name: string | null
  body: string | null
  published_at: string | null
  created_at: string
  prerelease: boolean
  draft: boolean
  html_url: string
  assets: GhAsset[]
}

export function detectAssetPlatform(name: string): Platform {
  const n = name.toLowerCase()
  if (n.includes('linux')) return 'linux'
  if (n.includes('windows') || n.includes('win') || n.endsWith('.exe') || n.endsWith('.msi')) return 'windows'
  if (n.includes('macos') || n.includes('darwin') || n.endsWith('.dmg')) return 'macos'
  if (n.includes('source')) return 'source'
  return 'other'
}

export function normalizeRelease(r: GhRelease): Release {
  return {
    tag: r.tag_name,
    name: r.name || r.tag_name,
    body: r.body || '',
    publishedAt: r.published_at || r.created_at,
    prerelease: r.prerelease,
    draft: r.draft,
    htmlUrl: r.html_url,
    assets: r.assets.map(normalizeAsset)
  }
}

function normalizeAsset(a: GhAsset): ReleaseAsset {
  return {
    name: a.name,
    size: a.size,
    downloadCount: a.download_count,
    url: a.browser_download_url,
    digest: a.digest ?? null,
    platform: detectAssetPlatform(a.name)
  }
}

/**
 * Newest published, non-draft, non-prerelease release — matching what GitHub
 * itself calls "latest". Falls back to the newest entry of any kind so the
 * download card is never empty on a repo that only ships prereleases.
 */
export function pickLatest(releases: Release[]): Release | undefined {
  return releases.find(r => !r.draft && !r.prerelease) ?? releases[0]
}

export function ghHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}
