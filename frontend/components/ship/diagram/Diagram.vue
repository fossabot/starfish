<template>
  <div class="holder" v-if="show">
    <Box
      :highlight="highlight"
      bgImage="/images/paneBackgrounds/14.jpg"
    >
      <template #title>
        <span class="sectionemoji">🚪</span>Ship Schematic
      </template>
      <div
        class="shipdiagram"
        :style="
          rotate
            ? {
                transform: `rotate(${
                  ship && ship.direction * -1 + 90
                }deg)`,
              }
            : ''
        "
      >
        <svg
          width="1776"
          height="2090"
          viewBox="0 0 1776 2090"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M1200 0H1057.15L1009 213H1200V0Z" />
            <path d="M576 0H718.849L767 213H576V0Z" />
            <path
              d="M472 558L472 486.95L576 463L576 558L472 558Z"
            />
            <path
              d="M1304 558L1304 486.95L1200 463L1200 558L1304 558Z"
            />
            <path d="M0 1432L576 684V2090L0 1783V1432Z" />
            <path
              d="M1776 1432L1200 684V2090L1776 1783V1432Z"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1200 213H576V2090H700L800 1961H976L1076 2090H1200V213Z"
            />
          </g>
          <g>
            <rect
              x="671"
              y="272"
              width="434"
              height="1554"
            />
            <path
              d="M448 1354H1328V1518.75V1683.5V1848.25L1208 2013H1108L998 1886.27L888 1890.36L778 1886.27L668 2013H568L448 1848.25V1683.5V1354Z"
            />
            <path
              d="M135 1387L687.5 713L730 937.5L220 1387H135Z"
            />
            <path
              d="M1641 1387L1088.5 713L1046 937.5L1556 1387H1641Z"
            />
          </g>
        </svg>

        <div
          class="roomrotator"
          :style="
            rotate
              ? {
                  transform: `rotate(-45deg)`,
                }
              : ''
          "
        >
          <div
            class="room pointer"
            :class="{
              current:
                crewMember && crewMember.location === room,
            }"
            v-for="room in ship.rooms"
            :key="'ar' + room.id"
            :ref="room.id"
            @click="
              crewMember &&
                $store.commit('setRoom', room.id)
            "
            v-tooltip="{
              type: 'room',
              data: room,
            }"
          >
            <div
              class="roomlabel"
              :style="{
                transform: rotate
                  ? `rotate(${
                      ship && ship.direction - 90 + 45
                    }deg)`
                  : '',
              }"
            >
              {{ room.id }}
            </div>
          </div>
          <template v-for="roomWithCrew in crewByRoom">
            <ShipDiagramRoomMember
              v-for="member in roomWithCrew.crewMembers"
              :key="'roomMember' + member.id"
              :name="member.name"
              :location="member.location"
              :highlight="member.id === userId"
              :roomEls="$refs"
            />
          </template>
        </div>
      </div>
    </Box>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      rotate: false,
    }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('diagram'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'diagram'
      )
    },
    crewByRoom(): {
      room: string
      crewMembers: CrewMemberStub[]
    }[] {
      const byRoom: {
        room: string
        crewMembers: CrewMemberStub[]
      }[] = []
      for (let room of Object.keys(
        this.ship?.rooms,
      ) as string[]) {
        byRoom.push({
          room,
          crewMembers: this.ship.crewMembers.filter(
            (cm: CrewMemberStub) => cm.location === room,
          ),
        })
      }
      return byRoom
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.holder {
  grid-column: span 2;
  width: 340px;
}
.shipdiagram {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2em;

  svg {
    z-index: 1;
    width: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.15;

    g {
      stroke-width: 10px;
      stroke: white;
      fill: rgba(white, 0.1);
    }
  }

  .roomrotator {
    position: relative;
    z-index: 2;
    transition: transform 0.5s;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .room {
    position: relative;
    display: inline-flex;
    width: 9em;
    height: 9em;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    z-index: 2;
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 1px var(--text);
    border-bottom: 1px solid var(--text);

    &:hover {
      z-index: 4;
      background: rgba(50, 50, 50, 0.85);

      .roomlabel {
        opacity: 0.8;
      }
    }

    &.current {
      background: rgba(50, 50, 50, 0.7);
    }

    .roomlabel {
      text-transform: uppercase;
      opacity: 0.3;
    }
  }
}
</style>
