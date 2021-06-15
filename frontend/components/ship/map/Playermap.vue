<template>
  <Box class="map" v-if="show">
    <template #title>
      <span class="sectionemoji">{{ emoji }}</span
      >{{ label }}
    </template>
    <div
      class="panesection padnone"
      :style="{ width: width + 'px', background }"
    >
      <ShipMap
        :mapData="mapData"
        @mouseup="$store.commit('setTarget', arguments[0])"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
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
    background: {},
    width: { default: 600 },
    buffer: { default: true },
    label: { default: 'Area Scan' },
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'userId']),
    show(this: ComponentShape) {
      return this.ship
    },
    mapData(this: ComponentShape) {
      return {
        center: this.ship.location,
        defaultRadius: c.r2(
          this.radius || this.ship.radii.sight,
          3,
          true,
        ),
        interactive: this.interactive,
        blackout: this.blackout,
        buffer: this.buffer,
        planets: this.planetsToShow,
        ships: this.ships,
        shipPaths: this.shipPaths,
        targetLines: this.targetLines,
        attackRemnants:
          this.ship.visible?.attackRemnants || [],
        caches: this.ship.visible?.caches || [],
        speed: this.ship.speed,
        radii: this.radii,
        gameRadius: this.ship.radii.game,
        targetPoints: this.ship.tutorial?.targetLocation
          ? [this.ship.tutorial?.targetLocation]
          : [],
      }
    },
    ships(this: ComponentShape) {
      return [
        ...(this.ship.visible?.ships || []),
        this.ship,
      ]
    },
    radii(this: ComponentShape) {
      const r = []
      if (this.ship.radii.attack)
        r.push({
          radius: this.ship.radii.attack,
          label: 'Attack',
          label2: c.r2(this.ship.radii.attack, 2) + 'AU',
          color: 'hsla(20, 70%, 60%, .6)',
        })
      if (this.ship.radii.scan)
        r.push({
          radius: this.ship.radii.scan,
          label: 'Scan',
          label2: c.r2(this.ship.radii.scan, 2) + 'AU',
          color: 'hsla(190, 70%, 70%, .4)',
        })
      if (this.ship.radii.broadcast)
        r.push({
          radius: this.ship.radii.broadcast,
          label: 'Broadcast',
          label2: c.r2(this.ship.radii.broadcast, 2) + 'AU',
          color: 'hsla(300, 70%, 60%, .3)',
        })
      return r
    },
    shipLocation(this: ComponentShape) {
      return this.ship.location
    },
    planetsToShow(this: ComponentShape) {
      const p = [...(this.ship.visible?.planets || [])]
      for (let seen of this.ship.seenPlanets) {
        if (!p.find((pl) => pl.name === seen.name))
          p.push(seen)
      }
      // c.log(this.ship.seenPlanets, p.length)
      return p
    },
    targetLines(this: ComponentShape) {
      return (this.ship.crewMembers || [])
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
    shipPaths(this: ComponentShape) {
      return [
        ...this.ships.map((s: ShipStub) => ({
          id: s.id,
          color: s.faction ? s.faction.color : undefined,
          points: [...s.previousLocations, s.location],
        })),
        ...(this.ship.visible?.trails || []).map((t) => ({
          points: t,
          id: t[0][0],
          color: 'rgba(255, 255, 255, .6)',
        })),
      ]
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

  @media (max-width: 768px) {
    width: 100% !important;
  }
}
</style>
