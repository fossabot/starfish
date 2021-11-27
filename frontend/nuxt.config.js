import c from '../common/dist'

export default {
  // target: `static`,

  server: {
    port: 4300,
  },

  env: {
    IS_DOCKER: process.env.IS_DOCKER,
    NODE_ENV: process.env.NODE_ENV,
    GAME_NAME: c.gameName,
    BOT_ID:
      process.env.BOT_ID ||
      (process.env.IS_DOCKER
        ? `804439178636558396` // real starfish
        : `723017262369472603`), // j's test
  },

  vue: {
    config: {
      productionTip: false,
    },
  },

  head: {
    titleTemplate(titleChunk) {
      return (
        (process.env.NODE_ENV === `development`
          ? `DEV - `
          : ``) +
        (titleChunk ? titleChunk + ` | ` : ``) +
        process.env.GAME_NAME
      )
    },
    htmlAttrs: {
      lang: `en`,
    },
    meta: [
      { charset: `utf-8` },
      {
        name: `viewport`,
        content: `width=device-width, initial-scale=1`,
      },
      {
        hid: `description`,
        name: `description`,
        content: c.gameDescription,
      },
    ],
    link: [
      {
        rel: `icon`,
        href: `/images/favicon/favicon.svg?v=4`,
      },
      {
        rel: `alternate icon`,
        href: `/images/favicon/favicon.ico`,
      },
    ],
  },

  css: [`~/assets/styles/main.scss`],

  plugins: [
    { src: `~/plugins/profiler.ts` },
    { src: `~/plugins/socket.ts` },
    { src: `~/plugins/tooltip.ts` },
  ],

  components: true,

  buildModules: [
    `@nuxt/typescript-build`,
    `nuxt-font-loader`,
    `@aceforth/nuxt-optimized-images`,
    `@nuxtjs/google-fonts`,
  ],

  modules: [`@nuxt/content`, `portal-vue/nuxt`],

  googleFonts: {
    display: `swap`,
    preconnect: true,
    preload: true,
    families: {
      Prompt: {
        wght: [400, 600],
      },
    },
  },

  optimizedImages: {
    optimizeImages: true,
  },
}
