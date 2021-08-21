<template>
  <div>
    <div class="tooltipheader">
      Damage Breakdown
    </div>
    <!-- <hr />
    <div>
      <span>
        Attack
        {{
          data.miss
            ? 'missed'
            : `hit for ${c.r2(data.damageTaken)} damage`
        }}</span
      ><span v-if="data.didDie"
        >, destroying the target</span
      > -->
      <hr />
      <div>
        <ul
          v-if="data.damageTally && data.damageTally.length"
        >
          <li v-for="d in data.damageTally">
            {{ d.targetDisplayName }} ({{ d.targetType }}) took
            {{ c.r2(d.damage)
            }} damage{{ d.destroyed ? ' (destroyed)' : '' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  mounted() {
    // c.log(this.data)
  },
})
</script>

<style scoped lang="scss">
ul {
  // margin: 0;
  padding-left: 1.5em;
}
</style>
