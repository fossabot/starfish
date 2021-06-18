<template>
  <div
    class="chargebutton"
    :style="{
      background: `linear-gradient(to right, ${startColor}, ${endColor}`,
    }"
    @mousedown="!disabled && start()"
    @mouseup="end()"
    @mouseleave="end()"
    @mouseenter="end()"
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
    max: { default: 1 },
    maxFillColor: { default: 'rgba(255,255,255,.1)' },
    startColor: { default: '#aa0' },
    endColor: { default: '#f50' },
  },
  data() {
    return {
      holdInterval: false,
      percent: 0,
    }
  },
  computed: {
    color() {},
  },
  mounted() {},
  methods: {
    start() {
      this.percent = 0
      this.holdInterval = setInterval(this.tick, 20)
    },
    tick() {
      this.percent += 0.002
      this.$emit('percent', this.percent / this.max)
      if (this.percent > this.max) this.percent = this.max
    },
    end() {
      if (!this.percent) return
      clearInterval(this.holdInterval)
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
  }
  .content {
    position: relative;
    z-index: 3;
    height: 100%;
  }
}
</style>
