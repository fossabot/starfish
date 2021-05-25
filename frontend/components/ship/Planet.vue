<template>
  <Box class="planet" v-show="ship.planet">
    <template #title v-if="ship.planet">
      <span class="sectionemoji">🪐</span>Current Planet:
      {{ ship.planet.name }}
    </template>
    <div class="panesection">
      <div
        class="panesection flex-column flex-center"
        :style="{
          '--highlight-color': ship.planet.color,
        }"
      >
        <div>
          Welcome to
          <b>{{ ship.planet.name }}!</b>
        </div>
        <div class="sub" v-if="ship.planet.races">
          Homeworld of
          {{ ship.planet.races.join(' and ') }}
        </div>
        <div class="sub">
          Population
          {{
            c.numberWithCommas(
              (ship.planet &&
                ship.planet.name
                  .split('')
                  .reduce(
                    (t, c) => t + c.charCodeAt(0),
                    0,
                  ) % 1000) **
                2 *
                ship.planet.radius || 0,
            )
          }}
        </div>
      </div>
    </div>
    <template v-if="ship.planet">
      <div
        class="panesection"
        v-if="
          ship.planet.vendor && ship.planet.vendor.cargo
        "
      >
        <div class="panesubhead">Merchant District</div>

        <div class="panesection" v-if="buyableCargo">
          <div><div class="panesubhead">Buy</div></div>
          <span
            v-for="c in buyableCargo"
            :key="'buycargo' + c.cargoData.type"
          >
            <button
              :disabled="!c.canBuy"
              @click="buyCargo(c)"
            >
              <b>{{ c.cargoData.name }}</b>
              <div>
                💳{{
                  Math.round(c.pricePerUnit * 10000) /
                    10000
                }}/ton
              </div>
            </button>
          </span>
        </div>

        <div class="panesection" v-if="sellableCargo">
          <div><div class="panesubhead">Sell</div></div>
          <span
            v-for="c in sellableCargo"
            :key="'sellcargo' + c.cargoData.type"
          >
            <button
              :disabled="!c.canSell"
              @click="sellCargo(c)"
            >
              <b>{{ c.cargoData.name }}</b>
              <div>
                💳{{
                  Math.round(c.pricePerUnit * 10000) /
                    10000
                }}/ton
              </div>
              <div class="sub">
                (You have
                {{
                  Math.floor(c.heldAmount * 1000) / 1000
                }})
              </div>
            </button>
          </span>
        </div>
      </div>

      <div
        class="panesection"
        v-if="ship.planet.repairCostMultiplier"
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
                count || repairableHp < count
          "
          @click="repair(count)"
        >
          🇨🇭{{ Math.round(count * 100) / 100 }}: 💳{{
            Math.round(
              c.baseRepairCost *
                ship.planet.repairCostMultiplier *
                count *
                100,
            ) / 100
          }}
        </button>
      </div>

      <div class="panesection">
        <div class="sub">
          You cannot be attacked while on a planet.
        </div>
      </div>
    </template>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    buyableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((c: any) => c.buyMultiplier)
        .map((c: any) => {
          const pricePerUnit =
            Math.round(
              c.cargoData.basePrice *
                c.buyMultiplier *
                10000,
            ) / 10000
          const maxCanBuy = Math.min(
            this.crewMember.credits / pricePerUnit,
            this.crewMember.maxCargoWeight -
              this.totalWeight,
          )
          return {
            ...c,
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
        .filter((c: any) => c.sellMultiplier)
        .map((c: any) => {
          const pricePerUnit =
            Math.round(
              c.cargoData.basePrice *
                c.sellMultiplier *
                10000,
            ) / 10000
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
    repairableHp(this: ComponentShape) {
      return this.ship._maxHp - this.ship._hp
    },
    repairOptions(this: ComponentShape) {
      const options = [1, 10]
      if (this.repairableHp) options.push(this.repairableHp)
      return options
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
    repair(this: ComponentShape, hp: number) {
      this.$socket?.emit(
        'crew:buyRepair',
        this.ship.id,
        this.crewMember.id,
        hp,
        this.ship?.planet?.name,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
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
  width: 420px;
}
</style>
