<template>
  <canvas
    id="fabriccanvas"
    width="500"
    height="500"
  ></canvas>
</template>

<script>
import { mapState } from 'vuex'
import { fabric as fb } from 'fabric'

export default {
  data() {
    return { fabric: null, bg: null, paths: [] }
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {},
  mounted() {
    this.fabricSetup()
    this.start()
  },
  methods: {
    frame() {
      for (let path of this.paths) {
        path.set({
          path: [
            [
              `M`,
              Math.random() * this.fabric.width,
              Math.random() * this.fabric.height,
            ],
            [
              'L',
              Math.random() * this.fabric.width,
              Math.random() * this.fabric.height,
            ],
          ],
        })
      }
      this.fabric.requestRenderAll()
      requestAnimationFrame(this.frame)
    },
    start() {
      this.bg = new fb.Rect({
        top: 0,
        left: 0,
        width: this.fabric.width,
        height: this.fabric.height,
        fill: '#222',
        selectable: false,
      })

      this.paths = []
      for (let i = 0; i < 1000; i++) {
        const path = new fb.Path()
        path.set({
          path: [
            [
              `M`,
              Math.random() * this.fabric.width,
              Math.random() * this.fabric.height,
            ],
            [
              'L',
              Math.random() * this.fabric.width,
              Math.random() * this.fabric.height,
            ],
          ],
          stroke: 'white',
          opacity: 1,
          selectable: false,
        })

        this.paths.push(path)
      }

      this.fabric.add(this.bg)

      for (let path of this.paths) this.fabric.add(path)

      // requestAnimationFrame(this.frame)
    },

    // ---

    fabricSetup() {
      this.fabric = new fb.Canvas('fabriccanvas')
      this.fabric.selection = false

      this.fabric.fitToBounds = function(vpt) {
        if (!vpt) vpt = this.viewportTransform
        const maxLeft = this.width - vpt[0] * this.width
        if (vpt[0] < 1) vpt[0] = 1
        if (vpt[4] > 0) vpt[4] = 0
        if (vpt[5] > 0) vpt[5] = 0
        if (vpt[4] < maxLeft) vpt[4] = maxLeft
        if (vpt[5] < maxLeft) vpt[5] = maxLeft
      }

      this.fabric.on('mouse:down', function(opt) {
        const event = opt.e
        this.isDragging = true
        this.selection = false
        this.lastPosX = event.clientX
        this.lastPosY = event.clientY
      })
      this.fabric.on('mouse:move', function(opt) {
        if (this.isDragging) {
          const event = opt.e
          const vpt = this.viewportTransform
          vpt[4] += event.clientX - this.lastPosX
          vpt[5] += event.clientY - this.lastPosY
          this.fitToBounds(vpt)
          this.requestRenderAll()
          this.lastPosX = event.clientX
          this.lastPosY = event.clientY
        }
      })
      this.fabric.on('mouse:up', function(opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform)
        this.isDragging = false
        this.selection = true
      })

      this.fabric.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY
        let zoom = this.getZoom()
        zoom *= 0.998 ** delta
        if (zoom > 20) zoom = 20
        if (zoom < 0.01) zoom = 0.01
        const initialVpt = this.viewportTransform
        this.zoomToPoint(
          {
            x: opt.e.offsetX + initialVpt[4],
            y: opt.e.offsetY + initialVpt[5],
          },
          zoom,
        )
        opt.e.preventDefault()
        opt.e.stopPropagation()
        this.fitToBounds()
      })
    },
  },
}
</script>

<style lang="scss"></style>
