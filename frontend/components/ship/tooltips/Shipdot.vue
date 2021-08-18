<template>
  <div class="shipdataview">
    <ShipTooltipsShipheader
      :data="data"
      :interactive="true"
    />

    <div
      v-if="data._hp && data._maxHp"
      class="panesection"
      v-tooltip="
        `🇨🇭HP: ${c.r2(data._hp)}/${c.r2(
          data._maxHp,
        )}<br /><br />The sum total of all of the ship's equipment's health.`
      "
    >
      <PillBar :value="data._hp" :max="data._maxHp" />
    </div>
    <!-- <ProgressBar
      v-if="data._hp && data._maxHp"
      :percent="data._hp / data._maxHp"
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
        <NumberChangeHighlighter :number="c.r2(data._hp)" />
        /
        {{ c.r2(data._maxHp) }}
      </div>
    </ProgressBar> -->

    <div class="panesection" v-if="data.planet">
      <div
        v-tooltip="{
          type: 'planet',
          data: data.planet,
        }"
      >
        At planet 🪐{{ data.planet.name }}
      </div>
    </div>

    <div
      class="panesection"
      v-if="data.speed !== undefined"
    >
      <div class="arrow" v-if="data.speed">
        <div>
          {{ c.r2(data && data.speed * 60 * 60, 4) }}
          AU/hr
          <br />
          at {{ c.r2(data && data.direction, 2) }}°
        </div>
        <svg
          :style="{
            transform: `rotate(${data &&
              data.direction * -1}deg)`,
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
        (data._hp === undefined && data._maxHp) ||
          data.chassis ||
          data.level ||
          data.mass ||
          data.crewMembers
      "
    >
      <div
        v-if="data._hp === undefined && data._maxHp"
        class="flexbetween"
      >
        <div>Max HP</div>
        <div>{{ data._maxHp }}</div>
      </div>
      <div
        v-if="data.chassis"
        class="flexbetween"
        v-tooltip="{
          type: 'chassis',
          data: data.chassis,
        }"
      >
        <div>Chassis</div>
        <div>{{ data.chassis.displayName }}</div>
      </div>

      <div v-if="data.level" class="flexbetween">
        <div>Level</div>
        <div>{{ Math.round(data.level) }}</div>
      </div>

      <div
        v-if="data.mass"
        class="flexbetween"
        v-tooltip="
          `More mass requires more thrust to gain velocity.`
        "
      >
        <div>Mass</div>
        <div>
          {{ c.numberWithCommas(c.r2(data.mass, 0)) }}kg
        </div>
      </div>

      <div
        v-if="data.crewMembers"
        class="flexbetween"
        @mouseenter="
          Array.isArray(data.crewMembers) &&
            data.crewMembers[0] &&
            data.crewMembers[0].name &&
            $store.commit(
              'tooltip',
              `<b>Crew</b><br/><hr />${data.crewMembers
                .map((cm) => cm.name)
                .join(', ')}`,
            )
        "
      >
        <div>Crew Members</div>
        <div>
          {{ data.crewMembers.length }}
        </div>
      </div>
      <div
        class="flexbetween"
        v-if="
          data.captain &&
            data.crewMembers &&
            Array.isArray(data.crewMembers)
        "
      >
        <div>
          Captain
        </div>
        <div>
          {{
            data.crewMembers.find(
              (cm) => cm.id === data.captain,
            )
              ? data.crewMembers.find(
                  (cm) => cm.id === data.captain,
                ).name
              : 'No Captain'
          }}
        </div>
      </div>
    </div>

    <div
      class="panesection"
      v-if="showItems && data.items && data.items.length"
    >
      <div>
        <div
          v-for="(item, index) in data.items || []"
          :key="'tooltipscanitem' + data.id + index"
          v-tooltip="{
            type: item.type,
            data: item,
          }"
        >
          <div>
            {{ item.displayName }}
            <span class="sub">{{
              c.capitalize(item.type)
            }}</span>
          </div>
          <PillBar
            v-if="item.repair && item.maxHp"
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
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {}, showItems: { default: true } },
  data() {
    return { c }
  },
  computed: {},
  mounted() {},
})
</script>

<style scoped lang="scss">
.shipdataview {
  margin: calc(-1 * var(--tooltip-pad-tb))
    calc(-1 * var(--tooltip-pad-lr));
}

.panesection {
  width: 230px;
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
