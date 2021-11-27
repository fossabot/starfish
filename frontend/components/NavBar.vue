<template>
  <nav class="padpane">
    <nuxt-link to="/"
      ><img
        src="/images/logo.svg"
        class="logo"
        height="38"
        width="38"
    /></nuxt-link>
    <nuxt-link to="/about">About</nuxt-link>
    <nuxt-link to="/howtoplay">How To Play</nuxt-link>
    <a :href="c.supportServerLink" target="_blank"
      >Discord Server</a
    >
    <nuxt-link to="/patchnotes">Patch Notes</nuxt-link>
    <nuxt-link to="/supportus">Support Us</nuxt-link>

    <nuxt-link to="/s" v-if="ship" class="button"
      ><span>My Ship</span></nuxt-link
    >
    <a
      to="#"
      class="underline pointer"
      v-show="userId"
      @click="logout"
      >Log out</a
    >
    <nuxt-link v-show="!userId" to="/login"
      >Log in</nuxt-link
    >
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/dist'
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
