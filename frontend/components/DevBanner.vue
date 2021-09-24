<template>
  <div class="devbanner position">
    <div v-if="isDev" class="dev">Local Dev</div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapState(['']),
    isDev() {
      return process.env.NODE_ENV === 'development'
    },
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.position {
  position: fixed;
  z-index: 9999;
  bottom: 0;
  right: 0;

  & > * {
    padding: 1em 2em;
  }
}
.dev {
  background: orange;
}
</style>
