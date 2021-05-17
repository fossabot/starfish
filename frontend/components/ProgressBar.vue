<template>
  <div class="bar">
    <div class="bg"></div>
    <div
      class="fill"
      :style="{
        width: percent * 100 + '%',
        background:
          percent <= dangerZone
            ? 'rgba(255,0,0,.4)'
            : color,
      }"
    ></div>
    <div
      class="label box"
      :style="{
        color:
          percent <= dangerZone
            ? 'rgba(255,0,0,1)'
            : 'inherit',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: {
    percent: { default: 1 },
    color: { default: '#333' },
    dangerZone: { default: 0.2 },
  },
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.bar {
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;

  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .fill {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .label {
    position: relative;
    width: 100%;
    height: 100%;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
}
</style>
