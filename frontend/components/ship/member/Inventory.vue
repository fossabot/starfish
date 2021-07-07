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
        {{ c.r2(crewMember.credits, 2, true) }}

        <div class="flexwrap">
          <PromptButton
            v-if="crewMember.credits > 0.00999"
            @done="addToCommonFund(...arguments)"
          >
            <template #label>
              Add to common fund
            </template>
            <template>
              How many credits do you want to contribute to
              the ship's common credits? (Max
              {{
                Math.floor(crewMember.credits * 100) / 100
              }})
            </template>
          </PromptButton>

          <PromptButton
            v-if="crewMember.credits > 0.099999"
            @done="drop('credits', ...arguments)"
          >
            <template #label>
              Drop
            </template>
            <template>
              How many credits do you want to jettison as a
              cache? (Max
              {{
                Math.floor(crewMember.credits * 100) / 100
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
    <div class="panesection" v-if="inventory.length > 0">
      <div class="panesubhead">Cargo</div>

      <ProgressBar
        class="marbotsmall"
        :percent="
          totalWeight /
            Math.min(
              crewMember.maxCargoSpace,
              ship.chassis.maxCargoSpace,
            )
        "
        :dangerZone="-1"
        @mouseenter.native="
          $store.commit(
            'tooltip',
            `Your personal store of cargo to buy and sell. You can upgrade your cargo space on certain planets.<br />
          Your ship's chassis has a hard maximum cargo space per crew member of <b>${ship.chassis.maxCargoSpace} tons</b>, which you cannot go above.`,
          )
        "
        @mouseleave.native="$store.commit('tooltip')"
      >
        <div>
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
      </ProgressBar>

      <div
        v-for="item in inventory"
        :key="'inv' + item.type"
      >
        <div class="flashtextgoodonspawn">
          {{ c.capitalize(item.type) }}:
          <NumberChangeHighlighter
            :number="c.r2(item.amount, 2)"
            :display="c.r2(item.amount, 2) + ' tons'"
          />
          <PromptButton
            class="inlineblock"
            v-if="item.amount >= 1"
            @done="drop(item.type, ...arguments)"
          >
            <template #label>
              Drop
            </template>
            <template>
              How many tons of {{ item.type }} do you want
              to jettison as a cache? (Max
              {{ c.r2(item.amount, 2, true) }})
            </template>
            <template #second>
              Would you like to attach a message to the
              cache? (Blank for no message)
            </template>
          </PromptButton>
        </div>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import c from '../../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState(['crewMember', 'ship']),
    show(this: ComponentShape) {
      return (
        this.ship &&
        this.crewMember &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('inventory'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'inventory'
      )
    },
    inventory(this: ComponentShape) {
      return this.crewMember?.inventory
        .filter((i: Cargo) => i.amount >= 0.001)
        .sort((a: Cargo, b: Cargo) => b.amount - a.amount)
    },
    totalWeight(this: ComponentShape) {
      return this.crewMember?.inventory.reduce(
        (total: number, i: Cargo) => total + i.amount,
        0,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    addToCommonFund(this: ComponentShape, amount: any) {
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (
        !amount ||
        amount < 0 ||
        amount > this.crewMember.credits
      ) {
        this.$store.dispatch('notifications/notify', {
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }

      this.$socket?.emit(
        'crew:contribute',
        this.ship.id,
        this.crewMember.id,
        amount,
      )
    },
    drop(
      this: ComponentShape,
      type: CargoType | 'credits',
      res: any[],
    ) {
      let [amount, message] = res

      const totalHeld =
        type === 'credits'
          ? c.r2(this.crewMember.credits, 2, true)
          : c.r2(
              this.crewMember.inventory.find(
                (i: Cargo) => i.type === type,
              ).amount,
              2,
              true,
            )
      amount = c.r2(parseFloat(amount || '0') || 0, 2, true)
      if (!amount || amount > totalHeld) {
        this.$store.dispatch('notifications/notify', {
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }
      if (amount < 1) {
        this.$store.dispatch('notifications/notify', {
          text: 'You must drop at least 1.',
          type: 'error',
        })
        return console.log('You must drop at least 1.')
      }

      message = message?.substring(0, 200)

      this.$socket?.emit(
        'crew:drop',
        this.ship.id,
        this.crewMember.id,
        type,
        amount,
        message,
        (cache: CacheStub) => {
          console.log('dropped cache!')
          this.$store.dispatch('notifications/notify', {
            text: 'Dropped cache!',
            type: 'success',
          })
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.inventory {
  width: 250px;
}
</style>
