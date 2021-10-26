<template>
  <div
    class="panesection"
    v-if="
      crewMember &&
      ship.planet &&
      (ship.planet.bank ||
        ship.banked.find((b) => b.id === ship.planet.id))
    "
  >
    <div>
      <div class="panesubhead">Savings &amp; Loan</div>
    </div>

    <div class="marbotsmall">
      <div v-if="creditsStoredHere">
        Your ship has
        <b
          >💳{{ creditsStoredHere }}
          {{ c.baseCurrencyPlural }}</b
        >
        stored here.
      </div>
      <div v-else class="sub">
        The captain can store the ship's common 💳{{
          c.baseCurrencyPlural
        }}
        here. Deposited 💳{{ c.baseCurrencyPlural }} will
        persist even through death, but you will have to
        come back to this planet to retrieve them.
      </div>
    </div>

    <div v-if="ship.captain === userId">
      <PromptButton
        :disabled="!ship.commonCredits"
        class="inlineblock"
        :max="ship.commonCredits"
        @done="deposit"
        @apply="deposit"
      >
        <template #label>
          <div class="padsmall">
            Deposit 💳{{
              c.capitalize(c.baseCurrencyPlural)
            }}
          </div>
        </template>
        <template>
          <div>
            How many 💳{{ c.baseCurrencyPlural }} will you
            deposit?
          </div>
        </template>
      </PromptButton>

      <PromptButton
        :disabled="!creditsStoredHere"
        class="inlineblock"
        :max="creditsStoredHere"
        @done="withdraw"
        @apply="withdraw"
      >
        <template #label>
          <div class="padsmall">
            Withdraw 💳{{
              c.capitalize(c.baseCurrencyPlural)
            }}
          </div>
        </template>
        <template>
          <div>
            How many 💳{{ c.baseCurrencyPlural }} will you
            withdraw?
          </div>
        </template>
      </PromptButton>
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
    ...mapState(['ship', 'crewMember', 'userId']),
    isFriendlyToGuild(): boolean {
      return (
        (this.ship.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    creditsStoredHere() {
      return (
        this.ship.banked.find(
          (b) => b.id === this.ship.planet.id,
        )?.amount || 0
      )
    },

    shipCosmeticCurrencyStoredHere() {
      return (
        this.ship.bankedCosmeticCurrency?.find(
          (b) => b.id === this.ship.planet.id,
        )?.amount || 0
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    deposit(amount: any) {
      if (amount === 'all') amount = this.ship.commonCredits
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)

      this.$store.dispatch('updateShip', {
        commonCredits: this.ship.commonCredits - amount,
      })
      ;(this as any).$socket?.emit(
        'ship:deposit',
        this.ship.id,
        this.crewMember?.id,
        amount,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
    withdraw(amount: any) {
      if (amount === 'all') amount = this.creditsStoredHere
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)

      this.$store.dispatch('updateShip', {
        commonCredits: this.ship.commonCredits + amount,
      })
      ;(this as any).$socket?.emit(
        'ship:withdraw',
        this.ship.id,
        this.crewMember?.id,
        amount,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            console.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped></style>
