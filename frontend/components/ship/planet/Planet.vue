<template>
  <Box
    class="planet"
    v-if="show"
    :highlight="highlight"
    :bgImage="`/images/paneBackgrounds/${
      planet.planetType === 'basic' ? 5 : 19
    }.jpg`"
    :bgTint="planet.color"
  >
    <template #title v-if="planet">
      <span class="sectionemoji">🪐</span>Planet
    </template>
    <div class="scroller">
      <div
        class="
          panesection
          flexcolumn
          flexcenter
          marbotsmall
        "
      >
        <h2 class="marnone flexcolumn flexcenter">
          <!-- Welcome to -->
          <span
            :style="{
              color: planet.color,
            }"
            ><b>{{ planet.name }}</b></span
          >
        </h2>
        <div
          class="sub"
          :style="{
            'line-height': 1.1,
          }"
        >
          <span class="fade">{{
            c.getPlanetTitle(planet)
          }}</span>
        </div>

        <hr class="half" />

        <div
          class="sub textcenter marbottiny"
          v-if="type === 'mining'"
        >
          Mining colony
        </div>

        <div
          class="sub textcenter marbottiny"
          v-if="
            type === 'mining' &&
            planet.creatures &&
            planet.creatures.length
          "
        >
          Primary creature{{
            planet.creatures.length === 1 ? '' : 's'
          }}: {{ c.printList(planet.creatures) }}
        </div>

        <div
          class="sub marbottiny"
          v-if="
            type === 'basic' &&
            planet.homeworld &&
            planet.faction
          "
        >
          <span
            :style="{
              color: c.factions[planet.faction.id].color,
            }"
          >
            {{ c.factions[planet.faction.id].name }}
          </span>
          faction homeworld
        </div>
        <!-- <div
          class="sub"
          v-else-if="
            planet.faction &&
            c.factions[planet.faction.id].color
          "
        >
          Faction allegiance:
          <span
            :style="{
              color:
                c.factions[planet.faction.id].color,
            }"
          >
            {{ c.factions[planet.faction.id].name }}
          </span>
        </div> -->
        <div class="sub marbottiny" v-if="type === 'basic'">
          Population:
          {{
            c.numberWithCommas(
              c.getPlanetPopulation(planet),
            )
          }}
          {{ c.printList(planet.creatures) }}
        </div>

        <div
          class="sub textcenter marbottiny"
          v-if="planet.pacifist"
          v-tooltip="
            `You cannot attack or be attacked while within this planet's radius.`
          "
        >
          Safe haven
        </div>
      </div>

      <ShipPlanetMine v-if="type === 'mining'" />

      <ShipPlanetVendorCargo v-if="type === 'basic'" />
      <ShipPlanetVendorItems v-if="type === 'basic'" />
      <ShipPlanetBuyRepair v-if="type === 'basic'" />
      <ShipPlanetBuyPassive v-if="type === 'basic'" />

      <ShipPlanetLevel />

      <div
        class="panesection"
        v-if="type === 'basic' && planet.allegiances"
      >
        <div
          class="panesubhead"
          v-tooltip="
            `Spend money at this planet to increase your faction's allegiance. Allegiances decay slowly over time.`
          "
        >
          Allegiances
        </div>
        <ShipPlanetFactionGraph :planet="planet" />
        <div class="martopsmall" v-if="isFriendlyToFaction">
          <span
            :style="{
              color: c.factions[planet.faction.id].color,
            }"
            >Friendly faction</span
          >
          bonus!
          <ul class="small success">
            <li>
              Prices improved by
              {{
                Math.round(
                  (1 - c.factionVendorMultiplier) * 100,
                )
              }}%
            </li>
            <li v-if="planet.repairFactor > 0">
              Repair field boost
            </li>
          </ul>
        </div>
      </div>
      <!-- <div
        v-if="c.getPlanetDescription(planet)"
        class="panesection sub"
      >
        {{ c.getPlanetDescription(planet) }}
      </div> -->
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
    show(): boolean {
      return (
        this.ship &&
        this.planet &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('planet'))
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'planet'
      )
    },
    planet(): PlanetStub {
      return this.ship?.planet
    },
    type(): PlanetType {
      return this.planet?.planetType
    },
    isFriendlyToFaction(): boolean {
      return (
        (this.planet?.allegiances.find(
          (a: PlanetAllegianceData) =>
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
