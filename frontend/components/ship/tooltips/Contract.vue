<template>
  <div
    :class="{
      contracttooltipwrapper: !targetInSight && dataToUse,
    }"
  >
    <ShipTooltipsShipdot
      v-if="targetInSight"
      :data="targetInSight"
    />
    <div v-else-if="dataToUse">
      <ShipContract
        :interactive="false"
        :contract="dataToUse"
        class="contracttooltip"
      />
    </div>
    <div v-else class="sub">Ended contract</div>
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
    targetInSight(): ShipStub | undefined {
      return this.ship?.visible?.ships.find(
        (s) => s.id === this.dataToUse?.targetId,
      )
    },
    dataToUse(): Contract {
      return this.ship?.contracts?.find(
        (p) => p.id === (this.data as any).id,
      )
    },
  },
})
</script>

<style scoped lang="scss">
.contracttooltip {
  margin: 0;
  border: 0;
}
.contracttooltipwrapper {
  padding: 0;
  border: 0;
}
</style>
