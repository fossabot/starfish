<template>
  <Box
    bgImage="/images/paneBackgrounds/22.webp"
    class="stats"
    v-if="show"
    :highlight="highlight"
  >
    <template #title>
      <span class="sectionemoji">📊</span>Stats
    </template>

    <Tabs class="tabs">
      <Tab
        v-if="crewMember"
        :title="
          (c.species[crewMember.speciesId] &&
            c.species[crewMember.speciesId].icon + ' ') +
          'You'
        "
      >
        <ul>
          <li v-for="s in crewMember.stats">
            {{ c.statToString(s) }}
          </li>
        </ul>
      </Tab>
      <Tab :title="'🚀 Ship'">
        <ul>
          <li v-for="s in ship.stats">
            {{ c.statToString(s) }}
          </li>
        </ul>
      </Tab>
    </Tabs>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('stats'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'stats'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.stats {
  width: 250px;
  position: relative;
}
</style>
