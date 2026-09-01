import type { RouteLocationNormalizedLoaded } from 'vue-router'

interface LocalisedPaths {
  /** The route these paths describe, so stale values are never reused. */
  forPath: string
  /** locale code -> full path in that language. */
  byLocale: Record<string, string>
}

/**
 * Lets a page tell the language switcher where its translations live.
 *
 * `switchLocalePath` derives the target by substituting route params, which
 * works only if it can see the params for the other locales. `useSetI18nParams`
 * supplies those during SSR — the `hreflang` alternates come out right — but in
 * the browser the header renders before the page's setup runs, so the
 * switcher's computed evaluates before the params exist and never re-runs.
 *
 * Documentation sections have a different slug in every language, so getting
 * this wrong sends readers to a 404. Publishing the paths explicitly is
 * deterministic and does not depend on the module's internal ordering.
 */
export function useLocalisedPaths() {
  return useState<LocalisedPaths | null>('localised-paths', () => null)
}

/** Called by a page whose URL differs per locale. */
export function setLocalisedPaths(forPath: string, byLocale: Record<string, string>) {
  useLocalisedPaths().value = { forPath, byLocale }
}

/** The path for one locale, or null when the current route has none registered. */
export function localisedPathFor(
  route: RouteLocationNormalizedLoaded,
  locale: string
): string | null {
  const stored = useLocalisedPaths().value
  if (!stored) return null
  // Trailing slashes vary between the server's route and the browser's URL.
  const same = stored.forPath.replace(/\/+$/, '') === route.path.replace(/\/+$/, '')
  return same ? (stored.byLocale[locale] ?? null) : null
}
