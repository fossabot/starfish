<template>
  <div>
    <button
      :disabled="disabled"
      @click="openPrompt"
      class="mini secondary"
    >
      <slot name="label" />
    </button>
    <portal to="prompt" v-if="prompt">
      <Prompt @done="done" :key="'prompt' + prompt">
        <slot v-if="prompt === 1" />
        <slot name="second" v-if="prompt === 2" />
      </Prompt>
    </portal>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import c from '../../common/src'
interface ComponentShape {
  [key: string]: any
}

export default {
  props: { disabled: {} },
  data(): ComponentShape {
    return { c, prompt: null, results: [] }
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
  },
  mounted(this: ComponentShape) {},
  methods: {
    openPrompt(this: ComponentShape) {
      this.prompt = 1
      this.$store.commit('set', { modal: 'prompt' })
    },
    done(this: ComponentShape, ...args: any[]) {
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
  },
}
</script>

<style lang="scss" scoped>
.inventory {
  width: 250px;
}
</style>
