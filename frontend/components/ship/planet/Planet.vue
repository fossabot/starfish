<template>
  <Box
    class="planet"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/5.jpg"
    :bgTint="ship.planet.color"
  >
    <template #title v-if="ship.planet">
      <span class="sectionemoji">🪐</span>Current Planet:
      {{ ship.planet.name }}
    </template>
    <div class="scroller">
      <div
        class="panesection flexcolumn flexcenter marbotsmall"
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
          {{ c.printList(ship.planet.creatures) }}
        </div>
        <div
          class="sub"
          v-if="
            ship.planet.homeworld && ship.planet.faction
          "
        >
          <span
            :style="{
              color: ship.planet.faction.color,
            }"
          >
            {{ ship.planet.faction.name }}
          </span>
          faction homeworld
        </div>
        <div
          class="sub"
          v-else-if="
            ship.planet.faction && ship.planet.faction.color
          "
        >
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
                2 *
                8 *
                ship.planet.radius || 0,
            )
          }}
        </div>
      </div>

      <ShipPlanetVendorCargo />
      <ShipPlanetVendorItems />
      <ShipPlanetBuyRepair />
      <ShipPlanetBuyPassive />

      <div class="panesection">
        <div class="panesubhead">Faction Allegiances</div>
        <ShipPlanetFactionGraph :planet="ship.planet" />
        <div
          class="martop"
          v-if="isFriendlyToFaction"
          :style="{
            color: ship.faction.color,
          }"
        >
          Friendly faction bonus! Prices improved by
          {{
            Math.round(
              (1 - c.factionVendorMultiplier) * 100,
            )
          }}%.
        </div>
      </div>
      <div class="panesection" v-if="ship.planet">
        <div class="sub">
          You cannot be attacked while on a planet.
        </div>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    show() {
      return (
        this.ship &&
        this.ship.planet &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('planet'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'planet'
      )
    },
    isFriendlyToFaction() {
      return (
        (this.ship.planet.allegiances.find(
          (a: AllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.planet {
  position: relative;
  grid-column: span 2;
  width: 420px;
}
.scroller {
  max-height: 420px;
  overflow-y: auto;
}
.factiongraph {
  & > * {
    height: 1em;
    border-right: 1px solid var(--bg);
  }
}
</style>
