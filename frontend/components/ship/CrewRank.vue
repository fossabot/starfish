<template>
  <Box class="crewrank" v-if="show">
    <template #title>
      <span class="sectionemoji">👨‍👩‍👧‍👦</span>Crew Rankings
    </template>

    <div class="panesection">
      <h5>Contributed Credits</h5>

      <div
        v-for="(cm, index) in mostShared"
        :key="'mostShared' + cm.id"
      >
        <b>#{{ index + 1 }}</b
        >: {{ cm.name }} ({{
          Math.round(cm.totalContributed)
        }}
        credits)
      </div>
    </div>

    <div
      class="panesection"
      v-for="skill in crewMember.skills"
      :key="'skillrank' + skill.skill"
    >
      <h5>{{ c.capitalize(skill.skill) }}</h5>

      <div
        v-for="(cm, index) in bestXAtEachSkill[skill.skill]"
        :key="'skillrankmember' + skill.skill + cm.id"
      >
        <b>#{{ index + 1 }}</b
        >: {{ cm.name }} - Lv.{{ cm.skill.level }} ({{
          Math.round(cm.skill.xp)
        }}
        xp)
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        this.ship.crewMembers.length > 1 &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewRank'))
      )
    },
    bestXAtEachSkill() {
      const best: any = {}
      for (let { skill } of this.crewMember.skills) {
        best[skill] = [...this.ship.crewMembers]
          .map((cm) => ({
            id: cm.id,
            name: cm.name,
            skill: cm.skills.find(
              (s: XPData) => s.skill === skill,
            ) || { xp: 0, level: 1 },
          }))
          .sort((a: any, b: any) => {
            return b.skill.xp - a.skill.xp
          })
          .slice(0, 3)
      }
      return best
    },
    mostShared() {
      return [...this.ship.crewMembers]
        .map((c: CrewMemberStub) => ({
          ...c,
          totalContributed: c.stats?.find(
            (s: CrewStatEntry) =>
              s.stat === 'totalContributedToCommonFund',
          )?.amount,
        }))
        .filter((c: CrewMemberStub) => c.totalContributed)
        .sort(
          (a: any, b: any) =>
            b.totalContributed - a.totalContributed,
        )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.crewrank {
  width: 300px;
  position: relative;
}
</style>
