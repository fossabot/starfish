<template>
  <div
    class="fader flex-center flex-column"
    :class="{ off }"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    off: {},
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
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
