<template>
  <div>
    <!-- <button @click="reset">Again!</button> -->
    <div ref="container" class="container">
      <div
        class="boxholder"
        v-for="(box, index) in boxes"
        :key="index"
        :style="{
          width: box.width,
          height: box.height,
        }"
      >
        <div
          class="box"
          :style="{
            background: box.color,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import FreeMase from '../assets/scripts/freemase'

export default Vue.extend({
  data() {
    let masonryElement: FreeMase | undefined
    return {
      boxCount: 3,
      boxes: [],
      scrambler: Math.random(),
      masonryElement,
    }
  },
  computed: {},
  watch: {},
  async mounted() {
    await this.$nextTick()

    while (!this.$refs.container) await this.$nextTick()
    this.masonryElement = new FreeMase(
      this.$refs.container as HTMLElement,
      { centerX: true, verbose: true },
    )

    window.addEventListener('keydown', this.reset)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.reset)
  },
  methods: {
    reset() {
      this.scrambler = Math.random()
      this.boxCount++
      while (this.boxes.length < this.boxCount) {
        ;(this.boxes as any).push({
          width:
            50 +
            ((Math.random() * this.scrambler) % 1) * 250 +
            'px',
          height:
            50 +
            ((Math.random() * this.scrambler) % 1) * 250 +
            'px',
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        })
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  // max-width: 700px;
}
.boxholder {
  top: 0;
  padding: 3px;
  transition: width 0.2s, height 0.2s, top 0.5s, left 0.5s;
}
.box {
  border-radius: 6px;
  width: 100%;
  height: 100%;
}
</style>
