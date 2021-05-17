<template>
  <g>
    <ShipMapPoint
      :location="location"
      :minSize="minSize"
      :radius="radius"
      :color="color"
      :label="name"
      :z="z"
      :zoom="zoom"
      :FLAT_SCALE="FLAT_SCALE"
      :view="view"
      :containerSizeMultiplier="containerSizeMultiplier"
      @enter="enter"
      @leave="leave"
    />
    <ShipMapPath
      :color="color"
      :opacity="0.4"
      :points="previousLocationsToUse"
      :zoom="zoom"
      :FLAT_SCALE="FLAT_SCALE"
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
    z: { default: 4 },
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.009 },
    color: {},
    name: {},
    previousLocations: {},
  },
  data(): ComponentShape {
    return { hovering: false }
  },
  computed: {
    ...mapState([]),
    previousLocationsToUse(this: ComponentShape) {
      return [
        ...this.previousLocations.map((el: any) => [
          el[0],
          el[1] * -1,
        ]),
        this.location,
      ]
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

<style lang="scss" scoped></style>
