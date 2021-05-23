<template>
  <ShipMapPoint
    :location="location"
    :minSize="minSize"
    :radius="radius"
    :color="color"
    :label="name"
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
    z: { default: 4 },
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.009 },
    color: {},
    name: {},
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
