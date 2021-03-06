<template>
  <Box
    class="bunk"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/13.webp"
  >
    <template #title><span class="sectionemoji">🛌</span>Bunk</template>
    <div class="panesection">zzzzZZZZzzzz.....</div>
    <div
      class="panesection"
      v-if="crewMember.bottomedOutOnStamina && msToBottomedOutResetPoint > 0"
    >
      <div class="bold warning marbotsmall">You've hit your limit!</div>
      You must rest
      <template
        v-if="ship.gameSettings.staminaBottomedOutChargeMultiplier !== 1"
      >
        at a
        <span class="warning"
          >{{
            c.r2(1 - ship.gameSettings.staminaBottomedOutChargeMultiplier) *
            100
          }}% reduced</span
        >
        recovery rate
      </template>
      until you've recovered at least
      <b>{{ ship.gameSettings.staminaBottomedOutResetPoint * 100 }} stamina</b>.
      ({{ c.msToTimeString(msToBottomedOutResetPoint) }})
    </div>
    <div class="panesection" v-if="msToRested && msToRested > 0">
      Fully rested in {{ timeToRested }}
    </div>
    <div class="panesection" v-if="crewMember.stamina === 1">Fully rested!</div>

    <div class="panesection" v-if="msToRested && msToRested > 0">
      <div>
        <div class="panesubhead">When Fully Rested, Go To...</div>
      </div>
      <button
        v-for="room in Object.keys(ship.rooms)"
        :key="'roomchoice' + room"
        :class="{
          secondary: crewMember.fullyRestedTarget !== room,
        }"
        @click="setFullyRestedTarget(room)"
      >
        <span>{{ c.capitalize(c.camelCaseToWords(room)) }}</span>
      </button>
    </div>
  </Box>
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
    highlight(): boolean {
      return this.ship?.tutorial?.currentStep?.highlightPanel === 'room'
    },
    msToRested(): number {
      const passiveBoostMultiplier =
        1 +
        ((this.crewMember as CrewMemberStub).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostStaminaRegeneration'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostStaminaRegeneration'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0)
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )

      return (
        ((this.crewMember.maxStamina - this.crewMember.stamina) /
          (c.getStaminaGainPerTickForSingleCrewMember(
            this.ship.gameSettings.baseStaminaUse,
            this.ship.gameSettings.staminaRechargeMultiplier,
          ) *
            generalBoostMultiplier *
            passiveBoostMultiplier)) *
        c.tickInterval
      )
    },
    msToBottomedOutResetPoint(): number {
      const passiveBoostMultiplier =
        1 +
        ((this.crewMember as CrewMemberStub).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostStaminaRegeneration'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostStaminaRegeneration'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0)
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )

      return (
        ((this.ship.gameSettings.staminaBottomedOutResetPoint -
          this.crewMember.stamina) /
          (c.getStaminaGainPerTickForSingleCrewMember(
            this.ship.gameSettings.baseStaminaUse,
            this.ship.gameSettings.staminaRechargeMultiplier,
          ) *
            (this.crewMember.bottomedOutOnStamina
              ? this.ship.gameSettings.staminaBottomedOutChargeMultiplier || 1
              : 1) *
            generalBoostMultiplier *
            passiveBoostMultiplier)) *
        c.tickInterval
      )
    },
    timeToRested(): string | null {
      if (this.crewMember.stamina === 1) return null
      return c.msToTimeString(this.msToRested)
    },
  },
  watch: {},
  mounted() {},
  methods: {
    setFullyRestedTarget(room) {
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        fullyRestedTarget: room,
      })
      ;(this as any).$socket?.emit(
        'crew:fullyRestedTarget',
        this.ship.id,
        this.crewMember.id,
        room,
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.bunk {
  position: relative;
  width: 320px;
}
</style>
