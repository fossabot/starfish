import c from '../common/dist'
export default {
  server: {
    port: 4300,
  },
  env: {
    IS_DOCKER: process.env.IS_DOCKER !== `false`,
  },

  head: {
    title: c.gameName,
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
    { src: `~/plugins/socket.ts` },
    { src: `~/plugins/tooltip.ts` },
  ],

  components: true,

  buildModules: [`@nuxt/typescript-build`], // , `nuxt-vite`],

  modules: [`@nuxtjs/axios`, `portal-vue/nuxt`],

  serverMiddleware: {
    '/api': `~/api`,
  },
}
