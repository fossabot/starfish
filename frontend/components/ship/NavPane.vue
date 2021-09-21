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
          >
            {{ basics.name }}
          </option>
        </select>

        <button
          class="secondary flexcenter"
          @click="toTutorial"
        >
          Redo Tutorial
        </button>

        <button
          class="secondary flexcenter"
          v-show="userId"
          @click="logout"
        >
          Log out
        </button>
      </div>
    </nav>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
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
      ;(this as any).$router.push('/')
    },
    shipSelected(e: Event) {
      this.$store.commit('set', { mapFollowingShip: true })
      this.$store.dispatch('socketSetup', this.selectedShip)
    },
    toTutorial() {
      ;(this as any).$socket?.emit(
        'crew:toTutorial',
        this.ship.id,
        this.crewMember?.id,
      )
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
