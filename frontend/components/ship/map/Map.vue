<template>
  <div class="holder box">
    <svg
      :viewBox="
        `${view.left} ${view.top} ${view.width} ${view.height}`
      "
    >
      <ShipMapPlanet
        v-for="p in planets"
        :key="'planet' + p.name"
        v-bind="p"
        :zoom="zoom"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

const FLAT_SCALE = 100
const ZOOM_LEVEL_ONE = 2.5 // AU across viewport
const KM_PER_AU = 149597900
const getMaxes = (coordPairs: CoordinatePair[]) => {
  let upperBound = coordPairs.reduce(
    (max, p) => Math.max(p[1], max),
    -99999999,
  )
  let rightBound = coordPairs.reduce(
    (max, p) => Math.max(p[0], max),
    -99999999,
  )
  let lowerBound = coordPairs.reduce(
    (min, p) => Math.min(p[1], min),
    99999999,
  )
  let leftBound = coordPairs.reduce(
    (min, p) => Math.min(p[0], min),
    99999999,
  )

  const heightDiff = Math.abs(upperBound - lowerBound)
  const widthDiff = Math.abs(rightBound - leftBound)

  return {
    left: leftBound,
    top: upperBound,
    right: rightBound,
    bottom: lowerBound,
    height: heightDiff,
    width: widthDiff,
  }
}

export default {
  data(): ComponentShape {
    return {
      zoom: 1,
      planets: [],
      maxView: { left: 0, top: 0, width: 1, height: 1 },
      view: { left: 0, top: 0, width: 0, height: 0 },
    }
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {
    ship(this: ComponentShape) {
      this.redraw()
    },
  },
  mounted(this: ComponentShape) {
    this.redraw()
  },
  methods: {
    click(this: ComponentShape, e: MouseEvent) {
      const x = e.offsetX
      const y = e.offsetY
    },
    redraw(this: ComponentShape) {
      if (!this.ship?.visible) return
      this.planets = (this.ship.visible.planets || []).map(
        (el: PlanetStub) => ({
          type: 'planet',
          location: [...el.location],
          radius: (el.radius || 360000) / KM_PER_AU,
          color: el.validColor || el.color || 'pink',
          name: el.name,
        }),
      )

      // flip y values since svg counts up from the top down
      this.planets.forEach(
        (el: PlanetStub) => (el.location[1] *= -1),
      )

      this.recalcView([
        ...this.planets.map((p: PlanetStub) => p.location),
      ])
    },
    recalcView(
      this: ComponentShape,
      points: CoordinatePair[],
    ) {
      const maxes = getMaxes(points)

      const hardBuffer = 0.01
      const softBuffer =
        0.05 * Math.max(maxes.width, maxes.height)
      const buffer = hardBuffer + softBuffer

      this.maxView.left = this.ship.location[0]
      this.maxView.top = this.ship.location[1]

      this.maxView.width = maxes.width
      this.maxView.height = maxes.height

      this.maxView.width += buffer * 2
      this.maxView.height += buffer * 2

      // const containerAspectRatio =
      //   this.$el.offsetWidth / this.$el.offsetHeight
      // const viewAspectRatio =
      //   this.maxView.width / this.maxView.height
      // const aspectRatioDifferencePercent =
      //   viewAspectRatio / containerAspectRatio
      // if (aspectRatioDifferencePercent > 1) {
      //   this.maxView.top -=
      //     (this.maxView.height *
      //       (aspectRatioDifferencePercent - 1)) /
      //     2
      //   this.maxView.height =
      //     this.maxView.width / containerAspectRatio
      // }
      // if (aspectRatioDifferencePercent < 1) {
      //   this.maxView.left -=
      //     (this.maxView.width *
      //       (1 - aspectRatioDifferencePercent)) /
      //     2
      //   this.maxView.width =
      //     this.maxView.height * containerAspectRatio
      // }

      this.maxView.left -= this.maxView.width / 2
      this.maxView.top -= this.maxView.height / 2

      if (this.view.width === 0)
        this.view = {
          top: -2,
          left: -2,
          width: 4,
          height: 4,
        }
      this.zoom = ZOOM_LEVEL_ONE / this.view.width
    },
  },
}
</script>

<style lang="scss" scoped>
.holder {
  z-index: 2;
  user-select: none;
  display: inline-block;
  position: relative;
  padding: 0 !important;
  width: 500px;
  height: 500px;
  background: rgba(white, 0.05);
}
svg {
  padding: 0 !important;
  width: 100%;
  height: 100%;
}
</style>
