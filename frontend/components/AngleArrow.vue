<template>
  <div :style="{ transform: `rotate(${angle * -1}deg)` }">
    →
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: { angle: {} },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  async mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
div {
  line-height: 1;
  display: inline-block;
}
</style>
