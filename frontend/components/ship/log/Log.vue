<template>
  <Box
    class="log"
    v-if="show"
    :highlight="highlight"
    bgImage="/images/paneBackgrounds/1.webp"
  >
    <template #title>
      <span class="sectionemoji">📄</span>Ship Log
    </template>

    <div class="panesection scroll">
      <ShipLogEntry
        v-for="l in flippedLog"
        :key="
          'log' +
          l.time +
          (l.content.map
            ? l.content.map((c) => c.text || c).join('')
            : l.content)
        "
        v-bind="l"
      />
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {}
  },
  computed: {
    ...mapState(['ship']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('log'))
      )
    },
    highlight() {
      return (
        this.ship?.tutorial?.currentStep?.highlightPanel ===
        'log'
      )
    },
    flippedLog() {
      const copy = [...this.ship.log]
      copy.reverse()
      return copy
    },
  },
  watch: {},
  mounted() {},
  methods: {},
})
</script>

<style lang="scss" scoped>
.log {
  width: 360px;
  position: relative;
}
.scroll {
  height: 250px;
  overflow-y: auto;
  user-select: text;
}
</style>
