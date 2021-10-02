<template>
  <Box
    class="repair"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/18.jpg"
  >
    <template #title
      ><span class="sectionemoji">⛏️</span>Mining Drop
      Pod</template
    >
    <div class="panesection">
      <div>
        <div class="panesubhead">Mining Priority</div>
      </div>
      <button
        v-for="choice in choicesToShow"
        :key="'repairchoice' + choice"
        :class="{ secondary: selected !== choice }"
        @click="$store.commit('setMinePriority', choice)"
      >
        {{
          c.capitalize(
            choice === 'closest'
              ? 'closest to complete'
              : choice,
          )
        }}
      </button>
    </div>

    <div class="panesection">
      <div class="">
        Your mine speed:
        {{
          c.numberWithCommas(
            c.r2(
              (minePower / c.tickInterval) * 1000 * 60 * 60,
              0,
            ),
          )
        }}/hr
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
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'mine'
      )
    },
    choicesToShow(): MinePriorityType[] {
      const choices: MinePriorityType[] = [
        ...(
          (this.ship?.planet?.mine || []) as PlanetMine
        ).map((m) => m.id),
        'closest',
      ]
      return choices
    },
    selected(): string {
      const priority = this.crewMember?.minePriority
      return this.choicesToShow.includes(priority)
        ? priority
        : 'closest'
    },
    minePower(): number {
      const passiveBoostMultiplier =
        1 +
        ((
          this.crewMember as CrewMemberStub
        ).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostMineSpeed'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostMineSpeed'
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
        generalBoostMultiplier *
        passiveBoostMultiplier *
        c.getMineAmountPerTickForSingleCrewMember(
          this.crewMember?.skills.find(
            (s: XPData) => s.skill === 'mining',
          )?.level || 1,
        )
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
