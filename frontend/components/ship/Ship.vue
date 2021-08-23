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

    <div class="panesection" v-if="ship.commonCredits">
      <div
        class="flexbetween"
        v-tooltip="
          `The ship's shared pool of credits. The captain can spend the common fund on new items for the ship.`
        "
      >
        <div>Common Fund</div>
        <div>
          💳{{
            ship &&
            c.numberWithCommas(
              c.r2(ship.commonCredits, 0, true),
            )
          }}
        </div>
      </div>
      <PromptButton
        v-if="isCaptain"
        :max="ship.commonCredits"
        @done="redistributeCommonFund(...arguments)"
        @apply="redistributeCommonFund(...arguments)"
      >
        <template #label> Redistribute Credits </template>
        <template>
          How many credits do you want to redistribute
          evenly among the crew? (Max
          {{
            c.numberWithCommas(
              Math.floor(ship.commonCredits),
            )
          }})
        </template>
      </PromptButton>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
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
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }

      ;(this as any).$socket?.emit(
        'ship:redistribute',
        this.ship.id,
        this.crewMember?.id,
        amount,
      )
      this.$store.dispatch('notifications/notify', {
        text: `Redistributed ${c.r2(amount, 0)} credits.`,
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
