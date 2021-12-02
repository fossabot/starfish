<template>
  <div class="healthbar">
    <slot>
      <div class="bg"></div>
      <div
        class="fill"
        :style="{
          width: Math.min(percent, 1) * 100 + '%',
          background: color,
        }"
      ></div>
    </slot>

    <div
      class="overlay"
      :style="{
        width: Math.min(percent, 1) * 100 + '%',
      }"
    ></div>
    <div
      class="overlay2"
      :style="{
        width: Math.min(percent, 1) * 100 + '%',
      }"
    ></div>

    <div class="ticks">
      <!-- <div
        class="hundreds"
        v-if="max < 10"
        :style="{
          'background-size': `${(1 / max) * 100}%`,
        }"
      ></div>
      <div
        class="twofifties"
        v-else-if="max > 10 && max < 20"
        :style="{
          'background-size': `${(1 / max) * 100}%`,
        }"
      ></div> -->
      <div
        class="thousands"
        :style="{
          'background-size': `${(1 / max) * 100}%`,
        }"
      ></div>
      <!-- <div
        class="fivethousands"
        :style="{
          'background-size': `${(5 / max) * 100}%`,
        }"
      ></div>
      <div
        class="tenthousands"
        v-if="max > 10"
        :style="{
          'background-size': `${(10 / max) * 100}%`,
        }"
      ></div> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    color: { default: 'rgba(255,255,255,1)' },
    max: { default: 1 },
    percent: { default: 0 },
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
.healthbar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 2px;
  overflow: hidden;
  min-height: 0.3em;

  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgb(60, 60, 60);
  }
  .overlay {
    pointer-events: none;
    position: absolute;
    z-index: 4;
    height: 100%;
    max-width: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4),
      rgba(0, 0, 0, 0.2) 10%,
      transparent 60%
    );
    mix-blend-mode: overlay;
  }
  .overlay2 {
    pointer-events: none;
    position: absolute;
    z-index: 4;
    height: 100%;
    max-width: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.05) 30%,
      transparent 60%
    );
    mix-blend-mode: multiply;
  }

  .fill {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: width 0.5s ease-in-out;
  }
}

.ticks {
  // display: none;
  // opacity: 0.5;
  mix-blend-mode: hard-light;
  pointer-events: none;
  z-index: 3;
  --tickColor: rgb(101, 101, 101);
  --tickWidth: 0.08em;

  &,
  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .tenthousands {
    --tickColor: rgb(52, 52, 52);
    height: 11px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(100% - var(--tickWidth)),
      var(--tickColor) calc(100% - var(--tickWidth)),
      var(--tickColor) 100%
    );
  }
  .fivethousands {
    --tickColor: rgb(52, 52, 52);
    height: 9px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(100% - var(--tickWidth)),
      var(--tickColor) calc(100% - var(--tickWidth)),
      var(--tickColor) 100%
    );
  }
  .thousands {
    height: 6px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(100% - var(--tickWidth)),
      var(--tickColor) calc(100% - var(--tickWidth)),
      var(--tickColor) 100%
    );
  }
  .hundreds {
    height: 4px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(10% - var(--tickWidth)),
      var(--tickColor) calc(10% - var(--tickWidth)),
      var(--tickColor) 10%
    );
  }
  .twofifties {
    height: 4px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(25% - var(--tickWidth)),
      var(--tickColor) calc(25% - var(--tickWidth)),
      var(--tickColor) 25%
    );
  }
}
</style>
