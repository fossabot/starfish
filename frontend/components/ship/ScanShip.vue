<template>
  <Box class="shipscan" v-if="ship && scannable.length">
    <template #title>
      <span class="sectionemoji">🛸</span>Scan Ships
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
      <div>
        Species:
        {{ toShow.species && toShow.species.icon
        }}{{
          c.capitalize(toShow.species && toShow.species.id)
        }}
      </div>
      <div v-if="toShow.planet">
        At planet 🪐{{ toShow.planet.name }}
      </div>
      <div v-if="toShow.level">
        Level {{ Math.round(toShow.level) }}
      </div>
      <div>
        <div
          v-for="(item, index) in toShow.items"
          :key="'scanitem' + index"
          @mouseenter="
            $store.commit('tooltip', {
              type: item.type,
              data: item,
            })
          "
          @mouseleave="$store.commit('tooltip')"
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
      if (!selectedShip) return

      return {
        name: selectedShip.name,
        faction: selectedShip.faction,
        species: selectedShip.species,
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
