<template>
  <Box class="shipscan" v-if="ship && scannable.length">
    <template #title>
      <span class="sectionemoji">🛸</span>Scan Ship
    </template>
    <div class="panesection">
      {{ scannable.length }} ship{{
        scannable.length === 1 ? '' : 's'
      }}
      in scan range
    </div>

    <div class="panesection" v-if="toShow">
      <select
        v-model="selected"
        v-if="scannable.length > 1"
      >
        <option
          v-for="(otherShip, index) in scannable"
          :key="otherShip.id"
          :value="index"
          >🚀{{ otherShip.name }}</option
        >
      </select>
      <div v-else>
        <b>🚀{{ toShow.name }}</b>
      </div>
      <div>
        Faction:
        <span
          v-if="toShow.faction"
          :style="{ color: toShow.faction.color }"
          >{{ toShow.faction.name }}</span
        ><span v-else>No Faction</span>
      </div>
      <div v-if="toShow.planet">
        At planet 🪐{{ toShow.planet.name }}
      </div>
      <div>
        <div
          v-for="(item, index) in toShow.items"
          :key="'scanitem' + index"
        >
          {{ c.capitalize(item.type) }}:
          {{ item.displayName }}
        </div>
      </div>
    </div>
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
    ...mapState(['userId', 'ship', 'crewMember']),
    scannable(this: ComponentShape) {
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
      if (!selectedShip) return

      return {
        name: selectedShip.name,
        faction: selectedShip.faction,
        items: selectedShip.items,
        planet: selectedShip.planet,
      }
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
  width: 260px;
  position: relative;
}
</style>
