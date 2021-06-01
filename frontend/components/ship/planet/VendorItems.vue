<template>
  <div v-if="buyableItems.length || sellableItems.length">
    <div class="panesection">
      <div>
        <div class="panesubhead">Ship Outfitters</div>
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
            ship.chassis.slots
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
        >
          <button
            :disabled="!ca.canBuy"
            @click="buyItem(ca)"
          >
            <b>{{ ca.itemData.displayName }}</b>
            <div>💳{{ c.r2(ca.price, 2) }}</div>
          </button>
        </span></span
      ><span
        class="panesection inline"
        v-if="sellableItems.length"
      >
        <div>
          <div class="panesubhead">Sell Equipment</div>
        </div>
        <span
          v-for="ca in sellableItems"
          :key="
            'sellitem' + ca.type + ca.id + Math.random()
          "
        >
          <button
            :disabled="!ca.canSell"
            @click="sellItem(ca)"
          >
            <b>{{ ca.displayName }}</b>
            <div>💳{{ c.r2(ca.price, 2) }}</div>
          </button>
        </span>
      </span>
    </div>
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
    ...mapState(['ship', 'userId', 'crewMember']),
    isCaptain(this: ComponentShape) {
      return this.ship?.captain === this.userId
    },
    isSameFaction(this: ComponentShape) {
      return (
        this.ship.planet.faction?.id ===
        this.ship.faction.id
      )
    },
    buyableItems(this: ComponentShape) {
      return (this.ship?.planet?.vendor?.items || [])
        .filter(
          (item: VendorItemPrice) => item.buyMultiplier,
        )
        .map((item: VendorItemPrice) => {
          const price = c.r2(
            (item.itemData?.basePrice || 1) *
              item.buyMultiplier! *
              this.ship.planet.buyFluctuator *
              (this.isSameFaction
                ? c.factionVendorMultiplier
                : 1),
            2,
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
    sellableItems(this: ComponentShape) {
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
            (itemForSale.itemData?.basePrice || 1) *
              itemForSale.sellMultiplier *
              this.ship.planet.sellFluctuator *
              (this.isSameFaction
                ? 1 + (1 - (c.factionVendorMultiplier || 1))
                : 1),
            2,
          )
          return {
            ...item,
            price,
            canSell: this.isCaptain,
          }
        })
        .filter((i: ItemStub) => i)
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    buyItem(this: ComponentShape, data: VendorItemPrice) {
      this.$socket.emit(
        'ship:buyItem',
        this.ship.id,
        this.crewMember.id,
        data.itemType,
        data.itemId,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
          this.$store.commit('updateShip', res.data)
        },
      )
    },

    sellItem(this: ComponentShape, data: ItemStub) {
      c.log(data)
      this.$socket.emit(
        'ship:sellItem',
        this.ship.id,
        this.crewMember.id,
        data.type,
        data.id,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            console.log(res.error)
            return
          }
          this.$store.commit('updateShip', res.data)
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
