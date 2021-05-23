<template>
  <g
    class="targetline"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
  >
    <circle
      :cx="to[0] * FLAT_SCALE"
      :cy="to[1] * FLAT_SCALE"
      :r="scaledRadius"
      :fill="highlight ? highlightColor : color"
    />
    <line
      :x1="from[0] * FLAT_SCALE"
      :y1="from[1] * FLAT_SCALE"
      :x2="to[0] * FLAT_SCALE"
      :y2="to[1] * FLAT_SCALE"
      :stroke="highlight ? highlightColor : color"
      :stroke-width="
        ((strokeWidth * FLAT_SCALE) / zoom) *
          containerSizeMultiplier
      "
      :stroke-dasharray="
        dash
          ? (dash / zoom) * containerSizeMultiplier +
            ' ' +
            (dash / zoom) * containerSizeMultiplier
          : ''
      "
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
    minSize: { default: 0.005 },
    color: { default: 'rgba(255,255,255,.4)' },
    highlightColor: { default: 'rgba(255,255,255,.8)' },
    strokeWidth: { default: 0.002 },
    highlight: {},
    from: { default: [0, 0] },
    to: { default: [0, 0] },
    zoom: { default: 1 },
    dash: { default: 2.3 },
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
    scaledRadius(this: ComponentShape) {
      return (
        (this.minSize / this.zoom) *
        this.FLAT_SCALE *
        this.containerSizeMultiplier
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
