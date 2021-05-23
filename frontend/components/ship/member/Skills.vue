<template>
  <div class="inventory panesection">
    <div class="panesubhead">Skills</div>
    <div
      v-for="skill in sortedSkills"
      :key="'skill' + skill.skill"
    >
      Lv.{{ skill.level }}
      {{ c.capitalize(skill.skill) }} ({{
        Math.round(skill.xp)
      }}
      xp)
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['crewMember']),
    sortedSkills(this: ComponentShape) {
      return [...this.crewMember.skills].sort(
        (a: XPData, b: XPData) => b.xp - a.xp,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.inventory {
  position: relative;
}
</style>
