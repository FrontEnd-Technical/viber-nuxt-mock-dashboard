export default defineNuxtConfig({
  ssr: false,
  modules: ['@pinia/nuxt', 'vuetify-nuxt-module'],
  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/600.css',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/css/main.css',
  ],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080/api/v1',
      apiRefreshEndpoint: '/auth/refresh-token',
    },
  },
  vuetify: {
    moduleOptions: {
      prefixComposables: true,
    },
    vuetifyOptions: {
      icons: {
        defaultSet: 'mdi',
      },
      theme: {
        defaultTheme: 'hotelLight',
        themes: {
          hotelLight: {
            dark: false,
            colors: {
              background: '#FFFFFF',
              surface: '#F9F9FA',
              primary: '#1C1C1C',
              secondary: '#EDEEFC',
              info: '#A0BCE8',
              success: '#71DD8C',
              warning: '#E6F1FD',
              error: '#C62828',
            },
          },
        },
      },
    },
  },
  app: {
    head: {
      title: 'Hotel Admin',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#FFFFFF' },
      ],
    },
  },
  compatibilityDate: '2026-10-31',
})
