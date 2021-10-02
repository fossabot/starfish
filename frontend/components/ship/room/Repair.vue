<template>
  <Box
    class="repair"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/9.jpg"
  >
    <template #title
      ><span class="sectionemoji">🔧</span>Repair
      Bay</template
    >
    <div class="panesection">
      <div>
        <div class="panesubhead">Repair Priority</div>
      </div>
      <button
        v-for="choice in choicesToShow"
        :key="'repairchoice' + choice"
        :class="{ secondary: selected !== choice }"
        @click="$store.commit('setRepairPriority', choice)"
      >
        {{ c.capitalize(choice) }}
      </button>
    </div>

    <div class="panesection">
      <div class="">
        Your repair speed:
        {{
          Math.round(totalRepairPower * 60 * 60 * 100) / 100
        }}
        HP/hr
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
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    choicesToShow() {
      const choices: RepairPriority[] = ['most damaged']
      if (
        this.ship.items.find(
          (i: ItemStub) => i.type === 'weapon',
        )
      )
        choices.push('weapons')
      if (
        this.ship.items.find(
          (i: ItemStub) => i.type === 'engine',
        )
      )
        choices.push('engines')
      if (
        this.ship.items.find(
          (i: ItemStub) => i.type === 'scanner',
        )
      )
        choices.push('scanners')
      if (
        this.ship.items.find(
          (i: ItemStub) => i.type === 'communicator',
        )
      )
        choices.push('communicators')
      if (
        this.ship.items.find(
          (i: ItemStub) => i.type === 'armor',
        )
      )
        choices.push('armor')
      return choices
    },
    selected() {
      return (
        this.crewMember?.repairPriority || 'most damaged'
      )
    },
    totalRepairPower() {
      const passiveBoostMultiplier =
        1 +
        ((
          this.crewMember as CrewMemberStub
        ).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostRepairSpeed'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostRepairSpeed'
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
        c.getRepairAmountPerTickForSingleCrewMember(
          this.crewMember?.skills.find(
            (s: XPData) => s.skill === 'mechanics',
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
