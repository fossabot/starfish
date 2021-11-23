<template>
  <div
    class="tooltipholder"
    :style="tooltipStyle"
    v-if="tooltip && !isMobile"
  >
    <div class="hovertooltip">
      <template v-if="tooltip.type">
        <ShipTooltipsImage
          v-if="tooltip.type === 'image'"
          :data="tooltip"
        />
        <ShipTooltipsContract
          v-if="tooltip.type === 'contract'"
          :data="tooltip"
        />
        <ShipTooltipsEngine
          v-else-if="
            tooltip.type === 'item' &&
            tooltip.itemType === 'engine'
          "
          :data="tooltip"
        />
        <ShipTooltipsCommunicator
          v-else-if="
            tooltip.type === 'item' &&
            tooltip.itemType === 'communicator'
          "
          :data="tooltip"
        />
        <ShipTooltipsScanner
          v-else-if="
            tooltip.type === 'item' &&
            tooltip.itemType === 'scanner'
          "
          :data="tooltip"
        />
        <ShipTooltipsWeapon
          v-else-if="
            tooltip.type === 'item' &&
            tooltip.itemType === 'weapon'
          "
          :data="tooltip"
        />
        <ShipTooltipsArmor
          v-else-if="
            tooltip.type === 'item' &&
            tooltip.itemType === 'armor'
          "
          :data="tooltip"
        />
        <ShipTooltipsChassis
          v-else-if="tooltip.type === 'chassis'"
          :data="tooltip"
        />
        <ShipTooltipsPlanet
          v-else-if="tooltip.type === 'planet'"
          :data="tooltip"
        />
        <ShipTooltipsComet
          v-else-if="tooltip.type === 'comet'"
          :data="tooltip"
        />
        <ShipTooltipsShipdot
          v-else-if="tooltip.type === 'ship'"
          :data="tooltip"
        />
        <ShipTooltipsCrewHeader
          v-else-if="tooltip.type === 'crewHeader'"
          :data="tooltip"
        />
        <ShipTooltipsCrewMember
          v-else-if="tooltip.type === 'crewMember'"
          :data="tooltip"
        />
        <ShipTooltipsShipheader
          v-else-if="tooltip.type === 'shipHeader'"
          :data="tooltip"
        />
        <ShipTooltipsCache
          v-else-if="tooltip.type === 'cache'"
          :data="tooltip"
          :key="tooltip.id"
        />
        <ShipTooltipsCargo
          v-else-if="tooltip.type === 'cargo'"
          :data="tooltip"
        />
        <ShipTooltipsZone
          v-else-if="tooltip.type === 'zone'"
          :data="tooltip"
        />
        <ShipTooltipsRoom
          v-else-if="tooltip.type === 'room'"
          :data="tooltip"
        />
        <ShipTooltipsSpecies
          v-else-if="tooltip.type === 'species'"
          :data="tooltip"
        />
        <ShipTooltipsDamage
          v-else-if="tooltip.type === 'damage'"
          :data="tooltip"
        />
        <ShipTooltipsReaction
          v-else-if="tooltip.type === 'reaction'"
          :data="tooltip"
        />
        <ShipTooltipsMass
          v-else-if="tooltip.type === 'mass'"
          :data="tooltip"
        />
        <div v-else>{{ tooltip }}</div>
      </template>
      <div v-else v-html="tooltip" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

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

      try {
        const { width } = this.$el.getBoundingClientRect()

        const sidePad = 25
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
      } catch (e) {
        this.tooltipStyle = {
          opacity: 0,
        }
      }
    },
  },
})
</script>

<style lang="scss">
.tooltipholder {
  pointer-events: none;
  position: absolute;
  perspective: 100em;
  --tooltip-pad-lr: 0.75em;
  --tooltip-pad-tb: 0.5em;
  z-index: 1001;
  font-size: 0.9rem;

  --panesectionpad-top: 0.6em;
}
.hovertooltip {
  max-width: 250px;
  font-weight: 400;
  background: #282828;
  color: var(--text);
  border-radius: 10px;
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

  & > * {
    padding: var(--tooltip-pad-tb) var(--tooltip-pad-lr);
  }
}
</style>
