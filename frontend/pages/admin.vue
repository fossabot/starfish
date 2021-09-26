<template>
  <div class="admin container">
    <template v-if="show">
      <h1>Admin</h1>
      <nuxt-link to="/s">Ship Page</nuxt-link>
      <br />
      <nuxt-link to="/login" v-if="!userId"
        >Login Page</nuxt-link
      >
      <div class="flexwrap buttonlist martop">
        <div class="button combo" @click="save">Save</div>
        <div class="button combo" @click="pause">Pause</div>
        <div class="button combo" @click="unpause">
          Unpause
        </div>
        <div class="button combo" @click="messageAll">
          Message All Ships
        </div>
      </div>

      <details class="martop">
        <summary>Resetters</summary>
        <div class="flexwrap buttonlist">
          <div
            class="button combo"
            @click="resetAllPlanets"
          >
            Reset All Planets
          </div>
          <div
            class="button combo"
            @click="reLevelAllPlanets"
          >
            Re-Level All Planets
          </div>
          <div class="button combo" @click="resetAllCaches">
            Reset All Caches
          </div>
          <div class="button combo" @click="resetAllZones">
            Reset All Zones
          </div>
          <div class="button combo" @click="resetAllShips">
            Reset All Ships
          </div>
          <div
            class="button combo"
            @click="resetAllAIShips"
          >
            Reset All AI Ships
          </div>
          <div
            class="button combo"
            @click="resetAllAttackRemnants"
          >
            Reset All Attack Remnants
          </div>
        </div>
      </details>

      <details class="martop">
        <summary>Game Settings</summary>

        <div class="flexwrap">
          <div
            class="setting marright"
            v-for="numberSettingKey in Object.keys(
              inputSettings,
            ).filter((s) => !isNaN(inputSettings[s]))"
          >
            <label>{{
              c.camelCaseToWords(numberSettingKey)
            }}</label>
            <input
              type="number"
              v-model="inputSettings[numberSettingKey]"
            />
          </div>

          <div
            class="setting marright"
            v-for="numberSettingKey in Object.keys(
              inputSettings,
            ).filter(
              (s) =>
                !['id'].includes(s) &&
                isNaN(inputSettings[s]),
            )"
          >
            <label>{{
              c.camelCaseToWords(numberSettingKey)
            }}</label>
            <input
              v-model="inputSettings[numberSettingKey]"
            />
          </div>
        </div>
        <button @click="updateSettings">
          Update Settings
        </button>
      </details>

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
import { get, set, remove } from '../assets/scripts/storage'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {
      c,
      show: false,
      initialSettings: {},
      inputSettings: {},
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
  },
  watch: {},
  async mounted() {
    if (get('adminPassword'))
      this.$store.commit('set', {
        adminPassword: get('adminPassword'),
      })
    if (
      process.env.NODE_ENV !== 'development' &&
      !this.adminPassword
    ) {
      const p = prompt('password')
      this.$store.commit('set', {
        adminPassword: p,
      })
    }

    this.$socket.emit(
      'game:adminCheck',
      this.userId,
      this.adminPassword,
      (isAdmin) => {
        if (isAdmin) {
          this.show = true
          set('adminPassword', this.adminPassword)

          this.$socket.emit(
            'game:settings',
            (gameSettings) => {
              this.inputSettings = gameSettings.data
              delete this.inputSettings._id
              delete this.inputSettings.__v
              this.initialSettings = {
                ...this.inputSettings,
              }
            },
          )
        } else {
          this.$store.commit('set', {
            adminPassword: false,
          })
          remove('adminPassword')
          this.$router.replace('/')
        }
      },
    )
  },
  methods: {
    updateSettings() {
      const updatedSettings = {}
      for (let key in this.inputSettings) {
        if (
          this.initialSettings[key] !==
          this.inputSettings[key]
        ) {
          updatedSettings[key] = parseFloat(
            this.inputSettings[key],
          )
          if (isNaN(updatedSettings[key]))
            updatedSettings[key] = this.inputSettings[key]
        }
      }
      this.$socket.emit(
        'game:setSettings',
        this.userId,
        this.adminPassword,
        updatedSettings,
      )
      this.initialSettings = { ...this.inputSettings }
    },
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
      if (
        !window.confirm(
          'Are you sure you want to RESET ALL PLANETS?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllPlanets',
        this.userId,
        this.adminPassword,
      )
    },
    reLevelAllPlanets() {
      if (
        !window.confirm(
          'Are you sure you want to re-level all planets?',
        )
      )
        return
      this.$socket.emit(
        'game:reLevelAllPlanets',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllCaches() {
      if (
        !window.confirm(
          'Are you sure you want to reset all caches?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllCaches',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllZones() {
      if (
        !window.confirm(
          'Are you sure you want to reset all zones?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllZones',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllShips() {
      if (
        !window.confirm(
          'Are you sure you want to RESET ALL SHIPS?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllShips',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllAIShips() {
      if (
        !window.confirm(
          'Are you sure you want to reset all AI ships?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllAIShips',
        this.userId,
        this.adminPassword,
      )
    },
    resetAllAttackRemnants() {
      if (
        !window.confirm(
          'Are you sure you want to reset all attack remnants?',
        )
      )
        return
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
.admin {
  padding: 5vw;
}
.setting {
  width: 150px;
  align-self: flex-end;
}
</style>
