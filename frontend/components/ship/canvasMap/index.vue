<template>
  <Box
    class="map"
    v-if="show"
    :highlight="highlight"
    :overlayTitle="true"
    @minimize="minimize"
    @unminimize="unminimize"
    @mouseleave.native="$store.commit('tooltip', null)"
  >
    <template #title>
      <span class="sectionemoji">{{ emoji }}</span
      >{{ label }}
    </template>
    <div
      class="panesection padnone"
      :style="{
        width: width + 'px',
        height: width + 'px',
        background,
      }"
    >
      <canvas
        ref="canvas"
        id="map"
        :width="widthScaledToDevice + 'px'"
        :height="widthScaledToDevice + 'px'"
        :style="{
          width: width + 'px',
          height: width + 'px',
        }"
        @wheel="mouseWheel"
        @mousedown="mouseDown"
        @mouseleave="mouseLeave"
      />

      <div class="floatbuttons">
        <button
          @click="resetCenter"
          v-if="!mapFollowingShip"
          class="secondary"
        >
          Follow Ship
        </button>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'
import Drawer from './drawMapFrame'
import { nextTick } from 'process'

export default Vue.extend({
  props: {
    emoji: { default: '🗺' },
    label: { default: 'Area Scan' },
    interactive: { default: true },
    radius: { type: Number },
    blackout: { default: true },
    background: {},
    width: { default: 600 },
    buffer: { default: true },
  },
  data() {
    let element: HTMLCanvasElement | undefined | null,
      drawer: Drawer | undefined,
      zoom: number | undefined,
      mapCenter: CoordinatePair | undefined,
      hoverPoint: CoordinatePair | undefined,
      followCenterTimeout: any,
      isZoomingTimeout: any,
      dragStartPoint: CoordinatePair | undefined,
      dragEndPoint: CoordinatePair | undefined,
      mapCenterAtDragStart: CoordinatePair | undefined
    // previousData:
    //   | { ship: ShipStub; visible: VisibleStub }
    //   | undefined

    return {
      c,
      element,
      drawer,
      paused: false,
      widthScaledToDevice: 0,
      devicePixelRatio: 1,
      lastFrameRes: null,
      mapCenter,
      zoom,
      // previousData,
      isZooming: false,
      isPanning: false,
      mouseIsDown: false,
      awaitingDragFrame: false,
      dragStartPoint,
      dragEndPoint,
      mapCenterAtDragStart,
      followCenterTimeout,
      isZoomingTimeout,
      resetCenterTime: 2 * 60 * 1000,
      hoverPoint,
    }
  },
  computed: {
    ...mapState([
      'ship',
      'userId',
      'lastUpdated',
      'forceMapRedraw',
    ]),
    mapFollowingShip(): boolean {
      return (
        !this.interactive ||
        this.$store.state.mapFollowingShip
      )
    },
    show(): boolean {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes(
            this.interactive ? 'map' : 'mapZoom',
          ))
      )
    },
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        (this.interactive ? 'map' : 'mapZoom')
      )
    },
  },
  watch: {
    lastUpdated() {
      if (!this.mouseIsDown && !this.isZooming) {
        this.drawNextFrame()
      }
    },
    forceMapRedraw() {
      this.drawNextFrame()
    },
    async show() {
      if (this.show) {
        this.start()
        await this.$nextTick()
        setTimeout(() => this.drawNextFrame(), 200)
      }
    },
  },
  mounted() {},
  methods: {
    start() {
      this.devicePixelRatio = window.devicePixelRatio || 1
      this.widthScaledToDevice =
        this.width * this.devicePixelRatio
      this.drawNextFrame()

      window.removeEventListener(
        'mousemove',
        this.mouseMove,
      )
      window.addEventListener('mousemove', this.mouseMove)
    },
    drawNextFrame(immediate = false) {
      if (this.paused || !this.show) return
      if (this.widthScaledToDevice === 0)
        return this.start()

      return new Promise<void>((resolve) => {
        if (!this.$el || !this.$el.querySelector) return
        const profiler = new c.Profiler(
          4,
          `canvasmap`,
          false,
          0,
        )
        profiler.step('called')
        requestAnimationFrame(async () => {
          if (this.paused || !this.show) return
          profiler.step('framestart')
          if (!this.element) {
            this.element = this.$el.querySelector(
              '#map',
            ) as HTMLCanvasElement
            this.drawNextFrame()
            resolve()
            return
          }
          if (this.radius) immediate = true

          if (!this.drawer)
            this.drawer = new Drawer({
              element: this.element,
              elWidth: this.widthScaledToDevice,
            })

          if (
            !this.drawer.element ||
            !this.element ||
            !document.body.contains(this.element)
          ) {
            await this.$nextTick()

            this.element = this.$el.querySelector(
              '#map',
            ) as HTMLCanvasElement
            this.drawer.element = this.element!
          }

          // if (this.interactive)
          //   c.log(
          //     this.element,
          //     this.drawer,
          //     document.body.contains(this.element),
          //   )

          profiler.step('startdraw')

          this.drawer.draw({
            zoom: this.radius
              ? (((1 / this.radius) *
                  this.drawer.flatScale) /
                  1000000) *
                2
              : this.mapFollowingShip
              ? undefined
              : this.zoom,
            ship: this.ship,
            center: this.mapFollowingShip
              ? undefined
              : this.mapCenter,
            visible: this.ship?.visible,
            immediate: !!immediate,
            crewMemberId: this.userId,
            // previousData: this.previousData,
          })

          // // set up previous data for next time
          // if (!this.radius)
          //   this.previousData = {
          //     ship: JSON.parse(JSON.stringify(this.ship)),
          //     visible: JSON.parse(
          //       JSON.stringify(this.ship?.visible),
          //     ),
          //   }
          // else this.previousData = undefined

          profiler.step('drawn')
          this.zoom = this.drawer.targetZoom || 1
          this.mapCenter = [
            ...(this.drawer.center || [0, 0]),
          ]
          profiler.end()
          if (!immediate && !this.drawer?.isIdle()) {
            this.drawNextFrame()
          }
          resolve()
        })
      })
    },

    mouseDown(e: MouseEvent) {
      if (!this.interactive) return
      clearTimeout(this.followCenterTimeout)
      this.$store.commit('set', { mapFollowingShip: false })
      this.mouseIsDown = true
      this.dragStartPoint = [e.x, e.y]
      this.zoom = this.drawer?.zoom
      this.mapCenterAtDragStart = [
        ...(this.mapCenter || [0, 0]),
      ]
      window.addEventListener('mouseup', this.mouseUp)
    },
    mouseUp(e: MouseEvent) {
      if (!this.interactive) return
      if (!this.mouseIsDown) return
      this.followCenterTimeout = setTimeout(
        this.resetCenter,
        this.resetCenterTime,
      )

      if (!this.isPanning) {
        this.$store.commit(
          'setTarget',
          this.$store.state.tooltip?.type !== 'zone'
            ? this.$store.state.tooltip?.data?.location ||
                this.hoverPoint
            : this.hoverPoint,
        )
      }

      this.isPanning = false
      this.mouseIsDown = false

      window.removeEventListener('mouseup', this.mouseUp)
    },
    mouseLeave(e: MouseEvent) {
      if (this.$store.state.tooltip)
        this.$store.commit('tooltip')
    },
    async mouseMove(e: MouseEvent) {
      if (e.target === this.$refs.canvas)
        this.checkHoverPointForTooltip(e)

      if (!this.interactive) return

      if (!this.mouseIsDown) return

      if (
        !this.dragStartPoint ||
        !this.mapCenterAtDragStart
      )
        return
      this.dragEndPoint = [e.x, e.y]
      if (
        c.distance(this.dragStartPoint, this.dragEndPoint) >
        4
      )
        this.isPanning = true
      else return

      this.$store.commit('set', { mapFollowingShip: false })

      // c.log({
      //   dsp: this.dragStartPoint,
      //   dep: this.dragEndPoint,
      // })

      if (this.awaitingDragFrame) return

      this.awaitingDragFrame = true
      const dx =
        ((this.dragStartPoint[0] - this.dragEndPoint[0]) /
          this.width) *
        (this.drawer?.width || 1)
      const dy =
        ((this.dragStartPoint[1] - this.dragEndPoint[1]) /
          this.width) *
        (this.drawer?.height || 1)
      this.mapCenter = [
        this.mapCenterAtDragStart[0] + dx,
        this.mapCenterAtDragStart[1] + dy,
      ]
      await this.drawNextFrame(true)
      this.awaitingDragFrame = false
    },
    async mouseWheel(e: WheelEvent) {
      if (!this.interactive) return
      if (this.zoom === undefined) return
      e.preventDefault()
      if (!this.mapCenter) return c.log('no mapcenter')

      clearTimeout(this.isZoomingTimeout)
      this.isZooming = true
      this.isZoomingTimeout = setTimeout(
        () => (this.isZooming = false),
        100,
      )

      this.$store.commit('set', { mapFollowingShip: false })
      clearTimeout(this.followCenterTimeout)
      this.followCenterTimeout = setTimeout(
        this.resetCenter,
        this.resetCenterTime,
      )

      let sizeDifference = this.zoom

      const fs = this.drawer?.flatScale || 1

      if (this.zoom <= 20 / fs && e.deltaY > 0) return
      if (this.zoom > 500000 / fs && e.deltaY < 0) return

      const zoomSpeed = 0.0015
      const zoomChange =
        this.zoom * Math.abs(e.deltaY) * zoomSpeed
      if (e.deltaY < 0) this.zoom += zoomChange
      else this.zoom -= zoomChange

      if (this.zoom < 20 / fs) this.zoom = 20 / fs
      if (this.zoom > 500000 / fs) this.zoom = 500000 / fs

      sizeDifference /= this.zoom
      sizeDifference -= 1

      const mx = e.offsetX / this.width
      const my = e.offsetY / this.width

      const mapDistanceFromMouseToCenter = this.drawer
        ? [
            this.drawer.width * (mx - 0.5),
            this.drawer.height * (my - 0.5),
          ]
        : [1, 1]

      this.mapCenter = [
        this.mapCenter[0] -
          mapDistanceFromMouseToCenter[0] * sizeDifference,
        this.mapCenter[1] -
          mapDistanceFromMouseToCenter[1] * sizeDifference,
      ]

      await this.drawNextFrame(true)
    },

    resetCenter() {
      this.$store.commit('set', { mapFollowingShip: true })
      this.zoom = undefined
      this.mapCenter = undefined
      this.drawNextFrame()
    },

    setHoverPoint(e: MouseEvent) {
      const tl = this.drawer?.topLeft || [0, 0]

      this.hoverPoint = [
        ((e.offsetX / this.width) *
          (this.drawer?.width || 1) +
          tl[0]) /
          (this.drawer?.flatScale || 1),
        (((e.offsetY / this.width) *
          (this.drawer?.height || 1) +
          tl[1]) *
          -1) /
          (this.drawer?.flatScale || 1),
      ]
    },

    checkHoverPointForTooltip(e: MouseEvent) {
      if (!this.ship) return

      if (this.isPanning) {
        if (this.$store.state.tooltip)
          this.$store.commit('tooltip')
        return
      }

      this.setHoverPoint(e)

      const hoverRadius =
        Math.max(this.drawer?.width || 1, 50) /
        (this.drawer?.flatScale || 1) /
        30
      const hoverableElements: any[] = []
      const s = this.ship as ShipStub
      if (!s) return

      s.seenPlanets!.forEach((p: PlanetStub) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'planet',
            data: p,
          })
      })

      s.visible?.caches.forEach((p: Partial<CacheStub>) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'cache',
            data: p,
          })
      })

      s.visible?.ships.forEach((p: ShipStub) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'ship',
            data: p,
          })
      })

      s.seenLandmarks!.filter(
        (l: any) => l.type === 'zone',
      ).forEach((p: ZoneStub) => {
        const hoverDistance =
          c.distance(p.location, this.hoverPoint) - p.radius
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            hoverDistanceSubtract: p.radius,
            type: 'zone',
            data: p,
          })
      })

      const hd = c.distance(
        this.ship.location,
        this.hoverPoint,
      )
      if (hd <= hoverRadius)
        hoverableElements.push({
          hoverDistance: hd,
          type: 'ship',
          data: this.ship,
        })

      const toShow = hoverableElements.reduce(
        (closest, curr) => {
          if (
            !closest ||
            curr.hoverDistance +
              (curr.hoverDistanceSubtract || 0) <=
              closest.hoverDistance +
                (closest.hoverDistanceSubtract || 0)
          )
            return curr
          return closest
        },
        null,
      )
      if (
        this.$store.state.tooltip === toShow ||
        (this.$store.state.tooltip?.type === toShow?.type &&
          this.$store.state.tooltip?.data?.name ===
            toShow?.data?.name &&
          this.$store.state.tooltip?.data?.id ===
            toShow?.data?.id)
      )
        return

      this.$store.commit('tooltip', toShow)
    },
    minimize() {
      this.paused = true
      this.drawer = undefined
      this.element = undefined
    },
    async unminimize() {
      await this.$nextTick()
      this.paused = false
      this.drawNextFrame(true)
    },
  },
})
</script>

<style lang="scss" scoped>
.panesection {
  background: var(--bg);

  @media (max-width: 768px) {
    width: 100% !important;
  }

  .floatbuttons {
    position: absolute;
    bottom: 0.5em;
    right: 0.5em;
  }
}
</style>
