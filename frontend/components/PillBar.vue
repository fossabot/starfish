<template>
  <div
    class="pillbar"
    v-if="value !== undefined && max !== undefined"
    :class="{ mini, micro }"
    :style="{
      '--primary-color':
        value / max <= dangerZone
          ? 'var(--warning)'
          : color,
    }"
  >
    <div
      v-for="pill in Math.floor(value || 0)"
      :key="'fullpill' + pill"
      class="pill full"
    ></div>
    <div
      v-if="value % 1 !== 0"
      class="pill middle"
      :class="{
        highlightBorderBad: highlightBad,
        highlightBorderGood: highlightGood,
      }"
      @animationend="
        highlightBad = false
        highlightGood = false
      "
    >
      <div
        :style="{
          height: micro ? '100%' : `${(value % 1) * 100}%`,
          width: micro ? `${(value % 1) * 100}%` : '100%',
        }"
        :class="{
          highlightBackgroundBad: highlightBad,
          highlightBackgroundGood: highlightGood,
        }"
      ></div>
    </div>
    <div
      v-for="pill in Math.floor((max || 10) - (value || 0))"
      :key="'emptypill' + pill"
      class="pill empty"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  props: {
    mini: {},
    micro: {},
    value: {},
    max: { default: 10 },
    color: { default: 'rgba(255,255,255,.85)' },
    dangerZone: { default: 0.2 },
    flashOnChange: { default: true },
    higherIsBetter: { default: true },
  },
  data() {
    return {
      highlightGood: false,
      highlightBad: false,
      lastTickPoint: 0,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {
    value(newNumber, oldNumber) {
      if (!this.flashOnChange) return
      if (Math.abs(newNumber - this.lastTickPoint) < 0.001)
        return
      if (newNumber > oldNumber)
        this.highlightGood = this.higherIsBetter
      else this.highlightBad = this.higherIsBetter

      this.lastTickPoint = newNumber
    },
  },
  mounted() {},
})
</script>

<style lang="scss" scoped>
.pillbar {
  flex-shrink: 1;
  height: 1em;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 0.6em;
  overflow: hidden;

  &.mini {
    border-radius: 0.4em;
    height: 0.5em;
  }
  &.micro {
    border-radius: 0.1em;
    height: 0.2em;
    .pill {
      background: rgba(255, 255, 255, 0.5);
      &.middle {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .pill {
    flex-shrink: 1;
    flex-grow: 1;
    width: 0.5em;
    height: 100%;
    border-radius: 0.1em;
    position: relative;
    background: rgba(255, 255, 255, 0.2);
    // border: 1px solid var(--primary-color);

    &:not(:last-of-type) {
      margin-right: 2px;
    }

    &.full {
      background: var(--primary-color);
    }

    &.empty {
      opacity: 0.4;
    }

    &.middle {
      background: rgba(255, 255, 255, 0.08);
      div {
        min-height: 1px;
        position: absolute;
        bottom: 0;
        background: var(--primary-color);
        width: 100%;
      }
    }
  }
}

.highlightBorderBad {
  animation: highlight-border-bad 0.7s ease-out 1;
}
.highlightBorderGood {
  animation: highlight-border-good 0.7s ease-out 1;
}
.highlightBackgroundBad {
  animation: highlight-background-bad 0.7s ease-out 1;
}
.highlightBackgroundGood {
  animation: highlight-background-good 0.7s ease-out 1;
}

@keyframes highlight-border-bad {
  to {
    border-color: var(--primary-color);
  }
  from {
    border-color: var(--warning);
  }
}

@keyframes highlight-border-good {
  to {
    border-color: var(--primary-color);
  }
  from {
    border-color: var(--success);
  }
}

@keyframes highlight-background-bad {
  to {
    background-color: var(--primary-color);
  }
  from {
    background-color: var(--warning);
  }
}

@keyframes highlight-background-good {
  to {
    background-color: var(--primary-color);
  }
  from {
    background-color: var(--success);
  }
}
</style>
