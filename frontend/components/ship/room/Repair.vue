<template>
  <Box class="repair">
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
      <div class="panesubhead">Efficacy</div>

      <div>
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
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  crewMember: CrewMemberStub
  [key: string]: any
}

export default {
  data(): Partial<ComponentShape> {
    return {
      c,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    choicesToShow(this: ComponentShape) {
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
      return choices
    },
    selected(this: ComponentShape) {
      return (
        this.crewMember?.repairPriority || 'most damaged'
      )
    },
    totalRepairPower(this: ComponentShape) {
      return c.getRepairAmountPerTickForSingleCrewMember(
        this.crewMember?.skills.find(
          (s: XPData) => s.skill === 'mechanics',
        )?.level || 1,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.repair {
  position: relative;
  width: 300px;
}
</style>
