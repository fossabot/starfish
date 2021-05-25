<template>
  <div class="progressbar" :class="{ mini }">
    <div class="bg"></div>
    <div
      class="fill"
      :style="{
        width: Math.min(percent, 1) * 100 + '%',
        background:
          percent <= dangerZone
            ? 'rgba(255,0,0,.4)'
            : color,
      }"
    ></div>
    <div
      class="label pad-pane"
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
    mini: {},
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
.progressbar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-top: 1px solid var(--pane-border);
  border-left: 1px solid var(--pane-border);
  border-bottom: 0;
  box-shadow: 0 1px 0 0 var(--pane-border),
    0.5px 0 0 0 var(--pane-border);

  &.mini .label {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
  }

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
