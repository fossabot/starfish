import c from '../common/dist'
import isDocker from 'is-docker'

c.log(process.env.BOT_ID)

export default {
  // target: `static`,

  server: {
    port: 4300,
  },

  env: {
    IS_DOCKER: isDocker(),
    NODE_ENV: process.env.NODE_ENV,
    GAME_NAME: c.gameName,
    BOT_ID:
      process.env.BOT_ID ||
      (isDocker()
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
    `@nuxtjs/google-fonts`,
  ],

  modules: [`portal-vue/nuxt`],

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
}
