<template>
  <div
    v-if="
      crewMember &&
        (buyableItems.length || sellableItems.length)
    "
  >
    <div class="panesection">
      <div>
        <div class="panesubhead">Ship Outfitter</div>
      </div>

      <div class="sub">
        <div v-if="isCaptain">
          Captain, you can use your ship's common fund to
          purchase equipment for the ship.
        </div>
        <div v-else>
          Your ship's captain can use the common fund to
          purchase equipment for the ship.
        </div>
        <div>
          Common Fund: 💳{{
            ship && c.r2(ship.commonCredits)
          }}
        </div>
        <div>
          Equipment Slots Used: {{ ship.items.length }}/{{
            ship.slots
          }}
        </div>
        <br />
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
          :key="'buyitem' + ca.itemType + ca.itemId"
          v-tooltip="{
            type: ca.itemData && ca.itemData.type,
            data: ca.itemData,
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
          (a: AllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
    buyableItems() {
      return (this.ship?.planet?.vendor?.items || [])
        .filter(
          (item: VendorItemPrice) => item.buyMultiplier,
        )
        .map((item: VendorItemPrice) => {
          const price = c.r2(
            Math.max(
              (item.itemData?.basePrice || 1) *
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
          const itemForSale = (
            this.ship?.planet?.vendor?.items || []
          ).find(
            (i: VendorItemPrice) =>
              i.itemType === item.type &&
              i.itemData?.id === item.id,
          )
          if (!itemForSale) return
          const price = c.r2(
            Math.min(
              (itemForSale.itemData?.basePrice || 1) *
                itemForSale.sellMultiplier *
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
            price,
            canSell: this.isCaptain,
          }
        })
        .filter((i: ItemStub) => i)
    },
    swappableChassis() {
      return (this.ship.planet?.vendor?.chassis || []).map(
        (chassis: VendorChassisPrice) => {
          const currentChassisSellPrice = Math.floor(
            this.ship.chassis?.basePrice / 2,
          )
          const price = c.r2(
            Math.min(
              (chassis.chassisData?.basePrice || 1) *
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
            price,
            canBuy:
              this.isCaptain &&
              this.ship.commonCredits >= price &&
              chassis.chassisType !== this.ship.chassis.id,
          }
        },
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyItem(data: VendorItemPrice) {
      this.$store.commit('setShipProp', [
        'items',
        [...this.ship.items, data.itemData],
      ])
      this.$socket.emit(
        'ship:buyItem',
        this.ship.id,
        this.crewMember?.id,
        data.itemType,
        data.itemId,
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
      this.$socket.emit(
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

    swapChassis(data: VendorChassisPrice) {
      this.$socket.emit(
        'ship:swapChassis',
        this.ship.id,
        this.crewMember?.id,
        data.chassisType,
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

<style lang="scss" scoped></style>
