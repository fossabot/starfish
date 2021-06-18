<template>
  <Box v-if="show" :highlight="highlight">
    <template #title>
      <span class="sectionemoji">🚀</span>{{ ship.name }}
    </template>

    <ShipTooltipsShipdot
      :data="ship"
      :showItems="false"
      class="ship"
    />

    <div class="panesection">
      <div
        class="flexbetween"
        @mouseenter="
          $store.commit(
            'tooltip',
            `The ship's shared pool of credits. The captain can spend the common fund on new items for the ship.`,
          )
        "
        @mouseleave="$store.commit('tooltip')"
      >
        <div>Common Fund</div>
        <div>💳{{ ship && c.r2(ship.commonCredits) }}</div>
      </div>
      <button
        v-if="isCaptain && ship.commonCredits > 0.01"
        @click="redistributeCommonFund"
        class="mini secondary"
      >
        Redistribute Credits
      </button>
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
    return { c }
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
    async redistributeCommonFund(this: ComponentShape) {
      const amount = c.r2(
        parseFloat(
          prompt(
            `How many credits do you want to contribute to the ship's common credits? (Max ${Math.floor(
              this.ship.commonCredits * 100,
            ) / 100})`,
          ) || '0',
        ) || 0,
        2,
        true,
      )
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
