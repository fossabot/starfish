<template>
  <ShipMapPlayermap
    v-if="show"
    :emoji="'🔍'"
    :buffer="false"
    :blackout="false"
    :interactive="false"
    background="black"
    :radius="c.ARRIVAL_THRESHOLD"
    :width="200"
    label="ship vicinity"
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
