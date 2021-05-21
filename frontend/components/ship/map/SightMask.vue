<template>
  <g class="outline">
    <mask id="sightMask">
      <!-- Everything under a black pixel will be invisible -->
      <rect
        x="-1000"
        y="-1000"
        width="1000"
        height="1000"
        fill="blank"
      />
      <!-- Everything under a white pixel will be visible -->
      <circle
        :cx="location[0] * FLAT_SCALE"
        :cy="location[1] * FLAT_SCALE"
        :r="radius"
        fill="white"
      />
    </mask>

    <circle
      :cx="location[0] * FLAT_SCALE"
      :cy="location[1] * FLAT_SCALE"
      :r="radius"
      stroke="rgba(255, 255, 255, 0.5)"
      :stroke-width="(0.0025 * FLAT_SCALE) / zoom"
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
      fill="rgba(255, 255, 255, 0.5)"
    >
      {{ zoom > 1 ? 'sight radius' : '' }}
    </text>
    <text
      :x="location[0] * FLAT_SCALE"
      :y="
        location[1] * FLAT_SCALE +
          radius +
          view.height * 0.023
      "
      text-anchor="middle"
      :font-size="
        (0.05 * FLAT_SCALE * containerSizeMultiplier) / zoom
      "
      fill="rgba(255, 255, 255, 0.5)"
    >
      {{
        zoom > 1
          ? Math.round(radius * 100) / 100 / FLAT_SCALE +
            'au'
          : ''
      }}
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
text {
  text-transform: uppercase;
  font-weight: bold;
}
</style>
