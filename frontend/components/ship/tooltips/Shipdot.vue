<template>
  <div class="shipdataview">
    <ShipTooltipsShipheader :data="dataToUse" :interactive="isSelf" />

    <div
      v-if="
        dataToUse._hp &&
        dataToUse._maxHp &&
        dataToUse.items &&
        dataToUse.items.length > 0 &&
        dataToUse.items[0].repair
      "
    >
      <ShipHealthBar :ship="dataToUse" />
    </div>

    <div
      class="panesection"
      v-if="dataToUse.planet && dataToUse.planet.planetType !== 'comet'"
    >
      <div
        v-tooltip="{
          type: 'planet',
          ...dataToUse.planet,
        }"
      >
        At planet
        <span :style="{ color: dataToUse.planet.color }"
          >🪐{{ dataToUse.planet.name }}</span
        >
      </div>
    </div>
    <div
      class="panesection"
      v-else-if="dataToUse.planet && dataToUse.planet.planetType === 'comet'"
    >
      <div
        v-tooltip="{
          ...dataToUse.planet,
          type: 'comet',
        }"
      >
        On
        <span :style="{ color: dataToUse.planet.color }"
          >💫{{ dataToUse.planet.name }}</span
        >
      </div>
    </div>

    <div class="panesection" v-if="dataToUse.speed !== undefined">
      <div class="arrow" v-if="dataToUse.speed">
        <div>
          {{
            c.speedNumber(
              (dataToUse &&
                dataToUse.speed * 60 * 60 * (c.tickInterval / 1000)) ||
                0,
            )
          }}
          <template v-if="dataToUse.direction">
            <br />
            at
            {{ c.r2(dataToUse && dataToUse.direction, 2) }}°
          </template>
        </div>
        <svg
          :style="{
            transform: `rotate(${dataToUse && dataToUse.direction * -1}deg)`,
          }"
          width="404"
          height="233"
          viewBox="200 0 604 233"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
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
    <div
      class="panesection padtop"
      v-if="
        (dataToUse._hp === undefined && dataToUse._maxHp) ||
        dataToUse.chassis ||
        dataToUse.level ||
        dataToUse.mass ||
        dataToUse.crewMembers ||
        (dataToUse.crewMembers &&
          dataToUse.crewMembers.length > 1 &&
          dataToUse.crewAverageMorale !== undefined)
      "
    >
      <ProgressBar
        class="marbottiny"
        v-if="
          (dev && dataToUse.crewAverageMorale !== undefined) ||
          (dataToUse.crewMembers &&
            dataToUse.crewMembers.length > 1 &&
            dataToUse.crewAverageMorale !== undefined)
        "
        :mini="true"
        :percent="dataToUse.crewAverageMorale"
        :color="
          dataToUse.crewAverageMorale > ship &&
          ship.gameSettings.moraleHighThreshold
            ? 'var(--success)'
            : 'rgba(255,255,255,.5)'
        "
        :dangerZone="ship && ship.gameSettings.moraleLowThreshold"
        v-tooltip="`The average morale of crew members on the ship.`"
      >
        <div class="flexcenter flexbetween fullwidth">
          <div class="small">Avg. Morale</div>
          <div>{{ c.r2(dataToUse.crewAverageMorale * 100, 0) }}%</div>
        </div>
      </ProgressBar>

      <div
        v-if="dataToUse._hp === undefined && dataToUse._maxHp"
        class="flexbetween"
      >
        <div class="sub">Max HP</div>
        <div>{{ dataToUse._maxHp }}</div>
      </div>
      <div
        v-if="dataToUse.chassis"
        class="flexbetween"
        v-tooltip="{
          type: 'chassis',
          ...dataToUse.chassis,
        }"
      >
        <div class="sub">Chassis</div>
        <div>{{ dataToUse.chassis.displayName }}</div>
      </div>

      <div v-if="dataToUse.level" class="flexbetween">
        <div class="sub">Level</div>
        <div>
          {{ Math.round(dataToUse.level) }}
        </div>
      </div>
      <div v-if="timeRemaining" class="flexbetween">
        <div class="sub">Time Remaining</div>
        <div>
          {{ c.msToTimeString(timeRemaining) }}
        </div>
      </div>

      <div v-if="!isSelf && dataToUse.targetShip" class="flexbetween">
        <div class="sub">Targeting</div>
        <div class="marleft textright">
          {{ dataToUse.targetShip.name }}
        </div>
      </div>

      <div v-if="!isSelf && dataToUse.rooms" class="flexbetween">
        <div class="sub">Rooms</div>
        <div class="marleft textright">
          {{
            c.printList(
              (dataToUse.rooms.map
                ? dataToUse.rooms
                : Object.keys(dataToUse.rooms)
              ).map((r) => c.capitalize(r)),
            )
          }}
        </div>
      </div>

      <div v-if="!isSelf && dataToUse.radii" class="flexbetween">
        <div class="sub">Radii</div>
        <div class="marleft textright">
          <div
            v-for="r in Object.keys(dataToUse.radii)
              .filter((r) => !['gameSize', 'safeZone'].includes(r))
              .map((r) =>
                Array.isArray(dataToUse.radii[r])
                  ? `${c.capitalize(r)}: ${dataToUse.radii[r]
                      .map((rad) => `${c.speedNumber(rad, true)} KM`)
                      .join(', ')}`
                  : `${c.capitalize(r)}: ${c.speedNumber(
                      dataToUse.radii[r],
                      true,
                    )} KM`,
              )"
          >
            {{ r }}
          </div>
        </div>
      </div>

      <div
        v-if="dataToUse.mass"
        class="flexbetween"
        v-tooltip="
          isSelf
            ? { type: 'mass' }
            : `More mass requires more thrust to gain velocity.`
        "
      >
        <div class="sub">Mass</div>
        <div>
          {{ c.numberWithCommas(c.r2(dataToUse.mass / 1000, 2)) }}
          tons
        </div>
      </div>

      <div
        v-if="dataToUse.crewMembers && !isSelf"
        class="flexbetween"
        v-tooltip="
          !dataToUse.tutorial &&
          Array.isArray(dataToUse.crewMembers) &&
          dataToUse.crewMembers[0] &&
          dataToUse.crewMembers[0].name
            ? `<b>Crew</b><br/><hr />${dataToUse.crewMembers
                .map((cm) => cm.name)
                .join(', ')}`
            : null
        "
      >
        <div class="sub">Crew Members</div>
        <div>
          {{ dataToUse.crewMembers.length }}
        </div>
      </div>
      <div
        class="flexbetween"
        v-if="
          !dataToUse.tutorial &&
          dataToUse.captain &&
          dataToUse.crewMembers &&
          Array.isArray(dataToUse.crewMembers)
        "
      >
        <div class="sub">Captain</div>
        <div v-tooltip="captain">
          <span class="captainlabel flex" v-if="captain">
            <div class="captainicon">
              <ShipCrewIcon :crewMember="captain" :showDiscordIcon="false" />
            </div>
            <div>{{ captain.name }}</div>
          </span>
          <span v-else>No Captain</span>
        </div>
      </div>
    </div>

    <div
      class="panesection"
      v-if="showItems && dataToUse.items && dataToUse.items.length"
    >
      <ShipItem
        v-for="(item, index) in dataToUse.items || []"
        :key="'tooltipscanitem' + dataToUse.id + index"
        :item="item"
        :owner="dataToUse"
        v-tooltip="item"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {}, showItems: { default: true } },
  data() {
    let timeRemaining = 0
    return { c, timeRemaining }
  },
  computed: {
    ...mapState(['ship', 'lastUpdated', 'dev']),
    isSelf() {
      return this.ship?.id === this.data.id
    },
    dataToUse() {
      return (
        this.ship?.visible?.ships.find((p) => p.id === this.data.id) ||
        this.data
      )
    },
    captain() {
      return this.dataToUse?.crewMembers?.find(
        (cm) => cm.id === this.dataToUse?.captain,
      )
    },
  },

  watch: {
    lastUpdated() {
      this.recalculateRemaining()
    },
  },
  mounted() {
    this.recalculateRemaining()
  },
  methods: {
    recalculateRemaining() {
      if (!this.dataToUse.until) this.timeRemaining = 0
      else this.timeRemaining = this.dataToUse.until - Date.now()
    },
  },
})
</script>

<style scoped lang="scss">
.shipdataview {
  min-width: 200px;
  margin: calc(-1 * var(--tooltip-pad-tb)) calc(-1 * var(--tooltip-pad-lr));
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    padding-left: 0.8em;
    // margin-left: 1em;
    margin-right: 0em;
    transition: transform 0.5s;
    // width: 25%;
    width: 60px;
    height: 40px;
  }
}

.captainlabel {
  .captainicon {
    width: 1.3em;
    margin-right: 2px;
    position: relative;
  }
}
</style>
