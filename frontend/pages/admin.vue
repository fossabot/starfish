<template>
  <div class="container">
    <template v-if="show">
      <h1>Admin</h1>
      <nuxt-link to="/s">Ship Page</nuxt-link>
      <br />
      <nuxt-link to="/login" v-if="!userId"
        >Login Page</nuxt-link
      >
      <div class="flexwrap buttonlist martop">
        <button @click="save">Save</button>
        <button @click="pause">Pause</button>
        <button @click="unpause">Unpause</button>
        <button @click="messageAll">
          Message All Ships
        </button>
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
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {
      show: false,
      password: '',
    }
  },
  computed: {
    ...mapState(['userId']),
  },
  watch: {},
  async mounted() {
    if (process.env.NODE_ENV !== 'development')
      this.password = prompt('password')
    this.$socket.emit(
      'game:adminCheck',
      this.$store.state.userId,
      this.password,
      (isAdmin) => {
        if (isAdmin) this.show = true
        else this.$router.replace('/')
      },
    )
  },
  methods: {
    save() {
      this.$socket.emit(
        'game:save',
        this.$store.state.userId,
        this.password,
      )
    },
    pause() {
      this.$socket.emit(
        'game:pause',
        this.$store.state.userId,
        this.password,
      )
    },
    unpause() {
      this.$socket.emit(
        'game:unpause',
        this.$store.state.userId,
        this.password,
      )
    },
    messageAll() {
      const message = prompt('Enter message')
      if (!message || message.length < 3) return
      this.$socket.emit(
        'game:messageAll',
        this.$store.state.userId,
        this.password,
        message,
      )
    },
    resetAllPlanets() {
      this.$socket.emit(
        'game:resetAllPlanets',
        this.$store.state.userId,
        this.password,
      )
    },
    resetAllCaches() {
      this.$socket.emit(
        'game:resetAllCaches',
        this.$store.state.userId,
        this.password,
      )
    },
    resetAllZones() {
      this.$socket.emit(
        'game:resetAllZones',
        this.$store.state.userId,
        this.password,
      )
    },
    resetAllShips() {
      this.$socket.emit(
        'game:resetAllShips',
        this.$store.state.userId,
        this.password,
      )
    },
    resetAllAIShips() {
      this.$socket.emit(
        'game:resetAllAIShips',
        this.$store.state.userId,
        this.password,
      )
    },
    resetAllAttackRemnants() {
      this.$socket.emit(
        'game:resetAllAttackRemnants',
        this.$store.state.userId,
        this.password,
      )
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
