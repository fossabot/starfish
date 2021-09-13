<template>
  <div class="container">
    <h1>Admin</h1>
    <nuxt-link to="/s">Ship Page</nuxt-link>
    <br />
    <nuxt-link to="/login" v-if="!userId"
      >Login Page</nuxt-link
    >
    <div class="flexwrap buttonlist martop">
      <button @click="save">Save</button>
      <button @click="resetAllPlanets">
        Reset All Planets
      </button>
      <button @click="resetAllCaches">
        Reset All Caches
      </button>
      <button @click="resetAllZones">
        Reset All Zones
      </button>
      <button @click="resetAllShips">
        Reset All Ships
      </button>
      <button @click="resetAllAIShips">
        Reset All AI Ships
      </button>
      <button @click="resetAllAttackRemnants">
        Reset All Attack Remnants
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {}
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  mounted() {},
  methods: {
    save() {
      this.$socket.emit('game:save')
    },
    resetAllPlanets() {
      this.$socket.emit('game:resetAllPlanets')
    },
    resetAllCaches() {
      this.$socket.emit('game:resetAllCaches')
    },
    resetAllZones() {
      this.$socket.emit('game:resetAllZones')
    },
    resetAllShips() {
      this.$socket.emit('game:resetAllShips')
    },
    resetAllAIShips() {
      this.$socket.emit('game:resetAllAIShips')
    },
    resetAllAttackRemnants() {
      this.$socket.emit('game:resetAllAttackRemnants')
    },
  },
})
</script>

<style lang="scss" scoped>
.buttonlist {
  & > * {
    margin-right: 1em;
    margin-bottom: 1em;
  }
}
</style>
