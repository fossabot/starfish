<template>
  <g
    class="attackremnant"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
  >
    <defs>
      <linearGradient
        :id="id"
        :x1="uvFromAToD[0] > 0 ? 0 : 1"
        :x2="uvFromAToD[0] > 0 ? 1 : 0"
        :y1="uvFromAToD[1] > 0 ? 0 : 1"
        :y2="uvFromAToD[1] > 0 ? 1 : 0"
        gradientUnits="objectBoundingBox"
      >
        <stop
          offset="0%"
          :stop-color="
            !miss ? 'yellow' : 'rgba(150, 150, 50, .5)'
          "
        />
        <stop
          offset="10%"
          :stop-color="
            !miss ? 'orange' : 'rgba(180, 100, 50, .5)'
          "
        />
        <stop
          offset="40%"
          :stop-color="
            !miss ? 'red' : 'rgba(100, 50, 50, .5)'
          "
        />
        <stop
          offset="70%"
          :stop-color="
            !miss
              ? 'rgba(255, 0, 0, .8)'
              : 'rgba(50, 50, 50, .5)'
          "
        />
        <stop
          offset="100%"
          :stop-color="
            !miss
              ? 'rgba(255, 0, 0, .8)'
              : 'rgba(50, 50, 50, .1)'
          "
        />
      </linearGradient>
    </defs>

    <line
      :x1="from[0] * FLAT_SCALE"
      :y1="from[1] * FLAT_SCALE"
      :x2="to[0] * FLAT_SCALE"
      :y2="to[1] * FLAT_SCALE"
      :stroke="`url(#${id})`"
      :stroke-width="(0.002 * FLAT_SCALE) / zoom"
      :style="{
        opacity,
      }"
      mask="url(#sightMask)"
    />
  </g>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    miss: {},
    from: {},
    to: {},
    time: {},
    containerSizeMultiplier: {},
    FLAT_SCALE: {},
    zoom: {},
  },
  data(this: ComponentShape): ComponentShape {
    return {
      id: 'g' + Math.random(),
      opacity: 1,
    }
  },
  computed: {
    ...mapState([]),
    uvFromAToD(this: ComponentShape) {
      if (!this.from || !this.to) return [1, 1]
      return c.degreesToUnitVector(
        c.angleFromAToB(this.from, this.to),
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {
    this.resetOpacity()
    setInterval(() => this.resetOpacity(), 1 * 60 * 1000)
  },
  methods: {
    resetOpacity(this: ComponentShape) {
      this.opacity =
        0.5 *
        (1 - (Date.now() - this.time) / (60 * 60 * 1000))
    },
  },
}
</script>

<style lang="scss" scoped></style>
