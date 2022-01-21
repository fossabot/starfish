<template>
  <div class="planetdatabrowser fullwidth">
    <div class="flexcolumn">
      <h5>Planet Data</h5>
      <div class="marbotsmall">
        <ModelSelect
          :options="
            allPlanetData.map((s) => ({
              value: s.id,
              text: s.name + (s.homeworld ? ` (${s.homeworld} homeworld)` : ''),
            }))
          "
          v-model="selectedPlanetId"
          placeholder="Select ship to inspect..."
        />
      </div>

      <div v-if="displayPlanetData" class="property flexstretch marbotsmall">
        <input
          placeholder="Select property to search..."
          v-model="propertySearchTerm"
        />
        <div
          class="button flexcenter"
          v-if="propertySearchTerm"
          @click="propertySearchTerm = null"
        >
          <div>Clear</div>
        </div>
      </div>

      <div
        class="codeblock displaybox"
        :class="{ searching: propertySearchTerm }"
        v-html="filteredPlanetData"
      ></div>
    </div>
    <AdminShipCrewMemberBrowser class="" :text="displayPlanetData" />
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
    const displayPlanetData: any = null
    const allPlanetData: any[] = []
    return {
      c,
      allPlanetData,
      selectedPlanetId: undefined,
      propertySearchTerm: undefined,
      displayPlanetData,
      filteredPlanetData: null,
    }
  },
  computed: {
    ...mapState(['userId', 'adminPassword']),
  },
  watch: {
    selectedPlanetId(newId) {
      this.displayPlanetData = JSON.stringify(
        this.allPlanetData.find((p) => p.id === newId),
        null,
        2,
      )
      this.updateFilteredPlanetData()
    },
    propertySearchTerm() {
      this.updateFilteredPlanetData()
    },
  },
  mounted() {
    this.getAllPlanetData()
  },
  methods: {
    updateFilteredPlanetData() {
      if (!this.displayPlanetData) return
      if (!this.propertySearchTerm)
        this.filteredPlanetData = this.displayPlanetData
      else
        this.filteredPlanetData = this.displayPlanetData
          .split('\n')
          .map((line) =>
            line.includes(this.propertySearchTerm)
              ? `<div class="highlight">${line}</div>`
              : `<span class="sub" style="opacity: ${
                  1 / ((line.length - line.trim().length) / 3)
                }">${line.trim()}</span>`,
          )
          .join('')
    },
    getAllPlanetData() {
      ;(this as any).$socket?.emit(
        'game:planets',
        this.userId,
        this.adminPassword,
        (res) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
          this.allPlanetData = res.data
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.planetdatabrowser {
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
