<template>
  <div>
    <div class="panesection">
      <div>
        💳Credits:
        {{ Math.floor(crewMember.credits * 100) / 100 }}
        <button
          v-if="crewMember.credits > 0.001"
          @click="addToCommonFund"
          class="mini secondary"
        >
          Add to common fund</button
        ><button
          class="mini secondary"
          @click="drop('credits')"
          v-if="crewMember.credits > 0.001"
        >
          Drop
        </button>
      </div>
    </div>
    <ProgressBar
      :percent="totalWeight / crewMember.maxCargoWeight"
      :dangerZone="-1"
    >
      <div>
        📦Cargo:
        {{ Math.round(totalWeight * 100) / 100 }}
        /
        {{
          Math.round(crewMember.maxCargoWeight * 100) / 100
        }}
        tons
      </div>
    </ProgressBar>
    <div class="panesection" v-if="inventory.length > 0">
      <div class="panesubhead">Cargo</div>
      <div
        v-for="item in inventory"
        :key="'inv' + item.type"
      >
        {{ c.capitalize(item.type) }}:
        {{ Math.round(item.amount * 1000) / 1000 }} tons
        <button
          class="mini secondary"
          @click="drop(item.type)"
        >
          Drop
        </button>
      </div>
    </div>
  </div>
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
    inventory(this: ComponentShape) {
      return this.crewMember?.inventory
        .filter((i: Cargo) => i.amount >= 0.001)
        .sort((a: Cargo, b: Cargo) => b.amount - a.amount)
    },
    totalWeight(this: ComponentShape) {
      return this.crewMember.inventory.reduce(
        (total: number, i: Cargo) => total + i.amount,
        0,
      )
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {
    addToCommonFund(this: ComponentShape) {
      const amount =
        parseFloat(
          prompt(
            `How many credits do you want to contribute to the ship's common credits? (Max ${Math.floor(
              this.crewMember.credits * 100,
            ) / 100})`,
          ) || '0',
        ) || 0
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
    ) {
      console.log()
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
      const amount =
        parseFloat(
          prompt(
            `How ${
              type === 'credits' ? 'many' : 'many tons of'
            } ${type} do you want to jettison as a cache? (Max ${totalHeld})`,
          ) || '0',
        ) || 0
      if (!amount || amount < 0 || amount > totalHeld) {
        this.$store.dispatch('notifications/notify', {
          text: 'Nope.',
          type: 'error',
        })
        return console.log('Nope.')
      }

      const message = prompt(
        `Would you like to attach a message to the cache?`,
      )?.substring(0, 200)

      this.$socket?.emit(
        'crew:drop',
        this.ship.id,
        this.crewMember.id,
        type,
        amount,
        message,
        (cache: CacheStub) => {
          console.log('dropped cache!')
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
