import { buildAtomFeed, feedStrings, getFeedReleases } from '../utils/feed'

/** Atom feed for the default (English) locale, prerendered to `/feed.xml`. */
export default defineEventHandler(async event => {
  const releases = await getFeedReleases(useRuntimeConfig(event).githubToken)
  const feed = buildAtomFeed('en', releases, await feedStrings('en'))

  setHeader(event, 'content-type', 'application/atom+xml; charset=utf-8')
  return feed
})
