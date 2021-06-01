<template>
  <div class="ship" v-if="ship">
    <Box v-if="ship">
      <template #title>
        <span class="sectionemoji">🚀</span>{{ ship.name }}
      </template>

      <div class="panesection" v-if="ship.planet">
        <div>At planet 🪐{{ ship.planet.name }}</div>
      </div>

      <div class="panesection">
        <div class="arrow" v-if="ship.speed > 0">
          <div>
            Speed: <br />
            {{ c.r2(ship && ship.speed * 60 * 60, 4) }}
            AU/hr
            <br />
            Angle: <br />
            {{ c.r2(ship && ship.direction, 2) }}°
          </div>
          <svg
            :style="{
              transform: `rotate(${ship &&
                ship.direction * -1}deg)`,
            }"
            width="604"
            height="233"
            viewBox="0 0 604 233"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="4.37114e-07"
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
        <div v-else>Stopped</div>
      </div>

      <ProgressBar :percent="ship._hp / ship._maxHp">
        <div>
          🇨🇭HP: {{ Math.round(ship._hp * 100) / 100 }}/{{
            Math.round(ship._maxHp * 100) / 100
          }}
        </div>
      </ProgressBar>

      <div class="panesection">
        <div>
          Model:
          <span
            @mouseenter="
              $store.commit('tooltip', {
                type: 'chassis',
                data: ship.chassis,
              })
            "
            @mouseleave="$store.commit('tooltip')"
            >🚀{{ ship && ship.chassis.displayName }}</span
          >
        </div>
        <div
          @mouseenter="
            $store.commit(
              'tooltip',
              `The ship's shared pool of credits. The captain can spend the common fund on new items for the ship.`,
            )
          "
          @mouseleave="$store.commit('tooltip')"
        >
          Common Fund: 💳{{
            ship && c.r2(ship.commonCredits)
          }}
        </div>
        <div>
          Captain:
          {{
            ship && ship.crewMembers
              ? ship.crewMembers.find(
                  (cm) => cm.id === ship.captain,
                ).name
              : 'No Captain'
          }}
        </div>
        <div>
          Crew Members:
          {{
            ship &&
              ship.crewMembers &&
              ship.crewMembers.length
          }}
        </div>
        <div>
          Species:
          {{ ship && ship.species.icon
          }}{{ ship && c.capitalize(ship.species.id) }}
        </div>
        <div>
          Faction:
          <span
            :style="{
              color:
                ship && ship.faction
                  ? ship.faction.color
                  : '',
            }"
          >
            {{
              ship && ship.faction
                ? ship.faction.name
                : 'No Faction'
            }}
          </span>
        </div>
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
    return { c }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    isCaptain(this: ComponentShape) {
      return this.ship?.captain === this.userId
    },
    crewByRoom(
      this: ComponentShape,
    ): { room: string; crewMembers: CrewMemberStub[] }[] {
      const byRoom: {
        room: string
        crewMembers: CrewMemberStub[]
      }[] = []
      for (let room of this.ship
        ?.availableRooms as string[]) {
        byRoom.push({
          room,
          crewMembers: this.ship?.crewMembers.filter(
            (cm: CrewMemberStub) => cm.location === room,
          ),
        })
      }
      return byRoom
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.ship {
  width: 230px;
  position: relative;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    margin-left: 0.5em;
    margin-right: 0em;
    transition: transform 0.5s;
    width: 33%;
    height: 50px;
  }
}
</style>
