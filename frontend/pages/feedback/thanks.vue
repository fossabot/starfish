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
import c from '../../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['userId', 'crewMember', 'ship']),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style></style>
