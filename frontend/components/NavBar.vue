<template>
  <nav class="padpane">
    <nuxt-link to="/"
      ><img src="/images/logo.svg" class="logo"
    /></nuxt-link>
    <nuxt-link to="/about">About</nuxt-link>
    <nuxt-link to="/howtoplay">How To Play</nuxt-link>
    <nuxt-link to="/feedback">Feedback</nuxt-link>
    <nuxt-link to="/feedback/bugreport"
      >Bug Report</nuxt-link
    >
    <nuxt-link to="/feedback/storytime"
      >Share a Story</nuxt-link
    >
    <nuxt-link to="/supportus">Support Us</nuxt-link>

    <nuxt-link to="/s" v-if="ship" class="button"
      >My Ship</nuxt-link
    >
    <a
      to="#"
      class="underline pointer"
      v-show="userId"
      @click="logout"
      >Log out</a
    >
    <a v-show="!userId" :href="loginUrl">Log in</a>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, selectedShip: null }
  },
  computed: {
    ...mapState([
      'ship',
      'userId',
      'crewMember',
      'shipIds',
      'shipsBasics',
    ]),
    loginUrl() {
      const botId =
        process?.env?.NODE_ENV === 'development'
          ? '723017262369472603'
          : '804439178636558396'
      let hostname = window.location.hostname
      if (hostname.indexOf('localhost') === 0)
        hostname = `${hostname}:${window.location.port}`
      else if (hostname.indexOf('www.') !== 0)
        hostname = 'www.' + hostname
      const postLoginPage = `http://${hostname}/postlogin`
      return `https://discord.com/api/oauth2/authorize?client_id=${botId}&redirect_uri=${encodeURIComponent(
        postLoginPage,
      )}&response_type=token&scope=identify%20guilds`
    },
  },
  watch: {
    ship() {
      if (this.ship) this.selectedShip = this.ship.id
    },
  },
  mounted() {
    if (this.ship) this.selectedShip = this.ship.id

    // c.log(this.$store, this.$store.dispatch)
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/')
    },
    shipSelected(e: Event) {
      this.$store.dispatch('socketSetup', this.selectedShip)
    },
  },
})
</script>

<style lang="scss" scoped>
nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 1.5em;

  & > * {
    margin: 0.1em 0.5em;
  }
}

.logo {
  width: 2em;
}
</style>
