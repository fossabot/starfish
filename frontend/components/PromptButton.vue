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
        v-if="!yesNo"
        @done="done"
        @apply="apply"
        :max="prompt === 1 ? max : null"
        :key="'prompt' + Math.random()"
      >
        <slot v-if="prompt === 1" />
        <slot name="second" v-if="prompt === 2" />
      </Prompt>
      <PromptYesNo
        v-else
        @yes="done"
        @no="cancel"
        :key="'ynprompt' + Math.random()"
      >
        <slot />
      </PromptYesNo>
    </portal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  props: { disabled: {}, max: {}, yesNo: {} },
  data() {
    let prompt: any = null,
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
      c.log(this.$slots, this.prompt)
      if (this.prompt === null) {
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
    cancel() {
      this.$emit('cancel', this.results)
      this.prompt = null
      this.results = []
      this.$store.commit('set', { modal: null })
    },
    apply(...args: any[]) {
      // if two-stage
      if (this.$slots.second && this.prompt === 1) {
        this.results.push(...args)
        this.prompt = 2
        return
      }

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
