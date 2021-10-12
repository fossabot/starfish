<template>
  <div>
    <div
      v-if="!isMobile"
      class="chargebutton pointer"
      :class="{ big, disabled }"
      :style="{
        background: `linear-gradient(to right, ${startColor}, ${endColor}`,
      }"
      @mousedown="start"
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

    <div v-else class="marbotsmall">
      <div class="flexcolumn">
        <div class="bgholder marbotsmall flex">
          <div class="label">
            <slot />
          </div>
          <div
            class="bg"
            :style="{
              width: percent * 100 + '%',
              background: `linear-gradient(to right, ${startColor}, ${endColor}`,
              transition: this.percent
                ? 'none'
                : `width ${animate}s`,
            }"
          ></div>
          <div
            class="charged"
            :style="{
              width: max * 100 + '%',
              background: maxFillColor,
              transition: this.percent
                ? 'none'
                : `width ${animate}s`,
            }"
          ></div>
        </div>
        <div class="flex inputholder">
          <input
            type="range"
            :min="0"
            :max="1"
            :step="0.01"
            v-model="mobileSliderPercent"
          />
          <button @click="end"><span>Use</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  name: 'notification',
  props: {
    disabled: {},
    big: {},
    max: { default: 1 },
    maxFillColor: { default: 'rgba(255,230,150,.3)' },
    startColor: { default: '#aa0' },
    endColor: { default: '#f50' },
    chargeTime: { default: 2000 },
    animate: { default: 0 },
  },
  data() {
    let holdInterval: any | undefined
    let startTime: number | undefined
    return {
      c,
      mobileSliderPercent: 0,
      holdInterval,
      percent: 0,
      startTime,
      mousePercent: 0,
    }
  },
  computed: { ...mapState(['isMobile']) },
  watch: {
    max(max) {
      if (max < this.mobileSliderPercent)
        this.mobileSliderPercent = max
    },
    mobileSliderPercent(val) {
      this.percent = Math.min(this.max, val)
      this.$emit('percent', this.percent / this.max)
    },
  },
  mounted() {},
  methods: {
    cancel() {
      this.percent = 0
      clearInterval(this.holdInterval)
    },
    start(e: MouseEvent) {
      if (this.disabled) return
      this.percent = 0
      this.holdInterval = setInterval(this.tick, 20)
      this.startTime = Date.now()
      this.updateMousePosition(e)
    },
    tick() {
      this.percent = Math.min(
        this.max,
        this.mousePercent,
        (Date.now() - this.startTime!) / this.chargeTime,
      )
      if (this.percent >= this.mousePercent)
        this.startTime = 0
      if (this.percent > this.max) this.percent = this.max
      this.$emit('percent', this.percent / this.max)
    },
    end() {
      if (this.disabled) return
      clearInterval(this.holdInterval)
      this.mobileSliderPercent = 0
      if (!this.percent) return
      this.$emit('end', this.percent / this.max)
      this.percent = 0
    },
    updateMousePosition(e: MouseEvent) {
      const x = e.offsetX
      this.mousePercent =
        x / (this.$el as HTMLElement).offsetWidth
      if (this.mousePercent > 0.95) this.mousePercent = 1
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

  &.big {
    height: 3em;
    border-radius: 8px;
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

.bgholder {
  height: 2.5em;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  overflow: hidden;
  align-items: center;

  .label {
    position: relative;
    margin-left: 0.5em;
    margin-top: 0.1em;
    z-index: 4;
  }

  .bg {
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 0;
    height: 90%;
    z-index: 3;
  }
  .charged {
    mix-blend-mode: screen;
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 0;
    height: 90%;
    z-index: 2;
  }
}

.inputholder {
  width: 100%;
  position: relative;

  input {
    position: relative;
    z-index: 4;
    margin-bottom: 0;
  }
}
button {
  margin-left: 1em;
}
</style>
