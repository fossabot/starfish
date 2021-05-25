<template>
  <ShipMapPath
    v-if="zoom > 0.5"
    :color="color"
    :opacity="0.4"
    :points="pointsToUse"
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
    points: {},
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
    pointsToUse(this: ComponentShape) {
      return [
        ...this.points.map((el: any) => [
          el[0],
          el[1] * -1,
        ]),
      ]
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
