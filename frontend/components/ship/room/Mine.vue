<template>
  <Box
    class="repair"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/18.webp"
  >
    <template #title
      ><span class="sectionemoji">⛏️</span>Mining Drop
      Pod</template
    >

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
        <span>{{
          c.capitalize(
            choice === 'closest'
              ? 'closest to complete'
              : choice === 'shipCosmeticCurrency'
              ? c.shipCosmeticCurrencyPlural
              : choice === 'crewCosmeticCurrency'
              ? c.crewCosmeticCurrencyPlural
              : choice,
          )
        }}</span>
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
    strengthLevel(): number {
      const passiveBoost = this.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === 'boostStrength' ? p.intensity || 0 : 0),
        0,
      )
      return (
        (this.crewMember.skills.find(
          (s) => s.skill === 'strength',
        )?.level || 1) + passiveBoost
      )
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
          this.strengthLevel,
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
