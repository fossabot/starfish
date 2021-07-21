<template>
  <div
    class="chargebutton"
    :class="{ big }"
    :style="{
      background: `linear-gradient(to right, ${startColor}, ${endColor}`,
    }"
    @mousedown="!disabled && start()"
    @mouseup="end()"
    @mouseleave="cancel()"
    @mouseenter="cancel()"
  >
    <div
      class="hider"
      :style="{ width: (1 - percent) * 100 + '%' }"
    ></div>
    <div
      class="base"
      :style="{
        width: max * 100 + '%',
        background: maxFillColor,
      }"
    ></div>

    <div class="content flex flexcenter">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'notification',
  props: {
    disabled: {},
    big: {},
    max: { default: 1 },
    maxFillColor: { default: 'rgba(255,255,255,.1)' },
    startColor: { default: '#aa0' },
    endColor: { default: '#f50' },
    chargeTime: { default: 5000 },
  },
  data() {
    return {
      holdInterval: false,
      percent: 0,
      startTime: null,
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
        (Date.now() - this.startTime) / this.chargeTime,
      )
      this.$emit('percent', this.percent / this.max)
      if (this.percent > this.max) this.percent = this.max
    },
    end() {
      clearInterval(this.holdInterval)
      if (!this.percent) return
      this.$emit('end', this.percent / this.max)
      this.percent = 0
    },
  },
}
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

  .hider {
    position: absolute;
    overflow: hidden;
    right: 0;
    height: 100%;
    background: var(--bg);
    z-index: 1;
  }

  .base {
    position: absolute;
    height: 100%;
    left: 0;
    z-index: 2;
    mix-blend-mode: screen;
    // border-radius: 5px;
  }
  .content {
    position: relative;
    z-index: 3;
    height: 100%;
  }
}
</style>
