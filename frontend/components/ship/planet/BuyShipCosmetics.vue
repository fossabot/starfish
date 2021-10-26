<template>
  <div
    v-if="
      ship.planet &&
      ship.planet.vendor &&
      ship.planet.vendor.shipCosmetics &&
      ship.planet.vendor.shipCosmetics.length
    "
    class="panesection"
    v-tooltip="
      isCaptain
        ? null
        : `The captain can buy cosmetics for the ship.`
    "
  >
    <div class="panesubhead">
      {{ ship.planet.name }} City Customs
    </div>

    <div class="sub marbot">
      <div v-if="isCaptain">
        Captain, you can use your ship's special resources
        (You have 💎{{
          ship &&
          c.numberWithCommas(
            c.r2(ship.shipCosmeticCurrency, 0, true),
          )
        }}) to buy and sell new taglines and headers for the
        ship.
      </div>
    </div>

    <div
      class="panesection inline"
      v-if="buyableTaglines.length"
    >
      <div class="panesubhead">Taglines</div>

      <div class="flexwrap">
        <span
          v-for="t in buyableTaglines"
          :key="'buyshipcosmetic' + t.tagline"
        >
          <button
            :disabled="!t.canBuy"
            @click="buyShipTagline(t)"
          >
            <b>{{ t.tagline }}</b>
            <div>
              {{ c.priceToString(t.price) }}
            </div>
          </button>
        </span>
      </div>
    </div>

    <div
      class="panesection inline"
      v-if="buyableHeaderBackgrounds.length"
    >
      <div class="panesubhead">Banners</div>

      <div class="flexwrap">
        <span
          v-for="hb in buyableHeaderBackgrounds"
          :key="'buyshipcosmetic' + hb.headerBackground.id"
          style="max-width: 50%"
          v-tooltip="{
            ...ship,
            headerBackground: hb.headerBackground.url,
            type: 'shipHeader',
          }"
        >
          <button
            :disabled="!hb.canBuy"
            @click="buyShipHeaderBackground(hb)"
          >
            <img
              :src="`/images/headerBackgrounds/${hb.headerBackground.url}`"
            />
            <b>{{ hb.headerBackground.id }}</b>
            <div>
              {{ c.priceToString(hb.price) }}
            </div>
          </button>
        </span>
      </div>
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
    buyableTaglines() {
      return (
        (this.ship?.planet?.vendor as PlanetVendor)
          ?.shipCosmetics || []
      )
        .filter((sc) => sc.tagline)
        .map((item) => {
          const price = c.getShipTaglinePrice(item)
          return {
            ...item,
            price,
            canBuy:
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
                true,
              ) &&
              !this.ship.availableTaglines.includes(
                item.tagline,
              ),
          }
        })
    },
    buyableHeaderBackgrounds() {
      return (
        (this.ship?.planet?.vendor as PlanetVendor)
          ?.shipCosmetics || []
      )
        .filter((sc) => sc.headerBackground)
        .map((item) => {
          const price = c.getShipHeaderBackgroundPrice(item)
          return {
            ...item,
            price,
            canBuy:
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
                true,
              ) &&
              !this.ship.availableHeaderBackgrounds.find(
                (ahb) =>
                  ahb.id === item.headerBackground?.id,
              ),
          }
        })
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyShipTagline(
      data: PlanetShipCosmetic & { tagline: string },
    ) {
      if (!confirm(`Really buy ${data.tagline}?`)) return
      ;(this as any).$socket.emit(
        'ship:buyTagline',
        this.ship.id,
        this.crewMember?.id,
        data.tagline,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
    buyShipHeaderBackground(data: PlanetShipCosmetic) {
      if (
        !confirm(`Really buy ${data.headerBackground?.id}?`)
      )
        return
      ;(this as any).$socket.emit(
        'ship:buyHeaderBackground',
        this.ship.id,
        this.crewMember?.id,
        data.headerBackground,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
button img {
  width: 100%;
  padding-bottom: 0.3em;
}
</style>
