<template>
  <div class="inventory box">
    <b>Skills</b>
    <div
      v-for="skill in crewMember.skills"
      :key="'skill' + skill.skill"
    >
      Lv.{{ skill.level }} {{ skill.skill }} ({{
        Math.round(skill.xp)
      }}
      xp)
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
