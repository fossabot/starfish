<template>
  <div :style="{ transform: `rotate(${angle * -1}deg)` }">
    →
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { angle: {} },
  data() {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  async mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
div {
  line-height: 1;
  display: inline-block;
}
</style>
