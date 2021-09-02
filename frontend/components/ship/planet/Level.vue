<template>
  <div class="panesection" v-if="crewMember && planet">
    <div>
      <div class="panesubhead">Planet Level</div>
    </div>
    <div>
      <b>Level {{ planet.level }}</b>
    </div>
    <div class="success martopsmall marbotsmall">
      <div v-if="planet.landingRadiusMultiplier > 1">
        +
        {{
          c.r2(
            (planet.landingRadiusMultiplier - 1) * 100,
            0,
          )
        }}% landing radius
      </div>
      <div v-if="planet.repairFactor > 0">
        + {{ c.r2(planet.repairFactor, 0, true) }} passive
        repair field speed
      </div>
      <div v-if="thingsForSale > 0">
        + {{ thingsForSale }} vendor capacity
      </div>
      <div v-if="planet.vendor.repairCostMultiplier">
        + Mechanics' Quarter (paid instant repairs)
      </div>
    </div>
    <div
      v-tooltip="
        `Levels advance slowly with purchases, but much faster with direct contributions.`
      "
      class="flex"
    >
      <ProgressBar
        :mini="true"
        :percent="xpProgressInLevel / xpInCurrentLevel"
        dangerZone="-1"
      >
        <div>
          Level Progress:
          <NumberChangeHighlighter
            :number="xpProgressInLevel"
            :display="
              c.r2(
                (xpProgressInLevel / xpInCurrentLevel) *
                  100,
                0,
                true,
              ) + `%`
            "
          />
          <span class="sub"
            >({{ xpProgressInLevel }} /
            {{ xpInCurrentLevel }})</span
          >
        </div>
      </ProgressBar>

      <PromptButton
        :disabled="crewMember.credits < 1"
        class="noflex marleftsmall"
        :max="crewMember.credits"
        @done="contributeToPlanet(...arguments)"
        @apply="contributeToPlanet(...arguments)"
      >
        <template #label> Contribute </template>
        <template>
          <div>How many credits will you contribute?</div>
          <div>
            Exchange rate: 1xp =
            {{ c.planetContributeCostPerXp }} credits
          </div>
        </template>
      </PromptButton>
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
    isFriendlyToFaction(): boolean {
      return (
        (this.planet.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.faction.id === this.ship.faction.id,
        )?.level || 0) >= c.factionAllegianceFriendCutoff
      )
    },
    xpInCurrentLevel(): number {
      return (
        c.levels[this.planet.level + 1] -
        c.levels[this.planet.level]
      )
    },
    xpProgressInLevel(): number {
      return (
        this.planet.xp - c.levels[this.planet.level - 1]
      )
    },
    thingsForSale(): number {
      const vendor = this.planet.vendor as PlanetVendor
      return (
        vendor.cargo.length +
        vendor.items.length +
        vendor.chassis.length +
        vendor.passives.length +
        vendor.actives.length
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    contributeToPlanet(amount: number | string) {
      if (amount === 'all') amount = this.crewMember.credits
      amount = c.r2(
        parseFloat(`${amount}` || '0') || 0,
        2,
        true,
      )
      if (
        !amount ||
        amount <= 0 ||
        amount > this.crewMember.credits
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }
      ;(this as any).$socket?.emit(
        'crew:donateToPlanet',
        this.ship.id,
        this.crewMember?.id,
        amount,
        this.ship?.planet?.name,
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
