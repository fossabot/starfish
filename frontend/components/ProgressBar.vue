<template>
  <div class="progressbar" :class="{ mini, micro, nofade: noFade }">
    <div class="bg"></div>
    <div
      class="fill"
      :class="{ mini }"
      :style="{
        width: Math.min(percent, 1) * 100 + '%',
      }"
    >
      <div
        class="fillborder"
        v-if="!noFade && percent < 1 && percent > 0"
        :style="{
          'border-right':
            `1px solid ` +
            (percent <= dangerZone
              ? 'var(--warning)'
              : micro
              ? ''
              : mini
              ? color || 'rgba(255,255,255,.3)'
              : color),
          opacity: micro ? 1 : 0.5,
        }"
      ></div>
      <div
        class="fillbg"
        :style="{
          background:
            percent <= dangerZone
              ? 'var(--warning)'
              : micro
              ? ''
              : mini
              ? color || 'rgba(255,255,255,.3)'
              : color,
          opacity: micro || noFade ? 1 : 0.4,
        }"
      ></div>
    </div>
    <div class="ticks" v-if="max">
      <div
        class="tens"
        :style="{
          'background-size': `${(1 / max) * 10}%`,
        }"
      ></div>
    </div>
    <div
      class="label padpane"
      :style="{
        color: percent <= dangerZone ? 'var(--warning)' : 'inherit',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    micro: {},
    mini: {},
    percent: { default: 1 },
    max: {},
    color: { default: 'rgba(255,255,255,.4)' },
    dangerZone: { default: 0.2 },
    noFade: { default: false },
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
.progressbar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 5px;
  overflow: hidden;

  // border-top: 1px solid var(--gray);
  // border-left: 1px solid var(--gray);
  // border-bottom: 0;
  // box-shadow: 0 0 0 1px var(--gray);

  &.mini {
    border: 2px solid transparent;
    border-right: 0;
    border-left: 0;
    box-shadow: none;

    .label {
      padding-top: 0.05em;
      padding-bottom: 0.035em;
      padding-left: 0.4em;
      padding-right: 0.4em;
    }

    .bg {
      // background: rgba(157, 98, 98, 0.1);
      border-radius: 0.3em;
    }
  }

  &.micro {
    border-radius: 2px;
    height: 4px;
    border: 0;
    border-top: 3px solid transparent;
    box-shadow: none;

    .label {
      display: none;
    }

    .bg {
      background: rgba(157, 98, 98, 0.07);
      border-radius: 0.1em;
    }

    .fill {
      background: rgb(149, 255, 221);
    }
  }

  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(164, 164, 164, 0.1);
    // border-radius: 5px;
  }

  .fill {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: width 0.5s ease-in-out;

    .fillbg,
    .fillborder {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }

  .label {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 0.5em;
    padding-right: 0.5em;
    padding-top: 0.11em;
    padding-bottom: 0.09em;
  }
}

.ticks {
  mix-blend-mode: hard-light;
  pointer-events: none;
  --tickColor: rgb(70, 70, 70);
  --tickWidth: 0.08em;

  &,
  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .tens {
    height: 7px;
    background: repeating-linear-gradient(
      90deg,
      transparent 0%,
      transparent calc(100% - var(--tickWidth)),
      var(--tickColor) calc(100% - var(--tickWidth)),
      var(--tickColor) 100%
    );
  }
}
</style>
