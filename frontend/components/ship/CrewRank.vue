<template>
  <div class="items" v-if="ship">
    <div class="box">
      <h4>Crew Rankings</h4>

      <div
        class="box"
        v-for="skill in crewMember.skills"
        :key="'skillrank' + skill.skill"
      >
        <h5>{{ skill.skill }}</h5>

        <div
          v-for="(cm, index) in bestXAtEachSkill[
            skill.skill
          ]"
          :key="'skillrankmember' + skill.skill + cm.id"
        >
          <b>#{{ index + 1 }}</b
          >: {{ cm.name }} - Lv.{{ cm.skill.level }} ({{
            Math.round(cm.skill.xp)
          }}
          xp)
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
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
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.items {
  width: 300px;
  position: relative;
  grid-column: span 2;
}

.box {
  width: 100%;
}
</style>
