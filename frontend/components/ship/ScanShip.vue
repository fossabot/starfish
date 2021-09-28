<template>
  <Box
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/16.jpg"
  >
    <template #title>
      <span class="sectionemoji">🛸</span>Scan Ships
    </template>
    <div class="panesection shipscan">
      <b>
        {{ scannable.length }} ship{{
          scannable.length === 1 ? '' : 's'
        }}
        in scan range
      </b>
      <br />
      <select
        v-model="selected"
        v-if="scannable.length > 1"
      >
        <option
          v-for="(otherShip, index) in scannable"
          :key="otherShip.id"
          :value="index"
        >
          {{ otherShip.species.icon }}{{ otherShip.name }}
        </option>
      </select>
    </div>

    <ShipTooltipsShipdot
      :key="toShow && 'scanship' + toShow.id"
      v-if="toShow"
      :data="toShow"
      v-targetpoint="toShow"
    />
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, selected: 0 }
  },
  computed: {
    ...mapState(['userId', 'ship']),
    show(): boolean {
      return (
        this.ship &&
        this.scannable.length &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('scanShip'))
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'scanShip'
      )
    },
    scannable(): ShipStub[] {
      if (this.ship.radii.scan === 0) return []
      return (this.ship.visible?.ships || [])
        .filter(
          (s: ShipStub) =>
            c.distance(s.location, this.ship.location) <=
              this.ship?.radii?.scan || 0,
        )
        .sort(
          (a: ShipStub, b: ShipStub) =>
            c.distance(a.location, this.ship.location) -
            c.distance(b.location, this.ship.location),
        )
    },
    toShow(): ShipStub {
      const selectedShip = this.scannable[this.selected]
      return selectedShip
    },
  },
  watch: {
    scannable(): void {
      if (this.selected + 1 > this.scannable.length)
        this.selected = 0
    },
  },
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.shipscan {
  width: 230px;
}
</style>
