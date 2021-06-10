<template>
  <div
    class="holder"
    @mousewheel="mouseWheel"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @mouseleave="mouseLeave"
    @mousemove="mouseMove"
    v-if="mapData"
  >
    <svg
      ref="svg"
      :viewBox="
        `${view.left} ${view.top} ${view.width} ${view.height}`
      "
    >
      <ShipMapSightMask
        v-if="mapData.blackout"
        :location="[
          mapData.center[0],
          mapData.center[1] * -1,
        ]"
        :radius="mapData.defaultRadius * FLAT_SCALE"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <!-- <ShipMapOutline
        :location="[
          mapData.center[0],
          mapData.center[1] * -1,
        ]"
        :radius="mapData.defaultRadius * FLAT_SCALE"
        :label="zoom > 1 ? 'sight radius' : ''"
        :label2="
          zoom > 1
            ? Math.round(mapData.defaultRadius * 100) /
                100 +
              'au'
            : ''
        "
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
        :blackout="true"
      /> -->

      <ShipMapOutline
        v-for="el in mapData.radii"
        :key="el.label"
        :location="[
          mapData.center[0],
          mapData.center[1] * -1,
        ]"
        :radius="el.radius * FLAT_SCALE"
        :label="zoom > 1 ? el.label : ''"
        :label2="zoom > 1 ? el.label2 : ''"
        :color="el.color"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapOutline
        v-if="mapData.gameRadius"
        :location="[0, 0]"
        :radius="mapData.gameRadius * FLAT_SCALE"
        :label="zoom > 1 ? 'Known Universe' : ''"
        :dash="3"
        :color="'rgba(255,255,255,.3)'"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapCache
        v-for="c in caches"
        :key="'cache' + c.id"
        v-bind="c"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapPoint
        v-for="t in targetPoints"
        :key="
          'targetPoint' +
            t.location[0] +
            ',' +
            t.location[1]
        "
        v-bind="t"
        radius="0.00001"
        minSize="0.06"
        strokeWidth=".5"
        :mask="false"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapShippath
        v-for="s in mapData.shipPaths"
        :key="'shippath' + s.id"
        v-bind="s"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapPlanet
        v-for="p in planets"
        :key="'planet' + p.planetData.name"
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

      <ShipMapAttackRemnant
        v-for="(ar, index) in attackRemnants"
        :key="'ar' + index"
        v-bind="ar"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapShipdot
        v-for="s in ships"
        :key="'ship' + s.shipData.id"
        v-bind="s"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :view="view"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <ShipMapDistanceCircles
        :location="[
          mapData.center[0],
          mapData.center[1] * -1,
        ]"
        :view="view"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :speed="mapData.speed"
        :containerSizeMultiplier="containerSizeMultiplier"
      />

      <!--

:location="[
          (view.left + view.width / 2) / FLAT_SCALE,
          (view.top + view.height / 2) / FLAT_SCALE,
        ]"
        -->

      <!-- <ShipMapDistanceMarkers
        v-bind="view"
        :FLAT_SCALE="FLAT_SCALE"
        :zoom="zoom"
        :containerSizeMultiplier="containerSizeMultiplier"
      /> -->
    </svg>
  </div>
</template>

