<template>
  <div class="panesection nopadtop">
    <!-- <div>
      <div class="panesubhead">Merchant District</div>
    </div> -->

    <div
      class="flexwrap"
      v-if="buyableCargo.length || sellableCargo.length"
    >
      <span
        class="panesection inline"
        v-if="buyableCargo && buyableCargo.length"
      >
        <div>
          <div class="panesubhead">Buy Cargo</div>
        </div>
        <span
          v-for="ca in buyableCargo"
          :key="
            'buycargo' +
            (ca.cargoData ? ca.cargoData.id : Math.random())
          "
          v-tooltip="{
            type: 'price',
            buyOrSell: 'buy',
            planet: ship.planet,
            cargoId: ca.cargoData ? ca.cargoData.id : null,
          }"
        >
          <PromptButton
            :disabled="ca.maxCanBuy < 0.01"
            class="inlineblock"
            :max="ca.maxCanBuy"
            :numeric="true"
            @done="buyCargo(ca, ...arguments)"
            @apply="buyCargo(ca, ...arguments)"
          >
            <template #label>
              <div class="padsmall">
                <b>{{
                  ca.cargoData && ca.cargoData.name
                }}</b>
                <div
                  :class="{
                    good:
                      ca.cargoData &&
                      (ca.pricePerUnit.credits || 0) <
                        (ca.cargoData.basePrice.credits ||
                          0),
                    bad:
                      ca.cargoData &&
                      (ca.pricePerUnit.credits || 0) >
                        (ca.cargoData.basePrice.credits ||
                          0),
                  }"
                >
                  {{ c.priceToString(ca.pricePerUnit) }}/ton
                </div>
              </div>
            </template>
            <template>
              How many tons of
              {{ ca.cargoData.name }} will you buy?
            </template>
          </PromptButton>
        </span></span
      ><span
        class="panesection inline"
        v-if="sellableCargo && sellableCargo.length"
      >
        <div>
          <div class="panesubhead">Sell Cargo</div>
        </div>
        <span
          v-for="ca in sellableCargo"
          :key="
            'sellcargo' +
            (ca.cargoData ? ca.cargoData.id : Math.random())
          "
          v-tooltip="{
            type: 'price',
            buyOrSell: 'sell',
            planet: ship.planet,
            cargoId: ca.cargoData ? ca.cargoData.id : null,
          }"
        >
          <PromptButton
            :disabled="!ca.canSell"
            class="inlineblock"
            :max="ca.heldAmount"
            :numeric="true"
            @done="sellCargo(ca, ...arguments)"
            @apply="sellCargo(ca, ...arguments)"
          >
            <template #label>
              <div class="padsmall">
                <b>{{
                  ca.cargoData && ca.cargoData.name
                }}</b>
                <div
                  :class="{
                    good:
                      ca.cargoData &&
                      (ca.pricePerUnit.credits || 0) >
                        (ca.cargoData.basePrice.credits ||
                          0),
                    bad:
                      ca.cargoData &&
                      (ca.pricePerUnit.credits || 0) <
                        (ca.cargoData.basePrice.credits ||
                          0),
                  }"
                >
                  {{ c.priceToString(ca.pricePerUnit) }}/ton
                </div>
                <div
                  class="sub"
                  v-if="ca.heldAmount > 0.005"
                >
                  ({{
                    c.numberWithCommas(
                      c.r2(ca.heldAmount, 2, true),
                    )
                  }}
                  held)
                </div>
              </div>
            </template>
            <template>
              How many tons of
              {{ ca.cargoData.name }} will you sell?
            </template>
          </PromptButton>
        </span>
      </span>
    </div>

    <div v-else class="padbig flexcenter">
      <div class="sub">Nothing for sale yet!</div>
    </div>
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
    buyableCargo(): any[] {
      return this.ship?.planet?.vendor?.cargo
        .filter((cargo: any) => cargo.buyMultiplier)
        .map((cargo: any) => {
          const pricePerUnit = c.getCargoBuyPrice(
            cargo.id,
            this.ship.planet,
            this.ship.guildId,
            1,
            this.crewMember?.skills?.find(
              (s) => s.skill === 'charisma',
            )?.level || 1,
          )

          const maxCanBuy = c.r2(
            Math.min(
              c.canAfford(
                pricePerUnit,
                this.ship,
                this.crewMember,
              ) || 0,
              Math.min(
                this.ship.chassis.maxCargoSpace,
                this.crewMember?.maxCargoSpace,
              ) - this.totalWeight,
            ),
            2,
            true,
          )

          return {
            ...cargo,
            cargoData: (c.cargo as any)[cargo.id],
            pricePerUnit,
            maxCanBuy,
            canBuy:
              maxCanBuy >= 0.00999 &&
              this.crewMember?.credits >= 1,
          }
        })
    },
    sellableCargo(): any[] {
      return (
        this.crewMember.inventory
          // .filter((cargo: any) => cargo.sellMultiplier)
          .map((cargo: Cargo) => {
            const pricePerUnit = c.getCargoSellPrice(
              cargo.id,
              this.ship.planet,
              this.ship.guildId,
              1,
              this.crewMember?.skills?.find(
                (s) => s.skill === 'charisma',
              )?.level || 1,
            )

            const heldAmount =
              this.crewMember?.inventory.find(
                (i: any) => i.id === cargo.id,
              )?.amount || 0

            return {
              ...cargo,
              cargoData: (c.cargo as any)[cargo.id],
              pricePerUnit,
              heldAmount,
              canSell:
                this.crewMember?.inventory.find(
                  (i: any) => i.id === cargo.id,
                )?.amount >= 0.00999,
            }
          })
      )
    },
    totalWeight(): number {
      return this.crewMember.inventory.reduce(
        (total: number, i: Cargo) => total + i.amount,
        0,
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyCargo(data: any, amount: any) {
      if (amount === 'all') amount = data.maxCanBuy
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (
        !amount ||
        amount < 0 ||
        amount > data.maxCanBuy
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }
      ;(this as any).$socket?.emit(
        'crew:buyCargo',
        this.ship.id,
        this.crewMember.id,
        data.cargoData.id,
        amount,
        (
          res: IOResponse<{
            amount: number
            price: Price
          }>,
        ) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: `Bought ${c.r2(res.data.amount)} ton${
              res.data.amount === 1 ? '' : 's'
            } of ${data.cargoData.id} for ${c.priceToString(
              res.data.price,
            )}.`,
            type: 'success',
          })
        },
      )
    },

    sellCargo(data: any, amount: any) {
      if (amount === 'all')
        amount =
          this.crewMember.inventory.find(
            (i: any) => i.id === data.cargoData.id,
          )?.amount || 0
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (
        !amount ||
        amount < 0 ||
        amount >
          this.crewMember.inventory.find(
            (i: any) => i.id === data.cargoData.id,
          )?.amount ||
        0
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }
      ;(this as any).$socket?.emit(
        'crew:sellCargo',
        this.ship.id,
        this.crewMember.id,
        data.cargoData.id,
        amount,
        (
          res: IOResponse<{
            amount: number
            price: Price
          }>,
        ) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
          this.$store.dispatch('notifications/notify', {
            text: `Sold ${c.r2(res.data.amount)} ton${
              res.data.amount === 1 ? '' : 's'
            } of ${data.cargoData.id} for ${c.priceToString(
              res.data.price,
            )}.`,
            type: 'success',
          })
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.good {
  color: var(--success);
}
.bad {
  color: var(--warning);
}
</style>
