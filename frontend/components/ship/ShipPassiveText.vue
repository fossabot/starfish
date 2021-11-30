<template>
  <span>
    <span
      :class="{
        success: (passive.intensity || 0) >= 0,
        warning: (passive.intensity || 0) < 0,
      }"
    >
      {{
        c.baseShipPassiveData[passive.id].description(
          passive,
        )
      }}
    </span>
    <span
      v-if="guildMembersWithinDistance !== null"
      class="sub"
    >
      ({{ guildMembersWithinDistance }} in range) -
    </span>
    <span
      class="sub nowrap"
      v-if="passive.data && passive.data.source"
    >
      {{
        passive.data.source.guildId
          ? `${c.capitalize(
              c.guilds[passive.data.source.guildId].name,
            )} Guild`
          : passive.data.source.speciesId
          ? `${c.capitalize(
              c.species[passive.data.source.speciesId]
                .singular,
            )} species`
          : passive.data.source.planetName
          ? `${passive.data.source.planetName}`
          : passive.data.source.zoneName
          ? `${passive.data.source.zoneName}`
          : passive.data.source.item
          ? `${
              c.items[passive.data.source.item.type][
                passive.data.source.item.id
              ].displayName
            }`
          : passive.data.source.chassisId
          ? `${
              c.items.chassis[passive.data.source.chassisId]
                .displayName
            }`
          : passive.data.source
      }}
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { passive: { required: true } },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    guildMembersWithinDistance(): null | number {
      if (
        (this.passive as ShipPassiveEffect).data?.distance
      ) {
        const guildMembersWithinDistance = !this.ship
          .guildId
          ? 0
          : this.ship.visible?.ships?.filter(
              (s) =>
                c.distance(
                  s.location,
                  this.ship.location,
                ) <=
                  (this.passive as ShipPassiveEffect).data!
                    .distance! &&
                s.guildId === this.ship.guildId,
            ).length
        if (
          (this.passive as ShipPassiveEffect).id ===
          'boostDamageWhenNoAlliesWithinDistance'
        ) {
          return guildMembersWithinDistance
        }
        if (
          (this.passive as ShipPassiveEffect).id ===
          'boostDamageWithNumberOfGuildMembersWithinDistance'
        ) {
          return guildMembersWithinDistance
        }
      }
      return null
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
