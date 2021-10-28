<template>
  <div
    v-if="planet.mine"
    class="panesection"
    v-tooltip="
      `When a job is completed, all ships actively mining that resource will share the payout evenly, regardless of size or guild.<br />
      The crew members mining that resource will get priority on the results, with remaining cargo shared evenly between all other crew members.`
    "
  >
    <div class="panesubhead">Active Mines</div>
    <div v-if="planet.mine.length === 0">
      <div class="centertext sub">All mines exhausted.</div>
    </div>
    <div
      v-else
      v-for="m in planet.mine"
      class="marbottiny"
      v-tooltip="
        m.mineRequirement
          ? (c.cargo[m.id]
              ? `Base price per ton: ${c.priceToString(
                  c.cargo[m.id].basePrice,
                )}
              <br />`
              : '') +
            `Remaining in vein: ${c.numberWithCommas(
              m.maxMineable,
            )}${c.cargo[m.id] ? 'tons' : ''}`
          : `Upgrade the mine to uncover more resources.`
      "
    >
      <ProgressBar
        :mini="true"
        :percent="m.mineCurrent / (m.mineRequirement || 1)"
        dangerZone="-1"
        :class="{ fade: !m.mineRequirement }"
      >
        <div class="fullwidth" v-if="!m.mineRequirement">
          <div class="fade">
            {{
              
                m.id === `crewCosmeticCurrency`
                  ? `🟡${c.capitalize(c.crewCosmeticCurrencyPlural)}`
                  : m.id === `shipCosmeticCurrency`
                  ? `💎${c.capitalize(c.shipCosmeticCurrencyPlural)}`
                  : c.capitalize(m.id),
            }}
            (exhausted)
          </div>
        </div>

        <div
          class="fullwidth flexbetween"
          v-if="m.mineRequirement"
        >
          <div>
            {{
              c.cargo[m.id]
                ? `${c.numberWithCommas(
                    c.r2(m.payoutAmount, 0),
                  )} ton${
                    c.r2(m.payoutAmount, 0) === 1 ? '' : 's'
                  } of`
                : ''
            }}
            {{
              c.capitalize(
                m.id === `crewCosmeticCurrency`
                  ? `🟡${c.numberWithCommas(
                      c.r2(m.payoutAmount, 0),
                    )} ${c.crewCosmeticCurrencyPlural}`
                  : m.id === `shipCosmeticCurrency`
                  ? `💎${c.numberWithCommas(
                      c.r2(m.payoutAmount, 0),
                    )} ${c.shipCosmeticCurrencyPlural}`
                  : m.id,
              )
            }}
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
import c from '../../../../common/dist'
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
