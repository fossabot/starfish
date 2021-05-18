<template>
  <div class="ship" v-if="ship">
    <Box v-if="ship">
      <template #title>
        <span class="sectionemoji">🚀</span>{{ ship.name }}
      </template>
      <!-- <div class="panesection">
        <div>
          Location:
          <br />
          {{
            ship.location
              .map((l) => l.toFixed(5))
              .join(', ')
          }}
        </div>
      </div> -->

      <div class="panesection">
        <div class="arrow">
          <div>
            Speed: <br />
            {{
              Math.round(
                ship && ship.speed * 60 * 60 * 10000,
              ) / 10000
            }}
            AU/hr
            <br />
            Angle: <br />
            {{
              Math.round(ship && ship.direction * 100) /
                100
            }}°
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
      </div>

      <ProgressBar :percent="ship._hp / ship._maxHp">
        <div>
          HP: {{ Math.round(ship._hp * 100) / 100 }}/{{
            Math.round(ship._maxHp * 100) / 100
          }}
        </div>
      </ProgressBar>

      <div class="panesection">
        <div>
          Sight Radius:
          {{ ship && ship.sightRadius }} AU
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
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
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
  width: 220px;
  position: relative;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    margin-left: 1em;
    margin-right: 0em;
    transition: transform 0.5s;
    width: 35%;
    height: 50px;
  }
}
</style>
