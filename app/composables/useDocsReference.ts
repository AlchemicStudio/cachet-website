import { REFERENCE_LOCALES } from '~/content'
import type { DocSectionData } from '~/composables/useAppDocs'

/**
 * The application's own reference documentation, indexed by section id.
 *
 * Each documentation page pulls the one block it needs, so the section
 * components stay independent of how the page above them is assembled.
 */
export function useDocsReference() {
  const { locale } = useI18n()
  const docs = useAppDocs()

  const reference = computed<Record<string, DocSectionData | undefined>>(() =>
    Object.fromEntries((docs.value?.sections ?? []).map(section => [section.id, section]))
  )

  /** False when the visitor's language has no reference and falls back to English. */
  const translated = computed(() =>
    (REFERENCE_LOCALES as readonly string[]).includes(locale.value)
  )

  return { docs, reference, translated }
}
