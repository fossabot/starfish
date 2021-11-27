<template>
  <div>
    <!-- <div class="tooltipheader">Damage Breakdown</div>

    <hr /> -->

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
            >{{
              c.r2(
                data.damageMitigated *
                  c.displayHPMultiplier,
                0,
              )
            }}
            damage</span
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
            >{{
              c.r2(d.damage * c.displayHPMultiplier, 0)
            }}
            damage</span
          >{{ d.destroyed ? ' (destroyed)' : '' }}
        </li>
        <template v-if="data.overkill">
          <li>
            <span class="warning"
              >{{
                c.r2(
                  data.overkill * c.displayHPMultiplier,
                  0,
                )
              }}
              damage</span
            >
            overkill
          </li>
        </template>
      </ul>
      <template v-if="data.hpLeft">
        <hr />
        <div class="sub">
          {{
            c.r2(data.hpLeft * c.displayHPMultiplier, 0)
          }}
          HP remaining
        </div>
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
