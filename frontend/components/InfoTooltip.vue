<template>
  <div class="tooltip" v-if="tooltip" :style="tooltipStyle">
    <template v-if="tooltip.type">
      <ShipTooltipsEngine
        v-if="tooltip.type === 'engine'"
        :data="tooltip.data"
      />
      <ShipTooltipsCommunicator
        v-if="tooltip.type === 'communicator'"
        :data="tooltip.data"
      />
      <ShipTooltipsScanner
        v-if="tooltip.type === 'scanner'"
        :data="tooltip.data"
      />
      <ShipTooltipsWeapon
        v-if="tooltip.type === 'weapon'"
        :data="tooltip.data"
      />
      <ShipTooltipsArmor
        v-if="tooltip.type === 'armor'"
        :data="tooltip.data"
      />
      <ShipTooltipsChassis
        v-if="tooltip.type === 'chassis'"
        :data="tooltip.data"
      />
      <ShipTooltipsPlanet
        v-if="tooltip.type === 'planet'"
        :data="tooltip.data"
      />
      <ShipTooltipsShipdot
        v-if="tooltip.type === 'ship'"
        :data="tooltip.data"
      />
      <ShipTooltipsCache
        v-if="tooltip.type === 'cache'"
        :data="tooltip.data"
      />
    </template>
    <div v-else v-html="tooltip" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'infoTooltip',
  props: {},
  data() {
    return {
      tooltipStyle: {},
      x: 0,
      y: 0,
    }
  },
  computed: {
    ...mapState(['isMobile', 'tooltip']),
    winWidth() {
      return this.$store.state.winSize[0]
    },
  },
  watch: {
    tooltip() {
      this.recalcTooltipStyle()
    },
    winWidth() {
      this.recalcTooltipStyle()
    },
  },
  mounted() {
    window.addEventListener('mousemove', this.mouseMove)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.mouseMove)
  },
  methods: {
    mouseMove(e) {
      if (!this.tooltip) return
      this.x = e.pageX
      this.y = e.pageY
      this.recalcTooltipStyle()
    },
    async recalcTooltipStyle() {
      if (!this.tooltip)
        return (this.tooltipStyle = { opacity: 0 })

      await this.$nextTick()

      const {
        right,
        width,
      } = this.$el.getBoundingClientRect()

      const sidePad = 15
      let left = this.x + sidePad,
        top = this.y - 5,
        transform = ''

      if (left + width >= this.winWidth - sidePad) {
        left = this.winWidth - width - sidePad
        transform = 'translateY(30px)'
      }

      this.tooltipStyle = {
        left: left + 'px',
        top: top + 'px',
        transform,
        opacity: 1,
      }
    },
  },
}
</script>

<style scoped lang="scss">
.tooltip {
  position: absolute;
  z-index: 100;
  font-size: 0.9rem;
  max-width: 250px;
  font-weight: 400;
  padding: 0.5em 0.75em;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--pane-border);
  // transition: transform 0.2s;
  pointer-events: none;
}
</style>
