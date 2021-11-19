<template>
  <span
    v-if="a !== undefined && b !== undefined && !isEqual"
    class="compare small"
    :class="{
      success: !isEqual && isBetter,
      warning: !isEqual && isWorse,
      fade: isEqual,
    }"
    >{{ !isEqual && isWorse && difference < 0 ? '-' : ''
    }}{{ !isEqual && isBetter && difference < 0 ? '-' : ''
    }}{{ difference > 0 ? '+' : ''
    }}{{
      Math.abs(difference) > 10000
        ? c.speedNumber(difference / c.kmPerAu, true, 0)
        : c.numberWithCommas(c.r2(difference, 4))
    }}{{ addendum }}
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../../common/dist'

export default Vue.extend({
  props: {
    a: { type: Number },
    b: { type: Number },
    higherIsBetter: { type: Boolean, default: true },
    addendum: { type: String, default: '' },
  },
  data() {
    return { c }
  },
  computed: {
    difference(): number {
      if (this.a === undefined || this.b === undefined)
        return 0
      return this.b - this.a
    },
    isBetter(): boolean {
      return this.higherIsBetter
        ? this.difference > 0
        : this.difference < 0
    },
    isWorse(): boolean {
      return this.higherIsBetter
        ? this.difference < 0
        : this.difference > 0
    },
    isEqual(): boolean {
      return Math.abs(this.difference) < 0.00001
    },
  },
  mounted() {
    // c.log(
    //   this.isBetter ? 'is better' : '',
    //   this.isWorse ? 'is worse' : '',
    //   this.higherIsBetter
    //     ? 'higher is better'
    //     : 'lower is better',
    //   'difference: ' + this.difference,
    //   this.a,
    //   this.b,
    // )
  },
})
</script>

<style scoped lang="scss">
// .compare {
// }
</style>
