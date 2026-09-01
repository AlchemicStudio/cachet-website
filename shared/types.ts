/** Subset of the GitHub REST release payload the site actually renders. */
export interface ReleaseAsset {
  name: string
  size: number
  downloadCount: number
  url: string
  /** e.g. `sha256:ab12…` — GitHub exposes this as `digest`. */
  digest: string | null
  platform: Platform
}

export interface Release {
  tag: string
  name: string
  body: string
  publishedAt: string
  prerelease: boolean
  draft: boolean
  htmlUrl: string
  assets: ReleaseAsset[]
}

export type Platform = 'linux' | 'windows' | 'macos' | 'source' | 'other'

export interface ReleaseData {
  releases: Release[]
  /** ISO timestamp of when this data was obtained. */
  fetchedAt: string
  /** `snapshot` = baked at build time, `live` = refreshed in the browser. */
  source: 'snapshot' | 'live'
  /** Set when a live refresh failed, so the UI can say so without hiding data. */
  error?: string
}
