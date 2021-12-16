<template>
  <span
    class="numberchangehighlighter nowrap"
    :class="{ highlightBad, highlightGood }"
    @animationend="
      highlightBad = false
      highlightGood = false
    "
    >{{ display || c.numberWithCommas(number)
    }}<span
      class="arrow marlefttiny"
      v-if="arrowState"
      :class="{
        success: arrowState === 'up',
        warning: arrowState === 'down',
      }"
    >
      <!-- <span
        v-if="arrowState === 'flat'"
        style="color: #888"
      >
        -
      </span> -->

      <div v-if="arrowState === 'up'" class="success">
        &#9650;
      </div>
      <div v-if="arrowState === 'down'" class="warning">
        &#9660;
      </div>
    </span></span
  >
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/dist'

export default Vue.extend({
  props: {
    raw: {
      type: Number,
    },
    number: { type: Number, required: true },
    display: {},
    higherIsBetter: { default: true },
    highlightStyle: { default: 'highlight' },
    arrow: { default: false },
  },
  data() {
    const history: number[] = []
    let historyInterval: any
    return {
      c,
      highlightBad: false,
      highlightGood: false,
      history,
      historyInterval,
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

      if (this.arrow) {
        this.history.pop()
        this.history.push(this.raw || newNumber)
      }
    },
  },
  computed: {
    arrowState(): string | null {
      if (!this.arrow) return null
      const oldest = this.history[0]
      const newest = this.history[this.history.length - 1]
      if (oldest === newest) return null //'flat'
      return oldest < newest ? 'up' : 'down'
    },
  },
  mounted() {
    this.pushHistoryState()
    if (this.arrow)
      this.historyInterval = setInterval(
        this.pushHistoryState,
        5000,
      )
  },
  beforeDestroy() {
    if (this.arrow) clearInterval(this.historyInterval)
  },
  methods: {
    pushHistoryState() {
      this.history.push(this.raw || this.number)
      if (this.history.length > 3) this.history.shift()
    },
  },
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

  .arrow {
    display: inline-flex;
    height: 100%;
    font-size: 0.6em;
    position: relative;
    top: -0.2em;
    opacity: 0.5;
  }
}
</style>
