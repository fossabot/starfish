<template>
  <div class="visiblepane">
    <Box>
      <template #title
        ><span class="sectionemoji">📡</span
        >Visible</template
      >
      <div
        class="panesection"
        v-if="
          !ship.visible.ships.length &&
            !ship.visible.planets.length &&
            !ship.visible.caches.length
        "
      >
        <div class="sub">Nothing on scanners.</div>
      </div>
      <div
        class="panesection"
        v-if="ship.visible.ships.length"
      >
        <div class="panesubhead">Ships</div>
        <div
          v-for="visibleShip in ship.visible.ships"
          :key="'visibleShip' + visibleShip.id"
        >
          {{ visibleShip.name }}
          {{ visibleShip.location }}
        </div>
      </div>

      <div
        class="panesection"
        v-if="ship.visible.planets.length"
      >
        <div class="panesubhead">Planets</div>
        <div
          v-for="visiblePlanet in ship.visible.planets"
          :key="'visiblePlanet' + visiblePlanet.name"
        >
          {{ visiblePlanet.name }}
          {{ visiblePlanet.location }}
        </div>
      </div>

      <div
        class="panesection"
        v-if="ship.visible.caches.length"
      >
        <div class="panesubhead">Caches</div>
        <div
          v-for="visibleCache in ship.visible.caches"
          :key="'visibleCache' + visibleCache.id"
        >
          {{ visibleCache }} {{ visibleCache.location }}
        </div>
      </div>

      <!-- <div
      class="panesection"
      v-if="ship.visible.attackRemnants.length"
    >
      <div class="panesubhead">Attack Remnants</div>
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
    </div> -->
    </Box>
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
  width: 200px;
}
</style>
