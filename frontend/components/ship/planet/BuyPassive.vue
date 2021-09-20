<template>
  <div
    class="panesection"
    v-if="
      crewMember &&
      ship.planet &&
      ship.planet.vendor.passives.length
    "
  >
    <div>
      <div class="panesubhead">Personal Outfitter</div>
    </div>

    <span
      v-for="passive in passives"
      :key="'buypassive' + passive.id"
      v-if="passive.data"
      v-tooltip="passive.data.description"
    >
      <button
        :class="{ disabled: !passive.canBuy }"
        @click="
          passive.canBuy && buyPassive(passive.data.id)
        "
      >
        {{ passive.data.displayName }} Lv.{{
          (crewMemberPassiveLevels[passive.data.id] || 0) +
          1
        }}: 💳{{ c.numberWithCommas(passive.price) }}
      </button>
    </span>
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

    isFriendlyToFaction(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },

    crewMemberPassiveLevels(): {
      [key in CrewPassiveId]?: number
    } {
      const levels: {
        [key in CrewPassiveId]?: number
      } = {}
      for (let p of this.crewMember?.passives || []) {
        levels[p.type as CrewPassiveId] = p.level
      }
      return levels
    },

    passives(): any[] {
      return this.ship.planet.vendor.passives.map(
        (passive: PlanetVendorCrewPassivePrice) => {
          const price = Math.ceil(
            c.crewPassives[passive.id].basePrice *
              passive.buyMultiplier *
              c.getCrewPassivePriceMultiplier(
                this.crewMemberPassiveLevels[passive.id] ||
                  1,
              ) *
              this.ship.planet.priceFluctuator *
              (this.isFriendlyToFaction
                ? c.factionVendorMultiplier
                : 1),
          )
          return {
            data: c.crewPassives[passive.id],
            canBuy: this.crewMember.credits >= price,
            price,
          }
        },
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    buyPassive(passiveId: CrewPassiveId) {
      ;(this as any).$socket?.emit(
        'crew:buyPassive',
        this.ship.id,
        this.crewMember?.id,
        passiveId,
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
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped></style>
