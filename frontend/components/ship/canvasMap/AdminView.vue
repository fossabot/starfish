<template>
  <div
    class="map"
    @mouseenter="hover"
    @mouseleave="unhover"
    :class="{
      killtouchevents: isPanning || isZooming,
    }"
  >
    <canvas
      ref="canvas"
      id="map"
      :width="widthScaledToDevice + 'px'"
      :height="widthScaledToDevice + 'px'"
      :style="{
        width: winSize[0] + 'px',
        height: winSize[1] + 'px',
      }"
      @wheel="mouseWheel"
      @touchstart="mouseDown"
      @touchend="mouseLeave"
      @mousedown="mouseDown"
      @mouseleave="mouseLeave"
    />

    <div class="floatbuttons flex">
      <button @click="$emit('update')" class="secondary">
        Reload
      </button>
      <button
        @click="resetCenter"
        v-if="!centered"
        class="marleft secondary"
      >
        Recenter
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'
import Drawer from './drawMapFrame'

export default Vue.extend({
  props: {
    visibleData: {
      type:
        undefined || (Object as PropType<AdminVisibleData>),
    },
    buffer: { default: true },
  },
  data() {
    let element: HTMLCanvasElement | undefined | null,
      drawer: Drawer | undefined,
      zoom: number | undefined,
      mapCenter: CoordinatePair | undefined,
      hoverPoint: CoordinatePair | undefined,
      isZoomingTimeout: any,
      dragStartPoint: CoordinatePair | undefined,
      dragEndPoint: CoordinatePair | undefined,
      mapCenterAtDragStart: CoordinatePair | undefined

    return {
      c,
      element,
      drawer,
      widthScaledToDevice: 0,
      heightScaledToDevice: 0,
      devicePixelRatio: 1,
      lastFrameRes: null,
      mapCenter,
      zoom,
      isHovering: false,
      isZooming: false,
      isPanning: false,
      mouseIsDown: false,
      awaitingDragFrame: false,
      dragStartPoint,
      dragEndPoint,
      mapCenterAtDragStart,
      centered: true,
      isZoomingTimeout,
      hoverPoint,
    }
  },
  computed: {
    ...mapState(['tooltip', 'targetPoint', 'winSize']),
  },
  watch: {
    visibleData() {
      this.drawNextFrame()
    },
    tooltip() {
      this.drawNextFrame()
    },
    targetPoint() {
      this.drawNextFrame()
    },
  },
  async mounted() {
    await this.$nextTick()
    window.addEventListener('resize', this.resize)
    this.resize()
  },
  methods: {
    hover() {
      this.isHovering = true
    },
    unhover() {
      this.isHovering = false
      this.$store.commit('tooltip', null)
    },
    resize() {
      this.start()
    },
    start() {
      this.devicePixelRatio = window.devicePixelRatio || 1
      this.widthScaledToDevice =
        this.winSize[0] * this.devicePixelRatio
      this.heightScaledToDevice =
        this.winSize[1] * this.devicePixelRatio
      this.drawNextFrame()

      window.removeEventListener(
        'mousemove',
        this.mouseMove,
      )
      window.addEventListener('mousemove', this.mouseMove)
      window.removeEventListener(
        'touchmove',
        this.mouseMove,
      )
      window.addEventListener('touchmove', this.mouseMove)
    },
    drawNextFrame(immediate = false) {
      if (this.widthScaledToDevice === 0)
        return this.start()

      return new Promise<void>((resolve) => {
        if (!this.$el || !this.$el.querySelector) return
        requestAnimationFrame(async () => {
          if (!this.element) {
            this.element = this.$el.querySelector(
              '#map',
            ) as HTMLCanvasElement
            this.drawNextFrame()
            resolve()
            return
          }

          if (
            !this.drawer ||
            this.drawer.elementScreenSize[0] !==
              this.widthScaledToDevice ||
            this.drawer.elementScreenSize[1] !==
              this.heightScaledToDevice
          )
            this.drawer = new Drawer({
              element: this.element,
              elWidth: this.widthScaledToDevice,
              elHeight: this.heightScaledToDevice,
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

          // *  ----- calculate the target point from the tooltip or targetPoint -----
          const targetPoints: TargetLocation[] = []
          const tp =
            this.targetPoint || this.tooltip
              ? this.targetPoint || this.tooltip
              : null

          if (tp) {
            let radius
            if (tp.location) {
              if (
                tp.type &&
                ['zone', 'weapon'].includes(tp.type)
              )
                radius = tp.radius
              targetPoints.push({
                location: tp.location,
                radius,
                color: tp.guildId
                  ? c.guilds[tp.guildId].color
                  : tp.color,
              })
            }
          }

          this.drawer.draw({
            zoom: this.centered ? undefined : this.zoom,
            center: this.centered
              ? undefined
              : this.mapCenter,
            visible: this.visibleData,
            immediate: !!immediate,
            targetPoints,
          })

          this.zoom = this.drawer.targetZoom || 1
          this.mapCenter = [
            ...(this.drawer.center || [0, 0]),
          ]

          if (!immediate && !this.drawer?.isIdle()) {
            await this.drawNextFrame()
          }
          resolve()
        })
      })
    },

    mouseDown(e: MouseEvent | TouchEvent) {
      this.centered = false
      this.mouseIsDown = true
      this.dragStartPoint =
        'x' in e
          ? [e.x, e.y]
          : [e.touches[0].clientX, e.touches[0].clientY]
      this.zoom = this.drawer?.zoom
      this.mapCenterAtDragStart = [
        ...(this.mapCenter || [0, 0]),
      ]
      window.addEventListener('mouseup', this.mouseUp)
    },
    mouseUp(e: MouseEvent | TouchEvent) {
      if (!this.mouseIsDown) return

      if (!this.isPanning && this.isHovering) {
        this.$store.commit('setTarget', [
          ...(this.$store.state.tooltip?.type !== 'zone'
            ? this.$store.state.tooltip?.location ||
              this.hoverPoint
            : this.hoverPoint),
        ])
      }

      this.isPanning = false
      this.mouseIsDown = false

      window.removeEventListener('mouseup', this.mouseUp)
    },
    mouseLeave(e: MouseEvent) {
      if (this.$store.state.tooltip)
        this.$store.commit('tooltip')
    },
    async mouseMove(e: MouseEvent | TouchEvent) {
      if (e.target === this.$refs.canvas && 'clientX' in e)
        this.checkHoverPointForTooltip(e)

      if (!this.mouseIsDown) return

      if (
        !this.dragStartPoint ||
        !this.mapCenterAtDragStart
      )
        return
      this.dragEndPoint =
        'x' in e
          ? [e.x, e.y]
          : [e.touches[0].clientX, e.touches[0].clientY]
      if (
        c.distance(this.dragStartPoint, this.dragEndPoint) >
        4
      )
        this.isPanning = true
      else return

      this.centered = false

      if (this.awaitingDragFrame) return

      this.awaitingDragFrame = true
      const dx =
        ((this.dragStartPoint[0] - this.dragEndPoint[0]) /
          this.winSize[0]) *
        (this.drawer?.width || 1)
      const dy =
        ((this.dragStartPoint[1] - this.dragEndPoint[1]) /
          this.winSize[1]) *
        (this.drawer?.height || 1)
      this.mapCenter = [
        this.mapCenterAtDragStart[0] + dx,
        this.mapCenterAtDragStart[1] + dy,
      ]
      await this.drawNextFrame(true)
      this.awaitingDragFrame = false

      e.preventDefault()
    },
    async mouseWheel(e: WheelEvent) {
      if (this.zoom === undefined) return
      e.preventDefault()
      if (!this.mapCenter) return c.log('no mapcenter')

      clearTimeout(this.isZoomingTimeout)
      this.isZooming = true
      this.isZoomingTimeout = setTimeout(
        () => (this.isZooming = false),
        100,
      )

      this.centered = false

      let sizeDifference = this.zoom

      const fs = this.drawer?.flatScale || 1

      if (this.zoom <= 20 / fs && e.deltaY > 0) return
      if (this.zoom > 1500000 / fs && e.deltaY < 0) return

      const zoomSpeed = 0.0015
      const zoomChange =
        this.zoom * Math.abs(e.deltaY) * zoomSpeed
      if (e.deltaY < 0) this.zoom += zoomChange
      else this.zoom -= zoomChange

      if (this.zoom < 20 / fs) this.zoom = 20 / fs
      if (this.zoom > 1500000 / fs) this.zoom = 1500000 / fs

      sizeDifference /= this.zoom
      sizeDifference -= 1

      const mx = e.offsetX / this.winSize[0]
      const my = e.offsetY / this.winSize[1]

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
      this.centered = true
      this.zoom = undefined
      this.mapCenter = undefined
      this.drawNextFrame()
    },

    setHoverPoint(e: MouseEvent) {
      const tl = this.drawer?.topLeft || [0, 0]

      this.hoverPoint = [
        ((e.offsetX / this.winSize[0]) *
          (this.drawer?.width || 1) +
          tl[0]) /
          (this.drawer?.flatScale || 1),
        (((e.offsetY / this.winSize[1]) *
          (this.drawer?.height || 1) +
          tl[1]) *
          -1) /
          (this.drawer?.flatScale || 1),
      ]
    },

    checkHoverPointForTooltip(e?: MouseEvent) {
      if (!this.isHovering) return

      if (this.isPanning) {
        if (this.$store.state.tooltip)
          this.$store.commit('tooltip')
        return
      }

      if (e) this.setHoverPoint(e)

      const hoverRadius =
        Math.max(this.drawer?.width || 1, 50) /
        (this.drawer?.flatScale || 1) /
        30
      const hoverableElements: any[] = []
      const vd = this.visibleData as AdminVisibleData
      if (!vd) return

      vd.planets.forEach((p: PlanetStub) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'planet',
            ...p,
          })
      })

      vd.caches.forEach((p: Partial<CacheStub>) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'cache',
            ...p,
          })
      })

      vd.ships.forEach((p: ShipStub) => {
        const hoverDistance = c.distance(
          p.location,
          this.hoverPoint,
        )
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            type: 'ship',
            ...p,
          })
      })

      vd.zones.forEach((p: ZoneStub) => {
        const hoverDistance =
          c.distance(p.location, this.hoverPoint) - p.radius
        if (hoverDistance <= hoverRadius)
          hoverableElements.push({
            hoverDistance,
            hoverDistanceSubtract: p.radius,
            type: 'zone',
            ...p,
          })
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
          this.$store.state.tooltip?.id === toShow?.id &&
          this.$store.state.tooltip?.location?.[0] ===
            toShow?.location?.[0])
      )
        return

      this.$store.commit('tooltip', toShow)
    },
  },
})
</script>

<style lang="scss" scoped>
.killtouchevents {
  touch-action: none;
}

.floatbuttons {
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
}
</style>
