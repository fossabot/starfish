<template>
  <div class="cockpit box">
    <div>
      Target destination:
      {{ crewMember.targetLocation || 'none' }}
    </div>

    <div v-if="ship.visible.planets.length">
      <h5>Planets</h5>
      <div
        v-for="planet in ship.visible.planets"
        :key="'gotoplanet' + planet.name"
      >
        <button @click="setTarget(planet.location)">
          Move toward {{ planet.name }} ({{
            planet.location
          }})
        </button>
      </div>
    </div>

    <div v-if="ship.visible.ships.length">
      <h5>Ships</h5>
      <div
        v-for="otherShip in ship.visible.ships"
        :key="'gotoship' + otherShip.id"
      >
        <button @click="setTarget(otherShip.location)">
          Move toward {{ otherShip.name }} ({{
            otherShip.location
          }})
        </button>
      </div>
    </div>

    <div v-if="ship.visible.caches.length">
      <h5>Caches</h5>
      <div
        v-for="cache in ship.visible.caches"
        :key="'gotocache' + Math.random()"
      >
        <button @click="setTarget(cache.location)">
          Move toward cache at {{ cache.location }}
        </button>
      </div>
    </div>

    <div>Engines: 1 2 3</div>
  </div>
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
    ...mapState(['ship', 'crewMember']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    setTarget(
      this: ComponentShape,
      target: CoordinatePair,
    ) {
      if (!this.crewMember) return
      const updates: Partial<ShipStub> = {
        id: this.crewMember.id,
        targetLocation: target,
      }
      this.$store.commit('updateACrewMember', updates)
      this.$socket?.emit(
        'crew:targetLocation',
        this.ship.id,
        this.crewMember.id,
        target,
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.cockpit {
  position: relative;
}
</style>
