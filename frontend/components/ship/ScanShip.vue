<template>
  <Box v-if="show" :highlight="highlight">
    <template #title>
      <span class="sectionemoji">🛸</span>Scan Ships
    </template>
    <div class="panesection shipscan">
      {{ scannable.length }} ship{{
        scannable.length === 1 ? '' : 's'
      }}
      in scan range
      <br />
      <select
        v-model="selected"
        v-if="scannable.length > 1"
      >
        <option
          v-for="(otherShip, index) in scannable"
          :key="otherShip.id"
          :value="index"
          >{{ otherShip.species.icon
          }}{{ otherShip.name }}</option
        >
      </select>
    </div>

    <ShipTooltipsShipdot
      :key="toShow && 'scanship' + toShow.id"
      v-if="toShow"
      :data="toShow"
    />
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c, selected: 0 }
  },
  computed: {
    ...mapState(['userId', 'ship']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        this.scannable.length &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('scanShip'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'scanShip'
      )
    },
    scannable(this: ComponentShape) {
      if (this.ship.radii.scan === 0) return []
      return this.ship.visible.ships
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
    toShow(this: ComponentShape) {
      const selectedShip = this.scannable[this.selected]
      return selectedShip
    },
  },
  watch: {
    scannable() {
      if (this.selected + 1 > this.scannable.length)
        this.selected = 0
    },
  },
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.shipscan {
  width: 230px;
}
</style>
