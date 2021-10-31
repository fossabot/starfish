<template>
  <canvas :width="width + 'px'" :height="height + 'px'" />
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      width: 0,
      height: 0,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  async mounted() {
    setTimeout(this.redraw, 1000)
  },
  methods: {
    async redraw() {
      const canvas: HTMLCanvasElement = this
          .$el as HTMLCanvasElement,
        ctx: CanvasRenderingContext2D =
          canvas.getContext('2d')!
      // ,
      // color = getComputedStyle(document.documentElement)
      //   .getPropertyValue('--ui')

      this.width = this.$el.parentElement!.offsetWidth * 2
      this.height = this.$el.parentElement!.offsetHeight * 2
      const stars = Math.round(
        this.width * this.height * 0.0005,
      )
      await this.$nextTick()

      const offsetWidth = canvas.offsetWidth
      const offsetHeight = canvas.offsetHeight
      for (let i = 0; i < stars; i++) {
        let x = Math.random() * offsetWidth
        let y = Math.random() * offsetHeight
        ctx.fillStyle = 'rgba(255,255,255,.4)' //color
        const size = Math.random() > 0.3 ? 1.5 : 3
        ctx.fillRect(x, y, size, size)
      }
    },
  },
})
</script>

<style lang="scss" scoped>
canvas {
  pointer-events: none;
  background: red;
  /* var(--bg); */
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  transform: scale(0.5);
  transform-origin: top left;
}
</style>
