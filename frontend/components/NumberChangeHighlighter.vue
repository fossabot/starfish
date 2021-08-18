<template>
  <span
    class="numberchangehighlighter"
    :class="{ highlightBad, highlightGood }"
    @animationend="
      highlightBad = false
      highlightGood = false
    "
    >{{ display || number }}</span
  >
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/src'

export default Vue.extend({
  props: {
    number: {},
    display: {},
    higherIsBetter: { default: true },
    highlightStyle: { default: 'highlight' },
  },
  data() {
    return {
      c,
      highlightBad: false,
      highlightGood: false,
    }
  },
  watch: {
    number(newNumber, oldNumber) {
      if (
        newNumber === oldNumber
        //  || Math.abs(1 - newNumber / oldNumber) < 0.0001
      )
        return
      if (newNumber > oldNumber)
        this.highlightGood = this.higherIsBetter
      else this.highlightBad = this.higherIsBetter
    },
  },
  mounted() {},
})
</script>

<style lang="scss" scoped>
.numberchangehighlighter {
  position: relative;

  &.highlightBad {
    animation: highlight-text-bad 0.7s ease-out 1;
  }
  &.highlightGood {
    animation: highlight-text-good 0.7s ease-out 1;
  }
}
</style>
