<template>
  <div class="bg">
    <div class="stars fullsize"></div>
    <transition name="fadeslow">
      <div v-if="state === 'planet'">
        <div class="planet fullsize"></div>
        <div
          class="tint fullsize"
          :style="{ 'background-color': ship.planet.color }"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState(['ship']),
    state(): string {
      if (this.ship?.planet) return 'planet'
      return ''
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.bg {
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  background: #000;
}
.fullsize {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
.tint {
  z-index: 2;
  mix-blend-mode: hue;
  opacity: 0.6;
}
.stars {
  background-image: url('/images/pageBackgrounds/bg2.jpg');
  opacity: 0.2;
}
.planet {
  background-image: url('/images/pageBackgrounds/planet.jpg');
  filter: brightness(0.4);
}
</style>
