<template>
  <div class="container">
    <NavBar />

    <div class="textcolumn">
      <h2>Change Log</h2>

      <h3>1234</h3>
      <div>
        5678
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import c from '../../common/src'
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return { c }
  },
  computed: {
    ...mapState([]),
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style></style>
