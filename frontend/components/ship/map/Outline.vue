<template>
  <g class="outline">
    <circle
      :cx="location[0] * FLAT_SCALE"
      :cy="location[1] * FLAT_SCALE"
      :r="radius"
      :stroke="color"
      :stroke-width="(0.0025 * FLAT_SCALE) / zoom"
      :stroke-dasharray="dash ? dash + ' ' + dash : ''"
      :fill="blackout ? 'black' : 'none'"
    />
    <text
      :x="location[0] * FLAT_SCALE"
      :y="
        location[1] * FLAT_SCALE +
          radius * -1 -
          view.height * 0.005
      "
      text-anchor="middle"
      :font-size="
        (0.05 * FLAT_SCALE * containerSizeMultiplier) / zoom
      "
      :fill="color"
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
    zoom: {},
    location: {},
    radius: {},
    color: { default: 'rgba(255,255,255,.6)' },
    label: {},
    z: { default: 1 },
    blackout: {},
    dash: {},
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
circle {
  opacity: 0.6;
}
text {
  text-transform: uppercase;
  font-weight: bold;
}
</style>
