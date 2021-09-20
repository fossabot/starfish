<template>
  <div class="prompt flexcolumn flexcenter textcenter">
    <slot />
    <div class="martop">
      <button class="" @click="yes">
        <span>Yes</span>
      </button>
      <button class="secondary" @click="no">
        <span>No</span>
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/dist'

export default Vue.extend({
  props: {},
  data() {
    return { c, value: '' }
  },
  async mounted() {},
  methods: {
    yes(e) {
      e.preventDefault()
      this.$emit('yes')
    },
    no(e) {
      e.preventDefault()
      this.$emit('no')
    },
  },
})
</script>

<style lang="scss" scoped>
.prompt {
  max-width: 400px;
}
</style>
