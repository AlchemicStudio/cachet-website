<script setup lang="ts">
import { FEATURES, MODES, OUTPUT_FILE_PATTERN } from '~/content'
import { formatDate } from '~/utils/format'
import { releaseExcerpt } from '~/utils/markdown'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { latest } = useReleases()

useSiteSeo('home')
useSoftwareSchema()

const badges = ['qes', 'pades', 'batch', 'standalone'] as const
</script>

<template>
  <div>
    <!-- Hero: the guide's `core` gradient under its isometric hatching. -->
    <section class="surface-iso relative isolate overflow-hidden">
      <div class="absolute inset-x-0 bottom-0 h-px bg-white/10" aria-hidden="true" />

      <UContainer class="py-20 sm:py-28">
        <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
          <div class="min-w-0 flex-1">
            <p class="eyebrow text-aqua-300">{{ t('home.eyebrow') }}</p>

            <h1 class="mt-4 flex items-center gap-4">
              <LogoMark :size="64" on-dark class="lg:hidden" />
              <span class="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {{ t('site.name') }}
              </span>
            </h1>

            <p class="mt-4 max-w-2xl font-display text-xl font-medium text-indigo-200 sm:text-2xl">
              {{ t('site.tagline') }}
            </p>

            <p class="mt-6 max-w-2xl text-base leading-relaxed text-indigo-200/90">
              {{ t('home.lead') }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <!-- The hero band is the same in both themes, so the CTA is
                   pinned to the guide's accent magenta rather than following
                   the colour mode into a pale variant. -->
              <UButton
                :to="localePath('/docs')"
                color="secondary"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
                class="bg-magenta-600 text-white hover:bg-magenta-700"
              >
                {{ t('home.readMore') }}
              </UButton>
              <UButton
                to="#download"
                color="neutral"
                variant="ghost"
                size="lg"
                icon="i-lucide-download"
                class="bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20 hover:text-white"
              >
                {{ t('download.title') }}
              </UButton>
            </div>

            <ul class="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              <li
                v-for="badge in badges"
                :key="badge"
                class="flex items-center gap-2 text-sm text-indigo-200"
              >
                <UIcon name="i-lucide-check" class="size-4 text-aqua-400" aria-hidden="true" />
                {{ t(`home.badges.${badge}`) }}
              </li>
            </ul>
          </div>

          <LogoMark
            :size="220"
            on-dark
            class="hidden shrink-0 opacity-95 lg:block"
            :alt="t('site.name')"
          />
        </div>
      </UContainer>
    </section>

    <!-- `relative z-10` lifts the card over the hero, whose `isolate` would
         otherwise paint the gradient on top of the negative margin. -->
    <UContainer class="relative z-10 -mt-12 pb-20 sm:-mt-16">
      <DownloadCard />
    </UContainer>

    <!-- Features -->
    <UContainer class="pb-20">
      <div class="max-w-2xl">
        <h2 class="font-display text-3xl font-bold text-highlighted">{{ t('home.featuresTitle') }}</h2>
        <p class="mt-3 text-base leading-relaxed text-muted">{{ t('home.featuresLead') }}</p>
      </div>

      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </UContainer>

    <!-- The three modes -->
    <section class="border-y border-default bg-default py-20">
      <UContainer>
        <div class="max-w-2xl">
          <h2 class="font-display text-3xl font-bold text-highlighted">{{ t('home.modesTitle') }}</h2>
          <p class="mt-3 text-base leading-relaxed text-muted">{{ t('home.modesLead') }}</p>
        </div>

        <div class="mt-10 grid gap-5 lg:grid-cols-3">
          <article
            v-for="mode in MODES"
            :key="mode.id"
            class="flex flex-col rounded-[var(--ui-radius)] border border-default bg-muted/50 p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="mode.icon"
                class="size-5"
                :class="{
                  'text-indigo-600 dark:text-indigo-300': mode.accent === 'indigo',
                  'text-violet-600 dark:text-violet-300': mode.accent === 'violet',
                  'text-neutral-500 dark:text-neutral-400': mode.accent === 'neutral'
                }"
                aria-hidden="true"
              />
              <h3 class="font-display text-lg font-semibold text-highlighted">
                {{ t(`docs.modes.${mode.id}.name`) }}
              </h3>
            </div>

            <code class="mt-2 self-start rounded bg-elevated px-2 py-0.5 font-mono text-xs text-muted">
              {{ t(`docs.modes.${mode.id}.flag`) }}
            </code>

            <p class="mt-4 text-sm font-medium text-toned">
              {{ t(`docs.modes.${mode.id}.nature`) }}
            </p>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {{ t(`docs.modes.${mode.id}.note`) }}
            </p>
          </article>
        </div>

        <UButton
          :to="`${localePath('/docs')}#modes`"
          color="neutral"
          variant="link"
          class="mt-6 px-0"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.modesMore') }}
        </UButton>
      </UContainer>
    </section>

    <!-- Latest release teaser -->
    <UContainer v-if="latest" class="py-20">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 class="font-display text-3xl font-bold text-highlighted">{{ t('home.newsTitle') }}</h2>
        <UButton
          :to="localePath('/news')"
          color="neutral"
          variant="link"
          class="px-0"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.newsMore') }}
        </UButton>
      </div>

      <NuxtLink
        :to="localePath('/news')"
        class="mt-6 block rounded-[var(--ui-radius)] border border-default bg-default p-6 transition-colors hover:border-accented"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="secondary" variant="subtle">{{ latest.tag }}</UBadge>
          <span class="text-sm text-muted">
            {{ t('download.released', { date: formatDate(latest.publishedAt, locale) }) }}
          </span>
        </div>
        <p class="mt-3 max-w-prose text-sm leading-relaxed text-toned">
          {{ releaseExcerpt(latest.body, 240) }}
        </p>
      </NuxtLink>
    </UContainer>
  </div>
</template>
