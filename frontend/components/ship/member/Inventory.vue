<template>
  <div>
    <div class="panesection">
      <div>
        💳Credits:
        {{ Math.floor(crewMember.credits * 100) / 100 }}
        <button
          v-if="crewMember.credits > 0.001"
          @click="addToCommonFund"
        >
          Add to ship common fund
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
      )
        return console.log('Nope.')

      this.$socket?.emit(
        'crew:contribute',
        this.ship.id,
        this.crewMember.id,
        amount,
      )
    },
  },
}
</script>

<style lang="scss" scoped></style>
