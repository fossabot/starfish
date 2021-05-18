<template>
  <Box class="items" v-if="ship">
    <template #title>
      <span class="sectionemoji">🏆</span>Crew Rankings
    </template>

    <div class="panesection">
      <h5>Credits</h5>

      <div
        v-for="(cm, index) in richest"
        :key="'richest' + cm.id"
      >
        <b>#{{ index + 1 }}</b
        >: {{ cm.name }} ({{ Math.round(cm.credits) }}
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
    richest() {
      return [...this.ship.crewMembers].sort(
        (a: any, b: any) => b.credits - a.credits,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.items {
  width: 320px;
  position: relative;
  grid-column: span 2;
}
</style>
