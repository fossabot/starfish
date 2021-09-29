<template>
  <div class="passives" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/12.jpg">
      <template #title>
        <span class="sectionemoji">💤</span>Ship Passives
      </template>

      <div class="panesection">
        <div
          v-for="(p, index) in ship.passives"
          :class="{
            marbot: index < ship.passives.length - 1,
          }"
          v-if="c.baseShipPassiveData[p.id]"
        >
          <ShipPassiveText :passive="p" />
        </div>
      </div>
    </Box>
  </div>
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
        this.ship.passives &&
        this.ship.passives.length &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('passives'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'passives'
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.passives {
  width: 250px;
  position: relative;
}
.panesection {
  // font-size: 0.9em;
  line-height: 1.25;
}
</style>
