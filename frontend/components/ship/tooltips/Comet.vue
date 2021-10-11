<template>
  <div>
    <div class="tooltipheader">
      <span>💫</span
      ><span :style="{ color: dataToUse.color }">{{
        dataToUse.name
      }}</span>
    </div>
    <!-- {{ data }} -->
    <hr />

    <div
      class="panesection"
      v-if="dataToUse.speed !== undefined"
    >
      <div class="arrow" v-if="dataToUse.speed">
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

    <div v-if="dataToUse.mine && dataToUse.mine.length">
      Rich
      <b>{{
        c.printList(
          dataToUse.mine.map(
            (cargo) => c.cargo[cargo.id].name,
          ),
        )
      }}</b>
      veins
    </div>

    <!-- <hr v-if="c.getPlanetDescription(data)" />
    <div v-if="c.getPlanetDescription(data)" class="sub">
      {{ c.getPlanetDescription(data) }}
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: { data: {} },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    dataToUse() {
      return (
        this.ship?.seenPlanets?.find(
          (p) => p.id === this.data.id,
        ) || this.data
      )
    },
  },
})
</script>

<style scoped lang="scss">
hr {
  margin-bottom: 0;
}
.panesection {
  margin-top: 0;
  margin-left: calc(-1 * var(--tooltip-pad-lr));
  margin-right: calc(-1 * var(--tooltip-pad-lr));
  margin-bottom: calc(1 * var(--tooltip-pad-lr));
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
