<template>
  <Box class="planet" v-if="show">
    <template #title v-if="ship.planet">
      <span class="sectionemoji">🪐</span>Current Planet:
      {{ ship.planet.name }}
    </template>
    <div class="panesection">
      <div
        class="panesection flexcolumn flexcenter"
        :style="{
          '--highlight-color': ship.planet.color,
        }"
      >
        <div>
          Welcome to
          <b>{{ ship.planet.name }}!</b>
        </div>
        <div
          class="sub textcenter"
          v-if="ship.planet.creatures"
        >
          Primary creature{{
            ship.planet.creatures.length === 1 ? '' : 's'
          }}:
          {{ ship.planet.creatures.join(' and ') }}
        </div>
        <div class="sub" v-if="ship.planet.homeworld">
          <span
            :style="{
              color: ship.planet.faction.color,
            }"
          >
            {{ ship.planet.faction.name }}
          </span>
          faction homeworld
        </div>
        <div class="sub" v-else-if="ship.planet.faction">
          Faction allegiance:
          <span
            :style="{
              color: ship.planet.faction.color,
            }"
          >
            {{ ship.planet.faction.name }}
          </span>
        </div>
        <div class="sub">
          Population
          {{
            c.numberWithCommas(
              ((ship.planet &&
                ship.planet.name
                  .split('')
                  .reduce(
                    (t, c) => t + c.charCodeAt(0),
                    0,
                  ) % 200) +
                80) **
                3 *
                ship.planet.radius || 0,
            )
          }}
        </div>
      </div>
    </div>

    <ShipPlanetVendorCargo />
    <ShipPlanetVendorItems />
    <ShipPlanetBuyRepair />
    <ShipPlanetBuyPassive />

    <div
      class="panesection"
      v-if="
        ship.planet.faction &&
          ship.planet.faction.id === ship.faction.id
      "
    >
      <div
        :style="{
          color: ship.planet.faction.color,
        }"
      >
        Faction bonus! Prices improved by
        {{
          Math.round((1 - c.factionVendorMultiplier) * 100)
        }}%.
      </div>
    </div>
    <div class="panesection" v-if="ship.planet">
      <div class="sub">
        You cannot be attacked while on a planet.
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): Partial<ComponentShape> {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        this.ship.planet &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('planet'))
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.planet {
  position: relative;
  grid-column: span 2;
  width: 420px;
}
</style>
