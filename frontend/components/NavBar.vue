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
    <a to="#" v-show="userId" @click="logout">
      Log out
    </a>
    <a
      v-show="!userId"
      href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Fstarfish.cool%2Fpostlogin&response_type=token&scope=identify%20guilds"
      >Log in</a
    >
  </nav>
</template>

<script lang="ts">
import c from '../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
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
  },
  watch: {
    ship() {
      if (this.ship) this.selectedShip = this.ship.id
    },
  },
  mounted(this: ComponentShape) {
    if (this.ship) this.selectedShip = this.ship.id
  },
  methods: {
    logout(this: ComponentShape) {
      this.$store.dispatch('logout')
      this.$router.push('/')
    },
    shipSelected(this: ComponentShape, e: Event) {
      this.$store.dispatch('socketSetup', this.selectedShip)
    },
  },
}
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
