#!/usr/bin/env node
/**
 * Refreshes the committed release snapshot.
 *
 * The snapshot is the third line of defence: the browser fetches GitHub live on
 * mount, the prerender fetches it at build time, and this file is what both
 * fall back to when neither call succeeds (offline build, exhausted anonymous
 * rate limit, GitHub outage). It keeps the download card and /news populated no
 * matter what, so run it whenever a release ships:
 *
 *     pnpm run snapshot
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const REPO = 'AlchemicStudio/Cachet'
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../app/data/releases-snapshot.json')

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'cachet-website-snapshot'
}
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const detectPlatform = (name) => {
  const n = name.toLowerCase()
  if (n.includes('linux')) return 'linux'
  if (n.includes('windows') || n.includes('win') || n.endsWith('.exe') || n.endsWith('.msi')) return 'windows'
  if (n.includes('macos') || n.includes('darwin') || n.endsWith('.dmg')) return 'macos'
  if (n.includes('source')) return 'source'
  return 'other'
}

const response = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers })
if (!response.ok) {
  console.error(`GitHub API returned ${response.status} ${response.statusText}`)
  process.exit(1)
}

const releases = (await response.json())
  .filter(r => !r.draft)
  .map(r => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    body: r.body || '',
    publishedAt: r.published_at || r.created_at,
    prerelease: r.prerelease,
    draft: r.draft,
    htmlUrl: r.html_url,
    assets: r.assets.map(a => ({
      name: a.name,
      size: a.size,
      downloadCount: a.download_count,
      url: a.browser_download_url,
      digest: a.digest ?? null,
      platform: detectPlatform(a.name)
    }))
  }))

const snapshot = { releases, fetchedAt: new Date().toISOString(), source: 'snapshot' }
await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(`Wrote ${releases.length} release(s) to ${OUT}`)
