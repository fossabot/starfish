<template>
  <div
    v-if="
      planet.planetType === 'mining' && planet.mine.length
    "
    class="panesection"
    v-tooltip="
      `When a job is completed, all ships actively mining that resource will share the payout evenly, regardless of size or faction.<br />
      The crew members mining that resource will get priority on the results, with remaining cargo shared evenly between all other crew members.`
    "
  >
    <div class="panesubhead">Active Mines</div>
    <div v-for="m in planet.mine" class="marbottiny">
      <ProgressBar
        :mini="true"
        :percent="m.mineCurrent / m.mineRequirement"
        dangerZone="-1"
      >
        <div class="fullwidth flexbetween">
          <div>
            {{
              c.numberWithCommas(c.r2(m.payoutAmount, 0))
            }}
            tons of
            {{ c.capitalize(m.id) }}
          </div>

          <div class="fade">
            <NumberChangeHighlighter
              :number="
                c.r2(
                  (m.mineCurrent / m.mineRequirement) * 100,
                  0,
                  true,
                )
              "
              :display="
                c.r2(
                  (m.mineCurrent / m.mineRequirement) * 100,
                  0,
                  true,
                ) + `%`
              "
            />
            mined
            <span class="sub">
              <NumberChangeHighlighter
                :number="c.r2(m.mineCurrent, 0)"
                :display="`
              (${c.numberWithCommas(
                c.r2(m.mineCurrent, 0),
              )} / ${c.numberWithCommas(
                  c.r2(m.mineRequirement, 0),
                )})`"
              />
            </span>
          </div>
        </div>
      </ProgressBar>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember']),
    planet(): any {
      return this.ship.planet
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
