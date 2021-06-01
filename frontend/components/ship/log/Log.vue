<template>
  <Box class="log" v-if="ship && ship.log">
    <template #title>
      <span class="sectionemoji">📄</span>Ship Log
    </template>

    <div class="panesection scroll">
      <ShipLogEntry
        v-for="l in flippedLog"
        :key="'log' + Math.random()"
        v-bind="l"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import { mapState } from 'vuex'
interface ComponentShape {
  [key: string]: any
}

export default {
  data(): ComponentShape {
    return {}
  },
  computed: {
    ...mapState(['ship']),
    flippedLog(this: ComponentShape) {
      const copy = [...this.ship.log]
      copy.reverse()
      return copy
    },
  },
  watch: {},
  mounted(this: ComponentShape) {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.log {
  width: 380px;
  position: relative;
}
.scroll {
  height: 250px;
  overflow-y: auto;
}
</style>
