<template>
  <div
    class="chargebutton"
    :style="{
      background: `linear-gradient(to right, ${startColor}, ${endColor}`,
    }"
    @mousedown="start"
    @mouseup="end"
    @mouseleave="end"
  >
    <div
      class="hider"
      :style="{ width: (1 - percent) * 100 + '%' }"
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
    startColor: { default: '#533' },
    endColor: { default: '#fb0' },
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
      this.percent += 0.005
      this.$emit('percent', this.percent)
      if (this.percent > 1) this.percent = 1
    },
    end() {
      if (!this.percent) return
      clearInterval(this.holdInterval)
      this.$emit('end', this.percent)
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
    right: 0;
    height: 100%;
    background: var(--bg);
    z-index: 2;
  }
  .content {
    position: relative;
    z-index: 3;
    height: 100%;
  }
}
</style>
