<template>
  <div
    class="panesection"
    v-if="ship.planet.vendor && ship.planet.vendor.cargo"
  >
    <div>
      <div class="panesubhead">Merchant District</div>
    </div>

    <span class="panesection inline" v-if="buyableCargo">
      <div>
        <div class="panesubhead">Buy Cargo</div>
      </div>
      <span
        v-for="ca in buyableCargo"
        :key="'buycargo' + ca.cargoData.type"
      >
        <button
          :disabled="!ca.canBuy"
          @click="buyCargo(ca)"
        >
          <b>{{ ca.cargoData.name }}</b>
          <div>💳{{ c.r2(ca.pricePerUnit, 2) }}/ton</div>
        </button>
      </span></span
    ><span class="panesection inline" v-if="sellableCargo">
      <div>
        <div class="panesubhead">Sell Cargo</div>
      </div>
      <span
        v-for="ca in sellableCargo"
        :key="'sellcargo' + ca.cargoData.type"
      >
        <button
          :disabled="!ca.canSell"
          @click="sellCargo(ca)"
        >
          <b>{{ ca.cargoData.name }}</b>
          <div>💳{{ c.r2(ca.pricePerUnit, 2) }}/ton</div>
          <div class="sub">
            (You have
            {{ c.r2(ca.heldAmount, 3) }})
          </div>
        </button>
      </span>
    </span>
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
    isSameFaction(this: ComponentShape) {
      return (
        this.ship.planet.faction?.id ===
        this.ship.faction.id
      )
    },
    buyableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((cargo: any) => cargo.buyMultiplier)
        .map((cargo: any) => {
          const pricePerUnit = c.r2(
            cargo.cargoData.basePrice *
              cargo.buyMultiplier *
              this.ship.planet.buyFluctuator *
              (this.isSameFaction
                ? c.factionVendorMultiplier
                : 1),
            5,
          )
          const maxCanBuy = Math.min(
            this.crewMember.credits / pricePerUnit,
            this.crewMember.maxCargoWeight -
              this.totalWeight,
          )
          return {
            ...cargo,
            pricePerUnit,
            maxCanBuy,
            canBuy:
              maxCanBuy > 0.001 &&
              this.crewMember.credits > 0.01,
          }
        })
    },
    sellableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((cargo: any) => cargo.sellMultiplier)
        .map((cargo: any) => {
          const pricePerUnit = c.r2(
            cargo.cargoData.basePrice *
              cargo.sellMultiplier *
              this.ship.planet.sellFluctuator *
              (this.isSameFaction
                ? 1 + (1 - (c.factionVendorMultiplier || 1))
                : 1),
            5,
          )
          const heldAmount =
            this.crewMember.inventory.find(
              (i: any) => i.type === cargo.cargoData.type,
            )?.amount || 0
          return {
            ...cargo,
            pricePerUnit,
            heldAmount,
            canSell:
              this.crewMember.inventory.find(
                (i: any) => i.type === cargo.cargoData.type,
              )?.amount > 0.001,
          }
        })
    },
    totalWeight(this: ComponentShape) {
      return this.crewMember.inventory.reduce(
        (total: number, i: Cargo) => total + i.amount,
        0,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    buyCargo(this: ComponentShape, data: any) {
      const amount =
        Math.floor(
          (parseFloat(
            prompt(
              `How many tons? (Max ${Math.floor(
                data.maxCanBuy * 1000,
              ) / 1000})`,
            ) || '0',
          ) || 0) * 100,
        ) / 100
      if (
        !amount ||
        amount < 0 ||
        amount > data.maxCanBuy
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }
      this.$socket?.emit(
        'crew:buyCargo',
        this.ship.id,
        this.crewMember.id,
        data.cargoData.type,
        amount,
        this.ship?.planet?.name,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
          this.$store.commit('updateACrewMember', res.data)
        },
      )
    },

    sellCargo(this: ComponentShape, data: any) {
      const amount =
        Math.round(
          (parseFloat(
            prompt(
              `How many tons? (Max ${Math.floor(
                data.heldAmount * 1000,
              ) / 1000})`,
            ) || '0',
          ) || 0) * 100,
        ) / 100
      if (
        !amount ||
        amount < 0 ||
        amount >
          this.crewMember.inventory.find(
            (i: any) => i.type === data.cargoData.type,
          )?.amount ||
        0
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }
      this.$socket?.emit(
        'crew:sellCargo',
        this.ship.id,
        this.crewMember.id,
        data.cargoData.type,
        amount,
        this.ship?.planet?.name,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
          this.$store.commit('updateACrewMember', res.data)
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
