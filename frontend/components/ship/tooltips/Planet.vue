<template>
  <div>
    <div class="tooltipheader">
      <span>🪐</span
      ><span :style="{ color: data.color }">{{
        data.name
      }}</span>
      <span class="sub normal"
        ><span class="sub">{{
          c.getPlanetTitle(data)
        }}</span></span
      >
    </div>
    <!-- {{ data }} -->
    <hr />
    <div v-if="data.faction">
      <span
        :style="{
          color: c.factions[data.faction.id].color,
        }"
        >{{ c.factions[data.faction.id].name }}</span
      >
      Homeworld
      <hr />
    </div>

    <div v-if="data.planetType === 'mining'" class="sub">
      Mining colony
    </div>

    <div v-if="data.pacifist" class="success">
      Safe haven
    </div>

    <template v-if="data.planetType === 'basic'">
      <div v-if="data.repairFactor" class="success">
        Repair field active
      </div>
      <div
        v-if="
          data.vendor &&
          data.vendor.cargo &&
          data.vendor.cargo.length
        "
      >
        Cargo:
        {{ data.vendor.cargo.length }} type{{
          data.vendor.cargo.length === 1 ? '' : 's'
        }}
        on sale
      </div>
      <div
        v-if="
          data.vendor &&
          data.vendor.items &&
          data.vendor.items.length
        "
      >
        Equipment:
        {{
          data.vendor.items.filter((i) => i.buyMultiplier)
            .length
        }}
        for sale
      </div>
      <div
        v-if="
          data.vendor &&
          data.vendor.chassis &&
          data.vendor.chassis.length
        "
      >
        Chassis:
        {{ data.vendor.chassis.length }}
        for sale
      </div>
      <div
        v-if="
          data.vendor &&
          data.vendor.passives &&
          data.vendor.passives.length
        "
      >
        Passives:
        {{ data.vendor.passives.length }}
        for sale
      </div>

      <hr />

      <ShipPlanetFactionGraph :planet="data" />
    </template>

    <!-- <hr v-if="c.getPlanetDescription(data)" />
    <div v-if="c.getPlanetDescription(data)" class="sub">
      {{ c.getPlanetDescription(data) }}
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
})
</script>

<style scoped lang="scss"></style>
