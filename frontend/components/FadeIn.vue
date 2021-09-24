<template>
  <div class="fader" :class="{ off }">
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
  pointer-events: auto;
  height: 100vh;
  margin-bottom: -100vh;
  width: 100%;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  background: var(--bg);
  transition: opacity 1s;
  opacity: 1;

  &.off {
    opacity: 0;
    pointer-events: none;
  }

  & > * {
    position: absolute;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
  }
}
</style>
