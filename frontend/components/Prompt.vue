<template>
  <div class="prompt flexcolumn flexcenter textcenter">
    <slot />
    <div class="flex martop" v-if="max && max >= 0">
      <button
        v-if="max >= 1"
        class="secondary"
        @click="applyValue(1)"
      >
        <span>1</span>
      </button>
      <button
        v-if="max >= 10"
        class="secondary"
        @click="applyValue(10)"
      >
        <span>10</span>
      </button>
      <button
        v-if="max >= 100"
        class="secondary"
        @click="applyValue(100)"
      >
        <span>100</span>
      </button>
      <button
        v-if="max >= 1000"
        class="secondary"
        @click="applyValue(1000)"
      >
        <span>1,000</span>
      </button>
      <button
        v-if="max >= 10000"
        class="secondary"
        @click="applyValue(10000)"
      >
        <span>10,000</span>
      </button>
      <button class="secondary" @click="applyValue('all')">
        <span
          >{{ c.numberWithCommas(c.r2(max)) }} (Max)</span
        >
      </button>
    </div>
    <div class="flex martopsmall combo">
      <input
        class="promptinput nomar"
        v-model="value"
        ref="input"
        style="flex-grow: 3"
        @keydown.enter="done"
      />
      <button class="attach" @click="done">
        <span>Go</span>
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'

export default Vue.extend({
  props: { max: {} },
  data() {
    return { c, value: '' }
  },
  async mounted() {
    await this.$nextTick()
    this.$refs.input.focus()
  },
  methods: {
    done(e) {
      e.preventDefault()
      this.$emit('done', this.value)
    },
    applyValue(value) {
      this.$emit('apply', value)
    },
  },
})
</script>

<style lang="scss" scoped>
.prompt {
  max-width: 400px;
}

.combo {
  line-height: 1;
  align-items: stretch;
}
.attach {
  margin: 0;
  border: 0;
  padding: 1em 1.5em;
  flex-grow: 1;
  flex-shrink: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;

  &:after {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    border-left: 0;
  }
}
</style>
