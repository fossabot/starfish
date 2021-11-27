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
      <div class="panesubhead">Personal Upgrades</div>
    </div>

    <span
      v-for="passive in passives"
      :key="'buypassive' + passive.data.id"
      v-if="passive.data"
      v-tooltip="{
        context: passive.data.description(passive, true),
        type: 'price',
        buyOrSell: 'buy',
        planet: ship.planet,
        passive: passive,
      }"
    >
      <button
        :class="{ disabled: !passive.canBuy }"
        @click="
          passive.canBuy && buyPassive(passive.data.id)
        "
      >
        <div>
          <b>
            {{ passive.data.displayName
            }}{{
              passive.intensity
                ? ` +${passive.intensity}`
                : ''
            }}
          </b>
        </div>
        <div>{{ c.priceToString(passive.price) }}</div>
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

    isFriendlyToGuild(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },

    crewMemberPassiveIntensitites(): {
      [key in CrewPassiveId]?: number
    } {
      const intensities: {
        [key in CrewPassiveId]?: number
      } = {}
      for (let p of this.crewMember?.passives || []) {
        intensities[p.id as CrewPassiveId] =
          p.intensity || 0
      }
      return intensities
    },

    passives(): any[] {
      return this.ship.planet.vendor.passives.map(
        (passive: PlanetVendorCrewPassivePrice) => {
          const price = c.getCrewPassivePrice(
            passive,
            this.crewMemberPassiveIntensitites[
              passive.id
            ] || 0,
            this.ship.planet,
            this.ship.guildId,
            this.crewMember.skills.find(
              (s) => s.skill === 'charisma',
            )?.level || 1,
          )
          return {
            buyMultiplier: passive.buyMultiplier,
            data: c.crewPassives[passive.id],
            canBuy: c.canAfford(
              price,
              this.ship,
              this.crewMember,
            ),
            price,
            intensity: passive.intensity,
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
