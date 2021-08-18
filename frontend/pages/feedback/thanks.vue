<template>
  <div class="container">
    <div class="textcolumn">
      <h2>Thanks for sharing!</h2>
      Your feedback has been recorded.
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
  layout: 'withnavbar',
  data() {
    return {}
  },
  computed: {
    ...mapState(['userId', 'crewMember', 'ship']),
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style></style>
