<template>
  <Box class="map">
    <template #title>
      <span class="sectionemoji">{{ emoji }}</span
      >{{ label }}
    </template>
    <div
      class="panesection pad-none"
      :style="{ width: width + 'px' }"
    >
      <ShipMap
        :mapData="mapData"
        @mouseup="$store.commit('setTarget', arguments[0])"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  ship: ShipStub
  [key: string]: any
}

export default {
  props: {
    emoji: { default: '🗺' },
    interactive: { default: true },
    radius: {},
    blackout: { default: true },
    width: { default: 600 },
    buffer: { default: true },
    label: { default: 'Area Scan' },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['ship', 'userId']),
    mapData(this: ComponentShape) {
      return {
        center: this.ship.location,
        defaultRadius: this.radius || this.ship.radii.sight,
        interactive: this.interactive,
        blackout: this.blackout,
        buffer: this.buffer,
        planets: this.planetsToShow,
        ships: [
          ...(this.ship.visible.ships || []),
          this.ship,
        ],
        targetLines: this.targetLines,
        attackRemnants:
          this.ship.visible.attackRemnants || [],
        caches: this.ship.visible.caches || [],
        speed: this.ship.speed,
        radii: this.radii,
      }
    },
    radii(this: ComponentShape) {
      return [
        {
          radius: this.ship.radii.attack,
          label: 'Attack',
          label2:
            Math.round(this.ship.radii.attack * 100) / 100 +
            'AU',
          color: 'hsla(20, 70%, 70%, .6)',
        },
      ]
    },
    shipLocation(this: ComponentShape) {
      return this.ship.location
    },
    planetsToShow(this: ComponentShape) {
      const p = [...(this.ship.visible.planets || [])]
      for (let seen of this.ship.seenPlanets) {
        if (!p.find((pl) => pl.name === seen.name))
          p.push(seen)
      }
      return p
    },
    targetLines(this: ComponentShape) {
      return this.ship.crewMembers
        .filter(
          (c: CrewMemberStub) =>
            c.location === 'cockpit' && c.targetLocation,
        )
        .map((c: CrewMemberStub) => ({
          id: c.id,
          from: this.ship.location,
          to: c.targetLocation,
          highlight: c.id === this.userId,
        }))
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.panesection {
  background: var(--bg);
}
</style>
