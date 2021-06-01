import c from '../common/src'
export default {
  server: {
    port: 4300,
  },

  // global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: c.GAME_NAME,
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
        content: c.GAME_DESCRIPTION,
      },
    ],
    link: [
      {
        rel: `icon`,
        type: `image/x-icon`,
        href: `/favicon.ico`,
      },
    ],
  },

  css: [`~/assets/styles/main.scss`],

  plugins: [
    { src: `~/plugins/socket.js` },
    { src: `~/plugins/masonry.js`, mode: `client` },
  ],

  components: true,

  buildModules: [`@nuxt/typescript-build`], // `nuxt-vite`],

  modules: [`@nuxtjs/axios`],

  io: {
    sockets: [
      {
        url: `http://localhost:4200`,
      },
    ],
  },

  serverMiddleware: {
    '/api': `~/api`,
  },

  build: {},
}
