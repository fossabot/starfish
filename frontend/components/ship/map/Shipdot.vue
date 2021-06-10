<template>
  <ShipMapPoint
    :location="location"
    :minSize="minSize"
    :radius="radius"
    :color="color"
    :label="showLabel && shipData.name"
    :zoom="zoom"
    :FLAT_SCALE="FLAT_SCALE"
    :view="view"
    :containerSizeMultiplier="containerSizeMultiplier"
    @enter="enter"
    @leave="leave"
  />
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
    minSize: { default: 0.009 },
    color: {},
    shipData: {},
  },
  data(): ComponentShape {
    return { hovering: false }
  },
  computed: {
    ...mapState([]),
    showLabel(this: ComponentShape) {
      return !this.shipData.planet && this.zoom > 1
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    enter(this: ComponentShape) {
      this.hovering = true
      this.$store.commit('tooltip', {
        type: 'ship',
        data: this.shipData,
      })
    },
    leave(this: ComponentShape) {
      this.hovering = false
      this.$store.commit('tooltip')
    },
  },
}
</script>

<style lang="scss" scoped></style>
