<template>
  <div class="shipdatabrowser fullwidth">
    <div class="flexcolumn">
      <h5>Ship Data</h5>
      <div class="flex marbotsmall">
        <ModelSelect
          :options="
            shipsBasics.map((s) => ({
              value: s.id,
              text:
                s.name +
                (s.isTutorial
                  ? ` (tutorial for ${s.isTutorial})`
                  : ''),
            }))
          "
          v-model="selectedShipId"
          placeholder="Select ship to inspect..."
        />
        <div class="buttonrow flex">
          <div
            class="button combo flexcenter marleftsmall"
            v-if="selectedShipId"
            @click="getShipData(selectedShipId)"
          >
            Reload
          </div>
          <div
            class="button combo flexcenter"
            v-if="selectedShipId"
            @click="respawnShip(selectedShipId)"
          >
            Respawn
          </div>
          <div
            class="button combo flexcenter"
            v-if="selectedShipId"
            @click="deleteShip(selectedShipId)"
          >
            Delete
          </div>
        </div>
      </div>

      <div
        v-if="displayShipData"
        class="property flexstretch marbotsmall"
      >
        <input
          placeholder="Select property to search..."
          v-model="propertySearchTerm"
        />
        <div
          class="button flexcenter"
          v-if="propertySearchTerm"
          @click="propertySearchTerm = null"
        >
          Clear
        </div>
      </div>

      <div
        class="codeblock displaybox"
        :class="{ searching: propertySearchTerm }"
        v-html="filteredShipData"
      ></div>
    </div>
    <AdminShipCrewMemberBrowser
      class=""
      :text="displayShipData"
      @reload="getShipData(selectedShipId)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'
import { ModelSelect } from 'vue-search-select'
import 'vue-search-select/dist/VueSearchSelect.css'

export default Vue.extend({
  components: { ModelSelect },
  data() {
    const shipsBasics: {
      name: string
      id: string
      guild: { id: string }
      species: { id: string }
      crewMemberCount: number
    }[] = []
    const displayShipData: any = null
    return {
      c,
      shipsBasics,
      selectedShipId: undefined,
      propertySearchTerm: undefined,
      displayShipData,
      filteredShipData: null,
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
  },
  watch: {
    selectedShipId(newId) {
      if (newId) this.getShipData(newId)
    },
    propertySearchTerm() {
      this.updateFilteredShipData()
    },
  },
  mounted() {
    this.refreshAllShipsBasics()
  },
  methods: {
    updateFilteredShipData() {
      if (!this.displayShipData) return
      if (!this.propertySearchTerm)
        this.filteredShipData = this.displayShipData
      else
        this.filteredShipData = this.displayShipData
          .split('\n')
          .map((line) =>
            line.includes(this.propertySearchTerm)
              ? `<div class="highlight">${line}</div>`
              : `<span class="sub" style="opacity: ${
                  1 /
                  ((line.length - line.trim().length) / 3)
                }">${line.trim()}</span>`,
          )
          .join('')
    },
    async getShipData(shipId: string) {
      ;(this as any).$socket?.emit(
        'ship:get',
        shipId,
        '',
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.displayShipData = JSON.stringify(
            res.data,
            null,
            2,
          )
          this.updateFilteredShipData()
        },
      )
    },
    refreshAllShipsBasics() {
      ;(this as any).$socket?.emit(
        'game:shipList',
        this.userId,
        this.adminPassword,
        true,
        (
          res: IOResponse<
            {
              name: string
              id: string
              guild: { id: string }
              species: { id: string }
              crewMemberCount: number
              isTutorial: string | false
            }[]
          >,
        ) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.shipsBasics = res.data
        },
      )
    },

    async respawnShip(shipId: string) {
      if (
        !window.confirm(
          `Are you sure you want to respawn ${shipId}?`,
        )
      )
        return
      ;(this as any).$socket?.emit(
        `admin:respawnShip`,
        this.userId,
        this.adminPassword,
        shipId,
        (res: IOResponse<ShipStub>) => {
          if (`error` in res) {
            this.$store.dispatch(`notifications/notify`, {
              text: res.error,
              type: `error`,
            })
            console.log(res.error)
            return
          }
          this.displayShipData = JSON.stringify(
            res.data,
            null,
            2,
          )
          this.updateFilteredShipData()
        },
      )
    },

    async deleteShip(shipId: string) {
      if (
        !window.confirm(
          `Are you sure you want to DELETE ${shipId}?`,
        )
      )
        return
      ;(this as any).$socket?.emit(
        `admin:deleteShip`,
        this.userId,
        this.adminPassword,
        shipId,
        (res: IOResponse<ShipStub>) => {
          if (`error` in res) {
            this.$store.dispatch(`notifications/notify`, {
              text: res.error,
              type: `error`,
            })
            console.log(res.error)
            return
          }
          this.displayShipData = JSON.stringify(
            res.data,
            null,
            2,
          )
          this.updateFilteredShipData()
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.shipdatabrowser {
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 1em;

  .property {
    width: 100%;
    height: 2.5em;

    input {
      width: 100%;
      height: 100%;
      max-width: 100%;
    }
  }

  .displaybox {
    width: 100%;
    height: 50em;
    border: 1px solid var(--text);

    &.searching {
      line-height: 1.1;
    }
  }
}
</style>
