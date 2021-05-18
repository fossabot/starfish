<template>
  <canvas :width="width" :height="height" />
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {
      width: 0,
      height: 0,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  async mounted(this: ComponentShape) {
    const canvas: HTMLCanvasElement = this.$el,
      ctx: CanvasRenderingContext2D = canvas.getContext(
        '2d',
      )!
    // ,
    // color = getComputedStyle(document.documentElement)
    //   .getPropertyValue('--ui')

    this.width = this.$el.parentElement.offsetWidth
    this.height = this.$el.parentElement.offsetHeight
    const stars = Math.round(
      this.width * this.height * 0.003,
    )
    await this.$nextTick()

    for (let i = 0; i < stars; i++) {
      let x = Math.random() * canvas.offsetWidth
      let y = Math.random() * canvas.offsetHeight
      ctx.fillStyle = 'rgba(255,255,255,.4)' //color
      const size = Math.random() > 0.3 ? 1 : 2
      ctx.fillRect(x, y, size, size)
    }
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
canvas {
  pointer-events: none;
  /* background: black; */
  /* var(--bg); */
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
}
</style>
