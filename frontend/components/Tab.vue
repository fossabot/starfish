<template>
  <div class="tab">
    <div v-show="isActive">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import c from '../../common/dist'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: 'Tab',
    },
  },
  data() {
    return {
      isActive: true,
    }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped></style>
