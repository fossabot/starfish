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
        :minSize="minSizeAdjustedForActualSize * 8"
        :radius="radius * 4"
        :color="`url('#${name}')`"
        :z="1"
        :zoom="zoom"
        :view="view"
        :FLAT_SCALE="FLAT_SCALE"
        :containerSizeMultiplier="containerSizeMultiplier"
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
      :view="view"
      :FLAT_SCALE="FLAT_SCALE"
      @enter="enter"
      @leave="leave"
      :containerSizeMultiplier="containerSizeMultiplier"
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
    view: {},
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.007 },
    color: {},
    name: {},
  },
  data(): ComponentShape {
    return {
      hovering: false,
      earthRadiusInAU: 6371 / 149597900,
    }
  },
  computed: {
    ...mapState([]),
    minSizeAdjustedForActualSize(this: ComponentShape) {
      return (
        (((this.radius - this.earthRadiusInAU) /
          this.earthRadiusInAU) *
          0.5 +
          1) *
        this.minSize *
        this.containerSizeMultiplier
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
