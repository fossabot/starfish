<template>
  <Box
    class="inventory"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/6.jpg"
  >
    <template #title>
      <span class="sectionemoji">⚖️</span>your Inventory
    </template>
    <div class="panesection">
      <div>
        💳Credits:
        {{
          c.numberWithCommas(
            c.r2(crewMember.credits, 0, true),
          )
        }}

        <div class="flexwrap">
          <PromptButton
            v-if="crewMember.credits >= 1"
            :max="crewMember.credits"
            @done="addToCommonFund(...arguments)"
            @apply="addToCommonFund(...arguments)"
          >
            <template #label>+ Common Fund </template>
            <template>
              How many credits do you want to contribute to
              the ship's common credits? (Max
              {{
                c.numberWithCommas(
                  Math.floor(crewMember.credits),
                )
              }})
            </template>
          </PromptButton>

          <PromptButton
            v-if="crewMember.credits >= 1"
            @done="drop('credits', ...arguments)"
            @apply="drop('credits', ...arguments)"
          >
            <template #label>Drop</template>
            <template>
              How many credits do you want to jettison as a
              cache? (Max
              {{
                c.numberWithCommas(
                  Math.floor(crewMember.credits),
                )
              }})
            </template>
            <template #second>
              Would you like to attach a message to the
              cache? (Blank for no message)
            </template>
          </PromptButton>
        </div>
      </div>
    </div>
    <div class="panesection">
      <div class="panesubhead">Cargo</div>

      <div
        v-tooltip="
          `Your personal store of cargo to buy and sell. You can upgrade your cargo space on certain planets.<br />
Your personal maximum cargo space is <b>${
            crewMember.maxCargoSpace
          } tons</b>.<br />
${
  ship.chassis.maxCargoSpace < crewMember.maxCargoSpace
    ? 'However, y'
    : 'Y'
}our ship's chassis has a hard maximum cargo space per crew member of <b>${
            ship.chassis.maxCargoSpace
          } tons</b>, which you cannot go above.`
        "
      >
        <PillBar
          :micro="true"
          :value="totalWeight"
          :dangerZone="-1"
          :max="
            Math.min(
              crewMember.maxCargoSpace,
              ship.chassis.maxCargoSpace,
            )
          "
          :color="'var(--cargo)'"
        />
        <div class="sub martoptiny marbottiny">
          <NumberChangeHighlighter
            :number="c.r2(totalWeight)"
          />
          /
          {{
            c.r2(
              Math.min(
                crewMember.maxCargoSpace,
                ship.chassis.maxCargoSpace,
              ),
            )
          }}
          tons
        </div>
      </div>

      <div v-for="item in inventory" :key="'inv' + item.id">
        <div class="flashtextgoodonspawn">
          {{ c.capitalize(item.id) }}:
          <NumberChangeHighlighter
            :number="c.r2(item.amount, 2)"
            :display="c.r2(item.amount, 2) + ' tons'"
          />

          <PromptButton
            class="inlineblock"
            v-if="item.amount >= 1"
            :max="item.amount"
            @done="drop(item.id, ...arguments)"
            @apply="drop(item.id, ...arguments)"
          >
            <template #label>Drop</template>
            <template>
              How many tons of {{ item.id }} do you want to
              jettison as a cache?
            </template>
            <template #second>
              Would you like to attach a message to the
              cache? (Blank for no message)
            </template>
          </PromptButton>

          <PromptButton
            class="inlineblock"
            :yesNo="true"
            v-else
            :max="item.amount"
            @done="drop(item.id, ['all'])"
          >
            <template #label>Drop</template>
            <template>
              You don't have enough {{ item.id }} to form a
              cache. Do you want to jettison it into
              nothingness?
            </template>
          </PromptButton>
        </div>
      </div>
    </div>
  </Box>
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
    ...mapState(['crewMember', 'ship']),
    show() {
      return (
        this.ship &&
        this.crewMember &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('inventory'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'inventory'
      )
    },
    inventory() {
      return this.crewMember?.inventory
        .filter((i: Cargo) => i.amount >= 0.001)
        .sort((a: Cargo, b: Cargo) => b.amount - a.amount)
    },
    totalWeight() {
      return this.crewMember?.inventory.reduce(
        (total: number, i: Cargo) => total + i.amount,
        0,
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {
    async addToCommonFund(amount: any) {
      if (amount === 'all') amount = this.crewMember.credits
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (
        !amount ||
        amount < 0 ||
        amount > this.crewMember.credits
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }

      ;(this as any).$socket?.emit(
        'crew:contribute',
        this.ship.id,
        this.crewMember.id,
        amount,
      )
      this.$store.dispatch('notifications/notify', {
        text: `Contributed ${c.r2(amount, 0)} credits.`,
        type: 'success',
      })
    },
    drop(cargoId: CargoId | 'credits', res: any[]) {
      let [amount, message] = res

      const totalHeld =
        cargoId === 'credits'
          ? c.r2(this.crewMember.credits, 2, true)
          : c.r2(
              this.crewMember.inventory.find(
                (i: Cargo) => i.id === cargoId,
              ).amount,
              2,
              true,
            )

      if (amount === 'all') amount = totalHeld
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (!amount || amount > totalHeld) {
        this.$store.dispatch('notifications/notify', {
          text: 'Invalid amount.',
          type: 'error',
        })
        return
      }

      if (amount < 1 && amount < totalHeld) {
        this.$store.dispatch('notifications/notify', {
          text: 'You must drop at least 1.',
          type: 'error',
        })
        return console.log('You must drop at least 1.')
      }

      message = message?.substring(0, 200)
      ;(this as any).$socket?.emit(
        'crew:drop',
        this.ship.id,
        this.crewMember.id,
        cargoId,
        amount,
        message,
        (res: IOResponse<CacheStub | undefined>) => {
          if ('error' in res) return
          const cache = res.data
          if (cache)
            this.$store.dispatch('notifications/notify', {
              text: 'Dropped cache!',
              type: 'success',
            })
          else
            this.$store.dispatch('notifications/notify', {
              text: 'Jettisoned cargo!',
              type: 'success',
            })
        },
      )
    },
  },
})
</script>

<style lang="scss" scoped>
.inventory {
  width: 250px;
}
</style>
