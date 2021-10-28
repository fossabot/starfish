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
      v-for="o in repairOptions"
      :disabled="!o.canBuy"
      @click="buyRepair(o.amount)"
    >
      <span
        >🛠{{ c.r2(o.amount, 2, true) }}HP:
        {{ c.priceToString(o.price) }}</span
      >
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
    isFriendlyToGuild(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    repairableHp(): number {
      return this.ship._maxHp - this.ship._hp
    },
    repairOptions(): {
      amount: number
      canBuy: boolean
      price: Price
    }[] {
      const options = [
        1, 5, 10, 15, 20, 30, 50, 75, 100,
      ].filter((o) => o <= this.ship._maxHp)
      if (this.repairableHp >= 1)
        options.push(this.repairableHp)
      return options.map((o) => ({
        amount: o,
        price:
          c.getRepairPrice(
            this.ship.planet,
            o,
            this.ship.guildId,
          ) || {},
        canBuy:
          this.repairableHp >= o &&
          c.canAfford(
            c.getRepairPrice(
              this.ship.planet,
              o,
              this.ship.guildId,
            ),
            this.ship,
            this.crewMember,
          ) !== false,
      }))
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyRepair(hp: number) {
      this.$store.dispatch('updateShip', {
        _hp: this.ship._hp + hp,
      })
      ;(this as any).$socket?.emit(
        'crew:buyRepair',
        this.ship.id,
        this.crewMember?.id,
        hp,
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
