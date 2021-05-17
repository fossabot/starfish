<template>
  <g class="distancemarkers">
    <g
      v-for="(y, index) in horizontalMarkersToDraw"
      :key="'horiz' + index"
    >
      <line
        :x1="left"
        :x2="left + width"
        :y1="y"
        :y2="y"
        :stroke="'white'"
        :stroke-width="(0.0025 * FLAT_SCALE) / zoom"
      />
      <text
        :x="left + width * 0.008"
        :y="y + height * 0.005"
        text-anchor="left"
        :font-size="
          (0.05 * FLAT_SCALE * containerSizeMultiplier) /
            zoom
        "
        :fill="'white'"
      >
        {{
          Math.round((y / FLAT_SCALE) * roundFactor) /
            roundFactor
        }}
      </text>
    </g>

    <g
      v-for="(x, index) in verticalMarkersToDraw"
      :key="'vert' + index"
    >
      <line
        :x1="x"
        :x2="x"
        :y1="top"
        :y2="top + height"
        :stroke="'white'"
        :stroke-width="(0.0025 * FLAT_SCALE) / zoom"
      />
      <text
        :x="x + width * 0.003"
        :y="top + height * 0.03"
        text-anchor="left"
        :font-size="
          (0.05 * FLAT_SCALE * containerSizeMultiplier) /
            zoom
        "
        :fill="'white'"
      >
        {{
          Math.round((x / FLAT_SCALE) * roundFactor) /
            roundFactor
        }}
      </text>
    </g>
  </g>
</template>

<script lang="ts">
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    containerSizeMultiplier: {},
    FLAT_SCALE: {},
    zoom: {},
    top: {},
    left: {},
    width: {},
    height: {},
  },
  data(): ComponentShape {
    return {
      horizontalMarkersToDraw: [],
      verticalMarkersToDraw: [],
      roundFactor: 1,
    }
  },
  computed: {},
  watch: {
    top(this: ComponentShape) {
      this.reset()
    },
    left(this: ComponentShape) {
      this.reset()
    },
  },
  mounted(this: ComponentShape) {
    this.reset()
  },
  methods: {
    reset(this: ComponentShape) {
      let auBetweenLines = 1 / 2 ** 8
      const diameter = Math.max(this.width, this.height)
      while (auBetweenLines / diameter < 0.15)
        auBetweenLines *= 2

      this.roundFactor = 1
      while (
        Math.abs(
          Math.round(
            (auBetweenLines * this.roundFactor) /
              this.FLAT_SCALE,
          ),
        ) < 1
      )
        this.roundFactor *= 10
      this.roundFactor *= 100

      this.horizontalMarkersToDraw = []
      this.verticalMarkersToDraw = []
      const center = [
        this.left + this.width / 2,
        this.top + this.height / 2,
      ]
      this.horizontalMarkersToDraw.push(center[1])
      this.verticalMarkersToDraw.push(center[0])
      for (let i = 1; i < 4; i++) {
        this.horizontalMarkersToDraw.push(
          center[1] + auBetweenLines * i,
        )
        this.verticalMarkersToDraw.push(
          center[0] + auBetweenLines * i,
        )
        this.horizontalMarkersToDraw.push(
          center[1] - auBetweenLines * i,
        )
        this.verticalMarkersToDraw.push(
          center[0] - auBetweenLines * i,
        )
      }
    },
  },
}
</script>

<style lang="scss" scoped>
g {
  z-index: 10;
  position: relative;
}
line {
  opacity: 0.1;
}
text {
  opacity: 0.3;
  font-weight: bold;
}
</style>
