<template>
  <Box
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/4.jpg"
    :overlayTitle="true"
    @minimize="minimized = true"
    @unminimize="minimized = false"
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
          💳{{ ship && c.r2(ship.commonCredits, 2, true) }}
        </div>
      </div>
      <PromptButton
        v-if="isCaptain && ship.commonCredits > 0.01"
        @done="redistributeCommonFund(...arguments)"
      >
        <template #label>
          Redistribute Credits
        </template>
        <template>
          How many credits do you want to redistribute
          evenly among the crew? (Max
          {{ Math.floor(ship.commonCredits * 100) / 100 }})
        </template>
      </PromptButton>
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c, minimized: false }
  },
  computed: {
    ...mapState(['userId', 'ship', 'crewMember']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('ship'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'ship'
      )
    },
    isCaptain(this: ComponentShape) {
      return this.ship?.captain === this.userId
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    async redistributeCommonFund(
      this: ComponentShape,
      amount: any,
    ) {
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

      this.$socket?.emit(
        'ship:redistribute',
        this.ship.id,
        this.crewMember?.id,
        amount,
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.ship {
  width: 230px;
}

.panesection {
  width: 230px;
}
</style>
