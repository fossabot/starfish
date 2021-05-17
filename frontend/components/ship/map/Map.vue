<template>
  <div
    class="holder box"
    @mousewheel="mouseWheel"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @mouseleave="mouseLeave"
    @mousemove="mouseMove"
    v-if="data"
  >
    <svg
      ref="svg"
      :viewBox="
        `${view.left} ${view.top} ${view.width} ${view.height}`
      "
    >
      <ShipMapOutline
        :location="[data.center[0], data.center[1] * -1]"
        :radius="data.defaultRadius * FLAT_SCALE"
        label="sight radius"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
        :blackout="true"
      />

      <ShipMapPlanet
        v-for="p in planets"
        :key="'planet' + p.name"
        v-bind="p"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapTargetline
        v-for="l in targetLines"
        :key="'tl' + l.id"
        v-bind="l"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <line
        v-for="(ar, index) in attackRemnants"
        :key="'ar' + index"
        :x1="ar.from[0] * FLAT_SCALE"
        :y1="ar.from[1] * FLAT_SCALE"
        :x2="ar.to[0] * FLAT_SCALE"
        :y2="ar.to[1] * FLAT_SCALE"
        :stroke="ar.miss ? 'rgba(255,50,50,.5)' : 'red'"
        :stroke-width="(0.002 * FLAT_SCALE) / zoom"
      />

      <ShipMapShipdot
        v-for="s in ships"
        :key="'ship' + s.id"
        v-bind="s"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapDistanceMarkers
        v-bind="view"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :containerSizeMultiplier="containerSizeMultiplier"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

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
  props: { data: {}, resetCenterTime: { default: 8000 } },
  data(): ComponentShape {
    return {
      FLAT_SCALE: 100,
      zoom: 1,
      ships: [],
      planets: [],
      targetLines: [],
      attackRemnants: [],
      maxView: { left: 0, top: 0, width: 1, height: 1 },
      view: { left: 0, top: 0, width: 0, height: 0 },
      isPanning: false,
      mouseIsDown: false,
      awaitingDragFrame: false,
      dragStartPoint: [],
      dragEndPoint: [],
      dragStartView: {},
      followingCenter: true,
      followCenterTimeout: null,
      containerSizeMultiplier: 1,
    }
  },
  computed: {},
  watch: {
    data(this: ComponentShape) {
      this.redraw()
    },
  },
  mounted(this: ComponentShape) {
    this.redraw()
  },
  methods: {
    redraw(this: ComponentShape) {
      if (
        !this.data ||
        (!this.data.ships && !this.data.planets)
      )
        return

      this.containerSizeMultiplier =
        600 / this.$el.offsetWidth

      this.ships =
        this.data.ships?.map((el: ShipStub) => ({
          type: 'ship',
          location: [...el.location],
          color:
            el === this.ship
              ? 'white'
              : el.faction
              ? el.faction.color
              : 'rgba(255,255,255,.6)',
          name: el.planet ? false : el.name,
          id: el.id,
          previousLocations: el.previousLocations || [],
        })) || []
      this.planets =
        this.data.planets?.map((el: PlanetStub) => ({
          type: 'planet',
          location: [...el.location],
          radius: (el.radius || 36000) / KM_PER_AU,
          color: el.validColor || el.color || 'pink',
          name: el.name,
        })) || []
      this.targetLines =
        this.data.targetLines?.map((el: any) => ({
          type: 'targetLine',
          from: [...el.from],
          to: [...el.to],
          highlight: el.highlight,
          id: el.id,
        })) || []
      this.attackRemnants =
        this.data.attackRemnants?.map((el: any) => ({
          type: 'attackRemnant',
          from: [...el.start],
          to: [...el.end],
          miss: el.damageTaken.damageTaken === 0,
        })) || []

      // flip y values since svg counts up from the top down
      this.ships.forEach((el: ShipStub) => {
        el.location[1] *= -1
      })
      this.planets.forEach(
        (el: PlanetStub) => (el.location[1] *= -1),
      )
      this.targetLines.forEach((el: PlanetStub) => {
        el.from[1] *= -1
        el.to[1] *= -1
      })
      this.attackRemnants.forEach((el: PlanetStub) => {
        el.from[1] *= -1
        el.to[1] *= -1
      })

      this.recalcView([
        ...this.ships.map((s: ShipStub) => s.location),
        ...this.planets.map((p: PlanetStub) => p.location),
      ])
    },
    recalcView(
      this: ComponentShape,
      points: CoordinatePair[],
    ) {
      const maxes = getMaxes(points)

      const hardBuffer = 0.05 * this.FLAT_SCALE
      const softBuffer =
        0.08 *
        this.FLAT_SCALE *
        Math.max(maxes.width, maxes.height) *
        this.containerSizeMultiplier
      const buffer = hardBuffer + softBuffer

      this.maxView.left =
        this.data.center[0] * this.FLAT_SCALE
      this.maxView.top =
        this.data.center[1] * this.FLAT_SCALE * -1

      this.maxView.width =
        this.data.defaultRadius * 2 * this.FLAT_SCALE +
        buffer * 2
      this.maxView.height =
        this.data.defaultRadius * 2 * this.FLAT_SCALE +
        buffer * 2

      // this.maxView.width = maxes.width
      // this.maxView.height = maxes.height

      // this.maxView.width += buffer * 2
      // this.maxView.height += buffer * 2

      // const containerAspectRatio =
      //   this.$refs.svg.offsetWidth / this.$refs.svg.offsetHeight
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

      // console.log(JSON.stringify(this.maxView), buffer)

      if (this.followingCenter)
        this.view = { ...this.maxView }
      this.zoom =
        (ZOOM_LEVEL_ONE * this.FLAT_SCALE) / this.view.width
    },

    mouseDown(this: ComponentShape, e: MouseEvent) {
      clearTimeout(this.followCenterTimeout)
      this.followingCenter = false
      this.mouseIsDown = true
      this.dragStartPoint = [e.x, e.y]
      this.dragStartView = { ...this.view }
    },
    mouseUp(this: ComponentShape, e: MouseEvent) {
      if (!this.mouseIsDown) return
      this.followCenterTimeout = setTimeout(
        this.resetCenter,
        this.resetCenterTime,
      )

      if (!this.isPanning) {
        const elBCR: ClientRect = this.$refs.svg.getBoundingClientRect()
        const percentOnMap = [
          e.offsetX / elBCR.width,
          e.offsetY / elBCR.height,
        ]
        const gameCoords = [
          (this.view.left +
            this.view.width * percentOnMap[0]) /
            this.FLAT_SCALE,
          ((this.view.top +
            this.view.height * percentOnMap[1]) /
            this.FLAT_SCALE) *
            -1,
        ]
        this.$emit('mouseup', gameCoords)
      }

      this.isPanning = false
      this.mouseIsDown = false
    },
    mouseLeave(this: ComponentShape, e: MouseEvent) {
      if (this.mouseIsDown)
        this.followCenterTimeout = setTimeout(
          this.resetCenter,
          this.resetCenterTime,
        )
      this.isPanning = false
      this.mouseIsDown = false
    },
    mouseMove(this: ComponentShape, e: MouseEvent) {
      if (!this.mouseIsDown) return
      this.followingCenter = false
      this.isPanning = true
      this.dragEndPoint = [e.x, e.y]
      if (this.awaitingDragFrame) return
      this.awaitingDragFrame = true
      requestAnimationFrame(() => {
        const elBCR = this.$refs.svg.getBoundingClientRect()

        const dx =
          ((this.dragStartPoint[0] - this.dragEndPoint[0]) /
            elBCR.width) *
          this.view.width
        const dy =
          ((this.dragStartPoint[1] - this.dragEndPoint[1]) /
            elBCR.height) *
          this.view.height

        this.view.left = this.dragStartView.left + dx
        this.view.top = this.dragStartView.top + dy

        this.awaitingDragFrame = false
      })
    },
    mouseWheel(this: ComponentShape, e: MouseWheelEvent) {
      this.followingCenter = false
      clearTimeout(this.followCenterTimeout)
      this.followCenterTimeout = setTimeout(
        this.resetCenter,
        this.resetCenterTime,
      )

      e.preventDefault()
      const zoomSpeed = 0.015
      if (this.zoom <= 0.1 && e.deltaY > 0) return
      if (this.zoom > 8000 && e.deltaY < 0) return

      const dw = this.view.width * e.deltaY * zoomSpeed
      const dh = this.view.height * e.deltaY * zoomSpeed

      const elBCR = this.$refs.svg.getBoundingClientRect()
      const mx = e.offsetX / elBCR.width
      const my = e.offsetY / elBCR.height

      const dx = dw * -1 * mx
      const dy = dh * -1 * my

      if (this.view.width + dw < 0) return
      if (this.view.height + dh < 0) return

      this.view = {
        left: this.view.left + dx,
        top: this.view.top + dy,
        width: this.view.width + dw,
        height: this.view.height + dh,
      }
      this.zoom =
        (ZOOM_LEVEL_ONE * this.FLAT_SCALE) / this.view.width
    },

    resetCenter(this: ComponentShape) {
      this.followingCenter = true
      this.view = { ...this.maxView }
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
  width: 100%;
  padding-top: 100%;
  background: rgba(white, 0.02);
  cursor: move;
}
svg {
  padding: 0 !important;
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
