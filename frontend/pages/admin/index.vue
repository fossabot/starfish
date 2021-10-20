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
        <div class="button combo" @click="save">
          <span>Save</span>
        </div>
        <div class="button combo" @click="pause">
          <span>Pause</span>
        </div>
        <div class="button combo" @click="unpause">
          <span>Unpause</span>
        </div>
        <div class="button combo" @click="messageAll">
          <span>Message All Ships</span>
        </div>
      </div>

      <details class="martop">
        <summary>Resetters</summary>
        <div class="flexwrap buttonlist">
          <div
            class="button combo"
            @click="resetAllPlanets"
          >
            <span>Reset All Planets</span>
          </div>
          <div class="button combo" @click="resetAllComets">
            <span>Reset All Comets</span>
          </div>
          <div
            class="button combo"
            @click="reLevelAllPlanets"
          >
            <span>Re-Level All Planets</span>
          </div>
          <div
            class="button combo"
            @click="reLevelAllPlanetsOfType"
          >
            <span>Re-Level All Planets Of Type</span>
          </div>
          <div
            class="button combo"
            @click="reLevelOnePlanet"
          >
            <span>Re-Level One Planet</span>
          </div>
          <div
            class="button combo"
            @click="resetHomeworlds"
          >
            <span>Reset Homeworlds</span>
          </div>
          <div class="button combo" @click="resetAllCaches">
            <span>Reset All Caches</span>
          </div>
          <div class="button combo" @click="resetAllZones">
            <span>Reset All Zones</span>
          </div>
          <div class="button combo" @click="resetAllShips">
            <span>Reset All Ships</span>
          </div>
          <div
            class="button combo"
            @click="resetAllAIShips"
          >
            <span>Reset All AI Ships</span>
          </div>
          <div
            class="button combo"
            @click="resetAllAttackRemnants"
          >
            <span>Reset All Attack Remnants</span>
          </div>
        </div>
        <div class="backups martopsmall">
          <div class="sub">Reset DB to Backup:</div>
          <div>
            <div
              class="backup button combo"
              v-for="b in backups"
              @click="resetToBackup(b)"
            >
              <span>{{
                new Date(parseInt(b)).toLocaleString()
              }}</span>
            </div>
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
          <span>Update Settings</span>
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
import c from '../../../common/dist'
import {
  get,
  set,
  remove,
} from '../../assets/scripts/storage'

export default Vue.extend({
  layout: 'withnavbar',
  head() {
    return {
      title: 'Admin',
    }
  },
  data() {
    return {
      c,
      show: false,
      initialSettings: {},
      inputSettings: {},
      backups: [],
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

          this.$socket.emit(
            'game:backups',
            this.userId,
            this.adminPassword,
            (res) => {
              if (res.data) {
                this.backups = res.data
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
    resetAllComets() {
      if (
        !window.confirm(
          'Are you sure you want to reset all Comets?',
        )
      )
        return
      this.$socket.emit(
        'game:resetAllComets',
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
    reLevelAllPlanetsOfType() {
      const planetType = window.prompt(
        'Enter planet type to relevel',
      )
      if (!planetType) return
      this.$socket.emit(
        'game:reLevelAllPlanetsOfType',
        this.userId,
        this.adminPassword,
        planetType,
      )
    },
    reLevelOnePlanet() {
      const planetId = window.prompt('Enter planet id')
      if (!planetId) return
      this.$socket.emit(
        'game:reLevelOnePlanet',
        this.userId,
        this.adminPassword,
        planetId,
      )
    },
    resetHomeworlds() {
      if (
        !window.confirm(
          'Are you sure you want to reset the guild homeworlds?',
        )
      )
        return
      this.$socket.emit(
        'game:resetHomeworlds',
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
    resetToBackup(b) {
      if (
        !window.confirm(
          `Are you sure you want to RESET THE ENTIRE DB to backup ${b}?`,
        )
      )
        return
      this.$socket.emit(
        'game:resetToBackup',
        this.userId,
        this.adminPassword,
        b,
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
