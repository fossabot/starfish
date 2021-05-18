<template>
  <Box class="planet">
    <template #title>
      <span class="sectionemoji">🪐</span>Current Planet:
      {{ ship.planet.name }}
    </template>
    <div
      class="panesection"
      v-if="ship.planet.vendor && ship.planet.vendor.cargo"
    >
      <div class="panesubhead">Vendor</div>

      <div class="panesection" v-if="buyableCargo">
        <div class="panesubhead">Buy</div>
        <div
          v-for="c in buyableCargo"
          :key="'buycargo' + c.cargoData.type"
        >
          <button
            :disabled="!c.canBuy"
            @click="buyCargo(c)"
          >
            {{ c.cargoData.name }} ({{ c.pricePerUnit }}
            credits/ton)
          </button>
        </div>
      </div>

      <div class="panesection" v-if="sellableCargo">
        <div class="panesubhead">Sell</div>
        <div
          v-for="c in sellableCargo"
          :key="'sellcargo' + c.cargoData.type"
        >
          <button
            :disabled="!c.canSell"
            @click="sellCargo(c)"
          >
            {{ c.cargoData.name }} ({{
              c.pricePerUnit
            }}
            credits/ton) (You have {{ c.heldAmount }})
          </button>
        </div>
      </div>
    </div>

    <div class="panesection">
      You cannot be attacked while on a planet.
    </div>
  </Box>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    buyableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((c: any) => c.buyMultiplier)
        .map((c: any) => {
          const pricePerUnit =
            c.cargoData.basePrice * c.buyMultiplier
          const maxCanBuy =
            this.crewMember.credits / pricePerUnit
          return {
            ...c,
            pricePerUnit,
            maxCanBuy,
            canBuy: this.crewMember.credits >= pricePerUnit,
          }
        })
    },
    sellableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((c: any) => c.sellMultiplier)
        .map((c: any) => {
          const pricePerUnit =
            c.cargoData.basePrice * c.sellMultiplier
          const heldAmount =
            this.crewMember.inventory.find(
              (i: any) => i.type === c.cargoData.type,
            )?.amount || 0
          return {
            ...c,
            pricePerUnit,
            heldAmount,
            canSell:
              this.crewMember.inventory.find(
                (i: any) => i.type === c.cargoData.type,
              )?.amount > 0,
          }
        })
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    buyCargo(this: ComponentShape, data: any) {
      const amount =
        parseFloat(
          prompt(
            `How many tons? (Max ${Math.floor(
              data.maxCanBuy * 1000,
            ) / 1000})`,
          ) || '0',
        ) || 0
      if (!amount || amount < 0 || amount > data.maxCanBuy)
        return console.log('Nope.')
      this.$socket?.emit(
        'crew:buy',
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
        parseFloat(
          prompt(
            `How many tons? (Max ${Math.floor(
              data.heldAmount * 1000,
            ) / 1000})`,
          ) || '0',
        ) || 0
      if (
        !amount ||
        amount < 0 ||
        amount >
          this.crewMember.inventory.find(
            (i: any) => i.type === data.cargoData.type,
          )?.amount ||
        0
      )
        return console.log('Nope.')
      this.$socket?.emit(
        'crew:sell',
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

<style lang="scss" scoped>
.planet {
  position: relative;
  grid-column: span 2;
  width: 400px;
}
</style>
