<template>
  <g>
    <defs>
      <radialGradient :id="name">
        <stop offset="30%" :stop-color="color" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
    </defs>

    <g
      :class="'atmosphere' + (hovering ? ' hovering' : '')"
    >
      <ShipMapPoint
        :location="location"
        :minSize="minSizeAdjustedForActualSize * 4"
        :radius="radius * 4"
        :color="`url('#${name}')`"
        :z="1"
      />
    </g>

    <ShipMapPoint
      :location="location"
      :minSize="minSizeAdjustedForActualSize"
      :radius="radius"
      :color="color"
      :label="name"
      :z="2"
      :zoom="zoom"
      @enter="enter"
      @leave="leave"
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
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.001 },
    color: {},
    name: {},
  },
  data(): ComponentShape {
    return { hovering: false }
  },
  computed: {
    ...mapState(['ship']),
    minSizeAdjustedForActualSize(this: ComponentShape) {
      const earthRadiusInAU = 6371 / 149597900
      return (
        (((this.radius - earthRadiusInAU) /
          earthRadiusInAU) *
          0.5 +
          1) *
        this.minSize
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    enter(this: ComponentShape) {
      this.hovering = true
    },
    leave(this: ComponentShape) {
      this.hovering = false
    },
  },
}
</script>

<style lang="scss" scoped>
.atmosphere {
  pointer-events: none;
  opacity: 0.2;
}
.atmosphere.hovering {
  opacity: 0.3;
}
</style>
