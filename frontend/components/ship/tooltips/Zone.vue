<template>
  <div>
    <div class="tooltipheader">
      <span :style="{ color: data.color }">{{
        data.name
      }}</span>
      <span class="sub">Zone</span>
    </div>
    <hr />
    <div>
      <!-- <div class="panesubhead">Zone Effects</div> -->
      <div
        v-for="(e, index) in data.effects"
        :key="'effecttt' + index"
      >
        <div>{{ c.capitalize(e.type) }}</div>
        <div>Intensity: {{ c.r2(e.intensity * 100) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  mounted() {
    c.log(this.data)
  },
}
</script>

<style scoped lang="scss"></style>
