<template>
  <div class="inventory panesection">
    <div class="panesubhead">Skills</div>
    <ProgressBar
      :mini="true"
      :dangerZone="-1"
      :percent="skill.progress"
      v-for="skill in sortedSkills"
      v-if="skill"
      :key="'skill' + skill.skill"
    >
      <div>
        <b>{{ c.capitalize(skill.skill) }}</b
        >: <NumberChangeHighlighter :number="skill.level" />
        <span class="sub"
          ><NumberChangeHighlighter
            :number="Math.round(skill.xp)"
            :display="`(${c.numberWithCommas(
              Math.round(skill.xp),
            )} xp)`"
          />
        </span>
      </div>
    </ProgressBar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['crewMember']),
    sortedSkills() {
      return [...this.crewMember.skills]
        .filter((s) => s)
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
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.inventory {
  position: relative;
}
</style>
