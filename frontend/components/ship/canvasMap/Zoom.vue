<template>
  <ShipCanvasMap
    v-if="show"
    :emoji="'🔍'"
    :buffer="false"
    :interactive="false"
    background="black"
    :radius="c.arrivalThreshold"
    :width="200"
    label="vicinity"
  />
</template>

<script>
import c from '../../../../common/src'
import { mapState } from 'vuex'

export default {
  data() {
    return { c }
  },
  computed: {
    ...mapState(['ship']),
    show() {
      return (
        this.ship &&
        (!this.ship.shownPanels ||
          this.ship.shownPanels.includes('mapZoom'))
      )
    },
  },
}
</script>
