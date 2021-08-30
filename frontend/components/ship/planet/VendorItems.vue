<template>
  <div
    v-if="
      crewMember &&
      (buyableItems.length || sellableItems.length)
    "
    class="panesection"
    v-tooltip="
      isCaptain
        ? null
        : `The captain can use the ship's common fund to buy and sell equipment for the ship.`
    "
  >
    <div>
      <div class="panesubhead">Ship Outfitter</div>
    </div>

    <div class="sub marbot">
      <div v-if="isCaptain">
        Captain, you can use your ship's common fund to buy
        and sell equipment for the ship.
      </div>
    </div>

    <div class="sub padbotsmall">
      <div class="flexbetween">
        <div>
          Common Fund:
          <b>💳{{ ship && c.r2(ship.commonCredits) }}</b>
        </div>
        <div
          class="flexcenter"
          v-tooltip="
            `${ship.items.length} of ${ship.slots} used`
          "
        >
          <div class="nowrap">Equipment Slots Used:</div>
          <PillBar
            :micro="true"
            :value="ship.items.length"
            :max="ship.slots"
            :dangerZone="-1"
            class="slots"
          />
        </div>
      </div>
    </div>

    <span
      class="panesection inline"
      v-if="buyableItems.length"
    >
      <div>
        <div class="panesubhead">Buy Equipment</div>
      </div>
      <span
        v-for="ca in buyableItems"
        :key="'buyitem' + ca.type + ca.id"
        v-tooltip="{
          type: ca.itemData && ca.itemData.type,
          data: ca.itemData,
        }"
      >
        <button :disabled="!ca.canBuy" @click="buyItem(ca)">
          <b>{{
            ca.itemData && ca.itemData.displayName
          }}</b>
          <div>
            💳{{ c.numberWithCommas(c.r2(ca.price, 2)) }}
          </div>
        </button>
      </span></span
    ><span
      class="panesection inline"
      v-if="sellableItems.length && isCaptain"
    >
      <div>
        <div class="panesubhead">Sell Equipment</div>
      </div>
      <span
        v-for="(ca, index) in sellableItems"
        :key="'sellitem' + ca.type + ca.id + index"
        v-tooltip="{
          type: ca.type,
          data: ca,
        }"
      >
        <button
          :disabled="!ca.canSell"
          @click="sellItem(ca)"
        >
          <b>{{ ca && ca.displayName }}</b>
          <div>
            💳{{ c.numberWithCommas(c.r2(ca.price, 2)) }}
          </div>
        </button>
      </span> </span
    ><span
      class="panesection inline"
      v-if="swappableChassis.length"
    >
      <div>
        <div class="panesubhead">Swap Chassis</div>
      </div>
      <span
        v-for="ca in swappableChassis"
        :key="
          ca.chassisData
            ? 'swapchassis' +
              ca.chassisData.type +
              ca.chassisData.id
            : Math.random()
        "
        v-tooltip="{
          type: 'chassis',
          data: ca.chassisData,
        }"
      >
        <button
          :disabled="!ca.canBuy"
          @click="swapChassis(ca)"
        >
          <b>{{
            ca.chassisData && ca.chassisData.displayName
          }}</b>
          <div>
            💳{{ c.numberWithCommas(c.r2(ca.price, 2)) }}
          </div>
        </button>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'userId', 'crewMember']),
    isCaptain() {
      return this.ship?.captain === this.userId
    },
    isFriendlyToFaction() {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
    buyableItems() {
      return (this.ship?.planet?.vendor?.items || [])
        .filter(
          (item: PlanetVendorItemPrice) =>
            item.buyMultiplier,
        )
        .map((item: PlanetVendorItemPrice) => {
          const price = c.r2(
            Math.max(
              ((c.items[item.type] as any)[item.id]
                ?.basePrice || 1) *
                item.buyMultiplier! *
                this.ship.planet.priceFluctuator *
                (this.isFriendlyToFaction
                  ? c.factionVendorMultiplier
                  : 1),
            ),
            0,
            true,
          )
          return {
            ...item,
            itemData: (c.items[item.type] as any)[item.id],
            price,
            canBuy:
              this.isCaptain &&
              this.ship.commonCredits >= price,
          }
        })
    },
    sellableItems() {
      return this.ship?.items
        .map((item: ItemStub) => {
          const price = c.r2(
            Math.min(
              ((c.items[item.type] as any)[item.id]
                ?.basePrice || 1) * // sorry to the typescript gods
                c.baseItemSellMultiplier *
                this.ship.planet.priceFluctuator *
                (this.isFriendlyToFaction
                  ? 1 +
                    (1 - (c.factionVendorMultiplier || 1))
                  : 1),
            ),
            0,
            true,
          )
          return {
            ...item,
            itemData: (c.items[item.type] as any)[item.id],
            price,
            canSell: this.isCaptain,
          }
        })
        .filter((i: ItemStub) => i)
    },
    swappableChassis() {
      return (this.ship.planet?.vendor?.chassis || []).map(
        (chassis: PlanetVendorChassisPrice) => {
          const currentChassisSellPrice = Math.floor(
            (this.ship.chassis?.basePrice || 0) *
              c.baseItemSellMultiplier,
          )
          const price = c.r2(
            Math.min(
              (c.items.chassis[chassis.id]?.basePrice ||
                1) *
                chassis.buyMultiplier *
                this.ship.planet.priceFluctuator *
                (this.isFriendlyToFaction
                  ? c.factionVendorMultiplier
                  : 1) -
                currentChassisSellPrice,
            ),
            0,
            true,
          )
          return {
            ...chassis,
            chassisData: c.items.chassis[chassis.id],
            price,
            canBuy:
              this.isCaptain &&
              this.ship.commonCredits >= price &&
              chassis.id !== this.ship.chassis.id,
          }
        },
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyItem(data: PlanetVendorItemPrice) {
      this.$store.commit('setShipProp', [
        'items',
        [
          ...this.ship.items,
          (c.items[data.type] as any)[data.id],
        ],
      ])
      ;(this as any).$socket.emit(
        'ship:buyItem',
        this.ship.id,
        this.crewMember?.id,
        data.type,
        data.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('updateShip', res.data)
        },
      )
    },

    sellItem(data: ItemStub) {
      // c.log(data)
      this.$store.commit('setShipProp', [
        'items',
        [...this.ship.items].filter(
          (i) => i.id === data.id,
        ),
      ])
      ;(this as any).$socket.emit(
        'ship:sellItem',
        this.ship.id,
        this.crewMember?.id,
        data.type,
        data.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('updateShip', res.data)
        },
      )
      this.$store.commit('tooltip')
    },

    swapChassis(data: PlanetVendorChassisPrice) {
      ;(this as any).$socket.emit(
        'ship:swapChassis',
        this.ship.id,
        this.crewMember?.id,
        data.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('updateShip', res.data)
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.slots {
  margin-left: 0.5em;
}
</style>
