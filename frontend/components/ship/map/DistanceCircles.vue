<template>
  <g class="distancecircles">
    <ShipMapOutline
      v-for="(radius, index) in circlesToDraw"
      :key="'distancerad' + index"
      :location="location"
      :radius="radius"
      color="rgba(255,255,255,.2)"
      :label="radius / FLAT_SCALE + ' AU'"
      :zoom="zoom"
      :view="view"
      :FLAT_SCALE="FLAT_SCALE"
      :containerSizeMultiplier="containerSizeMultiplier"
    />
  </g>
</template>

<script lang="ts">
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    containerSizeMultiplier: {},
    FLAT_SCALE: {},
    zoom: {},
    view: {},
    location: {},
    width: {},
    height: {},
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    circlesToDraw(this: ComponentShape) {
      let auBetweenLines = 1 / 2 ** 8
      const diameter = Math.max(
        this.view.width,
        this.view.height,
      )
      while (auBetweenLines / diameter < 0.15)
        auBetweenLines *= 2

      const circlesToDraw = []
      for (let i = 1; i < 10; i++)
        circlesToDraw.push(auBetweenLines * i)
      return circlesToDraw
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
