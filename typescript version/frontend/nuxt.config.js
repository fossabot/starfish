export default {
  server: {
    port: 4300,
  },

  // global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: `frontend`,
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
        content: ``,
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

  css: [],

  plugins: [],

  components: true,

  buildModules: [`nuxt-vite`],

  modules: [`@nuxtjs/axios`, `nuxt-socket-io`],
  io: {
    sockets: [
      {
        url: `http://localhost:4200`,
      },
    ],
  },

  axios: {},

  build: {},
}
