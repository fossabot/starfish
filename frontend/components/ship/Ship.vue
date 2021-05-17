<template>
  <div class="ship" v-if="ship">
    <div class="box" v-if="ship">
      <h4>{{ ship.name }}</h4>
      <div class="box">
        <div>
          Location:
          <br />
          {{
            ship.location
              .map((l) => l.toFixed(5))
              .join(', ')
          }}
        </div>
      </div>

      <div class="box pad-none">
        <div class="arrow">
          <div>
            Speed: <br />
            {{
              Math.round(ship && ship.speed * 1000000) /
                1000000
            }}AU/s
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

      <div class="box">
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
          {{
            ship && ship.faction
              ? ship.faction.name
              : 'No Faction'
          }}
        </div>
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
  width: 200px;
  position: relative;
  grid-column: span 2;
}

.box {
  width: 100%;
}

.arrow {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5em !important;
  padding-right: 1.5em !important;

  svg {
    transition: transform 0.5s;
    margin-left: 1em;
    width: 35%;
  }
}
</style>
