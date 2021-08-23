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
    <button
      v-for="passive in ship.planet.vendor.passives"
      :key="'buypassive' + passive.id"
      v-if="passive.passiveData"
      :disabled="
        crewMember.credits <
        passive.passiveData.basePrice *
          passive.buyMultiplier *
          ship.planet.priceFluctuator *
          (isFriendlyToFaction
            ? c.factionVendorMultiplier
            : 1) *
          c.getCrewPassivePriceMultiplier(
            crewMemberPassiveLevels[
              passive.passiveData.type
            ] || 0,
          )
      "
      @click="buyPassive(passive.passiveData.type)"
    >
      {{ passive.passiveData.displayName }} Lv.{{
        (crewMemberPassiveLevels[
          passive.passiveData.type
        ] || 0) + 1
      }}: 💳{{
        c.numberWithCommas(
          c.r2(
            passive.passiveData.basePrice *
              passive.buyMultiplier *
              (isFriendlyToFaction
                ? c.factionVendorMultiplier
                : 1) *
              c.getCrewPassivePriceMultiplier(
                crewMemberPassiveLevels[
                  passive.passiveData.type
                ] || 0,
              ),
            2,
            true,
          ),
        )
      }}
    </button>
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
    ...mapState(['ship', 'crewMember']),

    isFriendlyToFaction() {
      return (
        (this.ship.planet.allegiances.find(
          (a: AllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },

    crewMemberPassiveLevels() {
      const levels: {
        [key in CrewPassiveId]?: number
      } = {}
      for (let p of this.crewMember?.passives || []) {
        levels[p.type as CrewPassiveId] = p.level
      }
      return levels
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
