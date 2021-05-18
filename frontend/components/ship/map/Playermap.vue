<template>
  <Box class="map">
    <template #title>
      <span class="sectionemoji">🗺</span>Area Scan
    </template>
    <div class="panesection pad-none">
      <ShipMap
        :data="data"
        @mouseup="$store.commit('setTarget', arguments[0])"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['ship', 'userId']),
    data(this: ComponentShape) {
      return {
        center: this.ship.location,
        defaultRadius: this.ship.sightRadius,
        planets: this.planetsToShow,
        ships: [
          ...(this.ship.visible.ships || []),
          this.ship,
        ],
        targetLines: this.targetLines,
        attackRemnants:
          this.ship.visible.attackRemnants || [],
      }
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
        .filter((c: any | undefined) => c.targetLocation)
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
  width: 500px;
}
</style>
