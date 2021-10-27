<template>
  <Box
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/4.jpg"
    :overlayTitle="true"
    @minimize="minimized = true"
    @unminimize="minimized = false"
    class="shipbox"
  >
    <template #title>
      <span :style="{ display: minimized ? '' : 'none' }">
        <span class="sectionemoji">🚀</span>{{ ship.name }}
      </span>
    </template>

    <ShipTooltipsShipdot
      :data="ship"
      :showItems="false"
      class="ship"
    />

    <div
      class="panesection grid2"
      v-if="ship.commonCredits || ship.shipCosmeticCurrency"
    >
      <div
        v-tooltip="
          `<b>💳${c.capitalize(
            c.baseCurrencyPlural,
          )}</b>: The ship's common fund of currency. The captain can spend the common fund on new items for the ship.`
        "
      >
        💳{{
          ship &&
          c.numberWithCommas(
            c.r2(ship.commonCredits, 0, true),
          )
        }}
      </div>

      <PromptButton
        v-if="isCaptain && ship.commonCredits"
        :max="ship.commonCredits"
        @done="redistributeCommonFund(...arguments)"
        @apply="redistributeCommonFund(...arguments)"
      >
        <template #label>Redistribute</template>
        <template>
          How many 💳{{ c.baseCurrencyPlural }} do you want
          to redistribute evenly among the crew? (Max
          {{
            c.numberWithCommas(
              Math.floor(ship.commonCredits),
            )
          }})
        </template>
      </PromptButton>

      <div
        v-if="ship.shipCosmeticCurrency"
        v-tooltip="
          `<b>💎${c.capitalize(
            c.shipCosmeticCurrencyPlural,
          )}</b>: Rare currency used to buy cosmetics and other upgrades!`
        "
      >
        💎{{
          c.numberWithCommas(
            c.r2(ship.shipCosmeticCurrency, 0, true),
          )
        }}
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, minimized: false }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('ship'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'ship'
      )
    },
    isCaptain() {
      return this.ship?.captain === this.userId
    },
  },
  watch: {},
  mounted() {},
  methods: {
    async redistributeCommonFund(amount: any) {
      if (amount === 'all') amount = this.ship.commonCredits
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (
        !amount ||
        amount < 0 ||
        amount > this.ship.commonCredits
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }

      ;(this as any).$socket?.emit(
        'ship:redistribute',
        this.ship.id,
        this.crewMember?.id,
        amount,
      )
      this.$store.dispatch('notifications/notify', {
        text: `Redistributed 💳${c.r2(amount, 0)} ${
          c.baseCurrencyPlural
        }.`,
        type: 'success',
      })
    },
  },
})
</script>

<style lang="scss" scoped>
.shipbox {
  width: 250px;
}
</style>
