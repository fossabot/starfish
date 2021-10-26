<template>
  <div>
    <div class="tooltipheader">
      <span>🪐</span
      ><span :style="{ color: dataToUse.color }">{{
        dataToUse.name
      }}</span>
      <span class="sub normal"
        ><span class="sub">{{
          c.getPlanetTitle(data)
        }}</span></span
      >
    </div>
    <!-- {{ data }} -->
    <hr />
    <div v-if="dataToUse.guildId">
      <span
        :style="{
          color: c.guilds[dataToUse.guildId].color,
        }"
        >{{ c.guilds[dataToUse.guildId].name }}</span
      >
      Homeworld
      <hr />
    </div>

    <div v-if="dataToUse.planetType === 'mining'">
      <div v-if="dataToUse.mine && dataToUse.mine.length">
        {{
          c.printList(
            dataToUse.mine.map(
              (cargo) => c.cargo[cargo.id].name,
            ),
          )
        }}
        mining colony
      </div>
    </div>

    <div v-if="dataToUse.pacifist" class="success">
      Safe haven
    </div>

    <template v-if="dataToUse.planetType === 'basic'">
      <div v-if="dataToUse.repairFactor" class="success">
        Repair field active
      </div>
      <div
        v-if="
          dataToUse.vendor &&
          dataToUse.vendor.cargo &&
          dataToUse.vendor.cargo.length
        "
      >
        {{
          c.printList(
            dataToUse.vendor.cargo.map(
              (cargo) => c.cargo[cargo.id].name,
            ),
          )
        }}
        for sale
      </div>
      <div
        v-if="
          dataToUse.vendor &&
          dataToUse.vendor.items &&
          dataToUse.vendor.items.length
        "
      >
        Equipment:
        {{
          dataToUse.vendor.items.filter(
            (i) => i.buyMultiplier,
          ).length
        }}
        for sale
      </div>
      <div
        v-if="
          dataToUse.vendor &&
          dataToUse.vendor.chassis &&
          dataToUse.vendor.chassis.length
        "
      >
        Chassis:
        {{ dataToUse.vendor.chassis.length }}
        for sale
      </div>
      <div
        v-if="
          dataToUse.vendor &&
          dataToUse.vendor.passives &&
          dataToUse.vendor.passives.length
        "
      >
        Crew passives:
        {{ dataToUse.vendor.passives.length }}
        for sale
      </div>
      <div
        v-if="
          dataToUse.vendor &&
          dataToUse.vendor.shipCosmetics &&
          dataToUse.vendor.shipCosmetics.length
        "
      >
        Cosmetics:
        {{ dataToUse.vendor.shipCosmetics.length }}
        for sale
      </div>

      <div v-if="dataToUse.bank">
        Bank: 💳{{
          ship &&
          ship.banked.find((b) => b.id === dataToUse.id)
            ? ship.banked.find((b) => b.id === dataToUse.id)
                .amount
            : 0
        }}
        stored
      </div>

      <hr />

      <ShipPlanetGuildGraph :planet="dataToUse" />
    </template>

    <!-- <hr v-if="c.getPlanetDescription(data)" />
    <div v-if="c.getPlanetDescription(data)" class="sub">
      {{ c.getPlanetDescription(data) }}
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    dataToUse() {
      return (
        this.ship?.seenPlanets?.find(
          (p) => p.id === this.data.id,
        ) || this.data
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
