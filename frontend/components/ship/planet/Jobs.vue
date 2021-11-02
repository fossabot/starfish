<template>
  <div class="panesection" v-if="ship.planet">
    <div class="sub padbig flexcenter">
      <div>
        No jobs available at the moment, check back later!
      </div>
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
