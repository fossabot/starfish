<template>
  <div class="panesection" v-if="planet && planet.level">
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
      <li v-if="planet.defense">
        Lv.{{ c.r2(planet.defense) }} orbital defense
      </li>

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
      <li v-if="planet.bank">
        Intergalactic Savings &amp; Loan branch opened
      </li>
      <li v-if="thingsForSale > 0">
        Vendor capacity increased by {{ thingsForSale }}
      </li>
      <li
        v-if="
          planet.vendor &&
          planet.vendor.shipCosmetics.length > 0
        "
      >
        {{ planet.vendor.shipCosmetics.length }} cosmetics
        for sale
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
        v-if="c.baseShipPassiveData[p.id]"
      >
        {{ c.baseShipPassiveData[p.id].description(p) }}
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
          Upgrade:
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
            >({{ c.numberWithCommas(xpProgressInLevel) }} /
            {{
              c.numberWithCommas(xpInCurrentLevel)
            }})</span
          >
        </div>
      </ProgressBar>

      <PromptButton
        v-if="crewMember"
        :disabled="crewMember.credits < 1"
        class="noflex marlefttiny"
        :max="crewMember.credits"
        @done="contributeToPlanet(...arguments)"
        @apply="contributeToPlanet(...arguments)"
      >
        <template #label>+ 💳</template>
        <template>
          <div>
            How many 💳{{ c.baseCurrencyPlural }} will you
            contribute?
          </div>
          <div>
            Exchange rate: 1 xp = 💳{{
              c.planetContributeCostPerXp
            }}
            {{
              c.planetContributeCostPerXp === 1
                ? c.baseCurrencySingular
                : c.baseCurrencyPlural
            }}
          </div>
        </template> </PromptButton
      ><PromptButton
        v-if="crewMember && crewMember.crewCosmeticCurrency"
        class="noflex marlefttiny"
        :max="crewMember.crewCosmeticCurrency"
        @done="
          contributeCrewCosmeticCurrencyToPlanet(
            ...arguments,
          )
        "
        @apply="
          contributeCrewCosmeticCurrencyToPlanet(
            ...arguments,
          )
        "
      >
        <template #label>+ 🟡</template>
        <template>
          <div>
            How many 🟡{{ c.crewCosmeticCurrencyPlural }}
            will you contribute?
          </div>
          <div>
            Exchange rate: 🟡1
            {{ c.crewCosmeticCurrencySingular }} =
            {{
              c.numberWithCommas(
                Math.round(
                  1 /
                    c.planetContributeCrewCosmeticCostPerXp,
                ),
              )
            }}
            xp
          </div>
        </template> </PromptButton
      ><PromptButton
        v-if="
          crewMember &&
          ship.captain === crewMember.id &&
          ship.shipCosmeticCurrency
        "
        :disabled="ship.shipCosmeticCurrency < 1"
        class="noflex marlefttiny"
        :max="ship.shipCosmeticCurrency"
        @done="
          contributeShipCosmeticCurrencyToPlanet(
            ...arguments,
          )
        "
        @apply="
          contributeShipCosmeticCurrencyToPlanet(
            ...arguments,
          )
        "
      >
        <template #label>+ 💎</template>
        <template>
          <div>
            How many 💎{{ c.shipCosmeticCurrencyPlural }}
            will you contribute?
          </div>
          <div>
            Exchange rate: 💎1
            {{ c.shipCosmeticCurrencySingular }} =
            {{
              c.numberWithCommas(
                Math.round(
                  1 /
                    c.planetContributeShipCosmeticCostPerXp,
                ),
              )
            }}
            xp
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
    isFriendlyToGuild(): boolean {
      return (
        (this.planet?.allegiances.find(
          (a: PlanetAllegianceData) =>
            a.guildId === this.ship.guildId,
        )?.level || 0) >= c.guildAllegianceFriendCutoff
      )
    },
    xpInCurrentLevel(): number {
      return (
        c.levels[this.planet.level] *
          c.planetLevelXpRequirementMultiplier -
        c.levels[this.planet.level - 1] *
          c.planetLevelXpRequirementMultiplier
      )
    },
    xpProgressInLevel(): number {
      return (
        this.planet.xp -
        c.levels[this.planet.level - 1] *
          c.planetLevelXpRequirementMultiplier
      )
    },
    thingsForSale(): number {
      const vendor = this.planet.vendor as PlanetVendor
      if (!vendor) return 0
      return (
        vendor.cargo.length +
        vendor.items.length +
        vendor.chassis.length +
        vendor.passives.length
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
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },

    contributeCrewCosmeticCurrencyToPlanet(
      amount: number | string,
    ) {
      if (amount === 'all')
        amount = this.crewMember.crewCosmeticCurrency
      amount = c.r2(
        parseFloat(`${amount}` || '0') || 0,
        2,
        true,
      )
      if (
        !amount ||
        amount <= 0 ||
        amount > this.crewMember.crewCosmeticCurrency
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }
      ;(this as any).$socket?.emit(
        'crew:donateCosmeticCurrencyToPlanet',
        this.ship.id,
        this.crewMember?.id,
        amount,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },

    contributeShipCosmeticCurrencyToPlanet(
      amount: number | string,
    ) {
      if (amount === 'all')
        amount = this.ship.shipCosmeticCurrency
      amount = c.r2(
        parseFloat(`${amount}` || '0') || 0,
        2,
        true,
      )
      if (
        !amount ||
        amount <= 0 ||
        amount > this.ship.shipCosmeticCurrency
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }
      ;(this as any).$socket?.emit(
        'ship:donateCosmeticCurrencyToPlanet',
        this.ship.id,
        this.crewMember?.id,
        amount,
        (res: IOResponse<CrewMemberStub>) => {
          if ('error' in res) {
            this.$store.dispatch('notifications/notify', {
              text: res.error,
              type: 'error',
            })
            c.log(res.error)
            return
          }
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped></style>
