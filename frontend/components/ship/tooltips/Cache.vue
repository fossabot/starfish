<template>
  <div>
    <div class="tooltipheader">📦Cache</div>
    <hr />
    <div v-if="!data.contents">Contents unknown.</div>
    <div v-else>
      <div
        v-for="(c, index) in data.contents"
        :key="'cachecontentstooltip' + index"
      >
        Contains {{ c.amount }} {{ c.type }}
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
}
</script>

<style scoped lang="scss"></style>
