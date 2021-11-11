<template>
  <div>
    <div class="tooltipheader">
      <span :style="{ color: dataToUse.color }">{{
        dataToUse.name
      }}</span>
      <span class="sub normal"
        ><span class="sub">Zone</span></span
      >
    </div>
    <hr />
    <div>
      <!-- <div class="panesubhead">Zone Effects</div> -->
      <div
        v-for="(e, index) in dataToUse.effects"
        :key="'effecttt' + index"
      >
        <div>{{ c.capitalize(e.type) }}</div>
        <div class="sub" v-if="e.data && e.data.direction">
          Direction:
          <AngleArrow :angle="e.data.direction" />
        </div>
        <div class="sub" v-if="e.intensity">
          Intensity: {{ c.r2(e.intensity * 100, 0) }}
        </div>
        <div v-if="e.basedOnProximity" class="sub">
          Effect increases with proximity to epicenter
        </div>
      </div>
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
    ...mapState(['ship']),
    dataToUse() {
      return (
        this.ship?.seenLandmarks?.find(
          (p) => p.type === 'zone' && p.id === this.data.id,
        ) || this.data
      )
    },
  },
  mounted() {},
})
</script>

<style scoped lang="scss">
.sub {
  font-weight: normal;
}
</style>