<script lang="ts">
import c from '../../../../common/src'
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
  props: {
    mapData: {},
    resetCenterTime: { default: 120 * 1000 },
  },
  data(): ComponentShape {
    return {
      c,
      FLAT_SCALE: 1,
      zoom: 1,
      ships: [],
      planets: [],
      targetLines: [],
      attackRemnants: [],
      caches: [],
      targetPoints: [],
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
  computed: {
    ...mapState(['ship']),
  },
  watch: {
    mapData(this: ComponentShape) {
      this.redraw()
    },
  },
  mounted(this: ComponentShape) {
    this.redraw()
  },
  methods: {
    redraw(this: ComponentShape) {
      if (
        !this.mapData ||
        (!this.mapData.ships && !this.mapData.planets)
      )
        return

      this.containerSizeMultiplier =
        600 / this.$el.offsetWidth

      this.ships =
        this.mapData.ships?.map((el: ShipStub) => ({
          type: 'ship',
          location: [...el.location],
          color:
            el === this.ship
              ? 'white'
              : el.faction
              ? el.faction.color
              : 'rgba(255,255,255,.6)',
          shipData: el,
        })) || []
      this.planets =
        this.mapData.planets?.map((el: PlanetStub) => ({
          type: 'planet',
          location: [...el.location],
          radius: (el.radius || 36000) / KM_PER_AU,
          color: el.validColor || el.color || 'pink',
          planetData: el,
        })) || []
      this.targetLines =
        this.mapData.targetLines?.map((el: any) => ({
          type: 'targetLine',
          from: [...el.from],
          to: [...el.to],
          highlight: el.highlight,
          id: el.id,
        })) || []
      this.attackRemnants =
        (this.mapData.attackRemnants || []).map(
          (el: AttackRemnantStub) => ({
            type: 'attackRemnant',
            from: [...el.start],
            to: [...el.end],
            attacker: el.attacker,
            defender: el.defender,
            time: el.time,
            miss: el.damageTaken.damageTaken === 0,
          }),
        ) || []
      this.caches =
        this.mapData.caches?.map((el: CacheStub) => ({
          type: 'cache',
          id: el.id,
          location: [...el.location],
        })) || []
      this.targetPoints =
        this.mapData.targetPoints?.map((el: any) => ({
          type: 'targetPoint',
          color: el.color || '#fb5',
          label: el.label || 'Go Here!',
          location: [...el.coordinates],
        })) || []

      // flip y values since svg counts up from the top down
      this.ships.forEach((el: ShipStub) => {
        el.location[1] *= -1
      })
      this.planets.forEach(
        (el: PlanetStub) => (el.location[1] *= -1),
      )
      this.caches.forEach(
        (el: CacheStub) => (el.location[1] *= -1),
      )
      this.targetPoints.forEach(
        (el: any) => (el.location[1] *= -1),
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

      const hardBuffer = 0.002 * this.FLAT_SCALE
      const softBuffer =
        0.09 *
        this.FLAT_SCALE *
        Math.max(maxes.width, maxes.height) *
        this.containerSizeMultiplier
      const buffer = this.mapData.buffer
        ? hardBuffer + softBuffer
        : 0

      this.maxView.left =
        this.mapData.center[0] * this.FLAT_SCALE
      this.maxView.top =
        this.mapData.center[1] * this.FLAT_SCALE * -1

      this.maxView.width =
        this.mapData.defaultRadius * 2 * this.FLAT_SCALE +
        buffer * 2
      this.maxView.height =
        this.mapData.defaultRadius * 2 * this.FLAT_SCALE +
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
      if (!this.mapData.interactive) return
      clearTimeout(this.followCenterTimeout)
      this.followingCenter = false
      this.mouseIsDown = true
      this.dragStartPoint = [e.x, e.y]
      this.dragStartView = { ...this.view }
    },
    mouseUp(this: ComponentShape, e: MouseEvent) {
      if (!this.mapData.interactive) return
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
      if (!this.mapData.interactive) return
      if (this.mouseIsDown)
        this.followCenterTimeout = setTimeout(
          this.resetCenter,
          this.resetCenterTime,
        )
      this.isPanning = false
      this.mouseIsDown = false
    },
    mouseMove(this: ComponentShape, e: MouseEvent) {
      if (!this.mapData.interactive) return
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
      if (!this.mapData.interactive) return
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
  line-height: 1;
  z-index: 2;
  user-select: none;
  position: relative;
  padding: 0 !important;
  width: 100%;
  padding-top: 100%;
  cursor: move;
}
svg {
  padding: 0 !important;
  width: 100%;
  height: 100%;
  position: relative;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
