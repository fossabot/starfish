<template>
  <div>
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

      <div class="sub marbot" v-if="isCaptain">
        Captain, you can use your ship's special resources
        (You have 💎{{
          ship &&
          c.numberWithCommas(
            c.r2(ship.shipCosmeticCurrency, 0, true),
          )
        }}) to buy new taglines and banners for the ship.
      </div>

      <div
        class="panesection marbottiny"
        v-if="buyableShipTaglines.length"
      >
        <div class="panesubhead">Ship Taglines</div>

        <div class="flexwrap">
          <span
            v-for="t in buyableShipTaglines"
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
        class="panesection marbottiny"
        v-if="buyableShipBackgrounds.length"
      >
        <div class="panesubhead">Ship Banners</div>

        <div class="flexwrap">
          <span
            v-for="hb in buyableShipBackgrounds"
            :key="
              'buyshipcosmetic' + hb.headerBackground.id
            "
            style="max-width: 50%"
            v-tooltip="{
              ...ship,
              headerBackground: hb.headerBackground.url,
              type: 'shipHeader',
            }"
          >
            <button
              class="ship"
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

    <div
      v-if="
        ship.planet &&
        ship.planet.vendor &&
        ship.planet.vendor.crewCosmetics &&
        ship.planet.vendor.crewCosmetics.length
      "
      class="panesection"
    >
      <div class="panesubhead">Tailor</div>

      <div
        class="panesection marbottiny"
        v-if="buyableCrewTaglines.length"
      >
        <div class="panesubhead">Crew Member Taglines</div>

        <div class="flexwrap">
          <span
            v-for="t in buyableCrewTaglines"
            :key="'buycrewcosmetic' + t.tagline"
          >
            <button
              :disabled="!t.canBuy"
              @click="buyCrewTagline(t)"
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
        class="panesection marbottiny"
        v-if="buyableCrewBackgrounds.length"
      >
        <div class="panesubhead">
          Crew Member Backgrounds
        </div>

        <div class="grid3">
          <span
            v-for="hb in buyableCrewBackgrounds"
            :key="'buycrewcosmetic' + hb.background.id"
            v-tooltip="{
              ...crewMember,
              background: hb.background.url,
              type: 'crewHeader',
            }"
          >
            <button
              class="crew secondary flexcolumn flexcenter"
              :disabled="!hb.canBuy"
              @click="buyCrewHeaderBackground(hb)"
            >
              <img
                :src="`/images/headerBackgrounds/crew/${hb.background.url}`"
              />
              <b>{{ hb.background.id }}</b>
              <div>
                {{ c.priceToString(hb.price) }}
              </div>
            </button>
          </span>
        </div>
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
    buyableShipTaglines() {
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
    buyableShipBackgrounds() {
      return (
        (this.ship?.planet?.vendor as PlanetVendor)
          ?.shipCosmetics || []
      )
        .filter((sc) => sc.headerBackground)
        .map((item) => {
          const price = c.getShipBackgroundPrice(item)
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

    buyableCrewTaglines() {
      return (
        (this.ship?.planet?.vendor as PlanetVendor)
          ?.crewCosmetics || []
      )
        .filter((sc) => sc.tagline)
        .map((item) => {
          const price = c.getCrewTaglinePrice(item)
          return {
            ...item,
            price,
            canBuy:
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
              ) &&
              !this.crewMember.availableTaglines?.includes(
                item.tagline,
              ),
          }
        })
    },
    buyableCrewBackgrounds() {
      return (
        (this.ship?.planet?.vendor as PlanetVendor)
          ?.crewCosmetics || []
      )
        .filter((sc) => sc.background)
        .map((item) => {
          const price = c.getCrewBackgroundPrice(item)
          return {
            ...item,
            price,
            canBuy:
              c.canAfford(
                price,
                this.ship,
                this.crewMember,
              ) &&
              !(
                this.crewMember as CrewMemberStub
              ).availableBackgrounds?.find(
                (ahb) => ahb.id === item.background?.id,
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
            c.log(res.error)
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
        'ship:buyBackground',
        this.ship.id,
        this.crewMember?.id,
        data.headerBackground,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },

    buyCrewTagline(
      data: PlanetCrewCosmetic & { tagline: string },
    ) {
      if (!confirm(`Really buy ${data.tagline}?`)) return
      ;(this as any).$socket.emit(
        'crew:buyTagline',
        this.ship.id,
        this.crewMember?.id,
        data.tagline,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },
    buyCrewHeaderBackground(data: PlanetCrewCosmetic) {
      if (!confirm(`Really buy ${data.background?.id}?`))
        return
      ;(this as any).$socket.emit(
        'crew:buyBackground',
        this.ship.id,
        this.crewMember?.id,
        data.background,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.grid3 > * {
  display: block;
  width: 100%;
}
button.ship img {
  width: 100%;
  padding-bottom: 0.3em;
}
button.crew {
  display: block;
  width: 100%;
  img {
    width: 100%;
    padding-bottom: 0.3em;
  }
}
</style>
