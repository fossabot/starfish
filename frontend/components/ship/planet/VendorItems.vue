<template>
  <div
    class="panesection shipyard"
    v-tooltip="
      isCaptain
        ? null
        : `The captain can use the ship's common fund to buy and sell equipment for the ship.`
    "
  >
    <!-- <div>
      <div class="panesubhead">Ironworks</div>
    </div> -->

    <div v-if="buyableItems.length || sellableItems.length">
      <div class="sub marbot" v-if="isCaptain">
        Captain, you can use your ship's common fund to buy
        and sell equipment for the ship.
      </div>

      <div class="sub padbotsmall">
        <div class="flexbetween">
          <div>
            Common Fund:
            <b
              >💳{{
                ship &&
                c.numberWithCommas(c.r2(ship.commonCredits))
              }}</b
            >
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
            type: 'price',
            buyOrSell: 'buy',
            planet: ship.planet,
            item: ca,
            compare: true,
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
              {{ c.priceToString(ca.price) }}
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
          :key="
            'sellitem' + ca.itemType + ca.itemId + index
          "
          v-tooltip="{
            type: 'price',
            buyOrSell: 'sell',
            planet: ship.planet,
            item: ca,
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
              ? 'swapchassis' + ca.chassisData.chassisId
              : Math.random()
          "
          v-tooltip="{
            type: 'price',
            buyOrSell: 'buy',
            planet: ship.planet,
            chassis: ca,
            compare: true,
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
              {{ c.priceToString(ca.price) }}
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
    isCaptain(): boolean {
      return this.ship?.captain === this.userId
    },
    isFriendlyToGuild(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    charismaLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === 'boostCharisma' ? p.intensity || 0 : 0),
        0,
      )
      return (
        (this.crewMember.skills.find(
          (s) => s.skill === 'charisma',
        )?.level || 1) + passiveBoost
      )
    },
    buyableItems(): any[] {
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
            this.charismaLevel,
          )
          return {
            ...item,
            itemType: item.type,
            itemId: item.id,
            itemData: (c.items[item.type] as any)?.[
              item.id
            ],
            price,
            canBuy:
              this.ship.items.length < this.ship.slots &&
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
                true,
              ),
          }
        })
    },
    sellableItems(): any[] {
      return this.ship?.items
        .map((item: ItemStub) => {
          const price = c.getItemSellPrice(
            item.itemType,
            item.itemId as ItemId,
            this.ship.planet,
            this.ship.guildId,
            item.level,
            this.charismaLevel,
          )
          return {
            ...item,
            itemData: (c.items[item.itemType] as any)[
              item.itemId
            ],
            price,
            canSell:
              this.isCaptain && this.ship.items.length > 1,
          }
        })
        .filter((i: ItemStub) => i)
    },
    swappableChassis(): any[] {
      return (this.ship.planet?.vendor?.chassis || []).map(
        (chassis: PlanetVendorChassisPrice) => {
          const price = c.getChassisSwapPrice(
            chassis,
            this.ship.planet,
            this.ship.chassis.chassisId,
            this.ship.guildId,
            this.charismaLevel,
          )
          return {
            ...chassis,
            chassisData: c.items.chassis[chassis.id],
            price,
            canBuy:
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
                true,
              ) && chassis.id !== this.ship.chassis.id,
          }
        },
      )
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
            c.log(res.error)
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
            c.items[data.itemType][data.itemId].displayName
          }?`,
        )
      )
        return
      // c.log(data)
      this.$store.commit('setShipProp', [
        'items',
        [...this.ship.items].filter(
          (i) => i.itemId === data.itemId,
        ),
      ])
      ;(this as any).$socket.emit(
        'ship:sellItem',
        this.ship.id,
        this.crewMember?.id,
        data.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
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
            c.log(res.error)
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
.shipyard {
  padding-top: 0;
}
.slots {
  margin-left: 0.5em;
}
</style>
