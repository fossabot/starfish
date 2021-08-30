<template>
  <div>
    <div class="tooltipheader">
      <span :style="{ color: data.color }">{{
        data.name
      }}</span>
      <span class="sub">(Zone)</span>
    </div>
    <hr />
    <div>
      <!-- <div class="panesubhead">Zone Effects</div> -->
      <div
        v-for="(e, index) in data.effects"
        :key="'effecttt' + index"
      >
        <div>{{ c.capitalize(e.type) }}</div>
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
.sub {
  font-weight: normal;
}
</style>
