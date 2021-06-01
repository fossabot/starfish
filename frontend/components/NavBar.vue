<template>
  <Box>
    <template #title>
      <span class="sectionemoji">⚙️</span>{{ c.GAME_NAME }}
    </template>
    <nav class="pad-pane">
      <nuxt-link to="/">Home</nuxt-link>
      <nuxt-link to="/">How To Play</nuxt-link>
      <nuxt-link to="/" @click.native="test"
        >Feedback</nuxt-link
      >
      <nuxt-link to="/">Bug Report</nuxt-link>
      <nuxt-link to="/">Share a Story</nuxt-link>

      <select
        v-if="shipIds && shipIds.length > 1"
        @change="shipSelected"
        v-model="selectedShip"
      >
        <option
          v-for="id in shipIds"
          :key="'shipselector' + id"
          :selected="ship && ship.id === id"
          :value="id"
          >{{ id }}</option
        >
      </select>

      <button v-show="userId" @click="logout">
        Log out
      </button>
      <a
        v-show="!userId"
        href="https://discord.com/api/oauth2/authorize?client_id=723017262369472603&redirect_uri=http%3A%2F%2Flocalhost%3A4300%2Fpostlogin&response_type=token&scope=identify%20guilds"
        >Log in</a
      >
    </nav>
  </Box>
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
    test() {
      // fetch(`./api/feedback`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: 'test',
      //     email: 'test!test.com',
      //     comment: 12345,
      //   }),
      // })
    },
  },
}
</script>

<style lang="scss" scoped>
nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
</style>
