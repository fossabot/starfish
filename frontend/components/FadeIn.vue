<template>
  <div class="fader flexcenter flexcolumn" :class="{ off }">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    off: {},
  },
  data() {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.fader {
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: var(--bg);
  transition: opacity 1s;
  opacity: 1;

  &.off {
    opacity: 0;
  }
}
</style>
