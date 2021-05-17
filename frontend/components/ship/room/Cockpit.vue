<template>
  <div class="cockpit box">
    <div>
      Target destination:
      {{
        crewMember.targetLocation
          ? crewMember.targetLocation.map(
              (tl) => Math.round(tl * 10000) / 10000,
            )
          : 'none'
      }}
    </div>

    <div v-if="planetsToShow.length">
      <h5>Planets</h5>
      <div
        v-for="planet in planetsToShow"
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
    planetsToShow(this: ComponentShape) {
      const p = [...(this.ship.visible.planets || [])]
      for (let seen of this.ship.seenPlanets) {
        if (!p.find((pl) => pl.name === seen.name))
          p.push(seen)
      }
      return p
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    setTarget(
      this: ComponentShape,
      target: CoordinatePair,
    ) {
      this.$store.commit('setTarget', target)
    },
  },
}
</script>

<style lang="scss" scoped>
.cockpit {
  position: relative;
}
</style>
