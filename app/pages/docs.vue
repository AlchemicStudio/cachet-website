<script setup lang="ts">
import { SITE } from '#shared/site'
import {
  CLI_EXAMPLES,
  CLI_FLAGS,
  DOC_LINKS,
  DOC_SECTIONS,
  FEATURES,
  INSTALL_SOURCE,
  LEGAL_NOTICES,
  MODES,
  OUTPUT_FILE_PATTERN,
  PADES_LEVELS,
  REFERENCE_LOCALES,
  REQUIREMENTS,
  WIZARD_STEPS
} from '~/content'

const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()
const docs = useAppDocs()

useSiteSeo('docs')

/** Ported reference sections, looked up by the id the extractor assigns. */
const reference = computed(() => {
  const sections = docs.value?.sections ?? []
  return Object.fromEntries(sections.map(s => [s.id, s]))
})

/** A locale without its own reference falls back to English, and says so. */
const referenceTranslated = computed(() =>
  (REFERENCE_LOCALES as readonly string[]).includes(locale.value)
)

const activeSection = ref<string>(DOC_SECTIONS[0])

/**
 * Highlights the table-of-contents entry for whichever heading last crossed
 * the top of the viewport. Client-only, and purely cosmetic — the anchors work
 * regardless.
 */
onMounted(() => {
  const headings = DOC_SECTIONS
    .map(id => document.getElementById(id))
    .filter((el): el is HTMLElement => Boolean(el))

  const observer = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) activeSection.value = visible.target.id
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  )

  headings.forEach(el => observer.observe(el))
  onBeforeUnmount(() => observer.disconnect())
})

/** `tm` returns the raw array; `rt` resolves each entry to a plain string. */
function requirementItems(id: string): string[] {
  const list = tm(`docs.requirements.${id}.items`) as unknown[]
  return Array.isArray(list) ? list.map(entry => rt(entry as never)) : []
}
</script>

