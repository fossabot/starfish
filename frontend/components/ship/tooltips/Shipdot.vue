<template>
  <div class="shipdataview">
    <ShipTooltipsShipheader
      :data="dataToUse"
      :interactive="true"
    />

    <div
      v-if="dataToUse._hp && dataToUse._maxHp"
      class="panesection"
      v-tooltip="
        `🇨🇭HP: ${c.r2(dataToUse._hp)}/${c.r2(
          dataToUse._maxHp,
        )}<br /><br />The sum total of all of the ship's equipment's health.`
      "
    >
      <PillBar
        :value="dataToUse._hp"
        :max="dataToUse._maxHp"
      />
    </div>
    <!-- <ProgressBar
      v-if="dataToUse._hp && dataToUse._maxHp"
      :percent="dataToUse._hp / dataToUse._maxHp"
      @mouseenter.native="
        $store.commit(
          'tooltip',
          `The sum total of all of the ship's equipment's health.`,
        )
      "
      @mouseleave.native="$store.commit('tooltip')"
    >
      <div>
        🇨🇭HP:
        <NumberChangeHighlighter :number="c.r2(dataToUse._hp)" />
        /
        {{ c.r2(dataToUse._maxHp) }}
      </div>
    </ProgressBar> -->

    <div
      class="panesection"
      v-if="
        dataToUse.planet &&
        dataToUse.planet.planetType !== 'comet'
      "
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
      v-else-if="
        dataToUse.planet &&
        dataToUse.planet.planetType === 'comet'
      "
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

    <div
      class="panesection"
      v-if="dataToUse.speed !== undefined"
    >
      <div
        class="arrow"
        v-if="dataToUse.speed"
        @click="setTargetAlongPath"
      >
        <div>
          {{
            c.speedNumber(
              (dataToUse && dataToUse.speed * 60 * 60) || 0,
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
            transform: `rotate(${
              dataToUse && dataToUse.direction * -1
            }deg)`,
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
      class="panesection"
      v-if="
        (dataToUse._hp === undefined && dataToUse._maxHp) ||
        dataToUse.chassis ||
        dataToUse.level ||
        dataToUse.mass ||
        dataToUse.crewMembers
      "
    >
      <div
        v-if="
          dataToUse._hp === undefined && dataToUse._maxHp
        "
        class="flexbetween"
      >
        <div>Max HP</div>
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
        <div>Chassis</div>
        <div>{{ dataToUse.chassis.displayName }}</div>
      </div>

      <div v-if="dataToUse.level" class="flexbetween">
        <div>Level</div>
        <div>
          {{ Math.round(dataToUse.level) }}
        </div>
      </div>

      <div
        v-if="!isSelf && dataToUse.targetShip"
        class="flexbetween"
      >
        <div>Targeting</div>
        <div class="marleft textright">
          {{ dataToUse.targetShip.name }}
        </div>
      </div>

      <div
        v-if="!isSelf && dataToUse.rooms"
        class="flexbetween"
      >
        <div>Rooms</div>
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

      <div
        v-if="!isSelf && dataToUse.radii"
        class="flexbetween"
      >
        <div>Radii</div>
        <div class="marleft textright">
          <div
            v-for="r in Object.keys(dataToUse.radii).map(
              (r) =>
                `${c.capitalize(r)}: ${c.r2(
                  dataToUse.radii[r],
                )}AU`,
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
          `More mass requires more thrust to gain velocity.`
        "
      >
        <div>Mass</div>
        <div>
          {{
            c.numberWithCommas(
              c.r2(dataToUse.mass / 1000, 2),
            )
          }}
          tons
        </div>
      </div>

      <div
        v-if="dataToUse.crewMembers"
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
        <div>Crew Members</div>
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
        <div>Captain</div>
        <div>
          {{
            dataToUse.crewMembers.find(
              (cm) => cm.id === dataToUse.captain,
            ) //'👑' +
              ? (dataToUse.crewMembers.find(
                  (cm) => cm.id === dataToUse.captain,
                ).speciesId
                  ? c.species[
                      dataToUse.crewMembers.find(
                        (cm) => cm.id === dataToUse.captain,
                      ).speciesId
                    ].icon
                  : '') +
                dataToUse.crewMembers.find(
                  (cm) => cm.id === dataToUse.captain,
                ).name
              : 'No Captain'
          }}
        </div>
      </div>
    </div>

    <div
      class="panesection"
      v-if="
        showItems &&
        dataToUse.items &&
        dataToUse.items.length
      "
    >
      <div>
        <div
          v-for="(item, index) in dataToUse.items || []"
          :key="'tooltipscanitem' + dataToUse.id + index"
          v-tooltip="item"
        >
          <div>
            {{ item.displayName }}
            <span class="sub">{{
              c.capitalize(item.type)
            }}</span>
          </div>
          <PillBar
            v-if="item.repair !== undefined && item.maxHp"
            :mini="true"
            :value="item.repair * item.maxHp"
            :max="item.maxHp"
          />
          <div
            v-else-if="item.repair"
            class="sub marbotsmall"
          >
            Repair: {{ c.r2(item.repair * 100) }}%
          </div>
          <div
            v-else-if="item.maxHp"
            class="sub marbotsmall"
          >
            Max HP: {{ c.r2(item.maxHp) }}
          </div>
        </div>
      </div>
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
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    isSelf() {
      return this.ship?.id === this.data.id
    },
    dataToUse() {
      return (
        this.ship?.visible?.ships.find(
          (p) => p.id === this.data.id,
        ) || this.data
      )
    },
  },
  methods: {
    setTargetAlongPath() {
      if (this.dataToUse.id !== this.ship?.id) return
      this.$store.commit(
        'setTarget',
        this.ship?.location.map(
          (l, index) =>
            l + this.ship?.velocity[index] * 500,
        ),
      )
    },
  },
})
</script>

<style scoped lang="scss">
.shipdataview {
  min-width: 200px;
  margin: calc(-1 * var(--tooltip-pad-tb))
    calc(-1 * var(--tooltip-pad-lr));
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
</style>
