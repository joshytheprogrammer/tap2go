// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'nuxt-vuefire',
    '@nuxt/ui',
  ],
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    public: {
      baseUrl: '',
      cloudinarySecret: ''
    },
    telegramBotToken: '',
    telegramApiDomain: '',
    callbackUrl: '',
    googleApplicationCredentials: '',
  },
  vuefire: {
    auth: {
      enabled: true
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    }
  },
})