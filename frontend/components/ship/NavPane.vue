<template>
  <Box class="navbox">
    <template #title>
      <span class="sectionemoji">⚙️</span>{{ c.gameName }}
    </template>
    <nav class="padpane grid2">
      <div class="flexcenter marbotsmall">
        <img
          src="/images/logo.svg"
          alt="Starfish logo"
          class="logo"
        />
      </div>
      <div class="flexcolumn rightside">
        <nuxt-link to="/">Home</nuxt-link>
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

        <select
          v-if="shipsBasics && shipsBasics.length > 1"
          @change="shipSelected"
          v-model="selectedShip"
        >
          <option
            v-for="basics in shipsBasics"
            :key="'shipselector' + basics.id"
            :selected="ship && ship.id === basics.id"
            :value="basics.id"
            >{{ basics.name }}</option
          >
        </select>

        <button v-show="userId" @click="logout">
          Log out
        </button>
        <a
          v-show="!userId"
          href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Fstarfish.cool%2Fpostlogin&response_type=token&scope=identify%20guilds"
          >Log in</a
        >
      </div>
    </nav>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
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
.navbox {
  display: inline-block;
}
nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em;
  padding-top: 0.5em;
  white-space: nowrap;

  & > * {
    margin: 0.1em 0;
  }
}

.grid2 {
  display: grid;
  grid-template-columns: 5em 1fr;
  grid-gap: 1em;
}

.logo {
  width: 5em;
}
.rightside {
  line-height: 1.6;
}
</style>
