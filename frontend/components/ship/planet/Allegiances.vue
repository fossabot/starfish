<template>
  <div class="panesection" v-if="planet.allegiances">
    <div
      class="panesubhead"
      v-tooltip="
        `Spend money at this planet to increase your guild's allegiance. Allegiances decay slowly over time.`
      "
    >
      Allegiances
    </div>
    <ShipPlanetGuildGraph :planet="planet" />
    <div class="martopsmall" v-if="isFriendlyToGuild">
      <span
        :style="{
          color: c.guilds[ship.guildId].color,
        }"
        >Friendly guild</span
      >
      bonus!
      <ul class="small success">
        <li v-if="planet.defense">Orbital Defense</li>
        <li>
          Prices improved by
          {{
            Math.round((1 - c.guildVendorMultiplier) * 100)
          }}%
        </li>
        <li v-if="planet.repairFactor > 0">
          Repair field boost
        </li>
      </ul>
    </div>
  </div>
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
    planet(): any {
      return this.ship.planet
    },
    isFriendlyToGuild(): boolean {
      return (
        this.ship.guildId &&
        (this.planet?.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
