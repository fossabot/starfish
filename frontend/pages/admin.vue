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

      <div class="martop">
        <AdminShipDataBrowser />
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
      c,
      show: false,
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
  },
  watch: {},
  async mounted() {
    if (
      process.env.NODE_ENV !== 'development' &&
      !this.adminPassword
    ) {
      const p = prompt('password')
      this.$store.commit('set', {
        adminPassword: p,
      })
    }

    c.log(this.userId, this.adminPassword)

    this.$socket.emit(
      'game:adminCheck',
      this.userId,
      this.adminPassword,
      (isAdmin) => {
        c.log(isAdmin)
        if (isAdmin) this.show = true
        else {
          this.$store.commit('set', {
            adminPassword: false,
          })
          this.$router.replace('/')
        }
      },
    )
  },
  methods: {
    save() {
      this.$socket.emit(
        'game:save',
        this.userId,
        this.adminPassword,
      )
    },
    pause() {
      this.$socket.emit(
        'game:pause',
        this.userId,
        this.adminPassword,
      )
    },
    unpause() {
      this.$socket.emit(
        'game:unpause',
        this.userId,
        this.adminPassword,
      )
    },
    messageAll() {
      const message = prompt('Enter message')
      if (!message || message.length < 3) return
      this.$socket.emit(
        'game:messageAll',
        this.userId,
        this.adminPassword,
        message,
      )
    },
    resetAllPlanets() {
      this.$socket.emit(
        'game:resetAllPlanets',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllCaches() {
      this.$socket.emit(
        'game:resetAllCaches',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllZones() {
      this.$socket.emit(
        'game:resetAllZones',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllShips() {
      this.$socket.emit(
        'game:resetAllShips',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllAIShips() {
      this.$socket.emit(
        'game:resetAllAIShips',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllAttackRemnants() {
      this.$socket.emit(
        'game:resetAllAttackRemnants',
        this.userId,
        this.adminPassword,
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
