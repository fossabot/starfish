<template>
  <g
    class="point"
    :style="{ 'z-index': z }"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
  >
    <circle
      v-if="circle"
      :cx="location[0]"
      :cy="location[1]"
      :r="scaledRadius"
      :fill="color || 'white'"
    />
    <rect
      v-else
      :x="location[0] - scaledRadius"
      :y="location[1] - scaledRadius"
      :width="scaledRadius * 2"
      :height="scaledRadius * 2"
      :fill="color || 'white'"
    />
    <text
      v-if="label"
      :x="location[0]"
      :y="location[1] + scaledRadius * -1 - 0.03"
      text-anchor="middle"
      :font-size="0.03 / zoom"
      :fill="color || 'white'"
    >
      {{ label }}
    </text>
  </g>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    location: {},
    radius: { default: 0.00001 },
    minSize: { default: 3 },
    color: {},
    label: {},
    z: { default: 1 },
    circle: { default: true },
    zoom: { default: 1 },
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['ship']),
    scaledRadius(this: ComponentShape) {
      return Math.max(this.minSize / this.zoom, this.radius)
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
g {
  position: relative;
}
text {
  text-transform: uppercase;
  font-weight: bold;
  opacity: 0.5;
}
</style>

<style>
g {
  position: relative;
}
text {
  text-transform: uppercase;
  font-weight: bold;
  opacity: 0.5;
}
</style>
