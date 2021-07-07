<template>
  <div>
    <!-- <button @click="reset">Again!</button> -->
    <div ref="container" class="container">
      <div
        class="boxholder"
        v-for="(box, index) in boxes"
        :key="index"
        :style="{
          width:
            10 +
            (((Math.random() + scrambler) % 1) * 15) ** 2 +
            'px',
          height:
            10 +
            (((Math.random() + scrambler) % 1) * 15) ** 2 +
            'px',
        }"
      >
        <div
          class="box"
          :style="{
            background: `hsl(${Math.random() *
              360}, 70%, 60%)`,
          }"
        ></div>
      </div>
      <div
        class="boxholder"
        v-for="(box, index) in boxes"
        :key="'b2' + index"
        :style="{
          width:
            10 +
            (((Math.random() + scrambler) % 1) * 10) ** 2 +
            'px',
          height:
            10 +
            (((Math.random() + scrambler) % 1) * 10) ** 2 +
            'px',
        }"
      >
        <div
          class="box"
          :style="{
            background: `hsl(${Math.random() *
              360}, 70%, 60%)`,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import FreeMase from 'freemase'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { boxes: 150, scrambler: Math.random() }
  },
  computed: {},
  watch: {},
  async mounted(this: ComponentShape) {
    await this.$nextTick()

    while (!this.$refs.container) await this.$nextTick()
    this.masonryElement = new FreeMase(this.$refs.container)

    window.addEventListener('keydown', this.reset)
  },
  beforeDestroy(this: ComponentShape) {
    window.removeEventListener('keydown', this.reset)
  },
  methods: {
    reset(this: ComponentShape) {
      this.scrambler = Math.random()
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  // max-width: 700px;
}
.boxholder {
  top: 0;
  padding: 3px;
  transition: width 0.2s, height 0.2s, top 1s, left 1s;
}
.box {
  border-radius: 6px;
  width: 100%;
  height: 100%;
}
</style>
