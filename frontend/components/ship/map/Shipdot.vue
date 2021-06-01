<template>
  <ShipMapPoint
    :location="location"
    :minSize="minSize"
    :radius="radius"
    :color="color"
    :label="showLabel && name"
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
    z: { default: 4 },
    FLAT_SCALE: {},
    zoom: {},
    location: {},
    radius: { default: 0.000001 },
    minSize: { default: 0.009 },
    color: {},
    name: {},
    showLabel: {},
    species: {},
    faction: {},
    level: {},
    chassis: {},
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
      this.$store.commit('tooltip', {
        type: 'ship',
        data: {
          name: this.name,
          species: this.species,
          faction: this.faction,
          level: this.level,
          chassis: this.chassis,
        },
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
