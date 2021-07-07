<template>
  <Box
    class="log"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/1.jpg"
  >
    <template #title>
      <span class="sectionemoji">📄</span>Ship Log
    </template>

    <div class="panesection scroll">
      <ShipLogEntry
        v-for="l in flippedLog"
        :key="'log' + l.time + l.text"
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
    show(this: ComponentShape) {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('log'))
      )
    },
    highlight(this: ComponentShape) {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'log'
      )
    },
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
