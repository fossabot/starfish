<template>
  <div class="visiblepane" v-if="show">
    <Box>
      <template #title
        ><span class="sectionemoji">📡</span
        >Visible</template
      >
      <div class="overflowbox">
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
        <div class="panesection" v-else>
          <div
            v-for="visibleShip in ship.visible.ships.map(
              angleAndDistance,
            )"
            :key="'visibleShip' + visibleShip.id"
            v-tooltip="{
              type: 'ship',
              data: visibleShip,
            }"
          >
            <span
              :style="{ color: visibleShip.faction.color }"
              >🚀{{ visibleShip.name }}</span
            >
            <div
              class="inline"
              v-if="visibleShip.distance > 0.001"
            >
              (<AngleArrow :angle="visibleShip.angle" />
              {{
                Math.round(visibleShip.distance * 1000) /
                  1000
              }}AU)
            </div>
            <span v-else>
              (Here)
            </span>
          </div>

          <div
            v-for="visiblePlanet in ship.visible.planets.map(
              angleAndDistance,
            )"
            :key="'visiblePlanet' + visiblePlanet.name"
            v-tooltip="{
              type: 'planet',
              data: visiblePlanet,
            }"
          >
            <span :style="{ color: visiblePlanet.color }"
              >🪐{{ visiblePlanet.name }}</span
            >
            <div
              class="inline"
              v-if="visiblePlanet.distance > 0.001"
            >
              (<AngleArrow :angle="visiblePlanet.angle" />
              {{
                Math.round(visiblePlanet.distance * 1000) /
                  1000
              }}AU)
            </div>
            <span v-else>
              (Here)
            </span>
          </div>

          <div
            v-for="visibleCache in ship.visible.caches.map(
              angleAndDistance,
            )"
            :key="'visibleCache' + visibleCache.id"
            v-tooltip="{
              type: 'cache',
              data: visibleCache,
            }"
          >
            📦Cache (<AngleArrow
              :angle="visibleCache.angle"
            />
            {{
              Math.round(visibleCache.distance * 1000) /
                1000
            }}AU)
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
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import c from '../../../common/src'
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
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('visible'))
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    angleAndDistance(el: any) {
      return {
        ...el,
        distance: c.distance(
          this.ship.location,
          el.location,
        ),
        angle: c.angleFromAToB(
          this.ship.location,
          el.location,
        ),
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.visiblepane {
  position: relative;
  width: 260px;
}

.overflowbox {
  max-height: 210px;
  overflow-y: auto;
}
</style>
