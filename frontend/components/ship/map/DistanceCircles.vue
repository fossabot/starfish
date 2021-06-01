<template>
  <g class="distancecircles">
    <ShipMapOutline
      v-for="(radius, index) in circlesToDraw"
      :key="'distancerad' + index"
      :location="location"
      :radius="radius"
      color="rgba(255,255,255,.15)"
      :label2="c.r2(radius / FLAT_SCALE, 6) + 'AU'"
      :label="radiusToTime(radius)"
      :zoom="zoom"
      :view="view"
      :FLAT_SCALE="FLAT_SCALE"
      :containerSizeMultiplier="containerSizeMultiplier"
    />
  </g>
</template>

<script lang="ts">
import c from '../../../../common/src'
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
    speed: {},
  },
  data(): ComponentShape {
    return { c }
  },
  computed: {
    circlesToDraw(this: ComponentShape) {
      let auBetweenLines = 1 / 10 ** 6
      const diameter = Math.max(
        this.view.width,
        this.view.height,
      )
      while (auBetweenLines / diameter < 0.02)
        auBetweenLines *= 10
      while (auBetweenLines / diameter < 0.1)
        auBetweenLines *= 2

      const circlesToDraw = []
      for (let i = 1; i < 10; i++)
        circlesToDraw.push(
          Math.round(auBetweenLines * i * 100000) / 100000,
        )
      return circlesToDraw
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    radiusToTime(this: ComponentShape, r: number) {
      if (this.speed === 0) return
      const secondsToGetThere = Math.round(
        r / this.FLAT_SCALE / this.speed,
      )
      let remainingTime = secondsToGetThere

      let hours: any = Math.floor(remainingTime / (60 * 60))
      remainingTime -= hours * 60 * 60

      let minutes: any = Math.floor(remainingTime / 60)
      remainingTime -= minutes * 60
      if (minutes < 10 && hours > 0) minutes = `0${minutes}`

      let seconds: any = remainingTime
      if (seconds < 10) seconds = `0${seconds}`

      if (!hours) return `${minutes}m`
      return `${hours}h ${minutes}m` //${seconds}s
    },
  },
}
</script>

<style lang="scss" scoped></style>
