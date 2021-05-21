<template>
  <g
    class="path"
    :style="{ 'z-index': z }"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
  >
    <path
      :d="d"
      :stroke="color"
      :stroke-width="(strokeWidth * FLAT_SCALE) / zoom"
      :stroke-dasharray="dash ? dash + ' ' + dash : ''"
      :style="{ opacity }"
      mask="url(#sightMask)"
    />
  </g>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    containerSizeMultiplier: {},
    FLAT_SCALE: {},
    zoom: {},
    points: { default: () => [] },
    color: { default: 'rgba(255,255,255,.2)' },
    strokeWidth: { default: 0.003 },
    z: { default: 1 },
    dash: {},
    opacity: { default: 1 },
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
    scaledPoints(this: ComponentShape) {
      return this.points.map((p: any) => [
        p[0] * this.FLAT_SCALE,
        p[1] * this.FLAT_SCALE,
      ])
    },
    d(this: ComponentShape) {
      if (!this.scaledPoints.length) return ''
      let d = `M ${this.scaledPoints[0].join(' ')}`
      for (let p of this.scaledPoints.slice(1))
        d += ` L ${p.join(' ')}`
      return d
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
path {
  fill: none;
}
</style>
