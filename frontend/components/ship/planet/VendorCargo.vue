<template>
  <div
    class="panesection"
    v-if="
      crewMember &&
        ship.planet.vendor &&
        ship.planet.vendor.cargo &&
        ship.planet.vendor.cargo.length
    "
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
        :key="
          'buycargo' +
            (ca.cargoData
              ? ca.cargoData.type
              : Math.random())
        "
        @mouseenter="
          $store.commit('tooltip', {
            type: 'cargo',
            data: ca,
          })
        "
        @mouseleave="$store.commit('tooltip')"
      >
        <PromptButton
          :disabled="!ca.canBuy"
          class="inlineblock"
          @done="buyCargo(ca, ...arguments)"
        >
          <template #label>
            <div class="padsmall">
              <b>{{ ca.cargoData && ca.cargoData.name }}</b>
              <div
                :class="{
                  good:
                    ca.cargoData &&
                    ca.pricePerUnit <
                      ca.cargoData.basePrice,
                  bad:
                    ca.cargoData &&
                    ca.pricePerUnit >
                      ca.cargoData.basePrice,
                }"
              >
                💳{{ c.r2(ca.pricePerUnit, 2, true) }}/ton
              </div>
            </div>
          </template>
          <template>
            How many tons? (Max
            {{ c.r2(ca.maxCanBuy, 2, true) }})
          </template>
        </PromptButton>
      </span></span
    ><span class="panesection inline" v-if="sellableCargo">
      <div>
        <div class="panesubhead">Sell Cargo</div>
      </div>
      <span
        v-for="ca in sellableCargo"
        :key="
          'sellcargo' +
            (ca.cargoData
              ? ca.cargoData.type
              : Math.random())
        "
        @mouseenter="
          $store.commit('tooltip', {
            type: 'cargo',
            data: ca,
          })
        "
        @mouseleave="$store.commit('tooltip')"
      >
        <PromptButton
          :disabled="!ca.canSell"
          class="inlineblock"
          @done="sellCargo(ca, ...arguments)"
        >
          <template #label>
            <div class="padsmall">
              <b>{{ ca.cargoData && ca.cargoData.name }}</b>
              <div
                :class="{
                  good:
                    ca.cargoData &&
                    ca.pricePerUnit >
                      ca.cargoData.basePrice,
                  bad:
                    ca.cargoData &&
                    ca.pricePerUnit <
                      ca.cargoData.basePrice,
                }"
              >
                💳{{ c.r2(ca.pricePerUnit, 2, true) }}/ton
              </div>
              <div class="sub" v-if="ca.heldAmount > 0.005">
                (You have
                {{ c.r2(ca.heldAmount, 2, true) }})
              </div>
            </div>
          </template>
          <template>
            How many tons? (Max
            {{ c.r2(ca.heldAmount, 2, true) }})
          </template>
        </PromptButton>
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
    isFriendlyToFaction(this: ComponentShape) {
      return (
        (this.ship.planet.allegiances.find(
          (a: AllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
    buyableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((cargo: any) => cargo.buyMultiplier)
        .map((cargo: any) => {
          const pricePerUnit = c.r2(
            cargo.cargoData?.basePrice *
              cargo.buyMultiplier *
              this.ship.planet.priceFluctuator *
              (this.isFriendlyToFaction
                ? c.factionVendorMultiplier
                : 1),
            5,
          )
          const maxCanBuy = c.r2(
            Math.min(
              this.crewMember?.credits / pricePerUnit,
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
            pricePerUnit,
            maxCanBuy,
            canBuy:
              maxCanBuy > 0.001 &&
              this.crewMember?.credits > 0.01,
          }
        })
    },
    sellableCargo(this: ComponentShape) {
      return this.ship?.planet?.vendor?.cargo
        .filter((cargo: any) => cargo.sellMultiplier)
        .map((cargo: any) => {
          const pricePerUnit = c.r2(
            cargo.cargoData?.basePrice *
              cargo.sellMultiplier *
              this.ship.planet.priceFluctuator *
              (this.isFriendlyToFaction
                ? 1 + (1 - (c.factionVendorMultiplier || 1))
                : 1),
            5,
          )
          const heldAmount =
            this.crewMember?.inventory.find(
              (i: any) => i.type === cargo.cargoData?.type,
            )?.amount || 0
          return {
            ...cargo,
            pricePerUnit,
            heldAmount,
            canSell:
              this.crewMember?.inventory.find(
                (i: any) =>
                  i.type === cargo.cargoData?.type,
              )?.amount > 0.009999,
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
    buyCargo(this: ComponentShape, data: any, amount: any) {
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
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
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.commit('updateACrewMember', res.data)
          this.$store.dispatch('notifications/notify', {
            text: `Bought ${amount} tons of ${data.cargoData.type}.`,
            type: 'success',
          })
        },
      )
    },

    sellCargo(
      this: ComponentShape,
      data: any,
      amount: any,
    ) {
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
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
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.commit('updateACrewMember', res.data)
          this.$store.dispatch('notifications/notify', {
            text: `Sold ${amount} tons of ${data.cargoData.type}.`,
            type: 'success',
          })
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.good {
  color: var(--success);
}
.bad {
  color: var(--warning);
}
</style>
