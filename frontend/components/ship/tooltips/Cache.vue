<template>
  <div>
    <div class="tooltipheader">📦Cache</div>
    <hr />
    <div v-if="!dataToUse.contents">Contents unknown.</div>
    <div v-else>
      <div
        v-for="(ca, index) in dataToUse.contents"
        :key="'cachecontentstooltip' + index"
      >
        Contains {{ c.r2(ca.amount) }} {{ ca.id }}
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
        this.ship?.visible?.caches.find(
          (p) => p.id === this.data.id,
        ) || this.data
      )
    },
  },
})
</script>

<style scoped lang="scss"></style>
