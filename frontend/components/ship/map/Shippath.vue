<template>
  <ShipMapPath
    v-if="zoom > 0.5"
    :color="color"
    :opacity="0.4"
    :points="previousLocationsToUse"
    :zoom="zoom"
    :FLAT_SCALE="FLAT_SCALE"
    :containerSizeMultiplier="containerSizeMultiplier"
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
    FLAT_SCALE: {},
    zoom: {},
    color: {},
    previousLocations: {},
    location: {},
  },
  data(): ComponentShape {
    return {}
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
  methods: {},
}
</script>

<style lang="scss" scoped></style>
