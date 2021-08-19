<template
  ><transition name="fadein">
    <div
      class="tooltipholder"
      :style="tooltipStyle"
      v-if="tooltip && !isMobile"
    >
      <div class="hovertooltip">
        <template v-if="tooltip.type">
          <ShipTooltipsEngine
            v-if="tooltip.type === 'engine'"
            :data="tooltip.data"
          />
          <ShipTooltipsCommunicator
            v-else-if="tooltip.type === 'communicator'"
            :data="tooltip.data"
          />
          <ShipTooltipsScanner
            v-else-if="tooltip.type === 'scanner'"
            :data="tooltip.data"
          />
          <ShipTooltipsWeapon
            v-else-if="tooltip.type === 'weapon'"
            :data="tooltip.data"
          />
          <ShipTooltipsArmor
            v-else-if="tooltip.type === 'armor'"
            :data="tooltip.data"
          />
          <ShipTooltipsChassis
            v-else-if="tooltip.type === 'chassis'"
            :data="tooltip.data"
          />
          <ShipTooltipsPlanet
            v-else-if="tooltip.type === 'planet'"
            :data="tooltip.data"
          />
          <ShipTooltipsShipdot
            v-else-if="tooltip.type === 'ship'"
            :data="tooltip.data"
          />
          <ShipTooltipsCache
            v-else-if="tooltip.type === 'cache'"
            :data="tooltip.data"
            :key="tooltip.data.id"
          />
          <ShipTooltipsCargo
            v-else-if="tooltip.type === 'cargo'"
            :data="tooltip.data"
          />
          <ShipTooltipsZone
            v-else-if="tooltip.type === 'zone'"
            :data="tooltip.data"
          />
          <ShipTooltipsRoom
            v-else-if="tooltip.type === 'room'"
            :data="tooltip.data"
          />
          <ShipTooltipsSpecies
            v-else-if="tooltip.type === 'species'"
            :data="tooltip.data"
          />
          <div v-else>{{ tooltip }}</div>
        </template>
        <div v-else v-html="tooltip" />
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
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
      if (!this.tooltip || !this.$el)
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
})
</script>

<style lang="scss">
.tooltipholder {
  position: absolute;
  perspective: 100em;
  --tooltip-pad-lr: 0.75em;
  --tooltip-pad-tb: 0.5em;
  z-index: 100;
  font-size: 0.9rem;
}
.hovertooltip {
  max-width: 250px;
  font-weight: 400;
  padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
  background: #282828;
  color: var(--text);
  border-radius: 10px;
  pointer-events: none;
  overflow: hidden;
  display: flex;
  box-shadow: 0 2em 6em 0 var(--bg), 0 1em 2em 0 var(--bg),
    0 0.5em 1em 0 var(--bg);
  // transform: rotateY(-10deg); // * for 3d effect

  hr {
    border: none;
    border-top: 1px solid var(--text);
    opacity: 0.2;
    margin: 0.5em -2em;
    width: 200%;
  }
}
</style>
