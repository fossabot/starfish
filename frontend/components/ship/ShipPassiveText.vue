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
      class="sub"
      :class="{ nowrap: sourceText.length < 30 }"
      v-if="passive.data && passive.data.source"
    >
      {{ sourceText }}
    </span>
    <div class="sub" v-if="timeRemaining">
      <span class="fade"
        >({{
          c.msToTimeString(timeRemaining)
        }}
        remaining)</span
      >
    </div>
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    passive: {
      required: true,
      type: Object as PropType<ShipPassiveEffect>,
    },
  },
  data() {
    let timeRemaining = 0
    return { c, timeRemaining }
  },
  computed: {
    ...mapState(['ship', 'lastUpdated']),
    sourceText(): string {
      const s = this.passive.data?.source
      if (!s) return ''
      return s.guildId
        ? `${c.capitalize(c.guilds[s.guildId].name)} Guild`
        : s.crewActive
        ? `${
            c.crewActives[s.crewActive.activeId].displayName
          } by ${
            this.ship.crewMembers.find(
              (cm) => cm.id === s.crewActive!.crewMemberId,
            )
              ? this.ship.crewMembers.find(
                  (cm) =>
                    cm.id === s.crewActive!.crewMemberId,
                ).name
              : 'a crew member'
          }`
        : s.speciesId
        ? `${c.capitalize(
            c.species[s.speciesId].singular,
          )} species`
        : s.planetName
        ? `${s.planetName}`
        : s.zoneName
        ? `${s.zoneName}`
        : s.item
        ? `${c.items[s.item.type][s.item.id].displayName}`
        : s.chassisId
        ? `${c.items.chassis[s.chassisId].displayName}`
        : `${s}`
    },

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
  watch: {
    lastUpdated() {
      this.recalculateRemaining()
    },
  },
  mounted() {
    this.recalculateRemaining()
  },
  methods: {
    recalculateRemaining() {
      if (!this.passive.until) this.timeRemaining = 0
      else
        this.timeRemaining = this.passive.until - Date.now()
    },
  },
})
</script>

<style lang="scss" scoped></style>
