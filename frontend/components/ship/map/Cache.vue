<template>
  <ShipMapPoint
    :location="location"
    :minSize="minSize"
    :radius="radius"
    :color="'yellow'"
    :circle="false"
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
      this.$store.commit('tooltip', {
        type: 'cache',
        data: {},
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
