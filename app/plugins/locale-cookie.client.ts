import { LOCALE_COOKIE } from '#shared/site'

/**
 * Persists the active locale so the pre-hydration redirect script in
 * `nuxt.config.ts` honours it on the next visit to the site root. Writing it
 * from a watcher rather than from the switcher means it stays correct however
 * the locale changed — menu, direct URL, or a link from elsewhere.
 */
export default defineNuxtPlugin(() => {
  const { locale } = useNuxtApp().$i18n
  const cookie = useCookie<string>(LOCALE_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/'
  })

  watch(
    locale,
    value => {
      if (value) cookie.value = value
    },
    { immediate: true }
  )
})
