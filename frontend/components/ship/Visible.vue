<template>
  <div class="visiblepane box">
    <h4>Visible</h4>
    <div class="box" v-if="ship.visible.ships.length">
      <h5>Ships</h5>
      <div
        v-for="visibleShip in ship.visible.ships"
        :key="'visibleShip' + visibleShip.id"
      >
        {{ visibleShip.name }}
        {{ visibleShip.location }}
      </div>
    </div>

    <div class="box" v-if="ship.visible.planets.length">
      <h5>Planets</h5>
      <div
        v-for="visiblePlanet in ship.visible.planets"
        :key="'visiblePlanet' + visiblePlanet.name"
      >
        {{ visiblePlanet.name }}
        {{ visiblePlanet.location }}
      </div>
    </div>

    <div class="box" v-if="ship.visible.caches.length">
      <h5>Caches</h5>
      <div
        v-for="visibleCache in ship.visible.caches"
        :key="'visibleCache' + visibleCache.id"
      >
        {{ visibleCache }} {{ visibleCache.location }}
      </div>
    </div>

    <div
      class="box"
      v-if="ship.visible.attackRemnants.length"
    >
      <h5>Attack Remnants</h5>
      <div
        v-for="visibleAttackRemnant in ship.visible
          .attackRemnants"
        :key="
          'visibleAttackRemnant' + visibleAttackRemnant.id
        "
      >
        {{ visibleAttackRemnant }}
        {{ visibleAttackRemnant.start }}
      </div>
    </div>
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
  methods: {},
}
</script>

<style lang="scss" scoped>
.visiblepane {
  position: relative;
}
</style>
