<template>
  <Box
    class="repair"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/26.webp"
  >
    <template #title><span class="sectionemoji">🎮</span>Lounge</template>

    <div class="panesection">
      <div class="">
        Gaining
        {{
          c.numberWithCommas(
            c.r2(
              (moraleGainPerTick / c.tickInterval) * 1000 * 60 * 60 * 100,
              1,
            ),
          )
        }}% morale per hour
      </div>
    </div>

    <div class="panesection">
      <div class="sub">
        Morale is gained faster the more crew members are in the lounge.
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      c,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight(): boolean {
      return this.ship?.tutorial?.currentStep?.highlightPanel === 'lounge'
    },
    membersInLounge(): number {
      return this.ship.crewMembers.filter(
        (c: CrewMemberStub) => c.location === 'lounge',
      ).length
    },
    moraleGainPerTick(): number {
      const passiveBoostMultiplier =
        1 +
        ((this.crewMember as CrewMemberStub).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostMoraleGain' ? total + (p.intensity || 0) : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostMoraleGain' ? total + (p.intensity || 0) : total,
          0,
        ) || 0)
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )
      return (
        c.loungeMoraleGainBasisPerTick *
        generalBoostMultiplier *
        passiveBoostMultiplier *
        this.membersInLounge
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.repair {
  position: relative;
  width: 320px;
}
</style>
