<script setup lang="ts">
import { DOC_SECTION_IDS, docSlug } from '#shared/docs'
import { SECTION_ICONS } from '~/content'

/**
 * The documentation index: the overview, then a way into every section. Each
 * section is its own page at its own localized URL, so this page links rather
 * than scrolls.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()

useSiteSeo('docs')

const sections = computed(() =>
  DOC_SECTION_IDS.map(id => ({
    id,
    title: t(`docs.sections.${id}`),
    description: t(`docs.descriptions.${id}`),
    icon: SECTION_ICONS[id],
    to: `${localePath('/docs')}/${docSlug(id, locale.value)}`
  }))
)
</script>

<template>
  <div>
    <PageHeader :title="t('docs.title')" :lead="t('docs.lead')" />

    <UContainer class="py-12">
      <div class="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <DocsSidebar :current="null" />

        <div class="min-w-0">
          <DocsOverview />

          <section class="mt-16">
            <h2 class="font-display text-2xl font-bold text-highlighted">
              {{ t('docs.navTitle') }}
            </h2>
            <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {{ t('docs.navLead') }}
            </p>

            <ul class="mt-8 grid gap-4 sm:grid-cols-2">
              <li v-for="section in sections" :key="section.id">
                <NuxtLink
                  :to="section.to"
                  class="flex h-full flex-col rounded-[var(--ui-radius)] border border-default bg-default p-5 transition-colors hover:border-accented"
                >
                  <UIcon :name="section.icon" class="size-5 text-primary" aria-hidden="true" />
                  <span class="mt-3 flex items-center gap-1.5 font-display text-base font-semibold text-highlighted">
                    {{ section.title }}
                    <UIcon name="i-lucide-arrow-right" class="size-4 text-dimmed" aria-hidden="true" />
                  </span>
                  <span class="mt-1.5 text-sm leading-relaxed text-muted">
                    {{ section.description }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </UContainer>
  </div>
</template>
