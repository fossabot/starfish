<template>
  <div>
    <div class="tooltipheader">Damage Breakdown</div>

    <hr />

    <div>
      <ul
        v-if="
          (data.damageTally && data.damageTally.length) ||
          (data.damageMitigated !== undefined &&
            data.damageMitigated !== 0)
        "
      >
        <li
          v-if="data.damageMitigated"
          :class="
            data.damageMitigated > 0 ? 'success' : 'warning'
          "
        >
          {{ c.r2(data.damageMitigated) }} damage
          {{
            data.damageMitigated > 0 ? 'mitigated' : 'added'
          }}
          by passives
        </li>
        <li v-for="d in data.damageTally" class="warning">
          {{ d.targetDisplayName }} ({{ d.targetType }})
          took {{ c.r2(d.damage) }} damage{{
            d.destroyed ? ' (destroyed)' : ''
          }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
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
