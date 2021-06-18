<template>
  <div class="shipdataview">
    <div
      class="topzone"
      :class="{ captain: isCaptain }"
      :style="{
        background: `url('/images/headerBackgrounds/${data.headerBackground ||
          'default.jpg'}')`,
      }"
      @click="
        isCaptain &&
          $store.commit('set', {
            modal: 'headerBackgroundPicker',
          })
      "
    >
      <div class="bgfade"></div>
      <div class="content">
        <div v-if="data.species">
          <div
            class="icon"
            :class="{ pushup: data.tagline }"
            @mouseenter="
              $store.commit(
                'tooltip',
                `<b>Species:</b> ${
                  data.species.icon
                }${c.capitalize(data.species.id)}`,
              )
            "
            @mouseleave="$store.commit('tooltip')"
          >
            {{ data.species.icon }}
          </div>
        </div>
        <div class="right">
          <div class="shipname">{{ data.name }}</div>
          <div v-if="data.tagline" class="sub">
            {{ data.tagline }}
          </div>
        </div>
      </div>
      <div
        v-if="data.faction"
        class="factiontag"
        :style="{ background: data.faction.color }"
        @mouseenter="
          $store.commit(
            'tooltip',
            `<b>Faction:</b> ${data.faction.name}`,
          )
        "
        @mouseleave="$store.commit('tooltip')"
      ></div>
    </div>

    <ProgressBar
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
    </ProgressBar>

    <div class="panesection" v-if="data.planet">
      <div
        @mouseenter="
          $store.commit('tooltip', {
            type: 'planet',
            data: data.planet,
          })
        "
        @mouseleave="$store.commit('tooltip')"
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
        data._maxHp ||
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
        @mouseenter="
          $store.commit('tooltip', {
            type: 'chassis',
            data: data.chassis,
          })
        "
        @mouseleave="$store.commit('tooltip')"
      >
        <div>Chassis</div>
        <div>{{ data.chassis.displayName }}</div>
      </div>

      <div v-if="data.level" class="flexbetween">
        <div>Level</div>
        <div>{{ Math.round(data.level) }}</div>
      </div>

      <div v-if="data.mass" class="flexbetween">
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
            $store.commit(
              'tooltip',
              `<b>Crew</b><br/><hr />${data.crewMembers
                .map((cm) => cm.name)
                .join(', ')}`,
            )
        "
        @mouseleave="$store.commit('tooltip')"
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
          @mouseenter="
            $store.commit('tooltip', {
              type: item.type,
              data: item,
            })
          "
          @mouseleave="$store.commit('tooltip')"
        >
          {{ item.displayName }}
          <span class="sub">{{
            c.capitalize(item.type)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  props: { data: {}, showItems: { default: true } },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'userId']),
    isCaptain() {
      return (
        this.ship?.id === this.data?.id &&
        this.ship?.captain &&
        this.ship?.captain === this.userId
      )
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.shipdataview {
  margin: calc(-1 * var(--tooltip-pad-tb))
    calc(-1 * var(--tooltip-pad-lr));
}

.panesection {
  width: 230px;
}

.bgfade {
  width: 100%;
  height: 100%;
  position: absolute;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--bg) 85%
  );
  mix-blend-mode: multiply;
  opacity: 0.5;
}

.topzone {
  width: 230px;
  background-size: cover !important;
  background-position: center center !important;
  position: relative;
  overflow: hidden;

  &.captain {
    cursor: pointer;

    &:hover {
      background-size: 110% !important;
    }
  }

  .content {
    height: 100%;
    display: flex;
    align-items: flex-end;
    padding: 0.7em 1em;
    position: relative;
    z-index: 1;

    min-height: 100px;
  }

  .icon {
    position: relative;
    font-size: 1.4em;
    top: 0.1em;

    &.pushup {
      top: -0.7em;
    }
  }

  .right {
    flex-grow: 1;
    padding-left: 0.5em;
  }

  .shipname {
    font-size: 1.4em;
    font-weight: bold;
  }

  .factiontag {
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    width: 50px;
    height: 50px;
    transform: translateX(50%) translateY(-50%)
      rotate(45deg);
    box-shadow: 0 0 10px -3px var(--bg);
  }
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
