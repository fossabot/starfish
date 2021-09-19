<template>
  <Box
    class="dead"
    :minimizable="false"
    bgImage="/images/paneBackgrounds/17.jpg"
  >
    <template #title>You've died!</template>

    <div class="panesection">
      <div class="marbot">
        Your ship explodes into a cloud of rapidly-freezing
        crystals of ice and air! The crew watches in horror
        from the window of the escape pod as the wreckage of
        their ship goes spiraling out into the abyss.
      </div>

      <div class="marbot">
        All cargo and equipment are lost, along with most of
        your credits, but the crew managed to escape back to
        their homeworld.
      </div>

      <div class="marbot">
        <div v-if="!isCaptain">
          Waiting for the captain to start a new ship.
        </div>
        <div v-if="isCaptain">
          Captain, click to start a new ship.
        </div>
      </div>

      <button
        v-if="isCaptain"
        @click="$store.dispatch('respawn')"
        class="big"
      >
        Respawn
      </button>
    </div>
  </Box>
</template>

<script lang="ts">
import Vue from 'vue'
import c from '../../../common/dist'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return { c, selectedShip: null }
  },
  computed: {
    ...mapState(['ship', 'crewMember', 'userId']),
    show() {
      return this.ship && !this.crewMember
    },
    isCaptain() {
      return this.ship.captain === this.userId
    },
  },
})
</script>

<style lang="scss" scoped>
.dead {
  width: 400px;
}
</style>
