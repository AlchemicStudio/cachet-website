<script setup lang="ts">
import { SITE } from '#shared/site'

const { t } = useI18n()
const localePath = useLocalePath()

const project = computed(() => [
  { label: t('nav.docs'), to: localePath('/docs'), external: false },
  { label: t('nav.news'), to: localePath('/news'), external: false },
  { label: t('footer.sourceCode'), to: SITE.repoUrl, external: true },
  { label: t('footer.releases'), to: `${SITE.repoUrl}/releases`, external: true },
  { label: t('footer.issues'), to: `${SITE.repoUrl}/issues`, external: true }
])

const resources = computed(() => [
  { label: t('footer.eidLink'), to: 'https://eid.belgium.be' },
  { label: t('footer.eidasLink'), to: 'https://eur-lex.europa.eu/eli/reg/2014/910/oj' },
  { label: t('footer.tlBrowserLink'), to: 'https://eidas.ec.europa.eu/efda/tl-browser/' }
])

const { applicable: consentApplicable, choice: consentChoice, reset: resetConsent } = useConsent()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-24 border-t border-default bg-default">
    <UContainer class="py-14">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <LogoMark :size="28" />
            <span class="font-display text-base font-bold text-highlighted">{{ t('site.name') }}</span>
          </div>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {{ t('footer.tagline') }}
          </p>
          <p class="mt-4 max-w-md text-xs leading-relaxed text-dimmed">
            {{ t('footer.notAffiliated') }}
          </p>
        </div>

        <div>
          <h2 class="eyebrow text-dimmed">{{ t('footer.project') }}</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in project" :key="link.label">
              <ULink
                :to="link.to"
                :target="link.external ? '_blank' : undefined"
                class="text-sm text-muted hover:text-highlighted"
              >
                {{ link.label }}
              </ULink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="eyebrow text-dimmed">{{ t('footer.resources') }}</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in resources" :key="link.label">
              <ULink
                :to="link.to"
                target="_blank"
                class="text-sm text-muted hover:text-highlighted"
              >
                {{ link.label }}
              </ULink>
            </li>
          </ul>
        </div>
      </div>

      <USeparator class="my-8" />

      <div class="flex flex-col gap-3 text-xs text-dimmed sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {{ year }}
          <ULink :to="SITE.orgUrl" target="_blank" class="hover:text-highlighted">{{ SITE.org }}</ULink>
          · {{ t('footer.license') }}
        </p>
        <div class="flex items-center gap-4">
          <ClientOnly>
            <button
              v-if="consentApplicable && consentChoice"
              type="button"
              class="rounded hover:text-highlighted"
              @click="resetConsent"
            >
              {{ t('consent.manage') }}
            </button>
          </ClientOnly>
          <ULink
            :to="`${SITE.repoUrl}/blob/main/LICENSE`"
            target="_blank"
            class="font-mono hover:text-highlighted"
          >
            {{ SITE.license }}
          </ULink>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
