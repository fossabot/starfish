<template>
  <div class="shipdatabrowser">
    <div class="flex marbotsmall topbar">
      <ModelSelect
        class=""
        :options="
          shipsBasics.map((s) => ({
            value: s.id,
            text: c.species[s.species.id].icon + s.name,
          }))
        "
        v-model="selectedShipId"
        placeholder="Select ship to inspect..."
      />
      <div v-if="displayShipData" class="property flex">
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
    </div>
    <div
      class="codeblock displaybox"
      :class="{ searching: propertySearchTerm }"
      v-html="filteredShipData"
    ></div>
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
      faction: { id: string }
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
              faction: { id: string }
              species: { id: string }
              crewMemberCount: number
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
  },
})
</script>

<style lang="scss" scoped>
.shipdatabrowser {
  width: 100%;
  max-width: 600px;

  .topbar {
    height: 2.5em;

    .property {
      width: 50%;
      flex-shrink: 0;
      position: relative;

      input {
        height: 100%;
      }
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
