<template>
  <div class="bg">
    <div class="stars fullsize"></div>
    <transition name="fadeslow">
      <div v-if="['planet', 'comet'].includes(state)">
        <div
          v-if="state === 'comet'"
          class="comet fullsize coverothers"
        ></div>
        <div
          v-else
          class="planet fullsize coverothers"
        ></div>
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
      if (this.ship?.planet) {
        if (this.ship.planet.planetType === 'comet')
          return 'comet'
        return 'planet'
      }
      return ''
    },
  },
  watch: {
    state() {},
  },
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
.coverothers {
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
  background-image: url('/images/pageBackgrounds/bg2.webp');
  opacity: 0.2;
}
.planet {
  background-image: url('/images/pageBackgrounds/planet.webp');
  filter: brightness(0.4);
}
.comet {
  background-image: url('/images/pageBackgrounds/comet.webp');
  filter: brightness(0.15);
}
</style>
