export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Centflow',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FAF7F2' },
        { name: 'apple-mobile-web-app-title', content: 'Centflow' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    tursoDbUrl: 'file:./data/budget.db',
    tursoAuthToken: '',
    betterAuthSecret: '',
    betterAuthUrl: 'http://localhost:3000',
    resendApiKey: '',
    resendFrom: 'Centflow <onboarding@resend.dev>',
    public: {
      betterAuthUrl: 'http://localhost:3000',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Centflow',
      short_name: 'Centflow',
      description: 'Gestion de budget familial simple et efficace',
      theme_color: '#FAF7F2',
      background_color: '#FAF7F2',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^\/api\/budget\/.*$/,
          handler: 'StaleWhileRevalidate',
          method: 'GET',
          options: {
            cacheName: 'budget-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
          },
        },
        {
          urlPattern: /^\/api\/recurring\/.*$/,
          handler: 'StaleWhileRevalidate',
          method: 'GET',
          options: {
            cacheName: 'recurring-api-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
  },

  ui: {
    colorMode: false,
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    '/api/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store',
      },
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