<template>
  <div>
    <PageHeader :title="t('docs.title')" :lead="t('docs.lead')" />

    <UContainer class="py-12">
      <div class="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <!-- Table of contents -->
        <nav class="mb-10 lg:mb-0" :aria-label="t('docs.toc')">
          <div class="lg:sticky lg:top-[calc(var(--ui-header-height)+2rem)]">
            <h2 class="eyebrow text-dimmed">{{ t('docs.toc') }}</h2>
            <ul class="mt-4 space-y-0.5 border-l border-default">
              <li v-for="section in DOC_SECTIONS" :key="section">
                <a
                  :href="`#${section}`"
                  class="-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors"
                  :class="activeSection === section
                    ? 'border-secondary font-medium text-highlighted'
                    : 'border-transparent text-muted hover:border-accented hover:text-toned'"
                  :aria-current="activeSection === section ? 'location' : undefined"
                >
                  {{ t(`docs.sections.${section}`) }}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div class="min-w-0 space-y-20">
          <!-- Overview -->
          <section id="overview" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.overview') }}
            </h2>
            <div class="mt-5 space-y-4">
              <p
                v-for="key in ['p1', 'p2', 'p3']"
                :key="key"
                class="max-w-prose text-base leading-relaxed text-toned"
              >
                {{ t(`docs.overview.${key}`) }}
              </p>
            </div>

            <blockquote
              class="mt-6 rounded-[var(--ui-radius)] border-l-2 border-magenta-600 bg-magenta-50 p-4 dark:bg-magenta-950/25"
            >
              <p class="max-w-prose text-sm leading-relaxed text-toned">
                {{ t('docs.overview.quote') }}
              </p>
            </blockquote>

            <!-- Links to the canonical docs in the repository -->
            <div class="mt-8 rounded-[var(--ui-radius)] border border-default bg-default p-6">
              <h3 class="font-display text-base font-semibold text-highlighted">
                {{ t('docs.onGitHub') }}
              </h3>
              <p class="mt-1.5 max-w-prose text-sm text-muted">{{ t('docs.onGitHubLead') }}</p>

              <ul class="mt-5 grid gap-3 sm:grid-cols-2">
                <li v-for="link in DOC_LINKS" :key="link.id">
                  <ULink
                    :to="link.url"
                    target="_blank"
                    class="flex items-start gap-3 rounded-[var(--ui-radius)] border border-default p-3.5 transition-colors hover:border-accented"
                  >
                    <UIcon :name="link.icon" class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span class="min-w-0">
                      <span class="block font-mono text-sm font-medium text-highlighted">
                        {{ t(`docs.links.${link.id}.title`) }}
                      </span>
                      <span class="mt-0.5 block text-xs text-muted">
                        {{ t(`docs.links.${link.id}.text`) }}
                      </span>
                    </span>
                    <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-3.5 shrink-0 text-dimmed" aria-hidden="true" />
                  </ULink>
                </li>
              </ul>
            </div>
          </section>

          <!-- Features -->
          <section id="features" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.features') }}
            </h2>
            <ul class="mt-6 grid gap-4 sm:grid-cols-2">
              <li
                v-for="feature in FEATURES"
                :key="feature.id"
                class="rounded-[var(--ui-radius)] border border-default bg-default p-5"
              >
                <UIcon :name="feature.icon" class="size-5 text-primary" aria-hidden="true" />
                <h3 class="mt-3 font-display text-base font-semibold text-highlighted">
                  {{ t(`docs.features.${feature.id}.title`) }}
                </h3>
                <InlineMarkup
                  as="p"
                  :text="t(`docs.features.${feature.id}.text`, { pattern: OUTPUT_FILE_PATTERN })"
                  class="mt-1.5 text-sm leading-relaxed text-muted"
                />
              </li>
            </ul>
          </section>

          <!-- The three modes -->
          <section id="modes" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.modes') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.modes.lead') }}
            </p>

            <div class="mt-6 overflow-x-auto">
              <table class="w-full min-w-[42rem] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-accented text-left">
                    <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.mode') }}</th>
                    <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.requires') }}</th>
                    <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.modes.table.nature') }}</th>
                    <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.modes.table.output') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mode in MODES" :key="mode.id" class="border-b border-muted align-top">
                    <td class="py-4 pr-4">
                      <span class="flex items-center gap-2 font-display font-semibold text-highlighted">
                        <UIcon :name="mode.icon" class="size-4 shrink-0 text-muted" aria-hidden="true" />
                        {{ t(`docs.modes.${mode.id}.name`) }}
                      </span>
                      <code class="mt-1 block font-mono text-xs text-dimmed">
                        {{ t(`docs.modes.${mode.id}.flag`) }}
                      </code>
                    </td>
                    <td class="py-4 pr-4 text-muted">{{ t(`docs.modes.${mode.id}.requires`) }}</td>
                    <td class="py-4 pr-4 text-muted">{{ t(`docs.modes.${mode.id}.nature`) }}</td>
                    <td class="py-4 text-muted">{{ t(`docs.modes.${mode.id}.output`) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <DocsReferenceBlock
              v-if="reference.modes"
              class="mt-8"
              :section="reference.modes"
              :translated="referenceTranslated"
            />
          </section>

          <!-- Step by step -->
          <section id="walkthrough" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.walkthrough') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.walkthrough.lead') }}
            </p>

            <WizardShot
              step="welcome"
              :index="0"
              :alt="t('docs.walkthrough.welcomeAlt')"
              class="mt-6"
            />

            <ol class="mt-8 space-y-4">
              <li
                v-for="(step, index) in WIZARD_STEPS"
                :key="step.id"
                class="relative rounded-[var(--ui-radius)] border border-default bg-default p-5 pl-16"
              >
                <span
                  class="grad-wireframe absolute left-5 top-5 flex size-8 items-center justify-center rounded-full font-display text-sm font-bold text-neutral-900"
                  aria-hidden="true"
                >
                  {{ index + 1 }}
                </span>
                <h3 class="font-display text-base font-semibold text-highlighted">
                  {{ t(`docs.walkthrough.steps.${step.id}.title`) }}
                </h3>
                <InlineMarkup
                  as="p"
                  :text="t(`docs.walkthrough.steps.${step.id}.text`, { pattern: OUTPUT_FILE_PATTERN })"
                  class="mt-1.5 max-w-prose text-sm leading-relaxed text-muted"
                />
                <WizardShot :step="step.id" :index="index + 1" />
              </li>
            </ol>

            <p class="mt-6 text-sm text-muted">
              {{ t('docs.walkthrough.cliNote') }}
            </p>
            <p class="mt-2 text-xs italic text-dimmed">
              {{ t('docs.walkthrough.shotNote') }}
            </p>
          </section>

          <!-- Command line -->
          <section id="cli" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.cli') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.cli.lead') }}
            </p>

            <h3 class="mt-8 font-display text-lg font-semibold text-highlighted">
              {{ t('docs.cli.examplesTitle') }}
            </h3>
            <div class="mt-4 space-y-4">
              <CodeBlock
                v-for="example in CLI_EXAMPLES"
                :key="example.id"
                :code="example.command"
                :caption="t(`docs.cli.examples.${example.id}`)"
              />
            </div>

            <h3 class="mt-10 font-display text-lg font-semibold text-highlighted">
              {{ t('docs.cli.flagsTitle') }}
            </h3>
            <p class="mt-2 max-w-prose text-sm text-muted">{{ t('docs.cli.flagsLead') }}</p>

            <div class="mt-4 overflow-x-auto">
              <table class="w-full min-w-[36rem] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-accented text-left">
                    <th class="eyebrow py-2.5 pr-6 text-dimmed">{{ t('docs.cli.flagColumn') }}</th>
                    <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.cli.meaningColumn') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="flag in CLI_FLAGS" :key="flag" class="border-b border-muted align-top">
                    <td class="whitespace-nowrap py-3 pr-6">
                      <code class="font-mono text-xs text-primary">
                        {{ flag === '--x-y' ? '--x --y' : flag }}
                      </code>
                    </td>
                    <td class="py-3 text-muted">
                      <InlineMarkup :text="t(`docs.cli.flags.${flag}`, { pattern: OUTPUT_FILE_PATTERN })" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Signature levels -->
          <section id="levels" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.levels') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.levels.lead') }}
            </p>

            <div class="mt-6 overflow-x-auto">
              <table class="w-full min-w-[38rem] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-accented text-left">
                    <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.levels.table.level') }}</th>
                    <th class="eyebrow py-2.5 pr-4 text-dimmed">{{ t('docs.levels.table.adds') }}</th>
                    <th class="eyebrow py-2.5 text-dimmed">{{ t('docs.levels.table.network') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in PADES_LEVELS" :key="level.id" class="border-b border-muted align-top">
                    <td class="whitespace-nowrap py-3.5 pr-4">
                      <code class="font-mono text-xs font-semibold text-highlighted">{{ level.id }}</code>
                      <UBadge
                        v-if="'default' in level && level.default"
                        color="secondary"
                        variant="subtle"
                        size="sm"
                        class="ml-2"
                      >
                        {{ t('docs.levels.default') }}
                      </UBadge>
                    </td>
                    <td class="py-3.5 pr-4 text-muted">{{ t(`docs.levels.adds.${level.id}`) }}</td>
                    <td class="py-3.5 text-muted">
                      {{ level.offline
                        ? t('docs.levels.networkNone')
                        : level.id === 'b-t'
                          ? t('docs.levels.networkTsa')
                          : t('docs.levels.networkFull') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <DocsReferenceBlock
              v-if="reference.levels"
              class="mt-8"
              :section="reference.levels"
              :translated="referenceTranslated"
            />
            <DocsReferenceBlock
              v-if="reference.glance"
              class="mt-6"
              :section="reference.glance"
              :translated="referenceTranslated"
              hide-note
            />
          </section>

          <!-- AES vs QES -->
          <section id="tiers" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.tiers') }}
            </h2>
            <DocsReferenceBlock
              v-if="reference.tiers"
              class="mt-6"
              :section="reference.tiers"
              :translated="referenceTranslated"
              hide-title
            />
          </section>

          <!-- Requirements -->
          <section id="requirements" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.requirements') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.requirements.lead') }}
            </p>

            <div class="mt-6 grid gap-4 lg:grid-cols-3">
              <div
                v-for="requirement in REQUIREMENTS"
                :key="requirement.id"
                class="rounded-[var(--ui-radius)] border border-default bg-default p-5"
              >
                <div class="flex items-center gap-2.5">
                  <UIcon :name="requirement.icon" class="size-4 text-primary" aria-hidden="true" />
                  <h3 class="font-display text-base font-semibold text-highlighted">
                    {{ t(`docs.requirements.${requirement.id}.title`) }}
                  </h3>
                </div>
                <ul class="mt-3 space-y-2">
                  <li
                    v-for="(item, index) in requirementItems(requirement.id)"
                    :key="index"
                    class="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span class="mt-2 size-1 shrink-0 rounded-full bg-aqua-500" aria-hidden="true" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <p class="mt-5 max-w-prose text-sm text-muted">{{ t('docs.requirements.preview') }}</p>
          </section>

          <!-- Installation -->
          <section id="install" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.install') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.install.lead') }}
            </p>

            <div class="mt-6 space-y-6">
              <div class="rounded-[var(--ui-radius)] border border-default bg-default p-6">
                <h3 class="font-display text-base font-semibold text-highlighted">
                  {{ t('docs.install.binaryTitle') }}
                </h3>
                <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {{ t('docs.install.binaryText') }}
                </p>
                <UButton
                  :to="`${localePath('/')}#download`"
                  color="secondary"
                  size="sm"
                  icon="i-lucide-download"
                  class="mt-4"
                >
                  {{ t('docs.install.downloadCta') }}
                </UButton>
              </div>

              <div>
                <h3 class="font-display text-base font-semibold text-highlighted">
                  {{ t('docs.install.sourceTitle') }}
                </h3>
                <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {{ t('docs.install.sourceText') }}
                </p>
                <CodeBlock class="mt-4" :code="INSTALL_SOURCE" :caption="t('docs.install.sourceTitle')" />
              </div>

              <div>
                <h3 class="font-display text-base font-semibold text-highlighted">
                  {{ t('docs.install.buildTitle') }}
                </h3>
                <p class="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {{ t('docs.install.buildText') }}
                </p>
                <UButton
                  :to="`${SITE.repoUrl}/blob/main/BUILD.md`"
                  target="_blank"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-hammer"
                  class="mt-3"
                >
                  BUILD.md
                </UButton>
              </div>
            </div>
          </section>

          <!-- Glossary -->
          <section id="glossary" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.glossary') }}
            </h2>
            <DocsReferenceBlock
              v-if="reference.glossary"
              class="mt-6"
              :section="reference.glossary"
              :translated="referenceTranslated"
              hide-title
            />
          </section>

          <!-- Sources -->
          <section id="sources" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.sources') }}
            </h2>
            <p v-if="docs" class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ docs.sources.intro }}
            </p>

            <ul v-if="docs" class="mt-6 space-y-2">
              <li v-for="source in docs.sources.items" :key="source.url">
                <ULink
                  :to="source.url"
                  target="_blank"
                  class="flex items-start gap-2.5 rounded-lg py-1.5 text-sm text-toned hover:text-highlighted"
                >
                  <UIcon name="i-lucide-external-link" class="mt-0.5 size-3.5 shrink-0 text-dimmed" aria-hidden="true" />
                  <span>{{ source.title }}</span>
                </ULink>
              </li>
            </ul>
          </section>

          <!-- Legal notices -->
          <section id="legal" class="scroll-mt-24">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.sections.legal') }}
            </h2>
            <div class="mt-6 space-y-4">
              <UAlert
                v-for="notice in LEGAL_NOTICES"
                :key="notice.id"
                :color="notice.color"
                variant="subtle"
                :icon="notice.icon"
                :title="t(`docs.legal.${notice.id}.title`)"
                :description="t(`docs.legal.${notice.id}.text`)"
              />
            </div>
          </section>
        </div>
      </div>
    </UContainer>
  </div>
</template>
