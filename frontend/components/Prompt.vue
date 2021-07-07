<template>
  <div class="prompt flexcolumn flexcenter textcenter">
    <slot />
    <form class="martop">
      <input
        class="promptinput marbot"
        v-model="value"
        ref="input"
      />
      <input type="submit" @click="done" />
    </form>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      value: '',
    }
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
  },
}
</script>

<style lang="scss" scoped>
.prompt {
  max-width: 400px;
}
</style>
