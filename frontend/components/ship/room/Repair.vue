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
        v-for="choice in repairChoices"
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
  repairChoices: RepairPriority[]
  [key: string]: any
}

export default {
  data(): Partial<ComponentShape> {
    return {
      c,
      repairChoices: ['most damaged', 'engines', 'weapons'],
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
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
