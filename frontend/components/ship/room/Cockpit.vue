<template>
  <Box class="cockpit" :highlight="highlight">
    <template #title
      ><span class="sectionemoji">🛫</span>Cockpit</template
    >

    <div
      class="panesection"
      v-if="
        ship.visible.ships.length ||
          planetsToShow.length ||
          ship.visible.caches.length
      "
    >
      <div>
        <div class="panesubhead">Move Toward</div>
      </div>

      <div class="sub padbotsmall">
        Click on the map or a button below to set your
        target destination.
      </div>

      <span
        v-for="planet in planetsToShow"
        :key="'gotoplanet' + planet.name"
      >
        <button
          @click="setTarget(planet.location)"
          :class="{
            secondary:
              !crewMember.targetLocation ||
              planet.location[0] !==
                crewMember.targetLocation[0] ||
              planet.location[1] !==
                crewMember.targetLocation[1],
          }"
        >
          <span :style="{ color: planet.color }"
            >🪐{{ planet.name }}</span
          >
        </button> </span
      ><span
        v-for="otherShip in ship.visible.ships"
        :key="'gotoship' + otherShip.id"
      >
        <button
          @click="setTarget(otherShip.location)"
          :class="{
            secondary:
              !crewMember.targetLocation ||
              otherShip.location[0] !==
                crewMember.targetLocation[0] ||
              otherShip.location[1] !==
                crewMember.targetLocation[1],
          }"
        >
          🚀{{ otherShip.name }}
        </button></span
      ><span
        v-for="cache in cachesToShow"
        :key="'gotocache' + cache.id"
      >
        <button
          @click="setTarget(cache.location)"
          :class="{
            secondary:
              !crewMember.targetLocation ||
              cache.location[0] !==
                crewMember.targetLocation[0] ||
              cache.location[1] !==
                crewMember.targetLocation[1],
          }"
        >
          📦Cache (<AngleArrow :angle="cache.angle" />
          {{ Math.round(cache.distance * 1000) / 1000 }}AU)
        </button>
      </span>
    </div>

    <div class="panesection">
      <div
        @mouseenter="
          $store.commit(
            'tooltip',
            `The base amount of thrust that can be generated from the ship's engines. Goes up with higher engine repair and better engines.`,
          )
        "
        @mouseleave="$store.commit('tooltip')"
      >
        Base thrust from engines:
        {{ c.r2(engineThrustAmplification) }} kg/m^2/s? or
        something
      </div>
      <div
        @mouseenter="
          $store.commit(
            'tooltip',
            `The percent of the engines' max thrust you have charged, that can be released as thrust. This percent is unique to you. Your maximum percent goes up as you gain levels in <b>piloting</b>.`,
          )
        "
        @mouseleave="$store.commit('tooltip')"
      >
        Charge:
        {{
          c.r2(
            crewMember.cockpitCharge *
              c.getMaxCockpitChargeForSingleCrewMember(
                pilotingSkill,
              ) *
              100,
            1,
          ) +
            '% / ' +
            c.r2(
              c.getMaxCockpitChargeForSingleCrewMember(
                pilotingSkill,
              ) * 100,
              1,
            ) +
            '%'
        }}
      </div>
      <div
        class="marbotsmall"
        @mouseenter="
          $store.commit(
            'tooltip',
            `The maximum amount of thrust that you can generate currently.`,
          )
        "
        @mouseleave="$store.commit('tooltip')"
      >
        Available Thrust:
        <NumberChangeHighlighter
          :number="
            c.r2(
              c.getMaxCockpitChargeForSingleCrewMember(
                pilotingSkill,
              ) *
                crewMember.cockpitCharge *
                engineThrustAmplification,
            )
          "
        />
        xyz
      </div>
      <div>
        <LimitedChargeButton
          :max="crewMember.cockpitCharge"
          @end="thrust"
          @percent="thrustChargeToUse = arguments[0]"
          @mouseenter.native="
            $store.commit(
              'tooltip',
              `Click and hold to use your charged thrust!`,
            )
          "
          @mouseleave.native="$store.commit('tooltip')"
          @mousedown.native="$store.commit('tooltip')"
        >
          Thrust
          <span v-if="thrustChargeToUse">
            ({{
              c.r2(
                thrustChargeToUse *
                  c.getMaxCockpitChargeForSingleCrewMember(
                    pilotingSkill,
                  ) *
                  crewMember.cockpitCharge *
                  engineThrustAmplification,
              )
            }}
            xyz)
          </span>
        </LimitedChargeButton>
        <LimitedChargeButton
          :class="{
            disabled:
              ship.velocity[0] === 0 &&
              ship.velocity[1] === 0,
          }"
          :max="crewMember.cockpitCharge"
          :disabled="
            ship.velocity[0] === 0 && ship.velocity[1] === 0
          "
          @percent="brakeChargeToUse = arguments[0]"
          @end="brake"
          @mouseenter.native="
            $store.commit(
              'tooltip',
              `Click and hold to use your charged thrust to stop the ship.`,
            )
          "
          @mouseleave.native="$store.commit('tooltip')"
          @mousedown.native="$store.commit('tooltip')"
        >
          Brake
          <span v-if="brakeChargeToUse">
            ({{
              c.r2(
                brakeChargeToUse *
                  c.getMaxCockpitChargeForSingleCrewMember(
                    pilotingSkill,
                  ) *
                  crewMember.cockpitCharge *
                  engineThrustAmplification,
              )
            }}
            xyz)
          </span>
        </LimitedChargeButton>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c, thrustChargeToUse: 0, brakeChargeToUse: 0 }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    planetsToShow(this: ComponentShape) {
      const p = [...(this.ship.visible.planets || [])]
      for (let seen of this.ship.seenPlanets) {
        if (!p.find((pl) => pl.name === seen.name))
          p.push(seen)
      }
      return p.sort(
        (a: PlanetStub, b: PlanetStub) =>
          c.distance(this.ship.location, a.location) -
          c.distance(this.ship.location, b.location),
      )
    },
    activeEngines(this: ComponentShape) {
      return (
        this.ship?.items.filter(
          (e: ItemStub) =>
            e.type === 'engine' && (e.repair || 0) > 0,
        ) || []
      )
    },
    engineThrustAmplification(this: ComponentShape) {
      return Math.max(
        c.noEngineThrustMagnitude,
        this.activeEngines.reduce(
          (total: number, e: EngineStub) =>
            total +
            (e.thrustAmplification || 0) * (e.repair || 0),
          0,
        ),
      )
    },
    pilotingSkill(this: ComponentShape) {
      return (
        this.crewMember.skills.find(
          (s: XPData) => s.skill === 'piloting',
        )?.level || 1
      )
    },
    memberThrust(this: ComponentShape) {
      return c.getThrustMagnitudeForSingleCrewMember(
        this.pilotingSkill,
        this.engineThrustAmplification,
      )
    },
    cachesToShow(this: ComponentShape) {
      return this.ship?.visible.caches
        .map((cache: CacheStub) => ({
          ...cache,
          distance: c.distance(
            this.ship.location,
            cache.location,
          ),
          angle: c.angleFromAToB(
            this.ship.location,
            cache.location,
          ),
        }))
        .sort((a: any, b: any) => a.distance - b.distance)
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
    thrust(percent: number) {
      this.thrustChargeToUse = 0
      this.$socket.emit(
        'crew:thrust',
        this.ship.id,
        this.crewMember.id,
        percent,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('updateShip', res.data)
        },
      )
    },
    brake(percent: number) {
      this.brakeChargeToUse = 0
      this.$socket.emit(
        'crew:brake',
        this.ship.id,
        this.crewMember.id,
        percent,
        (res: IOResponse<ShipStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
          this.$store.dispatch('updateShip', res.data)
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.cockpit {
  position: relative;
  width: 300px;
}
</style>
