<template>
  <div
    class="panesection"
    v-if="
      crewMember &&
      ship.planet &&
      ship.planet.vendor &&
      ship.planet.vendor.repairCostMultiplier
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
            ship.planet.vendor.repairCostMultiplier *
            ship.planet.priceFluctuator *
            (isFriendlyToFaction
              ? c.factionVendorMultiplier
              : 1) *
            count || repairableHp < count
      "
      @click="buyRepair(count)"
    >
      🛠{{ c.r2(count, 2, true) }}HP: 💳{{
        c.numberWithCommas(
          c.r2(
            Math.max(
              c.baseRepairCost *
                ship.planet.vendor.repairCostMultiplier *
                ship.planet.priceFluctuator *
                (isFriendlyToFaction
                  ? c.factionVendorMultiplier
                  : 1) *
                count,
            ),
            0,
            true,
          ),
        )
      }}
    </button>
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
    isFriendlyToFaction(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
    repairableHp(): number {
      return this.ship._maxHp - this.ship._hp
    },
    repairOptions(): number[] {
      const options = [
        1, 5, 10, 15, 20, 30, 50, 75, 100,
      ].filter((o) => o <= this.ship._maxHp)
      if (this.repairableHp >= 1)
        options.push(this.repairableHp)
      return options
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyRepair(hp: number) {
      this.$store.commit('updateShip', {
        _hp: this.ship._hp + hp,
      })
      ;(this as any).$socket?.emit(
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
})
</script>

<style lang="scss" scoped></style>
