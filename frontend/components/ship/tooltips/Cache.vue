<template>
  <div>
    <div class="tooltipheader">📦Cache</div>
    <hr />
    <div v-if="!data.contents">Contents unknown.</div>
    <div v-else>
      <div
        v-for="(ca, index) in data.contents"
        :key="'cachecontentstooltip' + index"
      >
        Contains {{ c.r2(ca.amount) }} {{ ca.type }}
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
})
</script>

<style scoped lang="scss"></style>
