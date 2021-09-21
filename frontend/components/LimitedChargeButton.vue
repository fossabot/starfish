<template>
  <div
    class="chargebutton"
    :class="{ big, disabled }"
    :style="{
      background: `linear-gradient(to right, ${startColor}, ${endColor}`,
    }"
    @mousedown="!disabled && start()"
    @mouseup="end"
    @mouseleave="cancel"
    @mouseenter="cancel"
    @mousemove="updateMousePosition"
  >
    <div
      class="hider"
      :style="{
        width: (1 - percent) * 100 + '%',
        transition: this.percent
          ? 'none'
          : `width ${animate}s`,
      }"
    ></div>
    <div
      class="base"
      :style="{
        width: max * 100 + '%',
        background: maxFillColor,
        transition: this.percent
          ? 'none'
          : `width ${animate}s`,
      }"
    ></div>

    <div class="content flex flexcenter">
      <slot />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  name: 'notification',
  props: {
    disabled: {},
    big: {},
    max: { default: 1 },
    maxFillColor: { default: 'rgba(255,230,150,.3)' },
    startColor: { default: '#aa0' },
    endColor: { default: '#f50' },
    chargeTime: { default: 4000 },
    animate: { default: 0 },
  },
  data() {
    return {
      holdInterval: false,
      percent: 0,
      startTime: null,
      mousePercent: 0,
    }
  },
  computed: {
    color() {},
  },
  mounted() {},
  methods: {
    cancel() {
      this.percent = 0
      clearInterval(this.holdInterval)
    },
    start() {
      this.percent = 0
      this.holdInterval = setInterval(this.tick, 20)
      this.startTime = Date.now()
    },
    tick() {
      this.percent = Math.min(
        this.max,
        this.mousePercent,
        (Date.now() - this.startTime) / this.chargeTime,
      )
      if (this.percent > this.max) this.percent = this.max
      this.$emit('percent', this.percent / this.max)
    },
    end() {
      clearInterval(this.holdInterval)
      if (!this.percent) return
      this.$emit('end', this.percent / this.max)
      this.percent = 0
    },
    updateMousePosition(e) {
      this.mousePercent = e.offsetX / this.$el.offsetWidth
    },
  },
})
</script>

<style lang="scss" scoped>
.chargebutton {
  position: relative;
  height: 2em;
  border: 1px solid var(--text);
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;

  &.big {
    height: 3em;
    border-radius: 8px;
  }

  &.disabled {
    cursor: not-allowed;
  }

  .hider {
    pointer-events: none;
    position: absolute;
    overflow: hidden;
    right: 0;
    height: 100%;
    background: var(--bg);
    z-index: 1;
  }

  .base {
    pointer-events: none;
    position: absolute;
    height: 100%;
    left: 0;
    z-index: 2;
    mix-blend-mode: screen;
    opacity: 0.5;
    transition: opacity 0.2s;
    // border-radius: 5px;
  }
  .content {
    pointer-events: none;
    position: relative;
    z-index: 3;
    height: 100%;
  }

  &:not(.disabled):hover {
    .base {
      opacity: 1;
    }
  }
}
</style>
