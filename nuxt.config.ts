import { GTM_ID, LOCALES, LOCALE_COOKIE, SITE } from './shared/site'

/**
 * Pre-hydration language redirect.
 *
 * Inlined into every page's `<head>` and executed before Vue mounts, so the
 * root URL lands on the visitor's language without the prerendered markup
 * being hydrated first and navigated away from. Kept deliberately small and
 * dependency-free; anything it cannot resolve simply leaves the page alone.
 */
const LOCALE_REDIRECT_SCRIPT = `(function(){try{
var codes=${JSON.stringify(LOCALES.map(l => l.code))};
var path=location.pathname.replace(/\\/index\\.html$/,'/');
if(path!=='/')return;
var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]*)/);
var saved=m?decodeURIComponent(m[1]):null;
var target=saved&&codes.indexOf(saved)>-1?saved:null;
if(!target){
var prefs=navigator.languages||[navigator.language||'en'];
for(var i=0;i<prefs.length&&!target;i++){
var tag=String(prefs[i]).toLowerCase().split('-')[0];
if(codes.indexOf(tag)>-1)target=tag;}}
if(!target||target==='en')return;
location.replace('/'+target+location.search+location.hash);
}catch(e){}})();`

/**
 * Google Tag Manager loader, as issued for the container — kept byte-for-byte
 * rather than reconstructed, so it stays comparable with what Tag Manager
 * shows in its install instructions.
 */
const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  css: ['~/assets/css/main.css'],

  site: {
    url: SITE.url,
    name: SITE.name
  },

  runtimeConfig: {
    // Only consumed at build/prerender time, to lift the 60 req/h anonymous
    // GitHub rate limit on CI. Never exposed to the client.
    githubToken: process.env.GITHUB_TOKEN || '',
    public: {
      repo: SITE.repo
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#F9F9F9' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0A0713' }
      ],
      script: [
        {
          // Sends a first-time visitor to their own language before Vue boots.
          // Runs only on the site root, only when no choice has been stored,
          // and only towards a locale it actually has — so it cannot loop, and
          // it never overrides a language the visitor picked themselves.
          //
          // Ordered ahead of Tag Manager on purpose: this calls
          // `location.replace`, so a redirected visitor never finishes loading
          // `/`. Firing the tag first would count a pageview for a page nobody
          // saw, then a second one for the page they actually got.
          innerHTML: LOCALE_REDIRECT_SCRIPT,
          tagPosition: 'head' as const,
          tagPriority: 1
        },
        ...(GTM_ID
          ? [{
              innerHTML: GTM_SCRIPT,
              tagPosition: 'head' as const,
              tagPriority: 2
            }]
          : [])
      ],
      noscript: GTM_ID
        ? [{
            // Tag Manager's fallback frame, first thing inside <body>.
            innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            tagPosition: 'bodyOpen' as const
          }]
        : []
    }
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'info', 'success', 'warning', 'error']
    }
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    baseUrl: SITE.url,
    locales: LOCALES.map(l => ({
      code: l.code,
      language: l.language,
      name: l.name,
      dir: 'ltr' as const,
      file: `${l.code}.json`
    })),
    // Lazy loading is implicit in @nuxtjs/i18n v10 whenever a locale declares
    // a `file`; the old `lazy` flag no longer exists.
    // Detection is handled by the inline script in `app.head.script` below.
    // The module's own version redirects during hydration, which on a
    // prerendered page means Vue hydrates `/` and then navigates away — a
    // guaranteed hydration mismatch. Redirecting before Vue starts avoids it.
    detectBrowserLanguage: false,
    experimental: { typedPages: true }
  },

  sitemap: {
    autoI18n: true,
    xsl: false
  },

  robots: {
    allow: ['/']
    // No explicit `sitemap`: @nuxtjs/sitemap registers its own index with
    // @nuxtjs/robots. Pointing at /sitemap.xml by hand advertised a URL the
    // module never emits — and made the prerender crawler render a 404 page
    // into a `sitemap.xml/` directory.
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: [
        '/',
        '/docs',
        '/news',
        '/feed.xml',
        ...LOCALES.filter(l => l.code !== 'en').flatMap(l => [
          `/${l.code}`,
          `/${l.code}/docs`,
          `/${l.code}/news`,
          `/${l.code}/feed.xml`
        ])
      ]
    }
  },

  typescript: { typeCheck: false, strict: true },

  future: { compatibilityVersion: 4 }
})
