<template>
  <ShipMapPlayermap v-if="show" />
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
          this.ship.shownPanels.includes('map'))
      )
    },
  },
}
</script>
