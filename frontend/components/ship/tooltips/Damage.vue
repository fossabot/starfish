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
        <li v-if="data.damageMitigated">
          <span
            :class="
              data.damageMitigated > 0
                ? 'success'
                : 'warning'
            "
            >{{ c.r2(data.damageMitigated) }} damage</span
          >
          {{
            data.damageMitigated > 0 ? 'mitigated' : 'added'
          }}
          by passives
        </li>
        <li v-for="d in data.damageTally">
          <span style="color: var(--item)"
            >{{ d.targetDisplayName }} ({{
              d.targetType
            }})</span
          >
          took
          <span class="warning"
            >{{ c.r2(d.damage) }} damage</span
          >{{ d.destroyed ? ' (destroyed)' : '' }}
        </li>
      </ul>
      <template v-if="d.hpLeft">
        <hr />
        <div>{{ d.hpLeft }} HP remaining</div>
      </template>
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
