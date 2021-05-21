<template>
  <ShipMapPoint
    :location="location"
    :minSize="minSize"
    :radius="radius"
    :color="'yellow'"
    :circle="false"
    :z="z"
    :zoom="zoom"
    :FLAT_SCALE="FLAT_SCALE"
    :view="view"
    :containerSizeMultiplier="containerSizeMultiplier"
    @enter="enter"
    @leave="leave"
  />
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
    z: { default: 2 },
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.007 },
  },
  data(): ComponentShape {
    return { hovering: false }
  },
  computed: {
    ...mapState([]),
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
