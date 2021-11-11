<template>
  <div class="contractholder flexcolumn">
    <div
      class="contract flexcolumn"
      :class="{
        captain: isCaptain,
        stolen: contract.status === 'stolen',
        done: contract.status === 'done',
      }"
      v-targetpoint="
        seen
          ? {
              type: ship,
              location: seen.location,
              color: seen.guildId
                ? c.guilds[seen.guildId].color
                : `#bb0`,
            }
          : {
              type: 'zone',
              location: contract.lastSeenLocation,
              radius:
                ship.gameSettings.contractLocationRadius,
              color: contract.targetGuildId
                ? c.guilds[contract.targetGuildId].color
                : `#bb0`,
            }
      "
      @click="
        setTarget(
          seen ? seen.location : contract.lastSeenLocation,
        )
      "
    >
      <div class="marbotsmall">
        <span
          class="name bold"
          :style="{
            color: contract.targetGuildId
              ? c.guilds[contract.targetGuildId].color
              : '',
          }"
        >
          <!-- v-tooltip="{
        type: 'ship',
        id: contract.targetId,
      }" -->
          {{ contract.targetName }}
        </span>
        <span class="difficulty sub">
          ({{
            contract.difficulty < 5
              ? 'Easy'
              : contract.difficulty < 10
              ? 'Medium'
              : contract.difficulty < 20
              ? 'Hard'
              : contract.difficulty < 40
              ? 'Murderous'
              : 'Insane'
          }})
        </span>
      </div>

      <div class="flex">
        <div
          class="timeallowed"
          v-if="timeLeft && contract.status === 'active'"
        >
          {{ c.msToTimeString(timeLeft) }}
          <span class="sub">left</span>
        </div>
        <div class="done" v-if="contract.status === 'done'">
          <span class="success">Done!</span> Return to
          <span
            :style="{
              color: returnPlanet ? returnPlanet.color : '',
            }"
            >{{
              returnPlanet
                ? returnPlanet.name
                : 'starting planet'
            }}</span
          >
        </div>
        <div
          class="stolen"
          v-if="contract.status === 'stolen'"
        >
          <span class="warning">Stolen!</span> Return to
          <span
            :style="{
              color: returnPlanet ? returnPlanet.color : '',
            }"
            >{{
              returnPlanet
                ? returnPlanet.name
                : 'starting planet'
            }}</span
          >
          for half reward
        </div>
        <div class="marleft reward success">
          {{ c.priceToString(contract.reward) }}
        </div>
      </div>

      <template v-if="contract.status === 'active'">
        <div
          class="arrow"
          v-if="
            (ship.visible &&
              ship.visible.ships.find(
                (s) => s.id === contract.targetId,
              )) ||
            (contract.lastSeenLocation &&
              distanceTo >
                ship.gameSettings.contractLocationRadius)
          "
          :style="{
            opacity:
              1 /
              (distanceTo /
                (ship.gameSettings.contractLocationRadius *
                  2)),
          }"
        >
          <svg
            :style="{
              transform: `rotate(${angleTo}deg)`,
            }"
            width="404"
            height="233"
            viewBox="300 0 604 233"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="300"
              y1="116"
              x2="604"
              y2="116"
              stroke="white"
              stroke-width="10"
            />
            <line
              x1="600.464"
              y1="115.536"
              x2="488.464"
              y2="3.53553"
              stroke="white"
              stroke-width="10"
            />
            <line
              y1="-5"
              x2="158.392"
              y2="-5"
              transform="matrix(-0.707107 0.707107 0.707107 0.707107 604 121)"
              stroke="white"
              stroke-width="10"
            />
          </svg>
        </div>
        <div v-else class="near sub">Near</div>
      </template>
      <!-- {{ contract }} -->
    </div>
    <button
      class="abandon small secondary"
      @click="abandon"
    >
      <span>Abandon</span>
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    contract: { type: Object as PropType<Contract> },
  },
  data() {
    return { c, timeLeft: 0, angleTo: 0, distanceTo: 0 }
  },
  computed: {
    ...mapState([
      'ship',
      'crewMember',
      'userId',
      'isCaptain',
    ]),
    returnPlanet(): PlanetStub {
      c.log(this.ship.seenPlanets.map((p) => p.id))
      return this.ship.seenPlanets.find(
        (p) => p.id === this.contract.fromPlanetId,
      )
    },
    seen(): ShipStub | undefined {
      return this.ship.visible?.ships.find(
        (s) => s.id === this.contract.targetId,
      )
    },
  },
  watch: {},
  mounted() {
    this.update()
    setInterval(this.update, 1000 * 60)
  },
  methods: {
    update() {
      this.timeLeft = Math.max(
        0,
        this.contract.timeAccepted +
          this.contract.timeAllowed -
          Date.now(),
      )

      this.distanceTo = c.distance(
        this.contract.lastSeenLocation,
        this.ship.location,
      )

      this.angleTo = this.seen
        ? c.mirrorAngleVertically(
            c.angleFromAToB(
              this.seen.location,
              this.ship.location,
            ),
          )
        : c.mirrorAngleVertically(
            c.angleFromAToB(
              this.contract.lastSeenLocation,
              this.ship.location,
            ),
          )
    },

    abandon() {
      if (!confirm('Really abandon this contract?')) return
      ;(this as any).$socket?.emit(
        'ship:abandonContract',
        this.ship.id,
        this.crewMember?.id,
        this.contract.id,
        (res: IOResponse<true>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },

    setTarget(target: CoordinatePair): void {
      this.$store.commit('setTarget', target)
    },
  },
})
</script>

<style lang="scss" scoped>
.contractholder {
  margin-bottom: 0.5em;
}

.contract {
  box-shadow: 0 0 0 1px rgba(white, 0.2);
  width: 100%;
  padding: 0.7em 1em;
  text-align: left;
  position: relative;
  border-radius: 5px;

  &.stolen {
    box-shadow: 0 0 0 1px var(--warning);
  }
  &.done {
    box-shadow: 0 0 0 1px var(--success);
  }
  &.captain {
    border-bottom-right-radius: 0;
  }
}

.arrow {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0em;
  top: 50%;
  transform: translateY(-50%);

  svg {
    padding-left: 15px;
    width: 60px;
    height: 25px;
  }
}
.near {
  position: absolute;
  right: 1.3em;
  top: 50%;
  transform: translateY(-50%);
}
.reward {
  flex-shrink: 0;
}

.abandon {
  align-self: flex-end;
  margin-top: 0px;
  margin-right: -1px;

  &:after,
  &:before,
  & {
    border-top-right-radius: 0 !important;
    border-top-left-radius: 0 !important;
  }
}
</style>
