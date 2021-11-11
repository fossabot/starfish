<template>
  <div v-if="ship" class="mass">
    <div>
      More mass requires more thrust to gain velocity.
    </div>
    <hr />
    <div class="flexbetween">
      <div class="sub">Items</div>
      <div>
        {{
          c.r2(
            (ship.chassis.mass +
              ship.items.reduce(
                (total, i) => i.mass + total,
                0,
              )) /
              1000,
          )
        }}
        tons
      </div>
    </div>

    <div class="flexbetween">
      <div class="sub">Cargo</div>
      <div>
        {{
          c.r2(
            ship.crewMembers.reduce(
              (total, cm) =>
                cm.inventory.reduce(
                  (t, i) => t + i.amount,
                  0,
                ),
              0,
            ) / 1000,
          )
        }}
        tons
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
  },
})
</script>

<style scoped lang="scss">
.mass {
  width: 170px;
}
</style>
