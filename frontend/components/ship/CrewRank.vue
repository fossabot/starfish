<template>
  <Box
    class="crewrank"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/15.jpg"
  >
    <template #title>
      <span class="sectionemoji">👨‍👩‍👧‍👦</span>Crew Rankings
    </template>

    <Tabs>
      <Tab
        v-for="skill in crewMember.skills"
        :key="'skillrank' + skill.skill"
        :title="c.camelCaseToWords(skill.skill)"
      >
        <ol>
          <li
            v-for="(cm, index) in bestXAtEachSkill[
              skill.skill
            ]"
            :key="'skillrankmember' + skill.skill + cm.id"
          >
            {{ cm.name }}
            <span class="sub">
              Lv.{{ cm.skill.level }} ({{
                Math.round(cm.skill.xp)
              }}xp)
            </span>
          </li>
        </ol>
      </Tab>

      <Tab
        title="Contributed Credits"
        v-if="mostShared.length"
      >
        <ol>
          <li
            v-for="(cm, index) in mostShared"
            :key="'mostShared' + cm.id"
          >
            {{ cm.name }}
            <span class="sub">
              ({{ Math.round(cm.totalContributed) }})
            </span>
          </li>
        </ol>
      </Tab>
    </Tabs>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        this.ship.crewMembers.length > 1 &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('crewRank'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'crewRank'
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
        .slice(0, 3)
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.crewrank {
  width: 300px;
  position: relative;
}
</style>
