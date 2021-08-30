<template>
  <div>
    <button
      :class="{ disabled }"
      @click="!disabled && openPrompt()"
      class="mini secondary"
    >
      <slot name="label" />
    </button>
    <portal to="prompt" v-if="prompt">
      <Prompt
        @done="done"
        @apply="apply"
        :max="max"
        :key="'prompt' + prompt"
      >
        <slot v-if="prompt === 1" />
        <slot name="second" v-if="prompt === 2" />
      </Prompt>
    </portal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/src'

export default Vue.extend({
  props: { disabled: {}, max: {} },
  data() {
    let prompt: any,
      results: any[] = []
    return { c, prompt, results }
  },
  computed: {
    ...mapState(['modal']),
  },
  watch: {
    modal() {
      if (!this.modal) {
        this.prompt = null
        this.results = []
      }
    },
    prompt() {
      if (!this.prompt) {
        this.results = []
        this.$store.commit('set', { modal: null })
      }
    },
  },
  mounted() {
    // setInterval(
    //   () => c.log(this.prompt, this.results),
    //   1000,
    // )
  },
  methods: {
    openPrompt() {
      this.prompt = 1
      this.$store.commit('set', { modal: 'prompt' })
    },
    done(...args: any[]) {
      this.results.push(...args)
      if (this.$slots.second && this.prompt === 1) {
        this.prompt = 2
        return
      }
      this.$emit('done', this.results)
      this.prompt = null
      this.results = []
      this.$store.commit('set', { modal: null })
    },
    apply(...args: any[]) {
      this.$emit('apply', ...args)
      if (args[0] === 'all') {
        this.results = []
        this.$store.commit('set', { modal: null })
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.inventory {
  width: 250px;
}
</style>
