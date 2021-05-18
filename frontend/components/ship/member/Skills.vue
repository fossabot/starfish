<template>
  <div class="inventory panesection">
    <div class="panesubhead">Skills</div>
    <div
      v-for="skill in crewMember.skills"
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
