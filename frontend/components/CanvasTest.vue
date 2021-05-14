<template>
  <canvas width="500" height="500"></canvas>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  ctx: CanvasRenderingContext2D | null
  objects: any[]
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {
      ctx: null,
      objects: [],
    }
  },
  computed: {
    ...mapState(['ship']),
  },
  watch: {},
  mounted(this: ComponentShape) {
    this.ctx = this.$el.getContext('2d')

    requestAnimationFrame(this.frame)
  },
  methods: {
    frame(this: ComponentShape) {
      if (!this.ctx) return
      this.ctx.clearRect(
        0,
        0,
        this.$el.width,
        this.$el.height,
      )

      this.ctx.strokeStyle = `rgba(255,255,255,.1)`
      this.ctx.lineWidth = 1

      for (let i = 0; i < 100; i++) {
        this.ctx.beginPath()
        this.ctx.arc(
          Math.random() * 500,
          Math.random() * 500,
          Math.random() * 250,
          0,
          Math.PI * 2,
          true,
        )
        // this.ctx.moveTo(
        //   Math.random() * 500,
        //   Math.random() * 500,
        // )
        // this.ctx.lineTo(
        //   Math.random() * 500,
        //   Math.random() * 500,
        // )
        this.ctx.stroke()
      }

      // this.ctx.fillRect(10, 10, 150 * Math.random(), 100)

      requestAnimationFrame(this.frame)
    },
  },
}
</script>

<style lang="scss">
canvas {
  width: 500px;
  height: 500px;
}
</style>
