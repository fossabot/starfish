<template>
  <div class="passives" v-if="show" :highlight="highlight">
    <Box bgImage="/images/paneBackgrounds/12.webp">
      <template #title>
        <span class="sectionemoji">🦾</span>Passives
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
          <div
            v-for="(p, index) in crewMember.passives"
            :class="{
              marbot:
                index < crewMember.passives.length - 1,
            }"
            v-if="c.crewPassives[p.id]"
          >
            <ShipCrewPassiveText :passive="p" />
          </div>
          <div
            v-if="crewMember.passives.length === 0"
            class="sub textcenter"
          >
            No crew passives yet!
          </div>
        </Tab>
        <Tab :title="'🚀 Ship'">
          <div
            v-for="(p, index) in ship.passives"
            :class="{
              marbot: index < ship.passives.length - 1,
            }"
            v-if="c.baseShipPassiveData[p.id]"
          >
            <ShipPassiveText :passive="p" />
          </div>
          <div
            v-if="ship.passives.length === 0"
            class="sub textcenter"
          >
            No ship passives yet!
          </div>
        </Tab>
      </Tabs>
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
        ((this.ship.passives &&
          this.ship.passives.length) ||
          (this.crewMember.passives &&
            this.crewMember.passives.length)) &&
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
.tabs {
  // font-size: 0.9em;
  line-height: 1.25;
}
</style>
