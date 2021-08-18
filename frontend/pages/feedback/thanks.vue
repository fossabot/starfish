<template>
  <div class="container">
    <NavBar />

    <div class="textcolumn">
      <h2>Thanks for sharing!</h2>
      Your feedback has been recorded.
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/src'
import { mapState } from 'vuex'

export default Vue.extend({
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
