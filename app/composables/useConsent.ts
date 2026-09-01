import { CONSENT_COOKIE, GTM_ID } from '#shared/site'

export type ConsentChoice = 'granted' | 'denied'

/** The shared answer. Populated on the client by `plugins/consent.client.ts`. */
export function useConsentState() {
  return useState<ConsentChoice | null>('consent', () => null)
}

/** Reads the stored answer straight from `document.cookie`. Client only. */
export function readStoredConsent(): ConsentChoice | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))?.[1]
  const value = raw ? decodeURIComponent(raw) : null
  return value === 'granted' || value === 'denied' ? value : null
}

/**
 * Whether the visitor has agreed to analytics.
 *
 * Nothing from Google is loaded until this says `granted` — not the Tag
 * Manager container, not a cookie. That is the point of gating rather than
 * using Consent Mode: under the ePrivacy directive the storage waits for the
 * answer, it is not merely told about it afterwards.
 *
 * The state deliberately starts as `null` and is filled in on the client. It
 * must not be seeded from the cookie inside `useState`: the pages are
 * prerendered, so that initialiser runs at build time when no visitor and no
 * cookie exist, and the resulting `null` is serialized into the payload and
 * restored over the real answer on hydration. That silently reopens the banner
 * for people who already agreed, and analytics never runs.
 *
 * The answer itself lives in a first-party cookie, which is strictly necessary
 * (it records a preference the visitor expressed) and so needs no consent.
 */
export function useConsent() {
  const choice = useConsentState()

  /** True only once the visitor has actively agreed. */
  const granted = computed(() => choice.value === 'granted')

  /** True while no choice has been made — the banner's condition. */
  const undecided = computed(() => choice.value === null)

  /** Nothing to ask about when no container is configured. */
  const applicable = Boolean(GTM_ID)

  function persist(value: ConsentChoice | null) {
    if (typeof document === 'undefined') return
    const attributes = 'path=/; samesite=lax'
    document.cookie = value === null
      ? `${CONSENT_COOKIE}=; max-age=0; ${attributes}`
      : `${CONSENT_COOKIE}=${value}; max-age=${60 * 60 * 24 * 180}; ${attributes}`
  }

  function decide(value: ConsentChoice) {
    choice.value = value
    persist(value)
  }

  /** Reopens the question, so a choice can be taken back. */
  function reset() {
    choice.value = null
    persist(null)
  }

  return { choice, granted, undecided, applicable, decide, reset }
}
