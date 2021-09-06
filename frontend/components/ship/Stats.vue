<template>
  <div class="stats" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/3.jpg">
      <template #title>
        <span class="sectionemoji">📊</span>Stats
      </template>

      <div class="panesection">
        <div class="panesubhead">Ship Stats</div>
        <ul>
          <li v-for="s in ship.stats">
            {{ c.statToString(s) }}
          </li>
        </ul>
      </div>
      <div class="panesection">
        <div class="panesubhead">Personal Stats</div>
        <ul>
          <li v-for="s in crewMember.stats">
            {{ c.statToString(s) }}
          </li>
        </ul>
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
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
  width: 270px;
  position: relative;
}
</style>
