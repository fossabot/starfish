<template>
  <Box
    class="cockpit"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/10.jpg"
  >
    <template #title
      ><span class="sectionemoji">🛫</span>Cockpit</template
    >

    <div class="panesection">
      <div class="marbotsmall">
        <LimitedChargeButton
          class="marbottiny"
          :big="true"
          :max="crewMember.cockpitCharge"
          :animate="1"
          @end="thrust"
          @percent="thrustChargeToUse = arguments[0]"
          @mouseenter.native="
            $store.commit(
              'tooltip',
              `Click and hold to use your charged thrust!`,
            )
          "
          @mouseleave.native="reset"
          @mousedown.native="reset"
        >
          Thrust
          <span
            v-if="thrustChargeToUse"
            class="chargecounter nowrap"
          >
            &nbsp;(+{{
              c.speedNumber(
                maxPossibleSpeedChange *
                  crewMember.cockpitCharge *
                  thrustChargeToUse,
              )
            }})
          </span>
        </LimitedChargeButton>
        <LimitedChargeButton
          :class="{
            disabled:
              ship.velocity[0] === 0 &&
              ship.velocity[1] === 0,
          }"
          :big="true"
          :max="crewMember.cockpitCharge"
          :animate="1"
          :disabled="
            ship.velocity[0] === 0 && ship.velocity[1] === 0
          "
          @percent="brakeChargeToUse = arguments[0]"
          @end="brake"
          @mouseenter.native="
            $store.commit(
              'tooltip',
              `Click and hold to use your charged thrust to stop the ship. ${
                ship.gameSettings.brakeToThrustRatio *
                passiveBrakeMultiplier
              }x more powerful than thrusting.`,
            )
          "
          @mouseleave.native="reset"
          @mousedown.native="reset"
        >
          Brake
          <span
            v-if="brakeChargeToUse"
            class="chargecounter nowrap"
          >
            &nbsp;(-{{
              c.speedNumber(
                maxPossibleSpeedChange *
                  ship.gameSettings.brakeToThrustRatio *
                  crewMember.cockpitCharge *
                  brakeChargeToUse *
                  passiveBrakeMultiplier,
              )
            }})
          </span>
        </LimitedChargeButton>
      </div>

      <div
        v-tooltip="
          `The percent of the engines' power that you have charged. This percent is unique to you. <hr />Your charge speed goes up as you gain levels in <b>piloting</b>.
          <br /><br />
          Charge builds slowly even while in the bunk.`
        "
      >
        Charge:
        <NumberChangeHighlighter
          :number="
            c.r2(
              crewMember.cockpitCharge * maxCharge * 100,
              0,
            )
          "
          :display="
            c.r2(
              crewMember.cockpitCharge * maxCharge * 100,
              0,
            ) + '%'
          "
        />
        <span
          class="sub"
          v-if="maxCharge > crewMember.cockpitCharge"
          >(Full in
          {{
            c.msToTimeString(
              ((maxCharge - crewMember.cockpitCharge) /
                c.getCockpitChargePerTickForSingleCrewMember(
                  pilotingSkill,
                ) /
                passiveChargeBoost) *
                c.tickInterval,
            )
          }})</span
        >
      </div>
      <div
        v-tooltip="
          `The amount of speed that you can apply to the ship. 
          <p>
            Braking is <b>${
              ship.gameSettings.brakeToThrustRatio *
              passiveBrakeMultiplier
            }x</b> more effective than thrusting.
          </p>
          <hr />
          <p>
            Scales with your charge percent, engine base thrust and repair, your current level in <b>piloting</b>, and lower ship mass.
          </p>
          <p>
            Final speed will take into account the ship's current trajectory.
          </p>`
        "
      >
        Applicable Speed:
        <NumberChangeHighlighter
          :number="c.speedNumber(possibleSpeedChange, true)"
        /><span class="sub marlefttiny"
          >/<NumberChangeHighlighter
            :number="c.speedNumber(maxPossibleSpeedChange)"
        /></span>
      </div>
    </div>

    <div
      class="panesection"
      v-if="
        ship.visible &&
        (ship.visible.ships.length ||
          planetsToShow.length ||
          ship.visible.caches.length)
      "
    >
      <div>
        <div class="panesubhead">Set Target</div>
      </div>

      <span
        v-for="planet in planetsToShow"
        :key="'gotoplanet' + planet.name"
      >
        <button
          @click="setTarget(planet.location)"
          :class="{
            secondary:
              !planet ||
              !planet.location ||
              !crewMember ||
              !crewMember.targetLocation ||
              planet.location[0] !==
                crewMember.targetLocation[0] ||
              planet.location[1] !==
                crewMember.targetLocation[1],
          }"
          v-tooltip="{ type: 'planet', id: planet.id }"
        >
          <span :style="{ color: planet.color }"
            >🪐{{ planet.name }}</span
          >
        </button> </span
      ><span
        v-for="otherShip in ship.visible.ships"
        v-if="otherShip"
        :key="'gotoship' + otherShip.id"
        v-tooltip="{ type: 'ship', id: ship.id }"
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
          <span>🚀{{ otherShip.name }}</span>
        </button></span
      ><span
        v-for="cache in cachesToShow"
        :key="'gotocache' + cache.id"
        v-tooltip="{ type: 'cache', id: cache.id }"
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
          <span
            >📦Cache (<AngleArrow :angle="cache.angle" />
            {{
              c.speedNumber(cache.distance, true, 0)
            }}
            km)</span
          >
        </button>
      </span>

      <div class="sub padtopsmall">
        Click on the map or a button above to set your
        target destination.
      </div>
    </div>

    <div class="thrustbg" :class="{ animateThrust }"></div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      c,
      thrustChargeToUse: 0,
      brakeChargeToUse: 0,
      animateThrust: false,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    highlight(): boolean {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'room'
      )
    },
    activeEngines(): ItemStub[] {
      return (
        this.ship?.items.filter(
          (e: ItemStub) =>
            e.type === 'engine' && (e.repair || 0) > 0,
        ) || []
      )
    },
    engineThrustAmplification(): number {
      return Math.max(
        c.noEngineThrustMagnitude,
        this.activeEngines.reduce(
          (total: number, e: EngineStub) =>
            total +
            (e.thrustAmplification || 0) * (e.repair || 0),
          0,
        ) *
          this.ship.gameSettings.baseEngineThrustMultiplier,
      )
    },
    pilotingSkill(): number {
      return (
        this.crewMember.skills.find(
          (s: XPData) => s && s.skill === 'piloting',
        )?.level || 1
      )
    },
    memberThrust(): number {
      return c.getThrustMagnitudeForSingleCrewMember(
        this.pilotingSkill,
        this.engineThrustAmplification,
        this.ship.gameSettings.baseEngineThrustMultiplier,
      )
    },
    maxPossibleSpeedChange(): number {
      return (
        (c.getThrustMagnitudeForSingleCrewMember(
          this.pilotingSkill,
          this.engineThrustAmplification,
          this.ship.gameSettings.baseEngineThrustMultiplier,
        ) /
          this.ship.mass) *
        60 *
        60
      )
    },
    possibleSpeedChange(): number {
      return (
        this.maxPossibleSpeedChange *
        this.crewMember.cockpitCharge
      )
    },
    maxCharge(): number {
      const baseMax =
        c.getMaxCockpitChargeForSingleCrewMember(
          this.pilotingSkill,
        )
      return baseMax
    },
    passiveChargeBoost(): number {
      const generalBoostMultiplier =
        c.getGeneralMultiplierBasedOnCrewMemberProximity(
          this.crewMember,
          this.ship.crewMembers,
        )
      return (
        generalBoostMultiplier *
        (1 +
          ((
            this.crewMember as CrewMemberStub
          ).passives?.reduce(
            (total, p: CrewPassiveData) =>
              p.id === 'boostCockpitChargeSpeed'
                ? total + (p.intensity || 0)
                : total,
            0,
          ) || 0) +
          ((this.ship as ShipStub).passives?.reduce(
            (total, p: ShipPassiveEffect) =>
              p.id === 'boostCockpitChargeSpeed'
                ? total + (p.intensity || 0)
                : total,
            0,
          ) || 0))
      )
    },
    passiveBrakeMultiplier(): number {
      return (
        1 +
        ((
          this.crewMember as CrewMemberStub
        ).passives?.reduce(
          (total, p: CrewPassiveData) =>
            p.id === 'boostBrake'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0) +
        ((this.ship as ShipStub).passives?.reduce(
          (total, p: ShipPassiveEffect) =>
            p.id === 'boostBrake'
              ? total + (p.intensity || 0)
              : total,
          0,
        ) || 0)
      )
    },
    planetsToShow(): PlanetStub[] {
      const p = [...(this.ship.visible?.planets || [])]
      for (let seen of this.ship.seenPlanets) {
        if (!p.find((pl) => pl.name === seen.name))
          p.push(seen)
      }
      return p
        .sort(
          (a: PlanetStub, b: PlanetStub) =>
            c.distance(this.ship.location, a.location) -
            c.distance(this.ship.location, b.location),
        )
        .slice(0, 6)
    },
    cachesToShow(): CacheStub[] {
      return this.ship?.visible?.caches
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
        .slice(0, 6)
    },
  },
  watch: {},
  mounted() {},
  methods: {
    reset(): void {
      this.$store.commit('tooltip')
      this.brakeChargeToUse = 0
      this.thrustChargeToUse = 0
    },
    setTarget(target: CoordinatePair): void {
      this.$store.commit('setTarget', target)
    },
    thrust(percent: number): void {
      this.animateThrust = true
      setTimeout(() => (this.animateThrust = false), 2000)
      const initialCharge = this.crewMember.cockpitCharge
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        cockpitCharge:
          this.crewMember.cockpitCharge -
          this.crewMember.cockpitCharge * percent,
      })
      this.thrustChargeToUse = 0
      ;(this as any).$socket.emit(
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
            this.$store.commit('updateACrewMember', {
              id: this.crewMember.id,
              cockpitCharge: initialCharge,
            })
            return
          }
          //   this.$store.dispatch('updateShip', res.data.ship)
          //   this.$store.commit(
          //     'updateACrewMember',
          //     res.data.crewMember,
          //   )
        },
      )
    },
    brake(percent: number): void {
      this.animateThrust = true
      setTimeout(() => (this.animateThrust = false), 2000)
      const initialCharge = this.crewMember.cockpitCharge
      this.$store.commit('updateACrewMember', {
        id: this.crewMember.id,
        cockpitCharge:
          this.crewMember.cockpitCharge -
          this.crewMember.cockpitCharge * percent,
      })
      this.brakeChargeToUse = 0
      ;(this as any).$socket.emit(
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
            this.$store.commit('updateACrewMember', {
              id: this.crewMember.id,
              cockpitCharge: initialCharge,
            })
            return
          }
          //   this.$store.dispatch('updateShip', res.data.ship)
          //   this.$store.commit(
          //     'updateACrewMember',
          //     res.data.crewMember,
          //   )
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.cockpit {
  position: relative;
  width: 320px;

  & > * {
    position: relative;
    z-index: 2;
  }
}

.thrustbg {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 180%;
  background: radial-gradient(
    rgb(215, 50, 0),
    rgba(255, 185, 65, 0.767),
    transparent,
    transparent
  );
  transform: scale(2, 1) translateY(-50%);
  opacity: 0;
  pointer-events: none;
}

.animateThrust {
  animation: 2s thrust ease-out 1;
}

@keyframes thrust {
  0%,
  100% {
    opacity: 0;
  }

  8% {
    opacity: 0.5;
  }
  25% {
    opacity: 0.4;
  }
}

.chargecounter {
  width: 5em;
}
</style>
