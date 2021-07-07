<template>
  <div class="inventory panesection">
    <div class="panesubhead">Skills</div>
    <ProgressBar
      :mini="true"
      :dangerZone="-1"
      :percent="skill.progress"
      v-for="skill in sortedSkills"
      :key="'skill' + skill.skill"
    >
      <b>{{ c.capitalize(skill.skill) }}</b
      >: <NumberChangeHighlighter :number="skill.level" />
      <span class="sub"
        ><NumberChangeHighlighter
          :number="Math.round(skill.xp)"
          :display="
            `(${c.numberWithCommas(
              Math.round(skill.xp),
            )} xp)`
          "
        />
      </span>
    </ProgressBar>
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
      return [...this.crewMember.skills]
        .sort((a: XPData, b: XPData) => b.xp - a.xp)
        .map((s: XPData) => {
          const toNext = c.levels[s.level] - s.xp
          const levelSize =
            c.levels[s.level] - c.levels[s.level - 1]
          const progress = 1 - toNext / levelSize
          return { ...s, progress }
        })
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
