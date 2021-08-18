<template>
  <div class="container">
    <div class="textcolumn">
      <h2>Change Log</h2>

      <h3>1234</h3>
      <div>
        5678
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style></style>
