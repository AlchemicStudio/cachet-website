import { LOCALES } from '#shared/site'
import { buildAtomFeed, feedStrings, getFeedReleases } from '../../utils/feed'

/**
 * Atom feed for a prefixed locale (`/fr/feed.xml`, `/nl/feed.xml`, …).
 * The parameter is checked against the configured locales so this route cannot
 * be reached through an arbitrary path segment.
 */
export default defineEventHandler(async event => {
  const locale = getRouterParam(event, 'locale')
  const known = LOCALES.find(l => l.code === locale && l.code !== 'en')

  if (!known) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown locale' })
  }

  const releases = await getFeedReleases(useRuntimeConfig(event).githubToken)
  const feed = buildAtomFeed(known.code, releases, await feedStrings(known.code))

  setHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
  return feed
})
