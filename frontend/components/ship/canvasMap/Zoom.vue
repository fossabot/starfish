<template>
  <ShipCanvasMap
    class="zoommap"
    v-if="show"
    :emoji="'🔍'"
    :buffer="false"
    :interactive="false"
    background="black"
    :radius="ship.gameSettings.arrivalThreshold"
    :width="222"
    label="vicinity"
  />
</template>

<script>
import Vue from 'vue'
import c from '../../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
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
})
</script>

<style scoped lang="scss">
.zoommap {
  width: 250px;
  height: 250px;
}
</style>
