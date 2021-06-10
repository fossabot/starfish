<template>
  <g class="planet">
    <defs>
      <radialGradient :id="planetData.name">
        <stop offset="30%" :stop-color="color" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
    </defs>

    <g
      :class="'atmosphere' + (hovering ? ' hovering' : '')"
    >
      <ShipMapPoint
        :location="location"
        :minSize="minSizeAdjustedForActualSize * 6"
        :radius="radius * 4"
        :color="`url('#${planetData.name}')`"
        :zoom="zoom"
        :view="view"
        :FLAT_SCALE="FLAT_SCALE"
        :containerSizeMultiplier="containerSizeMultiplier"
        :mask="false"
      />
    </g>

    <ShipMapPoint
      :location="location"
      :minSize="minSizeAdjustedForActualSize"
      :radius="radius"
      :color="color"
      :label="planetData.name"
      :zoom="zoom"
      :view="view"
      :FLAT_SCALE="FLAT_SCALE"
      @enter="enter"
      @leave="leave"
      :containerSizeMultiplier="containerSizeMultiplier"
      :mask="false"
    />

    <ShipMapPoint
      v-if="zoom > 5"
      :location="location"
      :minSize="0"
      :radius="c.ARRIVAL_THRESHOLD"
      :color="color"
      :strokeWidth="0.12"
      :dash="3"
      :zoom="zoom"
      :view="view"
      :FLAT_SCALE="FLAT_SCALE"
      :containerSizeMultiplier="containerSizeMultiplier"
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
    containerSizeMultiplier: {},
    view: {},
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.007 },
    color: {},
    planetData: {},
  },
  data(): ComponentShape {
    return {
      c,
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
      this.$store.commit('tooltip', {
        type: 'planet',
        data: this.planetData,
      })
    },
    leave(this: ComponentShape) {
      this.hovering = false
      this.$store.commit('tooltip')
    },
  },
}
</script>

<style lang="scss" scoped>
.planet {
  opacity: 0.9;
}
.atmosphere {
  pointer-events: none;
  opacity: 0.2;
}
.atmosphere.hovering {
  opacity: 0.3;
}
</style>
