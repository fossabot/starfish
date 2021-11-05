<template>
  <div
    class="contract flexcolumn button secondary"
    :class="{
      pointer: !unavailable,
      disabled: unavailable,
    }"
    @click="!unavailable && $emit('click')"
  >
    <div class="flexbetween marbotsmall">
      <div>
        Kill
        <h3
          class="name"
          :style="{
            color: contract.targetGuildId
              ? c.guilds[contract.targetGuildId].color
              : '',
          }"
        >
          <!-- v-tooltip="{
        type: 'ship',
        id: contract.targetId,
      }" -->
          {{ contract.targetName }}
        </h3>
        <span class="difficulty sub">
          ({{
            contract.difficulty < 5
              ? 'Easy'
              : contract.difficulty < 10
              ? 'Medium'
              : contract.difficulty < 20
              ? 'Hard'
              : contract.difficulty < 40
              ? 'Murderous'
              : 'Insane'
          }})
        </span>
      </div>
      <div class="reward success">
        <span class="sub">Reward:</span>
        {{ c.priceToString(contract.reward) }}
      </div>
    </div>

    <div class="flexbetween">
      <div class="timeallowed">
        {{ c.msToTimeString(contract.timeAllowed) }}
        <span class="sub">to complete</span>
      </div>

      <div class="claimCost">
        <span class="sub">To start:</span>
        {{ c.priceToString(contract.claimCost) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    contract: {
      type: Object as PropType<PlanetContractAvailable>,
    },
  },
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
    unavailable() {
      return !c.canAfford(
        this.contract.claimCost,
        this.ship,
        null,
        true,
      )
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.contract {
  width: 100%;
  padding: 0.7em 1em;
  margin: 0.5em 0;
  text-align: left;
  position: relative;
}
h3 {
  display: inline-block;
  margin: 0;
}
</style>
