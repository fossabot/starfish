<template>
  <g
    class="point"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
  >
    <circle
      v-if="circle"
      :cx="location[0] * FLAT_SCALE"
      :cy="location[1] * FLAT_SCALE"
      :r="scaledRadius"
      :fill="strokeWidth ? 'none' : color || 'white'"
      :stroke="strokeWidth ? color || 'white' : 'none'"
      :stroke-width="scaledStrokeWidth"
      :stroke-dasharray="
        dash ? scaledDash + ' ' + scaledDash : ''
      "
      :mask="mask ? 'url(#sightMask)' : ''"
    />
    <rect
      v-else
      :x="location[0] * FLAT_SCALE - scaledRadius"
      :y="location[1] * FLAT_SCALE - scaledRadius"
      :width="scaledRadius * 2"
      :height="scaledRadius * 2"
      :fill="strokeWidth ? 'none' : color || 'white'"
      :stroke="strokeWidth ? color || 'white' : 'none'"
      :stroke-width="scaledStrokeWidth"
      :stroke-dasharray="
        dash ? scaledDash + ' ' + scaledDash : ''
      "
      :mask="mask ? 'url(#sightMask)' : ''"
    />
    <text
      v-if="label && zoom > 1"
      :x="location[0] * FLAT_SCALE"
      :y="
        location[1] * FLAT_SCALE +
          scaledRadius * -1 -
          view.height * 0.005
      "
      text-anchor="middle"
      :font-size="
        (0.05 * FLAT_SCALE * containerSizeMultiplier) / zoom
      "
      :fill="color || 'white'"
      :mask="mask ? 'url(#sightMask)' : ''"
    >
      {{ label }}
    </text>
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
    view: {},
    FLAT_SCALE: {},
    location: {},
    radius: { default: 0.00001 },
    minSize: { default: 3 },
    color: {},
    strokeWidth: {},
    dash: {},
    label: {},
    circle: { default: true },
    zoom: { default: 1 },
    mask: { default: true },
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
    scaledRadius(this: ComponentShape) {
      return (
        Math.max(
          (this.minSize / this.zoom) *
            this.containerSizeMultiplier,
          this.radius,
        ) * this.FLAT_SCALE
      )
    },
    scaledStrokeWidth(this: ComponentShape) {
      if (!this.strokeWidth) return
      return (
        ((this.strokeWidth / this.zoom) *
          this.containerSizeMultiplier) /
        100 /
        this.FLAT_SCALE
      )
    },
    scaledDash(this: ComponentShape) {
      if (!this.dash) return
      return (
        ((this.dash / this.zoom) *
          this.containerSizeMultiplier) /
        100 /
        this.FLAT_SCALE
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
g {
  position: relative;
}
text {
  text-transform: uppercase;
  font-weight: bold;
  opacity: 0.5;
}
</style>
