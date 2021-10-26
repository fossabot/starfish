<template>
  <div
    class="panesection"
    v-tooltip="
      isCaptain
        ? null
        : `The captain can use the ship's common fund to buy and sell equipment for the ship.`
    "
  >
    <div>
      <div class="panesubhead">Ironworks</div>
    </div>

    <div v-if="buyableItems.length || sellableItems.length">
      <div class="sub marbot">
        <div v-if="isCaptain">
          Captain, you can use your ship's common fund to
          buy and sell equipment for the ship.
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
            ...{ ...ca.itemData, compare: true },
          }"
        >
          <button
            :disabled="!ca.canBuy"
            @click="buyItem(ca)"
          >
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
          v-tooltip="ca"
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
            ...{ ...ca.chassisData, compare: true },
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

    <div v-else class="padbig flexcenter">
      <div class="sub">No equipment for sale yet!</div>
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
    ...mapState(['ship', 'userId', 'crewMember']),
    isCaptain() {
      return this.ship?.captain === this.userId
    },
    isFriendlyToGuild() {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    buyableItems() {
      return (this.ship?.planet?.vendor?.items || [])
        .filter(
          (item: PlanetVendorItemPrice) =>
            item.buyMultiplier,
        )
        .map((item: PlanetVendorItemPrice) => {
          const price = c.getItemBuyPrice(
            item,
            this.ship.planet,
            this.ship.guildId,
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
        .filter((e) => e.price > 0)
    },
    sellableItems() {
      return this.ship?.items
        .map((item: ItemStub) => {
          const price = c.getItemSellPrice(
            item.type,
            item.id as ItemId,
            this.ship.planet,
            this.ship.guildId,
          )
          return {
            ...item,
            itemData: (c.items[item.type] as any)[item.id],
            price,
            canSell: this.isCaptain,
          }
        })
        .filter((i: ItemStub) => i)
        .filter((e) => e.price > 0)
    },
    swappableChassis() {
      return (this.ship.planet?.vendor?.chassis || []).map(
        (chassis: PlanetVendorChassisPrice) => {
          const price = c.getChassisSwapPrice(
            chassis,
            this.ship.planet,
            this.ship.chassis.id,
            this.ship.guildId,
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
      // .filter((e) => e.price > 0)
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyItem(data: PlanetVendorItemPrice) {
      if (
        !confirm(
          `Really buy ${
            c.items[data.type][data.id].displayName
          }?`,
        )
      )
        return
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
      if (
        !confirm(
          `Really sell ${
            c.items[data.type][data.id].displayName
          }?`,
        )
      )
        return
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
