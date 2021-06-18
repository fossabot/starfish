<template>
  <div
    class="panesection"
    v-if="
      crewMember &&
        ship.planet &&
        ship.planet.repairCostMultiplier
    "
  >
    <div>
      <div class="panesubhead">Mechanics' Quarter</div>
    </div>
    <button
      v-for="count in repairOptions"
      :disabled="
        crewMember.credits <
          c.baseRepairCost *
            ship.planet.repairCostMultiplier *
            ship.planet.priceFluctuator *
            (isFriendlyToFaction
              ? c.factionVendorMultiplier
              : 1) *
            count || repairableHp < count
      "
      @click="buyRepair(count)"
    >
      🇨🇭{{ c.r2(count, 2, true) }}: 💳{{
        c.r2(
          c.baseRepairCost *
            ship.planet.repairCostMultiplier *
            ship.planet.priceFluctuator *
            (isFriendlyToFaction
              ? c.factionVendorMultiplier
              : 1) *
            count,
          2,
          true,
        )
      }}
    </button>
  </div>
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
    isFriendlyToFaction(this: ComponentShape) {
      return (
        (this.ship.planet.allegiances.find(
          (a: AllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },

    repairableHp(this: ComponentShape) {
      return this.ship._maxHp - this.ship._hp
    },
    repairOptions(this: ComponentShape) {
      const options = [1, 10]
      if (this.repairableHp >= 1)
        options.push(this.repairableHp)
      return options
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    buyRepair(this: ComponentShape, hp: number) {
      this.$socket?.emit(
        'crew:buyRepair',
        this.ship.id,
        this.crewMember?.id,
        hp,
        this.ship?.planet?.name,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
