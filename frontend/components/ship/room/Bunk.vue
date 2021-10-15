<template>
  <Box
    class="bunk"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/13.jpg"
  >
    <template #title
      ><span class="sectionemoji">🛌</span>Bunk</template
    >
    <div class="panesection">zzzzZZZZzzzz.....</div>
    <div
      class="panesection"
      v-if="crewMember.bottomedOutOnStamina"
    >
      <div class="bold warning marbotsmall">
        You've hit your limit!
      </div>
      You must rest until you're at least
      {{
        ship.gameSettings.staminaBottomedOutResetPoint *
        100
      }}% recovered. ({{
        c.msToTimeString(msToBottomedOutResetPoint)
      }})
    </div>
    <div class="panesection" v-if="timeToRested">
      Fully rested in {{ timeToRested }}
    </div>
    <div
      class="panesection"
      v-if="crewMember.stamina === 1"
    >
      Fully rested!
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
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    msToRested(): number {
      const passiveBoostMultiplier =
        1 +
        ((
          this.crewMember as CrewMemberStub
        ).passives?.reduce(
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
        ((this.crewMember.maxStamina -
          this.crewMember.stamina) /
          (c.getStaminaGainPerTickForSingleCrewMember(
            this.ship.gameSettings.baseStaminaUse,
          ) *
            generalBoostMultiplier *
            passiveBoostMultiplier)) *
        c.tickInterval
      )
    },
    msToBottomedOutResetPoint(): number {
      const passiveBoostMultiplier =
        1 +
        ((
          this.crewMember as CrewMemberStub
        ).passives?.reduce(
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
        ((this.ship.gameSettings
          .staminaBottomedOutResetPoint -
          this.crewMember.stamina) /
          (c.getStaminaGainPerTickForSingleCrewMember(
            this.ship.gameSettings.baseStaminaUse,
          ) *
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
  methods: {},
})
</script>

<style lang="scss" scoped>
.bunk {
  position: relative;
  width: 320px;
}
</style>
