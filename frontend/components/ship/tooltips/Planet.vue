<template>
  <div>
    <div>
      <b>🪐{{ data.name }}</b>
      <span class="sub">{{ c.capitalize(data.type) }}</span>
    </div>
    <div>{{ data.description }}</div>
    <hr />
    <div v-if="data.faction">
      Faction:
      <span :style="{ color: data.faction.color }">{{
        data.faction.name
      }}</span>
    </div>
    <div v-if="data.vendor.cargo.length">
      Cargo:
      {{ data.vendor.cargo.length }} type{{
        data.vendor.cargo.length === 1 ? '' : 's'
      }}
      on sale
    </div>
    <div v-if="data.vendor.items.length">
      Equipment:
      {{
        data.vendor.items.filter((i) => i.buyMultiplier)
          .length
      }}
      for sale
    </div>
    <div v-if="data.vendor.chassis.length">
      Chassis:
      {{ data.vendor.chassis.length }}
      for sale
    </div>
    <div v-if="data.vendor.passives.length">
      Passives:
      {{ data.vendor.passives.length }}
      for sale
    </div>

    <hr />

    <ShipPlanetFactionGraph :planet="data" />
  </div>
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
}
</script>

<style scoped lang="scss"></style>
