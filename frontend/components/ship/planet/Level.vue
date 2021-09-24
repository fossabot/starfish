<template>
  <div
    class="panesection"
    v-if="crewMember && planet && planet.level"
  >
    <div>
      <div
        class="panesubhead"
        v-if="planet.planetType === 'basic'"
      >
        Progression
      </div>
      <!-- <div
        class="panesubhead"
        v-if="planet.planetType === 'mining'"
      >
        Infrastructure
      </div> -->
    </div>
    <div>
      <b>
        <!-- Level {{ planet.level
        }}
        : -->
        {{ planetTitle }}
      </b>
    </div>

    <ul class="small success martopsmall marbotsmall">
      <li
        v-if="
          planet.landingRadiusMultiplier &&
          planet.landingRadiusMultiplier > 1
        "
      >
        {{
          c.r2(
            (planet.landingRadiusMultiplier - 1) * 100,
            0,
          )
        }}% bigger landing radius
      </li>
      <li v-if="planet.repairFactor">
        Level
        {{ c.r2(planet.repairFactor, 0, true) }} passive
        repair field
      </li>
      <li v-if="thingsForSale > 0">
        Vendor capacity increased by {{ thingsForSale }}
      </li>
      <li
        v-if="
          planet.vendor &&
          planet.vendor.repairCostMultiplier
        "
      >
        Mechanics' Quarter (paid instant repairs)
      </li>

      <li v-if="planet.mine && planet.mine.length > 0">
        {{ planet.mine.length }} resource{{
          planet.mine.length === 1 ? '' : 's'
        }}
        discovered
      </li>
      <li
        v-if="
          planet.planetType === 'mine' && planet.level > 1
        "
      >
        {{
          c.r2(c.lerp(1, 10, planet.level / 100) - 1) * 100
        }}% increased mine output
      </li>
      <li
        v-for="p in planet.passives"
        v-if="c.basePassiveData[p.id]"
      >
        {{ c.basePassiveData[p.id].toString(p) }}
      </li>
    </ul>

    <div
      v-tooltip="
        planet.planetType === 'basic'
          ? `Upgrade progress advances slowly with purchases, and much faster with direct contributions.`
          : `Upgrade progress advances with financial investment into the colony.`
      "
      class="flex"
    >
      <ProgressBar
        :mini="true"
        :percent="xpProgressInLevel / xpInCurrentLevel"
        dangerZone="-1"
      >
        <div>
          Upgrade Progress:
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
    isFriendlyToFaction(): boolean {
      return (
        (this.planet?.allegiances.find(
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
      if (!vendor) return 0
      return (
        vendor.cargo.length +
        vendor.items.length +
        vendor.chassis.length +
        vendor.passives.length +
        vendor.actives.length
      )
    },
    planetTitle(): string {
      return c.getPlanetTitle(this.planet)
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
