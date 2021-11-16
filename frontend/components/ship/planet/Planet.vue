<template>
  <Box
    class="planet"
    v-if="show"
    :highlight="highlight"
    :bgImage="`/images/paneBackgrounds/${
      planet.planetType === 'basic'
        ? 5
        : planet.planetType === 'comet'
        ? 21
        : 19
    }.webp`"
    :bgTint="planet.color"
  >
    <template #title v-if="planet">
      <span class="sectionemoji">🪐</span>Landed
      {{ planet.planetType === 'comet' ? 'on' : 'at' }}
    </template>

    <ShipTooltipsGuildBadges
      :guilds="alliedGuildIds"
      class="badges"
    />

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
          v-if="type !== 'comet'"
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
            planet.guildId
          "
        >
          <span
            :style="{
              color: c.guilds[planet.guildId].color,
            }"
          >
            {{ c.guilds[planet.guildId].name }}
          </span>
          guild homeworld
        </div>

        <div
          class="sub textcenter marbottiny"
          v-if="type === 'basic'"
        >
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

      <template v-if="['mining', 'comet'].includes(type)">
        <ShipPlanetMine />
        <ShipPlanetLevel v-if="type !== 'comet'" />
      </template>

      <template v-else-if="type === 'basic'">
        <!-- <hr style="opacity: 0.1; margin: 0" /> -->
        <Tabs
          :noPad="true"
          :centerTabs="true"
          :bigTabs="true"
          class="nopadtop nopadbot"
        >
          <div class="marbotsmall" />
          <Tab
            :title="`Market`"
            v-if="crewMember && ship.planet.vendor"
          >
            <ShipPlanetVendorCargo />
          </Tab>

          <Tab :title="`Shipyard`" v-if="crewMember">
            <ShipPlanetVendorItems />
            <ShipPlanetBuyRepair />
          </Tab>

          <Tab
            :title="`Outfitter`"
            v-if="
              crewMember &&
              ship.planet &&
              ship.planet.vendor &&
              ((ship.planet.vendor.passives &&
                ship.planet.vendor.passives.length) ||
                (ship.planet.vendor.shipCosmetics &&
                  ship.planet.vendor.shipCosmetics.length))
            "
          >
            <ShipPlanetBuyCrewPassive />
            <ShipPlanetBuyCosmetics />
          </Tab>

          <Tab
            :title="`Jobs`"
            v-if="
              crewMember &&
              ship.planet &&
              ship.planet.maxContracts
            "
          >
            <ShipPlanetContracts />
          </Tab>

          <Tab :title="`Downtown`">
            <ShipPlanetGuildRecruit />
            <ShipPlanetBank />
            <ShipPlanetLevel />
            <ShipPlanetAllegiances />
          </Tab>

          <!-- <div
        v-if="c.getPlanetDescription(planet)"
        class="panesection sub"
      >
        {{ c.getPlanetDescription(planet) }}
      </div> -->
        </Tabs>
      </template>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
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
    type(): PlanetType | undefined {
      return this.planet?.planetType
    },
    alliedGuildIds(): string[] {
      const ids: Set<string> = new Set()
      if (this.planet.guildId) {
        ids.add(this.planet.guildId)
      }
      if (this.planet.allegiances) {
        this.planet.allegiances.forEach((a) => {
          if (a.level >= c.guildAllegianceFriendCutoff)
            ids.add(a.guildId)
        })
      }

      return Array.from(ids)
    },
  },
  watch: {},
  mounted() {
    // c.log(this.planet)
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.planet {
  position: relative;
  width: 420px;
}
.scroller {
  max-height: 440px;
  overflow-y: auto;
  min-height: 350px;
}
.badges {
  margin-right: 2em;
}

// .bordertop {
//   border-top: 1px solid var(--pane-border);
// }
</style>
